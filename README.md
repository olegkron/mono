# Portfolio Template

A minimal, fast personal portfolio built with React, TypeScript, and Vite.

## Quick Start

```bash
npm install
npm run dev
```

## Customisation

Edit `src/content/portfolio.json`. It is the single source for identity, sections, contacts, stack, recognition, hero cards, projects, featured home cards, sitemap entries, robots, and static social metadata.

Project entries use this shape:

```json
{
  "title": "My Project",
  "slug": "my-project",
  "externalUrl": "https://example.com/my-project",
  "heading": "A one-line summary.",
  "seoDescription": "A short SEO description.",
  "description": [
    { "text": "Plain text can be mixed with " },
    { "text": "links", "href": "https://example.com" },
    { "text": "." }
  ],
  "images": [
    { "src": "/assets/projects/my-project/screenshot.png", "alt": "My Project screenshot" }
  ],
  "disciplines": ["Web Development"],
  "technologies": ["React", "TypeScript"],
  "featured": {
    "isVisible": true,
    "role": "Your Role",
    "heading": "Home-page project summary.",
    "description": [{ "text": "Short featured-card copy." }]
  }
}
```

Set `featured.isVisible` to control whether a project appears on the home page. Project detail pages and sitemap entries are generated from the same project list.

## Grid Widgets

The home page includes an optional bento-style grid of stat and social cards. Widgets are defined in `src/constants/widgets.ts` as the `homeWidgets` array.

Each widget has a `size` of `"sm"` or `"md"` (spans two columns) and a `variant` of `"heading"` or `"avatar"`:

```ts
// Stat card
{ size: "sm", variant: "heading", eyebrow: "Label", heading: "120%", subheading: "Description", col: 1, row: 1 }

// Avatar / social card
{ size: "sm", variant: "avatar", avatar: { src: "/logo.png", alt: "Alt" }, subheading: "Name", cta: { label: "Follow", href: "https://example.com" }, col: 2, row: 1 }

// Wide card (spans 2 cols)
{ size: "md", eyebrow: "Label", heading: "Heading", subheading: "Description", col: 1, row: 2 }
```

`col` and `row` are optional — omit them to let the grid auto-place cards. To remove the grid entirely, delete the `<GridWidgets>` usage from `src/screens/HomeScreen.tsx`.

## Static SEO

`index.html`, `public/robots.txt`, and `public/sitemap.xml` are generated from `src/content/portfolio.json`.

```bash
npm run generate:static
```

`npm run build` runs the generator and then verifies generated files are current.

## Assets

Put project media in `public/assets/projects/<project-slug>/` and reference it with an absolute public path, for example:

```json
{ "src": "/assets/projects/my-project/screenshot.png", "alt": "My Project screenshot" }
```

Replace these before publishing:

- `public/avatar.svg`
- `public/favicon.svg`
- `public/og-image.svg` with a production social image, ideally a 1200x630 PNG
- `public/assets/docs/cv.pdf`
- `public/assets/docs/portfolio.pdf`

## Checks

```bash
npm run lint
npm run typecheck
npm run verify:template
npm run test:e2e
npm run build
```

Before publishing with real content:

```bash
npm run verify:publish
```

That command intentionally fails while template placeholders such as `Your Name`, `your-domain.com`, and `example.com` remain.

## Analytics

Copy `.env.example` to `.env.local` and set your Umami website ID:

```bash
VITE_ANALYTICS_ID=your-umami-website-id
```

Leave it blank to disable analytics.

## Deployment

The project includes `netlify.toml` with SPA routing, security headers, and cache rules.

```bash
npm run build
```

The build output is written to `dist/`.

## License

MIT - see [LICENSE](./LICENSE).
