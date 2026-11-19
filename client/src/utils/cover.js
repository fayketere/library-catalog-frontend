const palettes = [
  ["#f1c27d", "#a3402d"],
  ["#b8c5a5", "#304b3d"],
  ["#d9b8cb", "#55394f"],
  ["#a9c5d5", "#29495a"],
  ["#e6a884", "#74392e"],
];

function escapeXml(value) {
  return String(value).replace(/[<>&'"]/g, character => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    "\"": "&quot;",
  })[character]);
}

export function coverImage(book) {
  const palette = palettes[(book.title.length + book.author.length) % palettes.length];
  const title = escapeXml(book.title);
  const author = escapeXml(book.author);
  const genre = escapeXml(book.genreName || "A library selection");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 640"><defs><linearGradient id="paper" x2="1" y2="1"><stop stop-color="${palette[0]}"/><stop offset="1" stop-color="${palette[1]}"/></linearGradient></defs><rect width="480" height="640" fill="url(#paper)"/><path d="M32 32h416v576H32z" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2"/><circle cx="360" cy="130" r="115" fill="#fff" fill-opacity=".09"/><path d="M32 480c108-56 210-15 416-97v225H32z" fill="#1e2523" fill-opacity=".2"/><text x="54" y="103" fill="#fff" fill-opacity=".82" font-family="Georgia,serif" font-size="17" letter-spacing="4">${genre.toUpperCase()}</text><foreignObject x="54" y="196" width="370" height="236"><div xmlns="http://www.w3.org/1999/xhtml" style="color:#fff;font:700 49px/1.05 Georgia,serif;overflow-wrap:anywhere">${title}</div></foreignObject><text x="54" y="545" fill="#fff" font-family="Georgia,serif" font-size="22" letter-spacing="1">${author}</text><text x="54" y="580" fill="#fff" fill-opacity=".65" font-family="Arial,sans-serif" font-size="11" letter-spacing="3">STACKS  ·  LIBRARY EDITION</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
