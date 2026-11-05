# Reviewed site chapters

The homepage introduces Productions, Experiences and Technology. The Technology tile opens the examples on the combined Services & Technology page. Sentient Studio remains its own experience page. The remaining catalog, project, service, maker, about and contact pages retain the React app and their existing URLs.

`npm run build` builds React, generates route metadata, then runs `scripts/build-curated.mjs`. That script installs the homepage at `/`, the editorial routes at `/productions/`, `/experiences/` and `/services/`, and Sentient Studio at `/sentient-studio/`, and retains `app-shell.html` as the React fallback. The editorial pages and React catalog use the same header/footer renderer in `src/lib/site-shell.ts` and the same `site-shell.css`. A navigation bridge routes full-document editorial pages correctly; old homepage chapter anchors forward to their new page. Services and individual service pages use the same page introduction and capability-list design.

Assets are self-hosted. Chapter CSS, JavaScript, images and fonts live under a versioned build directory; videos receive individual SHA-256 filenames so a copy change does not invalidate cached movies. Source/provenance documents, local preview servers, unpublished exports and machine paths are excluded. Chapter videos are limited to 10 MiB each, and the complete release to 256 MiB. The pre-existing `public/media` pipeline and its own 160 MiB cap remain unchanged.

The production overview uses the September 2026 63-second reel. Films available on YouTube use click-to-load embeds. Satori and Confucius each show four selected stills. The fictional family before-image was generated at the user's request and remains labelled. Dome imagery is 204's own visual development, separate from the Texas Eclipse event recordings.

Regenerate web encodes from the production archive when changing media; do not put master MOV files in this directory. The homepage hero uses smaller muted renditions with the original clip timing. Sound-bearing demonstrations retain audio.

Deploys remain manual. Use the existing Firebase Hosting release workflow after verifying the built package. Rollback is the previous Hosting release; the previous Git commit remains a reproducible source fallback.

### Working Title Animation sources (2026-11-04)

The Productions section at `#working-title` presents Working Title Animation,
with Mitchell Kriegman credited as collaborator. Its click-to-load selection is
studio opener, Whatnot pilot, Clarissa portrait pilot, and the existing Clarissa
narrated process reel. The `wta-*` assets are web encodes/posters sourced from
sibling `wta-web/public/media/opener-v3f.*` and
`wta-web/public/staging/reels/{whatnot,clarissa}/pilot.*`. Originals are unchanged.
`working-title.js` uses explicit asset URLs so curated packaging hashes every
video correctly. The full portrait film is contained within the player.

WTA-Web’s `content/studio.json` supplies the independent-creator positioning.
Its staged project data identifies Clarissa as in development and Whatnot as in
progress. Those staged entries have `cleared: null`; this local review does not
establish publication clearance. WTA-Web also has a Clarissa explorable room and
interactive comic, a Whatnot flying-machine game, and a Blame comic/scene. These
remain in WTA-Web for potential deeper project pages; they are not imported into
the 204 main page or runtime. Review source clearance before a public release.

### Archival intelligence page (2026-11-04)

`/archives/` is a vertical editorial page connected from Services & Technology, the
Archival Preservation service, and Alan Watts in Productions. The source is the
Living Archive presentation's public package: research, article, archive-agents,
activation and living chapters. Only the public article cover/walkthrough,
footage mosaic, timeline, research map and two living-picture examples are
adapted. Source mapping is kept outside the deployable site in the review
workspace. The page retains the AWO development / 204 advisory credit for
Coilendar and identifies generated motion. It offers a method and a pilot on the
visitor's collection; it does not offer access to the AWO platform. The four
videos use the common click-to-load/play/pause surface, without autoplay.

`build-curated.mjs` adds the physical archives route and sitemap entry. The
navigation bridge includes it alongside the other editorial pages, including
when entered from React service pages. This change remains a local preview.
