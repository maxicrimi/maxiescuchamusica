import './AlbumCard.css';

import './AlbumCard.css';

const AlbumCard = ({ album, viewMode, onEdit, onDelete, onClick }) => {
    const formatDate = (isoString) => {
        if (!isoString) return '-';
        return new Date(isoString).toLocaleDateString('es-AR');
    };

    return (
        <div className={`album-card ${viewMode}`} onClick={onClick}>
            <div className="album-cover-container">
                <img src={album.coverUrl} alt={album.title} className="album-cover" loading="lazy" />
                {onEdit && (
                    <div className="admin-overlay">
                        <button className="admin-btn btn-edit" onClick={(e) => {
                            e.stopPropagation();
                            onEdit();
                        }}>EDITAR</button>
                        {onDelete && (
                            <button className="admin-btn btn-delete" onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}>BORRAR</button>
                        )}
                    </div>
                )}
            </div>

            <div className="album-info">
                <div className="info-header">
                    <h3 className="album-title" title={album.title}>{album.title}</h3>
                    <p className="album-artist">{album.artist}</p>
                </div>

                {viewMode === 'list' && (
                    <div className="album-year-list">{album.year}</div>
                )}

                <div className="album-meta">
                    <div className="meta-row-primary">
                        <span className="album-country">📍 {album.country}</span>
                        {viewMode === 'grid' && <span className="album-year-meta">{album.year}</span>}
                    </div>
                    <div className="meta-row-secondary">
                        <span title="Fecha de adición">Añadido: {formatDate(album.dateAdded)}</span>
                    </div>
                </div>

                <div className="album-tags">
                    {album.tags.map(tag => (
                        <span key={tag} className="tag-pill">{tag}</span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AlbumCard;
