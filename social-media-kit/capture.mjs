import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(__dirname, 'images');
fs.mkdirSync(outputDir, { recursive: true });

const posts = [
  { selector: '.post-brand',      name: '01-notoriete-marque-1080x1080',   w: 1080, h: 1080, scale: 3 },
  { selector: '.post-gratuit',     name: '02-gratuit-1080x1080',            w: 1080, h: 1080, scale: 3 },
  { selector: '.post-categories',  name: '03-categories-1080x1080',         w: 1080, h: 1080, scale: 3 },
  { selector: '.post-promo',       name: '04-promo-telephones-1080x1080',   w: 1080, h: 1080, scale: 3 },
  { selector: '.post-howto',       name: '05-comment-vendre-1080x1920',     w: 1080, h: 1920, scale: 3 },
  { selector: '.post-whatsapp',    name: '06-whatsapp-contact-1080x1920',   w: 1080, h: 1920, scale: 3 },
  { selector: '.post-temoignage',  name: '07-temoignage-1080x1920',         w: 1080, h: 1920, scale: 3 },
  { selector: '.post-cover',       name: '08-couverture-facebook-820x312',  w: 820,  h: 312,  scale: 2 },
  { selector: '.post-vendeur',     name: '09-cta-vendeur-1200x630',         w: 1200, h: 630,  scale: 2 },
];

const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');
const cssMatch = htmlContent.match(/<style>([\s\S]*?)<\/style>/);
const css = cssMatch ? cssMatch[1] : '';

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox'],
});

for (const post of posts) {
  const vpW = Math.round(post.w / post.scale);
  const vpH = Math.round(post.h / post.scale);

  const page = await browser.newPage({
    viewport: { width: vpW, height: vpH },
    deviceScaleFactor: post.scale,
  });

  const postHtml = extractPost(htmlContent, post.selector);

  const isolatedHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8">
<style>
${css}
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  width: ${vpW}px;
  height: ${vpH}px;
  overflow: hidden;
  background: transparent;
}
.post {
  width: ${vpW}px !important;
  height: ${vpH}px !important;
  aspect-ratio: unset !important;
}
</style>
</head>
<body>${postHtml}</body>
</html>`;

  await page.setContent(isolatedHtml, { waitUntil: 'load' });

  await page.screenshot({
    path: path.join(outputDir, `${post.name}.png`),
    clip: { x: 0, y: 0, width: vpW, height: vpH },
    omitBackground: false,
  });

  console.log(`✅ ${post.name}.png (${vpW}x${vpH} @${post.scale}x → ${post.w}x${post.h})`);
  await page.close();
}

await browser.close();
console.log(`\n🎉 ${posts.length} images générées dans ${outputDir}`);

function extractPost(html, selector) {
  const className = selector.replace('.', '');
  const regex = new RegExp(
    `<div[^>]*class="[^"]*\\b${className}\\b[^"]*"`,
    'i'
  );
  const match = regex.exec(html);
  if (!match) return `<div class="post ${className}" style="width:100%;height:100%"></div>`;

  let startIdx = match.index;
  let depth = 0;
  let i = startIdx;
  let endIdx = html.length;

  while (i < html.length) {
    if (html.substring(i, i + 4) === '<div') {
      depth++;
      i += 4;
    } else if (html.substring(i, i + 6) === '</div>') {
      depth--;
      if (depth === 0) {
        endIdx = i + 6;
        break;
      }
      i += 6;
    } else {
      i++;
    }
  }

  return html.substring(startIdx, endIdx);
}
