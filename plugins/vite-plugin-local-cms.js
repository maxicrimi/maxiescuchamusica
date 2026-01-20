import fs from 'fs';
import path from 'path';

export default function localCmsPlugin() {
    const catalogPath = path.resolve('src/data/catalog.json');
    const coversDir = path.resolve('public/covers');

    // Ensure covers directory exists
    if (!fs.existsSync(coversDir)) {
        fs.mkdirSync(coversDir, { recursive: true });
    }

    return {
        name: 'vite-plugin-local-cms',
        configureServer(server) {
            server.middlewares.use(async (req, res, next) => {
                const url = req.url.split('?')[0]; // simple URL parsing

                // === API: GET ALBUMS ===
                if (req.method === 'GET' && url === '/api/albums') {
                    try {
                        if (fs.existsSync(catalogPath)) {
                            const data = fs.readFileSync(catalogPath, 'utf-8');
                            res.setHeader('Content-Type', 'application/json');
                            res.end(data);
                        } else {
                            res.end('[]');
                        }
                    } catch (err) {
                        console.error(err);
                        res.statusCode = 500;
                        res.end(JSON.stringify({ error: 'Failed to read catalog' }));
                    }
                    return;
                }

                // === API: SAVE ALBUM (POST/PUT) ===
                // combining add/update for simplicity or separating? Let's implement generic save list.
                // Actually typical REST: POST = create, PUT = update. 
                // For simplicity: POST /api/albums receives the FULL LIST or a single item?
                // Let's do: POST /api/albums (Create/Append), PUT /api/albums/:id (Update), DELETE /api/albums/:id

                // Helper to read body
                const readBody = () => new Promise((resolve, reject) => {
                    let body = '';
                    req.on('data', chunk => body += chunk);
                    req.on('end', () => resolve(JSON.parse(body)));
                    req.on('error', reject);
                });

                // POST (Add New)
                if (req.method === 'POST' && url === '/api/albums') {
                    try {
                        const newAlbum = await readBody();
                        const data = JSON.parse(fs.readFileSync(catalogPath, 'utf-8') || '[]');

                        // Assign ID if missing
                        if (!newAlbum.id) newAlbum.id = Date.now();

                        data.push(newAlbum);
                        fs.writeFileSync(catalogPath, JSON.stringify(data, null, 2));

                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify(newAlbum));
                    } catch (err) {
                        res.statusCode = 500;
                        res.end(JSON.stringify({ error: err.message }));
                    }
                    return;
                }

                // PUT (Update)
                if (req.method === 'PUT' && url.startsWith('/api/albums/')) {
                    const id = parseInt(url.split('/').pop());
                    try {
                        const updates = await readBody();
                        const data = JSON.parse(fs.readFileSync(catalogPath, 'utf-8') || '[]');
                        const index = data.findIndex(a => a.id === id);

                        if (index !== -1) {
                            data[index] = { ...data[index], ...updates };
                            fs.writeFileSync(catalogPath, JSON.stringify(data, null, 2));
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify(data[index]));
                        } else {
                            res.statusCode = 404;
                            res.end(JSON.stringify({ error: 'Not found' }));
                        }
                    } catch (err) {
                        res.statusCode = 500;
                        res.end(JSON.stringify({ error: err.message }));
                    }
                    return;
                }

                // DELETE
                if (req.method === 'DELETE' && url.startsWith('/api/albums/')) {
                    const id = parseInt(url.split('/').pop());
                    try {
                        let data = JSON.parse(fs.readFileSync(catalogPath, 'utf-8') || '[]');
                        data = data.filter(a => a.id !== id);
                        fs.writeFileSync(catalogPath, JSON.stringify(data, null, 2));
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ success: true }));
                    } catch (err) {
                        res.statusCode = 500;
                        res.end(JSON.stringify({ error: err.message }));
                    }
                    return;
                }

                // === API: UPLOAD IMAGE ===
                if (req.method === 'POST' && url === '/api/upload') {
                    // Simple buffer reading for multipart (naive implementation for dev)
                    // Ideally use 'busboy' or similar, but for zero-dep dev server:
                    // We'll assume the client sends a simple FormData, but parsing multipart manually is hard.
                    // EASIER STRATEGY: Client sends Base64 JSON? No, large payload.
                    // Let's use a very simple multipart parser or strict regex if possible.
                    // Actually, for a dev tool, we can just pipe the file content if we control the headers?

                    // Let's try to parse the multipart boundaries roughly.
                    const chunks = [];
                    req.on('data', chunk => chunks.push(chunk));
                    req.on('end', () => {
                        const buffer = Buffer.concat(chunks);
                        const contentType = req.headers['content-type'];
                        const boundary = contentType.split('boundary=')[1];

                        if (!boundary) {
                            res.statusCode = 400;
                            res.end(JSON.stringify({ error: 'No boundary' }));
                            return;
                        }

                        // Locate the file data in the buffer
                        // This is a naive parser, robust enough for single file upload in dev
                        const boundaryBuffer = Buffer.from('--' + boundary);
                        const parts = [];
                        let start = buffer.indexOf(boundaryBuffer) + boundaryBuffer.length;
                        let end = buffer.indexOf(boundaryBuffer, start);

                        while (end !== -1) {
                            parts.push(buffer.subarray(start, end));
                            start = end + boundaryBuffer.length;
                            end = buffer.indexOf(boundaryBuffer, start);
                        }

                        // Look for the part with filename
                        const filePart = parts.find(p => p.includes('filename="'));
                        if (filePart) {
                            const headerEnd = filePart.indexOf('\r\n\r\n');
                            const header = filePart.subarray(0, headerEnd).toString();
                            const filenameMatch = header.match(/filename="(.+?)"/);

                            if (filenameMatch) {
                                const originalName = filenameMatch[1];
                                const ext = path.extname(originalName);
                                // Sanitize filename (timestamp + original name limited)
                                const safeName = `${Date.now()}-${originalName.replace(/[^a-z0-9.]/gi, '_')}`;
                                const content = filePart.subarray(headerEnd + 4, filePart.length - 2); // Remove \r\n at end

                                fs.writeFileSync(path.join(coversDir, safeName), content);

                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify({ url: `/covers/${safeName}` }));
                                return;
                            }
                        }

                        res.statusCode = 400;
                        res.end(JSON.stringify({ error: 'No file found' }));
                    });
                    return;
                }

                next();
            });
        }
    };
}
