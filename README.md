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

Browser checks covered all 11 routes, long-page scrolling and footers, image loading, homepage video playback, slideshow changes, contact validation and successful local storage, and comparison with the original desktop and mobile layouts. The original narrow-screen behavior is preserved, including its clipped desktop canvas; the replica intentionally does not redesign it.

A desktop preview is saved in `qa/home-desktop.jpg`.

## Content updates

About Me uses three fixed professional photos and the updated graduate/strategist biography. Experience uses a shared responsive collage card layout, with Dimohe’s E-commerce & Branding Intern details in the matching white panel.

The Experience enhancement in `source/experience.js` reuses the authored image and title widgets. `source/experience.json` defines their card grouping; panel copy is taken from the existing hotspot content at build time. The left word is centered within the full parent section; mobile uses a horizontal heading. ResizeObserver keeps every card tall enough for the longest panel. Official Dimohe image URLs are recorded in `source/dimohe-assets.json`.
