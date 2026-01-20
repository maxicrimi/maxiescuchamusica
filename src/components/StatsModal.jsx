import { useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
    ScatterChart, Scatter, ZAxis, LabelList
} from 'recharts';
import './StatsModal.css';

// Monochromatic Brand Colors
const BRAND_BLUE = '#87CEEB';
const CHART_BAR_COLOR = '#87CEEB';
const BUBBLE_COLOR = '#87CEEB';

// Hardcoded "Perfect Cloud" Normalized Coordinates for Top 10 items
const CLOUD_POSITIONS = [
    { x: 0, y: 0 },       // 1
    { x: -1, y: 0.8 },    // 2
    { x: 1, y: 0.8 },     // 3
    { x: 0, y: 1.5 },     // 4
    { x: -1.5, y: -0.5 }, // 5
    { x: 1.5, y: -0.5 },  // 6
    { x: -0.8, y: -1.2 }, // 7
    { x: 0.8, y: -1.2 },  // 8
    { x: 0, y: -2 },      // 9
    { x: -2.2, y: 0.2 },  // 10
];

const StatsModal = ({ isOpen, onClose, albums }) => {
    if (!isOpen) return null;

    const stats = useMemo(() => {
        const totalAlbums = albums.length;
        const totalArtists = new Set(albums.map(a => a.artist)).size;

        // Top Country (All Data)
        const countryCount = {};
        albums.forEach(a => countryCount[a.country] = (countryCount[a.country] || 0) + 1);
        const countryData = Object.entries(countryCount)
            .sort((a, b) => b[1] - a[1]) // Sort descend
            .map(([name, value]) => ({ name, value }));

        // Decades Distribution (Vertical Bar)
        const decadesCount = {};
        albums.forEach(a => {
            const decade = Math.floor(a.year / 10) * 10;
            decadesCount[decade] = (decadesCount[decade] || 0) + 1;
        });
        const decadesData = Object.entries(decadesCount)
            .map(([decade, count]) => ({ name: `${decade}s`, value: count }))
            .sort((a, b) => a.name.localeCompare(b.name));

        // Tags (All Data)
        const tagCount = {};
        albums.forEach(a => {
            if (a.tags) a.tags.forEach(t => tagCount[t] = (tagCount[t] || 0) + 1);
        });

        // Map Tags: Top 15 Fixed/Spiral
        // We limit to 15 to ensure they fit in the cloud without scrolling
        const tagsData = Object.entries(tagCount)
            .sort((a, b) => b[1] - a[1]) // Sort by count
            .slice(0, 15) // Limit to Keep it Clean & No Scroll
            .map(([name, value], index) => {
                let x, y;
                // Use fixed clean layout for Top 10
                if (index < 10 && CLOUD_POSITIONS[index]) {
                    x = CLOUD_POSITIONS[index].x * 40;
                    y = CLOUD_POSITIONS[index].y * 30;
                } else {
                    // Spiral for 11-15
                    const angle = index * 2.4;
                    const r = 25 + (index * 7);
                    x = Math.cos(angle) * r;
                    y = Math.sin(angle) * r * 0.7;
                }

                return {
                    name,
                    value,
                    x,
                    y,
                    z: value * 100 // Scale magnitude
                };
            });

        return {
            totalAlbums,
            totalArtists,
            decadesData,
            countryData,
            tagsData
        };
    }, [albums]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const name = data.name || label || payload[0].name;
            const value = data.value !== undefined ? data.value : payload[0].value;

            return (
                <div className="custom-tooltip">
                    <p className="tooltip-label">{`${name}: ${value}`}</p>
                </div>
            );
        }
        return null;
    };

    // Dynamic Heights for Scrollable Charts
    const countryHeight = Math.max(240, stats.countryData.length * 35);
    // Tags height fixed to 240 as we are fitting them naturally

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="stats-modal-content glass-panel" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>&times;</button>

                <h2 className="stats-title">Estadísticas</h2>

                {/* Minimalist Text-Only KPIs */}
                <div className="kpi-minimal-row">
                    <span className="kpi-min-item">
                        <strong className="kpi-min-val">{stats.totalAlbums}</strong> Álbumes
                    </span>
                    <span className="kpi-separator">•</span>
                    <span className="kpi-min-item">
                        <strong className="kpi-min-val">{stats.totalArtists}</strong> Artistas
                    </span>
                </div>

                <div className="charts-grid-3">
                    {/* Decades Bar Chart (Vertical) */}
                    <div className="chart-section">
                        <h3>Por Década</h3>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={stats.decadesData} margin={{ top: 15, bottom: 0, left: 0, right: 0 }}>
                                    <XAxis dataKey="name" stroke="#555" tick={{ fill: '#777', fontSize: 11, dy: 5 }} interval={0} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                    <Bar dataKey="value" fill={CHART_BAR_COLOR} radius={[4, 4, 0, 0]} barSize={28} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Country - SCROLLABLE */}
                    <div className="chart-section">
                        <h3>Países</h3>
                        <div className="chart-container scroll-container">
                            <div style={{ height: countryHeight, width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        layout="vertical"
                                        data={stats.countryData}
                                        margin={{ top: 0, right: 15, left: 0, bottom: 0 }}
                                    >
                                        <XAxis type="number" hide />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            width={80}
                                            tick={{ fill: '#888', fontSize: 11, textAnchor: 'end' }}
                                            interval={0}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                        <Bar dataKey="value" fill={CHART_BAR_COLOR} radius={[0, 4, 4, 0]} barSize={12} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Tags - NO SCROLL & Cloud */}
                    <div className="chart-section">
                        <h3>Etiquetas</h3>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height={240}>
                                <ScatterChart margin={{ top: 15, right: 15, bottom: 15, left: 15 }}>
                                    <XAxis type="number" dataKey="x" hide domain={['auto', 'auto']} />
                                    <YAxis type="number" dataKey="y" hide domain={['auto', 'auto']} />
                                    <ZAxis type="number" dataKey="z" range={[80, 500]} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                                    <Scatter
                                        data={stats.tagsData}
                                        fill={BUBBLE_COLOR}
                                        fillOpacity={0.65}
                                        shape="circle"
                                    >
                                        <LabelList
                                            dataKey="name"
                                            position="bottom"
                                            style={{
                                                fill: '#ececec',
                                                fontSize: '11px',
                                                fontFamily: 'Helvetica, Arial, sans-serif',
                                                fontWeight: 'normal',
                                                opacity: 0.9,
                                                letterSpacing: '0.4px',
                                                textShadow: '0px 1px 3px rgba(0,0,0,0.8)'
                                            }}
                                            offset={8}
                                        />
                                    </Scatter>
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default StatsModal;
