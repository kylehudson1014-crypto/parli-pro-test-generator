# Parli Pro Test Generator
A Tactical Edge Solutions offline PWA for parliamentary procedure practice, based on Robert's Rules of Order Newly Revised (12th ed.). Generate tests, take them online with instant scoring, print a test and answer key, study with flashcards, and review missed questions. Progress is stored only on the device.
Not affiliated with the Robert's Rules Association or the National FFA Organization.

## v4: game mode (pp-v4)
Play hub with XP/levels, daily streak, badges, 60-second Speed Round, Quick 10, confetti/sounds (mute), dark mode.
Online play (Stump a Friend, Battle) uses Firebase Realtime Database over REST. Setup: create a Realtime Database,
publish `database.rules.json` as its rules, and put the database URL in `firebase-config.js`. Rooms are readable only by
exact 4-letter code and expire/recycle after 24 hours. Online tiles are greyed out when offline or unconfigured.
