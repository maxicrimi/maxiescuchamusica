import { createContext, useContext, useState, useEffect } from 'react';
import { getAllAlbums, CATALOG_DATA } from '../data';

// Development Mode Check
const isDev = import.meta.env.DEV;

const AdminContext = createContext();

export const useAdmin = () => useContext(AdminContext);

export const AdminProvider = ({ children }) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [albums, setAlbums] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch Albums on Mount (Only in Dev, or fallback to static in Prod)
    const fetchAlbums = async () => {
        setIsLoading(true);
        try {
            if (isDev) {
                const res = await fetch('/api/albums');
                if (res.ok) {
                    const data = await res.json();
                    setAlbums(data);
                } else {
                    console.error("Failed to fetch albums from local CMS");
                    setAlbums(CATALOG_DATA); // Fallback
                }
            } else {
                // Production: Use static data
                setAlbums(getAllAlbums());
            }
        } catch (err) {
            console.error(err);
            setAlbums(CATALOG_DATA);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAlbums();
    }, []);

    const toggleEditMode = () => {
        if (!isDev) return;
        setIsEditMode(prev => !prev);
    };

    // CRUD Operations (Dev Only)
    const addAlbum = async (album) => {
        if (!isDev) return;
        const res = await fetch('/api/albums', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(album)
        });
        if (res.ok) fetchAlbums();
        return res;
    };

    const updateAlbum = async (id, updates) => {
        if (!isDev) return;
        const res = await fetch(`/api/albums/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        if (res.ok) fetchAlbums();
        return res;
    };

    const deleteAlbum = async (id) => {
        if (!isDev) return;
        if (!window.confirm("¿Seguro que quieres borrar este álbum?")) return;

        const res = await fetch(`/api/albums/${id}`, {
            method: 'DELETE'
        });
        if (res.ok) fetchAlbums();
        return res;
    };

    const uploadImage = async (file) => {
        if (!isDev) return;

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                try {
                    const base64Content = reader.result.split(',')[1];
                    const res = await fetch('/api/upload', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            filename: file.name,
                            content: base64Content
                        })
                    });
                    if (res.ok) {
                        const data = await res.json();
                        resolve(data);
                    } else {
                        reject(new Error("Upload failed"));
                    }
                } catch (e) {
                    reject(e);
                }
            };
            reader.onerror = error => reject(error);
        });
    };

    return (
        <AdminContext.Provider value={{
            isDev,
            isEditMode,
            toggleEditMode,
            albums,
            fetchAlbums,
            addAlbum,
            updateAlbum,
            deleteAlbum,
            uploadImage,
            isLoading
        }}>
            {children}
        </AdminContext.Provider>
    );
};
