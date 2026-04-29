// Design tokens for Tappy Colour explorations.
// Themes, fonts, mascots, sample puzzle palettes — shared across all variants.

const TC_THEMES = {
  candy: {
    id: 'candy',
    name: 'Candy',
    bg: '#fff1f7',
    bgAlt: '#fde6f0',
    surface: '#ffffff',
    ink: '#3a2a4a',
    inkSoft: '#7a5d8a',
    primary: '#ff5fa2',     // hot pink
    primarySoft: '#ffd0e3',
    accent: '#a78bfa',      // lilac
    accentSoft: '#e7defb',
    mint: '#7adfc1',
    mintSoft: '#cdf2e6',
    sun: '#ffd25f',
    sunSoft: '#fff1c4',
    shadow: 'rgba(196, 80, 140, 0.18)',
  },
  sunny: {
    id: 'sunny',
    name: 'Sunny',
    bg: '#fff7e6',
    bgAlt: '#ffeccd',
    surface: '#ffffff',
    ink: '#4a2e1a',
    inkSoft: '#8a6a4a',
    primary: '#ff8a3d',
    primarySoft: '#ffd5b8',
    accent: '#ff5fa2',
    accentSoft: '#ffd0e3',
    mint: '#7adfc1',
    mintSoft: '#cdf2e6',
    sun: '#ffcb3d',
    sunSoft: '#fff0bf',
    shadow: 'rgba(180, 100, 40, 0.18)',
  },
  sky: {
    id: 'sky',
    name: 'Sky',
    bg: '#eaf6ff',
    bgAlt: '#d4ecff',
    surface: '#ffffff',
    ink: '#1f2e4a',
    inkSoft: '#5a6a8a',
    primary: '#3da9ff',
    primarySoft: '#bfe1ff',
    accent: '#7adfc1',
    accentSoft: '#cdf2e6',
    mint: '#a78bfa',
    mintSoft: '#e7defb',
    sun: '#ffcb3d',
    sunSoft: '#fff0bf',
    shadow: 'rgba(40, 90, 180, 0.18)',
  },
  cream: {
    id: 'cream',
    name: 'Cream',
    bg: '#fbf6ee',
    bgAlt: '#f3ead8',
    surface: '#ffffff',
    ink: '#2a2620',
    inkSoft: '#7a6e5a',
    primary: '#e8704d',
    primarySoft: '#f8c8b6',
    accent: '#7d8c5a',
    accentSoft: '#d3dab8',
    mint: '#7adfc1',
    mintSoft: '#cdf2e6',
    sun: '#e8c34d',
    sunSoft: '#f5e3a8',
    shadow: 'rgba(80, 60, 30, 0.16)',
  },
};

const TC_FONTS = {
  rounded: {
    id: 'rounded',
    name: 'Rounded (Fredoka + Nunito)',
    display: '"Fredoka", "Nunito", system-ui, sans-serif',
    body: '"Nunito", system-ui, sans-serif',
    mono: '"DM Mono", ui-monospace, monospace',
    googleFamilies: ['Fredoka:wght@400;500;600;700', 'Nunito:wght@400;600;700;800'],
  },
  storybook: {
    id: 'storybook',
    name: 'Storybook (Quicksand + Baloo)',
    display: '"Baloo 2", "Quicksand", system-ui, sans-serif',
    body: '"Quicksand", system-ui, sans-serif',
    mono: '"DM Mono", ui-monospace, monospace',
    googleFamilies: ['Baloo+2:wght@500;600;700;800', 'Quicksand:wght@400;500;600;700'],
  },
  pixel: {
    id: 'pixel',
    name: 'Pixel (Silkscreen + Nunito)',
    display: '"Silkscreen", system-ui, sans-serif',
    body: '"Nunito", system-ui, sans-serif',
    mono: '"DM Mono", ui-monospace, monospace',
    googleFamilies: ['Silkscreen:wght@400;700', 'Nunito:wght@400;600;700;800'],
  },
};

// Each mascot is just a colour scheme + a name + a "kind" (round/long).
// Renders as a chunky CSS shape, not pixel art (we have a separate pixel version).
const TC_MASCOTS = [
  { id: 'pip',     name: 'Pip',     kind: 'chick',   body: '#ffd25f', accent: '#ff8a3d', cheek: '#ff9bbd', tag: 'they/them' },
  { id: 'rosie',   name: 'Rosie',   kind: 'bunny',   body: '#ffc0d6', accent: '#ff5fa2', cheek: '#ff7aa6', tag: 'she/her' },
  { id: 'bo',      name: 'Bo',      kind: 'bear',    body: '#c79a6b', accent: '#7a4a26', cheek: '#ff9bbd', tag: 'he/him' },
  { id: 'mochi',   name: 'Mochi',   kind: 'cat',     body: '#f3ead8', accent: '#5a4a3a', cheek: '#ff9bbd', tag: 'they/them' },
  { id: 'finn',    name: 'Finn',    kind: 'frog',    body: '#7adfc1', accent: '#3a8a6a', cheek: '#ff9bbd', tag: 'he/him' },
  { id: 'luna',    name: 'Luna',    kind: 'fox',     body: '#ff8a3d', accent: '#a8431a', cheek: '#ffb0d0', tag: 'she/her' },
  { id: 'bibi',    name: 'Bibi',    kind: 'octopus', body: '#a78bfa', accent: '#5a3aaa', cheek: '#ffb0d0', tag: 'they/them' },
  { id: 'sprout',  name: 'Sprout',  kind: 'dino',    body: '#9adf7a', accent: '#3a8a4a', cheek: '#ff9bbd', tag: 'they/them' },
  { id: 'sparkle', name: 'Sparkle', kind: 'unicorn', body: '#ffe5f3', accent: '#ff5fa2', cheek: '#a78bfa', tag: 'she/her' },
  { id: 'plop',    name: 'Plop',    kind: 'poo',     body: '#8a5a3a', accent: '#5a3a20', cheek: '#ff9bbd', tag: 'they/them' },
  { id: 'sunny',   name: 'Sunny',   kind: 'smiley',  body: '#ffd25f', accent: '#f4a020', cheek: '#ff9bbd', tag: 'they/them' },
];

// Sample puzzle palettes (rough — what a kid would see in the strip).
const TC_SAMPLE_PALETTES = {
  unicorn: [
    '#ffd0e3', '#ff8fbf', '#ff5fa2', '#a78bfa', '#7adfc1',
    '#ffd25f', '#fff1c4', '#3a2a4a',
  ],
  cat: [
    '#3a2a20', '#7a5d4a', '#c79a6b', '#f3ead8', '#ffffff',
    '#ff9bbd', '#7adfc1',
  ],
  rocket: [
    '#1f2e4a', '#3da9ff', '#bfe1ff', '#ffffff', '#ffd25f',
    '#ff5fa2', '#ff8a3d',
  ],
};

// Sample artworks for the gallery.
const TC_SAMPLE_GALLERY = [
  { id: 'unicorn',  title: 'Unicorn',     palette: 'unicorn', progress: 0.62, complete: false, hue: '#ffc0d6' },
  { id: 'cat',      title: 'My cat Mochi', palette: 'cat',     progress: 1.00, complete: true,  hue: '#c79a6b' },
  { id: 'rocket',   title: 'Rocket',      palette: 'rocket',  progress: 0.18, complete: false, hue: '#3da9ff' },
  { id: 'flower',   title: 'Sunflower',   palette: 'unicorn', progress: 0.85, complete: false, hue: '#ffd25f' },
];

const TC_STARTERS = [
  { id: 'dino',    title: 'Dino',        hue: '#7adfc1' },
  { id: 'butterfly', title: 'Butterfly', hue: '#a78bfa' },
  { id: 'castle',  title: 'Castle',      hue: '#ff8a3d' },
  { id: 'whale',   title: 'Whale',       hue: '#3da9ff' },
];

window.TC_THEMES = TC_THEMES;
window.TC_FONTS = TC_FONTS;
window.TC_MASCOTS = TC_MASCOTS;
window.TC_SAMPLE_PALETTES = TC_SAMPLE_PALETTES;
window.TC_SAMPLE_GALLERY = TC_SAMPLE_GALLERY;
window.TC_STARTERS = TC_STARTERS;
