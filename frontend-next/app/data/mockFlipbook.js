const PLACEHOLDER_SOURCES = [
  'https://picsum.photos/seed/fb-cover/1200/800',
  'https://picsum.photos/seed/fb-1/1200/800',
  'https://picsum.photos/seed/fb-2/1200/800',
  'https://picsum.photos/seed/fb-3/1200/800',
  'https://picsum.photos/seed/fb-4/1200/800',
  'https://picsum.photos/seed/fb-5/1200/800',
  'https://picsum.photos/seed/fb-6/1200/800',
  'https://picsum.photos/seed/fb-7/1200/800',
  'https://picsum.photos/seed/fb-8/1200/800',
  'https://picsum.photos/seed/fb-9/1200/800',
];

const SAMPLE_TEXT = [
  'Chapter One: The Quiet Library',
  'On the morning the library opened, only Mira was waiting at the door.',
  'She had carried the same canvas bag for ten years, embroidered with stars.',
  '"We do not lend dreams," the librarian said, smiling. "We lend beginnings."',
  'Mira thought about that as she walked between the shelves, the dust turning gold.',
  'Chapter Two: The Borrowed Map',
  'The map was drawn in a hand she almost recognized. Not her mother’s, but close.',
  'There was a place marked Where the River Forgets Its Name. She wanted to go there.',
  'On page forty-seven of her notebook, she began the journey with a single line.',
  'Chapter Three: A House That Reads Aloud',
  'The little house on Aldermane read aloud to itself each evening at dusk.',
  'Its walls were papered with footnotes. Its windows blinked at passersby.',
  'Mira knocked. The door answered by quoting a poem she half-remembered.',
  'Chapter Four: The Book That Refused',
  'Some books refuse. They close themselves and refuse.',
  'Mira respected refusal. She placed the book back, and it thanked her with a sigh.',
  'Chapter Five: Homeward',
  'On the last page of the last book, she wrote her own name in soft pencil.',
  'Then she closed it gently, slid it onto the shelf, and walked out into the rain.',
];

function buildPage(index, total) {
  const isCover = index === 0;
  const isBack = index === total - 1;
  const text = isCover
    ? 'The Quiet Library — A Flipbook Edition'
    : SAMPLE_TEXT[(index - 1) % SAMPLE_TEXT.length] || `Page ${index + 1}`;
  return {
    id: `page-${index}`,
    index,
    image: PLACEHOLDER_SOURCES[index % PLACEHOLDER_SOURCES.length],
    width: 1200,
    height: 800,
    title: isCover ? 'Cover' : isBack ? 'Colophon' : `Page ${index + 1}`,
    text,
  };
}

const MOCK_FLIPBOOKS = {
  'quiet-library': {
    id: 'quiet-library',
    title: 'The Quiet Library',
    author: 'Mira Holloway',
    description: 'A small book about libraries, refusals, and the maps we borrow.',
    cover: PLACEHOLDER_SOURCES[0],
    pages: Array.from({ length: 10 }, (_, i) => buildPage(i, 10)),
    createdAt: '2026-01-15T09:00:00Z',
  },
};

/**
 * @param {string} id Flipbook id.
 * @returns {object|null} Flipbook payload or null when not found.
 */
export function getMockFlipbook(id) {
  return MOCK_FLIPBOOKS[id] || MOCK_FLIPBOOKS['quiet-library'];
}

/**
 * @returns {string[]} Known flipbook ids for routing fallbacks.
 */
export function listMockFlipbookIds() {
  return Object.keys(MOCK_FLIPBOOKS);
}
