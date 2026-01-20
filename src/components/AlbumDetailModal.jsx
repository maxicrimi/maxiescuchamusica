import { useEffect } from 'react';
import './Admin.css'; // Reusing modal styles (admin + detail)

const AlbumDetailModal = ({ isOpen, onClose, album }) => {
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen || !album) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content detail-modal" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>

                <div className="detail-layout">
                    {/* Left: Large Cover */}
                    <div className="detail-cover-container">
                        <img
                            src={album.coverUrl}
                            alt={album.title}
                            className="detail-cover"
                        />
                    </div>

                    {/* Right: Info */}
                    <div className="detail-info">
                        <h2 className="detail-title">{album.title}</h2>
                        <h3 className="detail-artist">{album.artist}</h3>

                        <div className="detail-meta-grid">
                            <div className="detail-meta-item">
                                <span className="meta-label">Año</span>
                                <span className="meta-value">{album.year}</span>
                            </div>
                            <div className="detail-meta-item">
                                <span className="meta-label">País</span>
                                <span className="meta-value">{album.country}</span>
                            </div>
                            <div className="detail-meta-item">
                                <span className="meta-label">Agregado</span>
                                <span className="meta-value">
                                    {new Date(album.dateAdded).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        <div className="detail-tags-section">
                            <span className="meta-label">Etiquetas</span>
                            <div className="detail-tags-list">
                                {album.tags.map(tag => (
                                    <span key={tag} className="tag-pill large">{tag}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlbumDetailModal;
