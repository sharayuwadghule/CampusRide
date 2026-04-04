# Implementation Plan - Phase 1 MVP Features (Expanded)

This expanded plan includes the newly requested high-value features like map-based selection, real-time chat, and the "Leave Now" quick button.

## User Review Required

> [!IMPORTANT]
> **Dependencies**: We need to install `react-native-maps`, `expo-location`, and `expo-notifications`.
> **Geofencing/Calculations**: Walking distance and "5 min away" alerts will be estimated using the Haversine formula (straight-line) for campus simplicity, unless you prefer integrating a paid Distance Matrix API.

## Proposed Changes

### 1. Enhanced Database Schema
Adding support for chat and expanded ride metadata.

#### [NEW] Supabase Tables
- **`messages`**:
    - `id` (uuid, pk)
    - `ride_id` (uuid, refs rides)
    - `sender_id` (uuid, refs profiles)
    - `content` (text)
    - `created_at` (timestamp)

#### [MODIFY] Supabase Tables
- **`rides`**:
    - `eta_arrival` (timestamp)
    - `origin_lat`, `origin_lng`, `dest_lat`, `dest_lng` (float) - needed for map rendering.

---

### 2. "Leave Now" Quick Button
Fast-track ride offering for immediate campus commutes.

#### [MODIFY] [HomeScreen.tsx](file:///c:/Users/Sidhesh%20Wadghule/OneDrive/Desktop/Work%20Stuff/campus-rider/CampusRide/src/screens/home/HomeScreen.tsx)
- Add a new "Leave Now" quick-action floating button or card.
- Logic: Pre-fills current location and current time, then jumps straight to `FarePreview`.

---

### 3. Map-based Selection UI
Visual ride selection instead of just lists.

#### [NEW] [MapSelectionView.tsx](file:///c:/Users/Sidhesh%20Wadghule/OneDrive/Desktop/Work%20Stuff/campus-rider/CampusRide/src/components/maps/MapSelectionView.tsx)
- Uses `react-native-maps`.
- Fetches all active rides and renders them as markers.
- Tapping a marker shows a preview card ("Rider: Anjali", "Fare: ₹30") and allows requesting directly.

#### [MODIFY] [FindRideScreen.tsx](file:///c:/Users/Sidhesh%20Wadghule/OneDrive/Desktop/Work%20Stuff/campus-rider/CampusRide/src/screens/passenger/FindRideScreen.tsx)
- Integrate a toggle between "List Feed" and "Map View".

---

### 4. In-App Chat (Post-Booking)
Direct communication after a ride request is accepted.

#### [NEW] [ChatScreen.tsx](file:///c:/Users/Sidhesh%20Wadghule/OneDrive/Desktop/Work%20Stuff/campus-rider/CampusRide/src/screens/common/ChatScreen.tsx)
- Simple messaging UI.
- Real-time subscription to the `messages` table filtered by `ride_id`.

#### [MODIFY] [ActiveRideScreen.tsx](file:///c:/Users/Sidhesh%20Wadghule/OneDrive/Desktop/Work%20Stuff/campus-rider/CampusRide/src/screens/rider/ActiveRideScreen.tsx)
- Add "Message Passenger" button that opens chat.

---

### 5. Live Progress & Status Alerts
Auto-updating status messages and countdowns.

#### [MODIFY] [ActiveRideScreen.tsx](file:///c:/Users/Sidhesh%20Wadghule/OneDrive/Desktop/Work%20Stuff/campus-rider/CampusRide/src/screens/rider/ActiveRideScreen.tsx) & [ActiveRideScreen (Passenger)](file:///c:/Users/Sidhesh%20Wadghule/OneDrive/Desktop/Work%20Stuff/campus-rider/CampusRide/src/screens/passenger/ActiveRideScreen.tsx)
- **Ride Countdown**: Visual timer based on `eta_arrival`.
- **Walking Distance**: Calculates straight-line distance between Passenger's current loc and Rider's location.
- **Auto Updates**: Notification triggers like:
    - `"Rider is 5 min away"` (based on distance < 1km).
    - `"Ride started"` (when Rider click "Start").
    - `"Reached"` (when Rider clicks "Complete").

## Open Questions

1. **Walking Path vs Straight Line**: For campus, straight lines can be misleading. Do you have a specific "walking path factor" (e.g., +30% distance) you'd like to use for estimates?
2. **Chat Persistence**: Should chats be deleted after the ride is completed, or kept for some time?

## Verification Plan

### Manual Verification
- **Map View**: Verify markers appear on the map for active rides.
- **Chat**: Send message from Passenger, see it appear on Rider's screen instantly.
- **Quick Ride**: Test "Leave Now" button creates a ride record in 1 tap.
- **Updates**: Move a simulated rider location and verify "Rider is 5 min away" notification appears on Passenger app.
