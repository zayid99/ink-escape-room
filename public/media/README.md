# Real assets go here

The game ships with procedural placeholders for every image and sound, so this folder can stay empty.

- `art/` — room backgrounds (PNG/WebP), e.g. `art/study.png`
- `audio/` — ambience loops, music layers and effects (OGG/MP3), e.g. `audio/door.ogg`

Then point the matching key at the file in `src/content/assets.manifest.js`
(relative path, no leading slash): `'sfx.door': 'media/audio/door.ogg'`.
See the main README → “Replacing placeholder assets”.
