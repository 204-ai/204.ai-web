204 — website
===============

Deploy: upload this whole folder to any static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages, or any web server). index.html is the entry point. No build step.

Netlify quickest route: app.netlify.com/drop → drag this folder in.

Must be served over http(s) — opening index.html by double-click won't load the page scripts or YouTube players.

Structure
- index.html        entry
- styles.css        all tokens + components
- *.jsx             one file per page (compiled in the browser)
- assets/           images, logos, muted MP4 reels

Contact form opens the visitor's mail client addressed to hello@204.ai.
