# CrazyGames submission: copy-paste sheet

Everything for the **Game details** step of the CrazyGames Developer Portal (Basic launch).

## Upload step

| Field | Value |
|---|---|
| Game name | `Marginalia` |
| Game engine | **HTML5** |
| Does your game save progress? | The game saves in the browser (localStorage), not through the CrazyGames SDK. See the note at the bottom. |
| Supports mobile devices | ✅ Yes |
| Online multiplayer | ⬜ No |
| Muting audio through the SDK | ⬜ No. The game does not use the SDK. Its own volume settings are in Settings. |
| Build | `portal/marginalia-portal.zip` |

## Details step

**Category:** Puzzle. If Puzzle isn't listed, use Adventure.

**Tags** (up to 5; pick from the dropdown):

- Escape
- Horror
- Point and Click
- Mystery
- 2D

If one of these isn't in the list, use Story, Detective or Hidden Object instead.

**Description** (plain text or Markdown, no HTML):

```
Marginalia is a hand-drawn psychological horror escape room.

You wake at 3:17 a.m. in the attic of your late father's house on a tidal island. Your sister Wren came here to empty the house and stopped answering her phone. The door is locked from the outside, every clock has stopped, and someone has been writing in your journal in red pen.

Search the house room by room, solve puzzles built from its clocks, tapes, photographs and tides, and find your sister before the tide comes back.

Features:
- A world drawn entirely in ink that never sits still
- 4 chapters, 3 twists and 2 endings
- Puzzles that come from the story, with no random passwords
- Tension instead of jump scares: something stands in the doorways when you turn your back
- Progress saves automatically
- Takes about 1 to 2 hours to finish

Best played in the dark, with headphones.
```

**Controls:**

```
Desktop:
- A / D or Left / Right arrow: walk
- Mouse: aim the torch; click to walk to or use something
- E, Space or Enter: interact / continue text
- I or Tab: pockets (inventory)
- J: journal and clues
- Q or right-click: put away the held item
- F: torch on / off
- Esc or P: pause

Mobile:
- Tap to walk, tap things to use them
- Journal, Pockets and Pause buttons are in the top-right corner
- Play with your phone held sideways
```

**Google Play / iOS App Store / Steam:** leave these blank.

**Marketing creatives URL:** a public link to the `marketing/` folder. A shared Google Drive folder works, or the GitHub folder if the repo is public: `https://github.com/zayid99/ink-escape-room/tree/main/marketing`.

**Cover images** (in this folder; title only, no extra text):

| Slot | File |
|---|---|
| Landscape 16:9 (1920×1080) | `cover-landscape-1920x1080.jpg` |
| Portrait 2:3 (800×1200) | `cover-portrait-800x1200.jpg` |
| Square 1:1 (800×800) | `cover-square-800x800.jpg` |

**Preview videos** (17.8 s each, MP4, 30 fps, gameplay only: no text, no UI, no sound):

| Slot | File |
|---|---|
| Landscape video | `preview-landscape-1920x1080.mp4` |
| Portrait video | `preview-portrait-1080x1920.mp4` |

The portrait video is cropped from the same footage and follows the action in each scene, because the game itself is landscape.

**Mobile orientation:** the game plays in landscape. On a phone held upright it shows a "turn your phone sideways" hint. If you make a new build, choose **Landscape**.

**The game works well in fullscreen:** ✅ Yes. It always keeps a 16:9 picture and letterboxes on other screen shapes.

## About saving progress

The Basic launch doesn't need the CrazyGames SDK. If CrazyGames asks for SDK saving, or for a Full launch later, a CrazyGames-specific build can save through the SDK's Data Module. The SDK's audio muting would come with that build too.
