import { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import AlbumCard from './components/AlbumCard';
import Pagination from './components/Pagination';
import { mockAlbums } from './data/mockData';
import './App.css';

const ITEMS_PER_PAGE = 50;

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [viewMode, setViewMode] = useState('grid');
  const [grouping, setGrouping] = useState(null); // 'year', 'decade', 'country', null
  const [currentPage, setCurrentPage] = useState(1);

  // Derive available years and decades
  const { years, decades } = useMemo(() => {
    const allYears = [...new Set(mockAlbums.map(a => a.year))].sort((a, b) => b - a);
    const allDecades = [...new Set(mockAlbums.map(a => Math.floor(a.year / 10) * 10))].sort((a, b) => b - a);
    return {
      years: allYears.map(String),
      decades: allDecades.map(String)
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilters, grouping, viewMode]);



  const filteredAlbums = useMemo(() => {
    return mockAlbums.filter(album => {
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
  }, [searchQuery, activeFilters]);

  // Pagination Logic
  // Note: Pagination gets tricky with grouping. 
  // Strategy: Paginate the FLATTENED list first, then group? Or Group the whole list then pagination?
  // Usually, with grouping, pagination is awkward. 
  // Let's paginate the ITEMS, then render groups for the items on current page.
  // OR, if grouping is active, disable pagination or paginate groups?
  // Use Case: "50 albums per page". We will stick to item-based pagination.

  const totalPages = Math.ceil(filteredAlbums.length / ITEMS_PER_PAGE);
  const currentAlbums = useMemo(() => {
    // If grouping is active, we might want to sort by that group key first to ensure chunks make sense?
    let sorted = [...filteredAlbums];
    if (grouping) {
      if (grouping === 'year') sorted.sort((a, b) => b.year - a.year);
      if (grouping === 'decade') sorted.sort((a, b) => b.year - a.year);
      if (grouping === 'country') sorted.sort((a, b) => a.country.localeCompare(b.country));
    }

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sorted.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAlbums, currentPage, grouping]);

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
    return groups; // Returns object { "2024": [...], "2023": [...] }
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
      />

      <div className="app-container">
        <main>
          {/* GROUPED VIEW (List or Grid) */}
          {grouping && groupedAlbums ? (
            <div className="grouped-container">
              {Object.entries(groupedAlbums).map(([groupTitle, albums]) => (
                <div key={groupTitle} className="group-section">
                  <h2 className="group-title">{groupTitle}</h2>
                  <div className={`album-container ${viewMode === 'list' ? 'list-view' : 'grid-view'}`}>
                    {albums.map(album => (
                      <div key={album.id} className="album-item-wrapper">
                        <AlbumCard album={album} viewMode={viewMode} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* STANDARD VIEW (Grid or Flat List) */
            <div className={`album-container ${viewMode === 'list' ? 'list-view' : 'grid-view'}`}>
              {currentAlbums.map(album => (
                <div key={album.id} className="album-item-wrapper">
                  <AlbumCard album={album} viewMode={viewMode} />
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

export default App;
