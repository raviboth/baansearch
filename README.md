# BaanSearch

> Disclaimer: ✨Vibe coded✨, hand architected. I was inspired by [Brian's job search](https://briansjobsearch.com/) and wanted to do something more customizable.

Job search link aggregator for tech professionals. Generate pre-built search URLs to 60+ job boards with a single set of filters.


## Features

- **60+ Job Boards** across 5 categories:
  - ATS Systems (Greenhouse, Lever, Ashby, Workday, etc.)
  - Major Platforms (LinkedIn, Indeed, Glassdoor, ZipRecruiter, Google Jobs)
  - Tech-Focused (Wellfound, Y Combinator, Stack Overflow, Dice, etc.)
  - Niche & Specialized (Remote-focused, climate tech, crypto, gaming, etc.)
  - Company Careers (Google, Apple, Amazon, Meta, Netflix, Stripe, etc.)

- **Smart Filtering**
  - Role/job title with variations (e.g., "full stack" / "fullstack")
  - Experience level (entry, mid, senior, director)
  - Technologies (include/exclude)
  - Industries (include/exclude)
  - Remote preference
  - Location
  - Time posted
  - Company size

- **Presets** - Save and load filter configurations
- **Theme Support** - Light/dark mode
- **Local Storage** - Filters persist across sessions

## Getting Started

### Prerequisites

- Node.js 18+

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open `index.html` in your browser.

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

## Tech Stack & Decisions

### Stack
- **TypeScript** - Strict mode for type safety
- **esbuild** - Fast bundling (~15ms builds)
- **Vitest** - Test runner with jsdom for DOM testing
- **Vanilla JS** - No framework; direct DOM manipulation

### Why No Framework?
Single-page tool with simple UI needs:
- Filter inputs → generate URLs → display links
- No complex state or routing needed
- Bundle stays small (~49kb) and loads instantly

### Architecture

**URL Generation**
- Each job board has a `buildUrl(filters)` function
- Two query builders:
  - `buildSearchQuery()` - Boolean syntax with quotes for sophisticated search engines (LinkedIn, Indeed, Google)
  - `buildSimpleQuery()` - Plain terms for sites that display raw query in URL (Glassdoor, company careers)

**Tri-state Checkboxes**
- Technologies/industries support include/exclude/ignore
- Enables "Python jobs but NOT Java" queries

**Storage**
- Filters auto-save to localStorage
- Presets exportable as JSON
- URL sharing via query string

**No Backend**
- Pure client-side; opens directly in browser
- Docker is just nginx serving static files

## Project Structure

```
├── src/
│   ├── app.ts          # Main application logic
│   ├── jobboards.ts    # Job board definitions and URL builders
│   ├── types.ts        # TypeScript types
│   ├── storage.ts      # Local storage utilities
│   ├── presets.ts      # Preset configurations
│   └── tristate.ts     # Tri-state checkbox component
├── css/
│   └── styles.css      # Styling
├── dist/               # Built output
└── index.html          # Main HTML file
```

## Deployment

### Docker (recommended)

Pull and run from GitHub Container Registry:

```bash
docker compose pull
docker compose up -d
```

The app runs on port `8080`. Configure your reverse proxy:

| Proxy | Config |
|-------|--------|
| Caddy | `reverse_proxy localhost:8080` |
| nginx | `proxy_pass http://localhost:8080;` |
| Traefik | Use labels or file provider |

To update:
```bash
docker compose pull && docker compose up -d
```

### Static Files

No Docker needed. Build and serve with any web server:

```bash
npm run build
```

Serve these files:
- `index.html`
- `css/`
- `dist/`

### Local Development

```bash
docker compose up
```

Access at `http://localhost:8080`

## License

MIT
