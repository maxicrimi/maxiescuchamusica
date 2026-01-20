export const countries = ['Argentina', 'USA', 'UK', 'Brasil', 'Japón', 'Alemania', 'Francia', 'España', 'Canadá', 'Australia'];
export const tags = ['Rock', 'Pop', 'Indie', 'Jazz', 'Electrónica', 'Hip Hop', 'Folk', 'Metal', 'Clásica', 'Ambient', 'Soul', 'R&B'];

export const PROJECT_START_DATE = '2024-01-01'; // Example start date

const artists = [
  'The Beatles', 'Pink Floyd', 'Radiohead', 'Gustavo Cerati', 'Charly García',
  'Luis Alberto Spinetta', 'Tame Impala', 'Daft Punk', 'Kendrick Lamar', 'David Bowie',
  'Queen', 'Led Zeppelin', 'Nirvana', 'Metallica', 'The Strokes',
  'Arctic Monkeys', 'Gorillaz', 'Coldplay', 'Red Hot Chili Peppers', 'Foo Fighters',
  'Soda Stereo', 'Babasonicos', 'Los Abuelos de la Nada', 'Sumo', 'Virus',
  'Frank Ocean', 'Tyler, The Creator', 'Kanye West', 'Drake', 'The Weeknd'
];

const albumTitles = [
  'Abbey Road', 'Dark Side of the Moon', 'OK Computer', 'Bocanada', 'Clics Modernos',
  'Artaud', 'Currents', 'Random Access Memories', 'To Pimp a Butterfly', 'Blackstar',
  'A Night at the Opera', 'IV', 'Nevermind', 'Master of Puppets', 'Is This It',
  'AM', 'Demon Days', 'Parachutes', 'Californication', 'The Colour and the Shape',
  'Doble Vida', 'Jessico', 'Vasos y Besos', 'Llegando los Monos', 'Locura',
  'Blonde', 'IGOR', 'My Beautiful Dark Twisted Fantasy', 'Take Care', 'After Hours'
];

const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
};

const generateAlbums = (count) => {
  const albums = [];
  const projectStart = new Date(PROJECT_START_DATE);
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const artist = artists[Math.floor(Math.random() * artists.length)];
    const title = albumTitles[Math.floor(Math.random() * albumTitles.length)];
    const displayTitle = Math.random() > 0.8 ? `${title} (Deluxe)` : title;

    // Date Added: Random date between project start and now
    // Last Updated: Random date between added date and now
    const dateAdded = getRandomDate(projectStart, now);
    const lastUpdated = getRandomDate(new Date(dateAdded), now);

    // Ensure unique tags
    const pickedTags = new Set();
    while (pickedTags.size < (Math.random() > 0.5 ? 2 : 1)) {
      pickedTags.add(tags[Math.floor(Math.random() * tags.length)]);
    }

    albums.push({
      id: i + 1,
      artist: artist,
      title: displayTitle,
      coverUrl: `https://picsum.photos/seed/${i}/300/300`,
      country: countries[Math.floor(Math.random() * countries.length)],
      year: 1960 + Math.floor(Math.random() * 64),
      tags: Array.from(pickedTags),
      dateAdded: dateAdded,
      lastUpdated: lastUpdated
    });
  }
  return albums;
};

export const mockAlbums = generateAlbums(150);
