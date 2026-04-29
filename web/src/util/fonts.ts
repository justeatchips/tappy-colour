const BASE = import.meta.env.BASE_URL

export function injectFonts(): void {
  const css = `
@font-face {
  font-family: 'Pixelify Sans';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('${BASE}fonts/Pixelify_Sans/static/PixelifySans-Regular.ttf') format('truetype');
}
@font-face {
  font-family: 'Pixelify Sans';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('${BASE}fonts/Pixelify_Sans/static/PixelifySans-Bold.ttf') format('truetype');
}
@font-face {
  font-family: 'Nunito';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('${BASE}fonts/Nunito/static/Nunito-Regular.ttf') format('truetype');
}
@font-face {
  font-family: 'Nunito';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url('${BASE}fonts/Nunito/static/Nunito-SemiBold.ttf') format('truetype');
}
@font-face {
  font-family: 'Nunito';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('${BASE}fonts/Nunito/static/Nunito-Bold.ttf') format('truetype');
}
@font-face {
  font-family: 'Nunito';
  font-style: normal;
  font-weight: 800;
  font-display: swap;
  src: url('${BASE}fonts/Nunito/static/Nunito-ExtraBold.ttf') format('truetype');
}
@font-face {
  font-family: 'DM Mono';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('${BASE}fonts/DM_Mono/DMMono-Regular.ttf') format('truetype');
}
`
  const style = document.createElement('style')
  style.textContent = css
  document.head.prepend(style)
}
