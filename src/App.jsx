import { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import AlbumCard from './components/AlbumCard';
import Pagination from './components/Pagination';
import { mockAlbums } from './data/mockData';
import { AdminProvider, useAdmin } from './context/AdminContext';
import AlbumEditorModal from './components/AlbumEditorModal';
import AlbumDetailModal from './components/AlbumDetailModal';
import './App.css';

const ITEMS_PER_PAGE = 50;

// Inner App Component that uses the Context
function MusicApp() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [viewMode, setViewMode] = useState('grid');
  const [grouping, setGrouping] = useState(null); // 'year', 'decade', 'country', null
  const [sortOption, setSortOption] = useState('newest'); // 'newest', 'oldest', 'year_desc', 'year_asc', 'alpha'
  const [currentPage, setCurrentPage] = useState(1);

  // Use data from Admin Context (which handles Dev/Prod switch)
  const { albums: contextAlbums, isEditMode, deleteAlbum } = useAdmin();

  // Create Modal State locally to control opening
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [viewingAlbum, setViewingAlbum] = useState(null); // State for Detail Modal

  const handleEdit = (album) => {
    setEditingAlbum(album);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingAlbum(null); // Clear for new
    setIsModalOpen(true);
  };

  // Derive available years and decades
  const { years, decades } = useMemo(() => {
    // Determine data source: empty contextAlbums? use mock?
    // Let's rely on contextAlbums being populated.
    const sourceData = contextAlbums.length > 0 ? contextAlbums : mockAlbums;

    // NOTE: If we switch to purely dynamic, mockAlbums usage here might be redundant/fallback.
    // For now, let's stick to using `contextAlbums` IF available.

    const dataToUse = contextAlbums.length > 0 ? contextAlbums : mockAlbums;

    const allYears = [...new Set(dataToUse.map(a => a.year))].sort((a, b) => b - a);
    const allDecades = [...new Set(dataToUse.map(a => Math.floor(a.year / 10) * 10))].sort((a, b) => b - a);
    return {
      years: allYears.map(String),
      decades: allDecades.map(String)
    };
  }, [contextAlbums]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilters, grouping, viewMode]);

  const filteredAlbums = useMemo(() => {
    const sourceData = contextAlbums.length > 0 ? contextAlbums : mockAlbums;

    return sourceData.filter(album => {
      const matchesSearch =
        album.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        album.title.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      for (const [key, values] of Object.entries(activeFilters)) {
        if (values.length === 0) continue;

        let matchesFilter = false;

        if (key === 'country') {
          matchesFilter = values.includes(album.country);
        } else if (key === 'tag') {
          matchesFilter = album.tags.some(tag => values.includes(tag));
        } else if (key === 'year') {
          matchesFilter = values.includes(String(album.year));
        } else if (key === 'decade') {
          const decade = Math.floor(album.year / 10) * 10;
          matchesFilter = values.includes(String(decade));
        }

        if (!matchesFilter) return false;
      }

      return true;
    });
  }, [searchQuery, activeFilters, contextAlbums]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredAlbums.length / ITEMS_PER_PAGE);

  // Sorting Logic
  const sortedAlbums = useMemo(() => {
    let sorted = [...filteredAlbums];

    switch (sortOption) {
      case 'newest':
        sorted.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
        break;
      case 'oldest':
        sorted.sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
        break;
      case 'year_desc':
        sorted.sort((a, b) => b.year - a.year);
        break;
      case 'year_asc':
        sorted.sort((a, b) => a.year - b.year);
        break;
      case 'artist_asc':
        sorted.sort((a, b) => a.artist.localeCompare(b.artist));
        break;
      case 'artist_desc':
        sorted.sort((a, b) => b.artist.localeCompare(a.artist));
        break;
      case 'album_asc':
        sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'album_desc':
        sorted.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
        break;
      default:
        sorted.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    }
    return sorted;
  }, [filteredAlbums, sortOption]);

  const currentAlbums = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedAlbums.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedAlbums, currentPage]);

  // Grouping Render Logic
  const groupedAlbums = useMemo(() => {
    if (!grouping) return null;

    const groups = {};
    currentAlbums.forEach(album => {
      let key = '';
      if (grouping === 'year') key = album.year;
      else if (grouping === 'decade') key = (Math.floor(album.year / 10) * 10) + 's';
      else if (grouping === 'country') key = album.country;

      if (!groups[key]) groups[key] = [];
      groups[key].push(album);
    });
    return groups;
  }, [currentAlbums, grouping]);


  return (
    <>
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeFilters={activeFilters}
        setActiveFilters={setActiveFilters}
        availableYears={years}
        availableDecades={decades}
        viewMode={viewMode}
        setViewMode={setViewMode}
        grouping={grouping}
        setGrouping={setGrouping}
        sortOption={sortOption}
        setSortOption={setSortOption}
        allAlbums={filteredAlbums}
      />

      {/* FAB for Adding (Only in Edit Mode) */}
      {isEditMode && (
        <button
          className="fab-add-btn"
          onClick={handleCreate}
          title="Agregar Disco"
          style={{
            position: 'fixed', bottom: '2rem', right: '2rem',
            width: '60px', height: '60px', borderRadius: '50%',
            backgroundColor: 'var(--accent-blue-sky)', color: 'black',
            fontSize: '2rem', border: 'none', cursor: 'pointer', zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
          }}
        >
          +
        </button>
      )}

      <AlbumEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingAlbum}
      />

      <AlbumDetailModal
        isOpen={!!viewingAlbum}
        onClose={() => setViewingAlbum(null)}
        album={viewingAlbum}
      />

      <div className="app-container">
        <main>
          {/* GROUPED VIEW */}
          {grouping && groupedAlbums ? (
            <div className="grouped-container">
              {Object.entries(groupedAlbums).map(([groupTitle, albums]) => (
                <div key={groupTitle} className="group-section">
                  <h2 className="group-title">{groupTitle}</h2>
                  <div className={`album-container ${viewMode === 'list' ? 'list-view' : 'grid-view'}`}>
                    {albums.map(album => (
                      <div key={album.id} className="album-item-wrapper">
                        <AlbumCard
                          album={album}
                          viewMode={viewMode}
                          onEdit={isEditMode ? () => handleEdit(album) : null}
                          onDelete={isEditMode ? () => deleteAlbum(album.id) : null}
                          onClick={() => setViewingAlbum(album)} // Open Detail
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* STANDARD VIEW */
            <div className={`album-container ${viewMode === 'list' ? 'list-view' : 'grid-view'}`}>
              {currentAlbums.map(album => (
                <div key={album.id} className="album-item-wrapper">
                  <AlbumCard
                    album={album}
                    viewMode={viewMode}
                    onEdit={isEditMode ? () => handleEdit(album) : null}
                    onDelete={isEditMode ? () => deleteAlbum(album.id) : null}
                    onClick={() => setViewingAlbum(album)} // Open Detail
                  />
                </div>
              ))}
            </div>
          )}

          {currentAlbums.length === 0 && (
            <div className="no-results">
              <p>No se encontraron álbumes.</p>
            </div>
          )}
        </main>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </>
  );
}

function App() {
  return (
    <AdminProvider>
      <MusicApp />
    </AdminProvider>
  );
}

export default App;
