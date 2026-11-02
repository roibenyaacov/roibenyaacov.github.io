# Roi Ben Yaacov — portfolio site

A single page that shows the three apps: Par King, Shield Parking and Royal Cash.
No build step, no dependencies: plain HTML, one stylesheet, one script.

```
index.html          the page
assets/site.css     tokens, sections, motion
assets/site.js      entrances, the chapter-coloured header, the settlement line
assets/shots/       nine real screenshots from the shipped apps
assets/video/       a real screen recording of Par King, in the same phone frame
assets/img/         the portrait
```

## Seeing it

Opening `index.html` in a browser works on its own. To serve it:

```bash
node serve.mjs . 
```

then open <http://localhost:5173/>. In Claude Code the preview is configured as
`portfolio-site` in `.claude/launch.json`.

## Publishing

Everything is static, so any host that serves a folder works (GitHub Pages,
Netlify, Cloudflare Pages, Vercel). Upload the repository as it is; `index.html`
is the entry point.

## The settlement line

The "Settle a night yourself" input runs the same greedy settlement Royal Cash
uses: each player's buy-in and cash-out, biggest debtor paying the biggest
winner, which never needs more than one payment fewer than there are players.
It works from the keyboard, and the page shows a worked example without script.

## Design

Built with the `design-taste-frontend` skill; the direction sheet and the
inspector's measurements live in `.taste-skill/`.

- Direction: "Type and nothing else", seed 1821289364
- Type: Hanken Grotesk, five sizes
- Colour: the three apps' own colours, one per chapter
