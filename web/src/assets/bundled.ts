export interface BundledImage {
  id: string
  title: string
  src: string
}

const base = import.meta.env.BASE_URL

export const BUNDLED_IMAGES: BundledImage[] = [
  { id: 'img_duck',   title: 'Duck',   src: base + 'images/img_duck.png'   },
  { id: 'img_cat',    title: 'Cat',    src: base + 'images/img_cat.png'    },
  { id: 'img_rocket', title: 'Rocket', src: base + 'images/img_rocket.png' },
  { id: 'img_flower', title: 'Flower', src: base + 'images/img_flower.png' },
  { id: 'img_fish',   title: 'Fish',   src: base + 'images/img_fish.png'   },
]
