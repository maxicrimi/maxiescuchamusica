import { useState, useRef, useEffect } from 'react';
import { countries, tags, PROJECT_START_DATE } from '../data/mockData';
import FilterChip from './FilterChip';
import './Header.css';

const Header = ({
    searchQuery, setSearchQuery,
    activeFilters, setActiveFilters,
    availableYears, availableDecades,
    viewMode, setViewMode,
    grouping, setGrouping
}) => {
    const [isAddFilterOpen, setIsAddFilterOpen] = useState(false);
    const [isAboutOpen, setIsAboutOpen] = useState(false);
    const [isGroupOpen, setIsGroupOpen] = useState(false);
    const addFilterRef = useRef(null);
    const aboutRef = useRef(null);
    const groupRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (addFilterRef.current && !addFilterRef.current.contains(event.target)) {
                setIsAddFilterOpen(false);
            }
            if (aboutRef.current && !aboutRef.current.contains(event.target)) {
                setIsAboutOpen(false);
            }
            if (groupRef.current && !groupRef.current.contains(event.target)) {
                setIsGroupOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatProjectDate = (dateStr) => {
        const d = new Date(dateStr);
        return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    };

    const handleFilterChange = (key, values) => {
        setActiveFilters(prev => ({ ...prev, [key]: values }));
    };

    const removeFilterType = (key) => {
        setActiveFilters(prev => {
            const newFilters = { ...prev };
            delete newFilters[key];
            return newFilters;
        });
    };

    const addFilterType = (key) => {
        if (!(key in activeFilters)) {
            setActiveFilters(prev => ({ ...prev, [key]: [] }));
        }
        setIsAddFilterOpen(false);
    };

    const handleGroupingSelect = (value) => {
        setGrouping(value === grouping ? null : value);
        setIsGroupOpen(false);
    };

    const filterOptions = {
        'country': { label: 'País', options: countries },
        'decade': { label: 'Década', options: availableDecades },
        'year': { label: 'Año', options: availableYears },
        'tag': { label: 'Etiqueta', options: tags }
    };

    const availableFilterTypes = Object.keys(filterOptions).filter(key => !(key in activeFilters));

    return (
        <div className="header-wrapper">
            {/* Single Compact Actions Row */}
            <div className="header-actions-row">

                {/* Left Group: Brand - About - Contact */}
                <div className="actions-left-group">
                    {/* Brand Name (Replaces Title) */}
                    <div className="brand-name-compact">MAXI ESCUCHA MÚSICA</div>

                    <div className="header-action-item" ref={aboutRef}>
                        <button
                            className="icon-btn"
                            onClick={() => setIsAboutOpen(!isAboutOpen)}
                            title="Sobre Mí"
                        >
                            ?
                        </button>
                        {isAboutOpen && (
                            <div className="about-dropdown">
                                <p className="about-name">Maxi Crimi. Amante de la Música.</p>
                                <p className="about-description">
                                    Registro de escucha diaria: álbumes y EPs.<br />
                                    Sin preconceptos, sin opiniones. Recibo data por mail.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="header-action-item">
                        <a href="mailto:soymaxicrimi@gmail.com" className="icon-btn" title="Contacto">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                        </a>
                    </div>
                </div>

                {/* Center Group: Search */}
                <div className="actions-center-group">
                    <input
                        type="text"
                        placeholder="Buscar artista, álbum..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input-compact"
                    />
                </div>

                {/* Right Group: Filter - Group - View */}
                <div className="actions-right-group">
                    {/* Filter Add */}
                    {availableFilterTypes.length > 0 && (
                        <div className="header-action-item" ref={addFilterRef}>
                            <button
                                className="icon-btn"
                                onClick={() => setIsAddFilterOpen(!isAddFilterOpen)}
                                title="Agregar Filtro"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                                </svg>
                            </button>
                            {isAddFilterOpen && (
                                <div className="add-filter-dropdown right-aligned">
                                    {availableFilterTypes.map(key => (
                                        <div
                                            key={key}
                                            className="add-filter-item"
                                            onClick={() => addFilterType(key)}
                                        >
                                            {filterOptions[key].label}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Grouping Icon (Menu) */}
                    <div className="header-action-item" ref={groupRef}>
                        <button
                            className={`icon-btn ${grouping ? 'active-control' : ''}`}
                            onClick={() => setIsGroupOpen(!isGroupOpen)}
                            title="Agrupar"
                        >
                            {/* Layers / Group Icon */}
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                                <polyline points="2 17 12 22 22 17"></polyline>
                                <polyline points="2 12 12 17 22 12"></polyline>
                            </svg>
                        </button>
                        {isGroupOpen && (
                            <div className="add-filter-dropdown right-aligned">
                                <div className="add-filter-item-header">Agrupar por...</div>
                                <div
                                    className={`add-filter-item ${!grouping ? 'selected' : ''}`}
                                    onClick={() => handleGroupingSelect(null)}
                                >
                                    Ninguno
                                </div>
                                <div
                                    className={`add-filter-item ${grouping === 'year' ? 'selected' : ''}`}
                                    onClick={() => handleGroupingSelect('year')}
                                >
                                    Año
                                </div>
                                <div
                                    className={`add-filter-item ${grouping === 'decade' ? 'selected' : ''}`}
                                    onClick={() => handleGroupingSelect('decade')}
                                >
                                    Década
                                </div>
                                <div
                                    className={`add-filter-item ${grouping === 'country' ? 'selected' : ''}`}
                                    onClick={() => handleGroupingSelect('country')}
                                >
                                    País
                                </div>
                            </div>
                        )}
                    </div>

                    {/* View Toggles */}
                    <div className="view-toggle-group">
                        <button
                            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                            title="Grilla"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="7" height="7"></rect>
                                <rect x="14" y="3" width="7" height="7"></rect>
                                <rect x="14" y="14" width="7" height="7"></rect>
                                <rect x="3" y="14" width="7" height="7"></rect>
                            </svg>
                        </button>
                        <button
                            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                            title="Lista"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="8" y1="6" x2="21" y2="6"></line>
                                <line x1="8" y1="12" x2="21" y2="12"></line>
                                <line x1="8" y1="18" x2="21" y2="18"></line>
                                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                                <line x1="3" y1="18" x2="3.01" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Active Filters Row - Only Render if Filters Exist */}
            {Object.keys(activeFilters).length > 0 && (
                <div className="active-filters-row">
                    {Object.entries(activeFilters).map(([key, values]) => (
                        <FilterChip
                            key={key}
                            label={filterOptions[key].label}
                            options={filterOptions[key].options}
                            selectedValues={values}
                            onChange={(newValues) => handleFilterChange(key, newValues)}
                            onRemove={() => removeFilterType(key)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Header;
