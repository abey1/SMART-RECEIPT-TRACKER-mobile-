You are a senior React Native engineer. Build a clean, production-ready React Native mobile app using Expo.

App Name: Smart Receipt Tracker

Requirements:
- Use React Native with Expo
- Use TypeScript
- Use React Navigation (bottom tabs)
- Use modern functional components and hooks
- Clean folder structure (components, screens, services, types)

-----------------------------------
APP ENTRY BEHAVIOR (VERY IMPORTANT)
-----------------------------------
- When the app launches, it MUST open on the Capture Receipt Screen (Tab 1) by default
- The camera should automatically open without requiring user interaction
- The camera preview must act as the FULL BACKGROUND of the screen
- UI elements (buttons, overlays) should be rendered on top of the live camera feed
- Ask for camera permission on first launch and handle permission states properly

-----------------------------------
TAB 1: Capture Receipt Screen
-----------------------------------
Features:
- Fullscreen live camera preview as background using Expo Camera
- Camera starts automatically when screen loads
- Button to capture photo
- After capturing:
  - Show preview overlay (modal or screen overlay)
  - Save image locally (for now)
  - Store metadata (id, date, image URI) in global state
- Add a "Save Receipt" button

UI:
- Camera fills entire screen
- Capture button fixed at bottom center
- Minimal overlay UI (semi-transparent)
- Smooth UX (no flicker when opening camera)

-----------------------------------
TAB 2: Receipts List Screen
-----------------------------------
Features:
- Display all saved receipts
- Group receipts by date
- Search bar at the top:
  - When clicked, show list of available dates
  - Filter receipts by selected date
- Toggle view:
  - List view
  - Grid (thumbnail) view

UI:
- Section headers for dates
- Cards for receipts
- Toggle button for list/grid
- Clean spacing and modern design

-----------------------------------
TAB 3: Analysis Screen
-----------------------------------
Features:
- Date range selector at top:
  - Last 2 weeks
  - Last 3 weeks
  - Last month
- Show spending analytics (mock data for now):
  - Total spending
  - Number of receipts
- Display charts using a React Native chart library
- Placeholder section for AI insights

UI:
- Dashboard-style layout
- Cards for metrics
- Chart component

-----------------------------------
STATE MANAGEMENT
-----------------------------------
- Use React Context or Zustand for global state
- Store receipts with:
  - id
  - imageUri
  - date

-----------------------------------
FOLDER STRUCTURE
-----------------------------------
/src
  /components
  /screens
    - CaptureScreen.tsx
    - ReceiptsScreen.tsx
    - AnalysisScreen.tsx
  /navigation
  /store
  /services
  /types

-----------------------------------
EXTRA REQUIREMENTS
-----------------------------------
- Use reusable components
- Add clean modern styling (not default UI)
- Handle camera permissions gracefully
- Add comments explaining key parts
- Ensure code runs without errors
- No backend yet (use local state)

-----------------------------------
FUTURE EXTENSIONS (prepare structure)
-----------------------------------
- Backend API integration
- AI receipt parsing (OCR) azure document intellignce
- Database mongo db to store receipt images
- Spending categorization
- AI financial advice

-----------------------------------

Generate all necessary files with clean, maintainable code.
