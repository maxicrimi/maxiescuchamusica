import { mockAlbums } from './mockData';
import catalogAlbums from './catalog.json';

// Configuration: Toggle to use only catalog or mix
// In production, you might want only catalog.
// For now, let's export valid JSON catalog + Mock Data for demo purposes 
// unless catalog has enough items.

// If in Dev mode, we might want to see Catalog updates instantly.
// But catalog.json is imported statically by Vite/Rollup.
// To see "Live" updates in Dev without HMR reload, we need to fetch from API.
// BUT for simplicity, we will stick to static import for the "Build".
// In Dev, the App component will fetch the latest JSON.

// Initial Load Strategy:
const useMock = false; // Set to true if you want to keep seeing 100+ items
const combinedAlbums = useMock ? [...catalogAlbums, ...mockAlbums] : catalogAlbums;

export const getAllAlbums = () => {
    return combinedAlbums;
};

export const MOCK_DATA = mockAlbums;
export const CATALOG_DATA = catalogAlbums;
