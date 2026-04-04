# Phase 1 MVP Execution Task List

- `[x]` Install dependencies (`react-native-maps`, `expo-location`, `expo-notifications`, `uuid`)
- `[ ]` Configure Supabase Realtime & Schema updates (Logic-side)
    - `[ ]` Define new ride states (`waiting`, `in_progress`, `completed`, `cancelled`)
    - `[ ]` Support for `driver_lat`, `driver_lng` and `messages` table
- `[x]` HomeScreen: Add "Leave Now" Quick Button
- `[/]` FindRideScreen: Implement Map-based Selection UI
    - `[x]` MapView component integration
    - `[/]` Markers for active rides with info previews
- `[ ]` ActiveRideScreen (Rider): Live Location Publishing
    - `[ ]` Background location tracking logic
    - `[ ]` "Message Passenger" button
- `[/]` ActiveRideScreen (Passenger): Live Tracking & Progress
    - `[ ]` Real-time subscription to rider's position
    - `[ ]` Walking distance & Countdown display
    - `[ ]` Status alerts ("Rider is 5 min away", etc.)
- `[x]` In-App Chat: `ChatScreen.tsx`
    - `[x]` Message sending/receiving logic
- `[ ]` Verify all flows and status transitions
