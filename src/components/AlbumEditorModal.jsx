import { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '../context/AdminContext';
import './Admin.css';
import { countries, tags } from '../data/mockData'; // Reuse lists

const AlbumEditorModal = ({ isOpen, onClose, initialData = null }) => {
    const { addAlbum, updateAlbum, uploadImage } = useAdmin();
    const [formData, setFormData] = useState({
        artist: '',
        title: '',
        country: '',
        year: new Date().getFullYear(),
        tags: '',
        coverUrl: '',
        dateAdded: new Date().toISOString()
    });
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                tags: initialData.tags ? initialData.tags.join(', ') : ''
            });
        } else {
            // Reset for Add Mode
            setFormData({
                artist: '',
                title: '',
                country: 'Argentina',
                year: new Date().getFullYear(),
                tags: '',
                coverUrl: '',
                dateAdded: new Date().toISOString()
            });
        }
    }, [initialData, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDrop = useCallback(async (e) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            setUploading(true);
            try {
                const res = await uploadImage(file);
                // Assume server returns { url: "/covers/..." }
                setFormData(prev => ({ ...prev, coverUrl: res.url }));
            } catch (err) {
                alert("Error subiendo imagen");
            } finally {
                setUploading(false);
            }
        }
    }, [uploadImage]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
            year: parseInt(formData.year)
        };

        if (initialData) {
            await updateAlbum(initialData.id, payload);
        } else {
            await addAlbum(payload);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 10000 }}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <h2>{initialData ? 'Editar Álbum' : 'Agregar Álbum'}</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <form className="admin-form" onSubmit={handleSubmit}>
                    {/* Image Upload */}
                    <div
                        className={`image-dropzone ${isDragging ? 'dragging' : ''}`}
                        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                    >
                        {formData.coverUrl && <img src={formData.coverUrl} className="preview-bg" />}
                        <div className="drop-overlay">
                            {uploading ? 'Subiendo...' :
                                formData.coverUrl ? 'Arrastra otra imagen para cambiar' :
                                    'Arrastra la Portada Aquí (JPG/PNG)'}
                        </div>
                    </div>
                    <input
                        type="text"
                        name="coverUrl"
                        placeholder="O pega URL de imagen..."
                        value={formData.coverUrl}
                        onChange={handleChange}
                        style={{ marginTop: '-0.5rem', fontSize: '0.8rem' }}
                    />

                    <div className="form-group">
                        <label>Artista</label>
                        <input name="artist" value={formData.artist} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Título</label>
                        <input name="title" value={formData.title} onChange={handleChange} required />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Año</label>
                            <input type="number" name="year" value={formData.year} onChange={handleChange} required />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>País</label>
                            <input list="countries" name="country" value={formData.country} onChange={handleChange} />
                            <datalist id="countries">
                                {countries.map(c => <option key={c} value={c} />)}
                            </datalist>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Etiquetas (separadas por coma)</label>
                        <input name="tags" value={formData.tags} onChange={handleChange} placeholder="Rock, Indie, Pop..." />
                    </div>

                    <button type="submit" className="submit-btn">
                        {initialData ? 'Guardar Cambios' : 'Crear Álbum'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AlbumEditorModal;
