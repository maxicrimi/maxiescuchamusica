import { useState, useRef, useEffect } from 'react';
import './FilterChip.css';

const FilterChip = ({ label, options, selectedValues, onChange, onRemove, color = 'var(--accent-blue-sky)' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (value) => {
        const newValues = selectedValues.includes(value)
            ? selectedValues.filter(v => v !== value)
            : [...selectedValues, value];
        onChange(newValues);
    };

    return (
        <div className="filter-chip" ref={dropdownRef}>
            <div className="chip-header" onClick={() => setIsOpen(!isOpen)} style={{ borderColor: isOpen ? color : '#444' }}>
                <span className="chip-label">{label}</span>
                {selectedValues.length > 0 && (
                    <span className="chip-count" style={{ backgroundColor: color }}>{selectedValues.length}</span>
                )}
                <span className="chip-arrow">▼</span>
            </div>

            {/* Remove button outside main click area to avoid opening dropdown */}
            <button className="chip-remove" onClick={(e) => { e.stopPropagation(); onRemove(); }}>×</button>

            {isOpen && (
                <div className="chip-dropdown">
                    {options.map(option => (
                        <label key={option} className="dropdown-item">
                            <input
                                type="checkbox"
                                checked={selectedValues.includes(option)}
                                onChange={() => toggleOption(option)}
                            />
                            <span>{option}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FilterChip;
