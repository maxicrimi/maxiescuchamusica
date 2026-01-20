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
                    try {
                        const { filename, content } = await readBody();
                        if (!filename || !content) {
                            res.statusCode = 400;
                            res.end(JSON.stringify({ error: 'Missing filename or content' }));
                            return;
                        }

                        // Sanitize filename
                        const ext = path.extname(filename);
                        const safeName = `${Date.now()}-${filename.replace(/[^a-z0-9.]/gi, '_')}`;

                        // Write File
                        const buffer = Buffer.from(content, 'base64');
                        fs.writeFileSync(path.join(coversDir, safeName), buffer);

                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ url: `/covers/${safeName}` }));
                    } catch (err) {
                        console.error('Upload error:', err);
                        res.statusCode = 500;
                        res.end(JSON.stringify({ error: err.message }));
                    }
                    return;
                }

                next();
            });
        }
    };
}
