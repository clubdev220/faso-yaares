import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(__dirname, 'images');
fs.mkdirSync(outputDir, { recursive: true });

const posts = [
  { selector: '.post-brand',      name: '01-notoriete-marque-1080x1080',   w: 1080, h: 1080 },
  { selector: '.post-gratuit',     name: '02-gratuit-1080x1080',            w: 1080, h: 1080 },
  { selector: '.post-categories',  name: '03-categories-1080x1080',         w: 1080, h: 1080 },
  { selector: '.post-promo',       name: '04-promo-telephones-1080x1080',   w: 1080, h: 1080 },
  { selector: '.post-howto',       name: '05-comment-vendre-1080x1920',     w: 1080, h: 1920 },
  { selector: '.post-whatsapp',    name: '06-whatsapp-contact-1080x1920',   w: 1080, h: 1920 },
  { selector: '.post-temoignage',  name: '07-temoignage-1080x1920',         w: 1080, h: 1920 },
  { selector: '.post-cover',       name: '08-couverture-facebook-820x312',  w: 820,  h: 312  },
  { selector: '.post-vendeur',     name: '09-cta-vendeur-1200x630',         w: 1200, h: 630  },
];

const htmlPath = `file://${path.join(__dirname, 'index.html')}`;

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox'],
});

for (const post of posts) {
  const page = await browser.newPage({ viewport: { width: post.w, height: post.h } });

  const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');

  const isolatedHtml = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
${htmlContent.match(/<style>([\s\S]*?)<\/style>/)?.[1] || ''}

body {
  margin: 0; padding: 0;
  width: ${post.w}px;
  height: ${post.h}px;
  overflow: hidden;
  background: transparent;
}
.post {
  width: ${post.w}px !important;
  height: ${post.h}px !important;
  aspect-ratio: unset !important;
}
</style>
</head>
<body>
${extractPost(htmlContent, post.selector)}
</body>
</html>`;

  await page.setContent(isolatedHtml, { waitUntil: 'load' });

  await page.screenshot({
    path: path.join(outputDir, `${post.name}.png`),
    clip: { x: 0, y: 0, width: post.w, height: post.h },
    omitBackground: false,
  });

  console.log(`✅ ${post.name}.png`);
  await page.close();
}

await browser.close();
console.log(`\n🎉 ${posts.length} images générées dans ${outputDir}`);

function extractPost(html, selector) {
  const className = selector.replace('.', '');
  const regex = new RegExp(`<div[^>]*class="[^"]*\\bpost\\b[^"]*\\b${className}\\b[^"]*"[\\s\\S]*?(?=<div[^>]*class="post-meta"|$)`, 'i');

  let match = html.match(regex);
  if (!match) {
    const simpleRegex = new RegExp(`<div[^>]*class="[^"]*${className}[^"]*"[\\s\\S]*?<\\/div>\\s*<\\/div>\\s*<div[^>]*class="post-meta"`, 'i');
    match = html.match(simpleRegex);
    if (match) {
      return match[0].replace(/<div[^>]*class="post-meta".*$/, '');
    }
  }

  if (!match) return `<div class="post ${className}" style="width:100%;height:100%"></div>`;

  let result = match[0];
  let openCount = (result.match(/<div/g) || []).length;
  let closeCount = (result.match(/<\/div>/g) || []).length;

  let searchFrom = match.index + match[0].length;
  const remaining = html.substring(searchFrom);

  let pos = 0;
  while (openCount > closeCount && pos < remaining.length) {
    const nextClose = remaining.indexOf('</div>', pos);
    if (nextClose === -1) break;
    result += remaining.substring(pos, nextClose + 6);
    pos = nextClose + 6;
    closeCount++;

    const segment = remaining.substring(pos > 6 ? pos - (nextClose + 6 - (pos - 6)) : 0, nextClose + 6);
    const opens = (remaining.substring(pos - (nextClose + 6), nextClose + 6).match(/<div/g) || []).length;
    openCount += opens;
  }

  return result;
}
