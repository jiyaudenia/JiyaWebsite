# Jiya Udenia portfolio replica

A local snapshot of [jiyaudenia.com](https://jiyaudenia.com/), captured October 6, 2026. It preserves the published Readymag viewer, authored layouts, text, photographs, image crops, fonts, hover/load/scroll animations, slideshows, and looping videos. This approach retains the original interactions instead of approximating them in a new design.

## Run

Requires Python 3.9 or newer. No package installation is needed.

```sh
npm run dev
```

Or run `python3 scripts/serve.py`. Open http://localhost:5173. To use another port, run `python3 scripts/serve.py --port 8080`.

## Pages

- `/` and `/home/`
- `/projects/`
- `/aboutme/`
- `/work/`
- `/travel/`
- `/volunteering/`
- `/contact/`
- `/loewe/`
- `/sabyasachi/`
- `/jacquemus/`
- `/avavav/`

## Edit and build

`source/<page>.json` contains the original editable widget definitions: content, coordinates, styles, links, and animation settings. `source/server.json` contains project settings and the page index. The runtime and media are in `public/vendor/`; `public/media/` contains the captured image crops.

```sh
npm run build
npm run check
```

The build regenerates `public/index.html` and each route's `index.html` from the captured source. It embeds all 344 widgets, rewrites resources and navigation to local paths, and uses the original fonts and 85 photo crops. The checks compare original content, geometry, slideshow settings, and all 45 animation definitions, and verify local asset references and video segments.

The shipped snapshot builds without internet access. The capture utilities in `scripts/mirror.py`, `scripts/crops.py`, and `scripts/complete_runtime.py` are for refreshing public assets and require internet access.

## Contact form

The original form layout, validation, and “Connected!” confirmation are preserved. The Python server saves submissions to `.data/contacts.sqlite3`, which is excluded from Git and never served as a public file. It does not connect to the original site's private Readymag inbox.

To deliver submissions by email, configure these environment variables before starting the server:

- `SMTP_HOST` and optional `SMTP_PORT` (default `587`; STARTTLS)
- `SMTP_FROM` and `CONTACT_TO`
- `SMTP_USER` and `SMTP_PASSWORD` when your provider requires authentication

Static-only hosting serves every page but needs an equivalent POST endpoint at `/api/connect/forms/send/5795839` for contact delivery. The included server provides that endpoint.

## External content

The two AVAVAV Vimeo embeds remain hosted by Vimeo and require internet access. The Resume link serves the updated `public/media/Udenia_Jiya_Resume.pdf`; LinkedIn retains its original destination. All portfolio photographs, fonts, viewer modules, and the five uploaded looping videos are bundled locally.

## Verification

Browser checks cover all 11 routes, long-page scrolling and footers, image loading, homepage video playback, slideshow changes, and contact validation. Shared responsive layouts replace the original clipped phone canvas. Desktop artboards are capped at 1024px to keep the scale consistent between pages; screens up to 800px use flowing paragraphs and stacked media sections.

A desktop preview is saved in `qa/home-desktop.jpg`.

## Content updates

About Me uses three fixed professional photos and the updated graduate/strategist biography. Experience uses a shared responsive collage card layout, with Dimohe’s E-commerce & Branding Intern details in the matching white panel.

The Experience enhancement in `source/experience.js` reuses the authored image and title widgets. `source/experience.json` defines their card grouping; panel copy is taken from the existing hotspot content at build time. The left word is centered within the full parent section; mobile uses a horizontal heading. ResizeObserver keeps every card tall enough for the longest panel. Official Dimohe image URLs are recorded in `source/dimohe-assets.json`.

`source/responsive.js` and `source/responsive.css` supply the shared navigation, footer, and responsive widget grouping for every page. The build embeds widget geometry from the page definitions and versions these assets so layout updates are not held in the browser cache. Media compositions retain their proportions while phone paragraphs reflow at 16px. Navigation resolves from the script URL, including GitHub Pages repository subpaths.

The shared navigation and footer use the original link-style definitions, including the bright pink title hover, black hover underlines, and pink selected-page underlines. Link colors, hover underlines, and form buttons ease over 0.3 seconds; map popups fade over 0.35 seconds. Card overlays retain their authored opacity targets and timing, and Experience panels use a 0.5-second fade. Closing fades finish before panels become hidden. Cards also reveal on keyboard focus; product covers can be toggled with touch or a keyboard. Phone travel markers reuse the original pin artwork and open the matching location details. Narrow-screen scroll fades use the reflowed positions. Reduced-motion preferences shorten non-spatial hover fades to 0.18–0.2 seconds and disable spatial animation. All custom styles and interaction scripts are versioned to deliver updates immediately.
