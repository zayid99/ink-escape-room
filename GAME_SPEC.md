I want to build a complete **2D mystery horror escape-room game** that can be played directly in a web browser and deployed on **Netlify**.

The game should feel like a professionally designed indie horror game, with a strong focus on **mystery, psychological horror, exploration, puzzles, storytelling, suspense, and unexpected twists**.

## 1. Core Game Concept

Create a story-driven 2D escape-room horror game where the player becomes trapped in a mysterious location and must explore the environment, discover clues, solve interconnected puzzles, uncover hidden information, and ultimately escape.

The story should be built around a **deep mystery with multiple layers**. The player should constantly question what is real, who they can trust, and what actually happened.

The narrative should contain:

* Mystery and suspense
* Psychological horror
* Hidden clues
* Environmental storytelling
* Unreliable information
* Multiple twists and reveals
* False assumptions
* Foreshadowing
* Unexpected connections between clues
* A major final revelation
* An ending that makes the player rethink earlier events

Avoid predictable horror clichés wherever possible. The twists should be properly foreshadowed through subtle clues so that, after discovering the truth, the player can look back and realize that the evidence was there all along.

## 2. Gameplay

The player should be able to:

* Move around the environment
* Interact with objects
* Inspect items
* Pick up important objects
* Open doors, drawers, cabinets, boxes, etc.
* Examine notes, photographs, documents, recordings, and other clues
* Combine or use items where appropriate
* Solve puzzles
* Enter codes
* Discover hidden rooms or areas
* Trigger story events
* Make important discoveries
* Progress through multiple stages of the mystery

The gameplay should not simply consist of finding random passwords. Puzzles should be connected to the story and environment.

For example:

* A photograph contains a hidden clue.
* A clock provides information needed for another puzzle.
* A diary explains something that changes the meaning of an earlier clue.
* A seemingly harmless object later becomes extremely important.
* A room contains details that foreshadow a later revelation.

## 3. Story Design

Create an original, engaging horror mystery story specifically for this game.

Structure the story into several chapters or stages.

Each chapter should:

1. Introduce new information.
2. Create new questions.
3. Give the player meaningful objectives.
4. Introduce new puzzles.
5. Reveal part of the mystery.
6. Create additional uncertainty.
7. Connect to previously discovered clues.
8. Build toward a larger revelation.

The story should contain at least **3 major twists** and a strong final revelation.

The twists should not feel random. Each twist must have logical evidence and foreshadowing throughout the game.

Use techniques such as:

* Misdirection
* Red herrings
* Hidden messages
* Contradictory evidence
* Environmental clues
* Recontextualization
* Unreliable documents
* Repeated visual details
* Subtle dialogue/text clues
* Events that initially appear supernatural but later have another explanation

However, the game can still leave some elements genuinely unexplained to preserve the horror and mystery.

## 4. Horror Atmosphere

The horror should primarily come from **tension and psychological fear**, rather than constant jump scares.

Use:

* Dark environments
* Limited visibility
* Atmospheric lighting
* Ambient sounds
* Distant noises
* Footsteps
* Doors moving unexpectedly
* Flickering lights
* Strange environmental changes
* Subtle visual anomalies
* Silence at important moments
* Unexplained events
* Occasional carefully timed scares

Do not overuse jump scares.

The player should often feel that something is wrong even when nothing obvious is happening.

## 5. Visual Style

Use a polished **2D horror aesthetic** suitable for a browser game.

The visual style should be:

* Dark
* Atmospheric
* Cinematic
* Detailed
* Cohesive
* Easy to understand
* Optimized for web performance

Use lighting, shadows, color grading, particles, animations, and environmental details to create atmosphere.

The game should feel like a finished indie game rather than a basic prototype.

## 6. Game Interface

Create a clean and immersive interface.

Include:

* Main menu
* New Game
* Continue
* Settings
* Pause menu
* Restart option
* Save/load system if appropriate
* Inventory
* Interaction prompts
* Objective tracking where appropriate
* Dialogue/text presentation
* Puzzle interfaces
* Game-over screen
* Ending screen

The UI should match the horror aesthetic without becoming difficult to use.

Avoid unnecessary UI elements that break immersion.

## 7. Puzzle System

Create several different types of puzzles.

Examples:

* Combination locks
* Pattern puzzles
* Symbol puzzles
* Hidden-object puzzles
* Sequence puzzles
* Environmental puzzles
* Audio clues
* Document-based puzzles
* Item combination
* Logic puzzles
* Multi-step puzzles

Every major puzzle should have a logical solution that can be discovered through exploration.

Do not make puzzles depend on arbitrary guessing.

## 8. Exploration

Design the environment so that exploration is rewarding.

Players should discover:

* Hidden objects
* Secret passages
* Optional clues
* Documents
* Personal belongings
* Strange environmental details
* Optional rooms
* Story fragments
* Easter eggs
* Foreshadowing

Some discoveries should not be immediately understandable but should become meaningful later.

## 9. Narrative Delivery

Do not rely exclusively on long cutscenes.

Tell the story through:

* Environmental storytelling
* Notes
* Diaries
* Letters
* Photographs
* Audio recordings
* Objects
* Room layouts
* Dialogue
* Visual events
* Player discoveries

The player should gradually piece together the story themselves.

## 10. Save System

Implement a reliable save system suitable for a browser game.

If practical, use **localStorage** so the player can close the browser and continue later.

Store:

* Current chapter
* Player progress
* Inventory
* Solved puzzles
* Important story flags
* Discovered clues
* Relevant game state

The game should not lose progress unexpectedly.

## 11. Audio

Add support for:

* Background music
* Ambient sounds
* Footsteps
* Door sounds
* Interaction sounds
* Puzzle sounds
* Horror effects
* Environmental sounds

Audio should dynamically contribute to suspense.

For example, music may become quieter during exploration and intensify during important discoveries.

If external audio assets are unavailable, create the architecture so they can easily be added later and use appropriate placeholders.

## 12. Game Architecture

Build the game using a maintainable architecture.

Separate:

* Game state
* Player controls
* Interaction system
* Inventory system
* Puzzle system
* Dialogue system
* Story progression
* Save system
* Audio system
* UI
* Scene/room management

Avoid putting the entire game into one huge file.

Use reusable components and clear naming conventions.

## 13. Browser Compatibility

The game must run smoothly in modern browsers.

Optimize it for:

* Chrome
* Firefox
* Edge
* Safari

Make the game responsive where practical.

The game should work on common desktop resolutions and gracefully handle smaller screens.

## 14. Netlify Deployment

The final project must be **Netlify-ready**.

Include everything required for deployment.

Make sure:

* Production build works correctly.
* Assets use correct paths.
* No localhost URLs remain.
* No development-only dependencies are required at runtime.
* Client-side routing works correctly if used.
* Environment variables are documented if required.
* The project can be deployed through Netlify with minimal configuration.

Provide a clear README containing:

* Project description
* Tech stack
* Installation instructions
* Development commands
* Production build command
* Netlify deployment instructions
* Asset replacement instructions
* Configuration instructions

## 15. Performance

Optimize the game for browser performance.

Pay attention to:

* Image sizes
* Asset loading
* Memory usage
* Animation performance
* Audio loading
* Unnecessary re-renders
* Large files
* Mobile/smaller-screen performance

Use lazy loading or other appropriate techniques when useful.

## 16. Code Quality

Write production-quality code.

Requirements:

* Clean structure
* Reusable components
* Meaningful variable/function names
* Comments where necessary
* No unnecessary complexity
* No duplicated logic
* Proper error handling
* No obvious security issues
* No broken links or missing assets

Do not create fake functionality just to make the project appear complete.

If something cannot be implemented immediately because an external asset is required, create a proper placeholder system and clearly document what needs to be replaced.

## 17. Important Creative Requirement

The most important part of this project is the **story and mystery**.

I don't want a generic horror escape-room game.

I want the player to constantly ask:

> "What is actually happening?"

The story should deliberately make the player form assumptions and then challenge those assumptions.

The final revelation should connect multiple seemingly unrelated details from earlier in the game.

The game should reward players who pay attention.

Include subtle details that players may initially ignore but later realize were important.

Avoid predictable endings such as:

* "It was all a dream."
* "The player was secretly the killer" without meaningful setup.
* Random supernatural explanations with no narrative foundation.
* A villain appearing at the end without previous foreshadowing.

## 18. Development Approach

Build the game in stages rather than attempting everything at once.

Start with:

1. Project structure
2. Core game loop
3. Player movement
4. Room/environment system
5. Interaction system
6. Inventory
7. Puzzle framework
8. Dialogue/story system
9. Save system
10. Main menu/UI
11. First complete playable chapter
12. Additional chapters
13. Audio and visual polish
14. Testing
15. Performance optimization
16. Netlify deployment preparation

After each major stage, make sure the existing functionality still works before continuing.

## 19. Final Goal

The final result should be a **complete playable 2D mystery horror escape-room game**, not merely a concept, mockup, or prototype.

It should have:

* A compelling original story
* Strong mystery
* Multiple twists
* Meaningful puzzles
* Exploration
* Atmospheric horror
* Environmental storytelling
* Inventory
* Save system
* Interactive environments
* Professional UI
* Audio support
* Multiple chapters
* Strong ending
* Replay/discovery value where appropriate
* Clean code
* Good browser performance
* Netlify deployment readiness

Before considering the project complete, test the entire game from beginning to end and fix broken interactions, progression blockers, visual issues, save/load problems, and console errors.

Most importantly, **prioritize player experience, mystery, pacing, atmosphere, and narrative consistency over simply adding more features.**
