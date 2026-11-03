# Reviewed site chapters

The homepage and Sentient Space are the approved November 2026 review pages. The remaining catalog, project, service, maker, about and contact pages retain the React app and their existing URLs.

`npm run build` builds React, generates route metadata, then runs `scripts/build-curated.mjs`. That script installs the homepage at `/`, Sentient Space at `/sentient-space/`, and retains `app-shell.html` as the React fallback. A small navigation bridge makes links and browser history return to the complete homepage rather than the older React home component.

Assets are self-hosted. Chapter CSS, JavaScript, images and fonts live under a versioned build directory; videos receive individual SHA-256 filenames so a copy change does not invalidate cached movies. Source/provenance documents, local preview servers, unpublished exports and machine paths are excluded. Chapter videos are limited to 10 MiB each, and the complete release to 256 MiB. The pre-existing `public/media` pipeline and its own 160 MiB cap remain unchanged.

The production overview uses the September 2026 63-second reel. Published films use click-to-load YouTube embeds; Confucius remains a clearly labelled archive preview pending its YouTube URL. The fictional family before-image was generated at the user's request and remains labelled. Dome imagery is 204's own visual development, separate from the Texas Eclipse event recordings.

Regenerate web encodes from the production archive when changing media; do not put master MOV files in this directory. The homepage hero uses smaller muted renditions with the original clip timing. Sound-bearing demonstrations retain audio.

Deploys remain manual. Use the existing Firebase Hosting release workflow after verifying the built package. Rollback is the previous Hosting release; the previous Git commit remains a reproducible source fallback.
