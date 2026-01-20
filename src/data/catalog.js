// =====================================================================
// CATÁLOGO DE ÁLBUMES - MAXI ESCUCHA MÚSICA
// =====================================================================
// INSTRUCCIONES:
// 1. Agrega tus álbumes en la lista 'albums' de abajo.
// 2. Para la portada (coverUrl):
//    - Copia tu imagen en la carpeta: /public/covers/
//    - Usa la ruta: "/covers/nombre-archivo.jpg"
// 3. Los 'tags' pueden ser cualquiera, pero trata de ser consistente.
// =====================================================================

export const albums = [
    {
        id: 1,
        artist: "Radiohead",
        title: "In Rainbows",
        coverUrl: "/covers/in-rainbows.jpg", // Asegúrate de tener esta imagen en public/covers/
        country: "UK",
        year: 2007,
        tags: ["Art Rock", "Electronic", "Experimental"],
        dateAdded: "2024-01-20T10:00:00Z", // Fecha ISO
        rating: null, // (Opcional) Por si quieres agregar puntaje a futuro
        comment: "Increíble texturas y calidez." // (Opcional) Comentarios privados o públicos
    },
    {
        id: 2,
        artist: "Charly García",
        title: "Clics Modernos",
        coverUrl: "/covers/clics-modernos.jpg",
        country: "Argentina",
        year: 1983,
        tags: ["Rock Nacional", "New Wave", "Pop"],
        dateAdded: "2024-01-21T15:30:00Z"
    }
    // ... copia y pega el bloque anterior para agregar más ...
];

// Opcional: Listas de referencia para el autocompletado en tu cabeza
// Countries: Argentina, USA, UK, Brasil, Japón, Alemania, Francia, España...
// Tags: Rock, Pop, Indie, Jazz, Electrónica, Hip Hop, Folk, Metal, Soul, R&B...
