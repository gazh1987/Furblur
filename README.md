# Furblur

## Overview
Furblur is a Cordova-based mobile app scaffolded from the Apache Cordova sample, targeting iOS and the browser. It uses Cordova plugins for device access (geolocation, background mode, and insomnia), Bootstrap for layout, Google Fonts/Icons for styling, and Leaflet for maps.

## Project structure
- **Root config**: `config.xml` defines the Cordova widget, app metadata, start page (`index.html`), platform preferences, and iOS location permission strings.
- **Web assets**: All app UI lives in `www/`.
  - **Entry splash** (`www/index.html`): Auto-redirects to `home.html` after 3 seconds and hooks Cordova's `deviceready` event via `js/index.js`.
  - **Home page** (`www/home.html`): Placeholder view with navigation icons to Map/Walk pages.
  - **Map view** (`www/map.html`): Shows the user's location on a Leaflet map and links to the Walk screen.
  - **Walk tracker** (`www/walk.html`): Combines a live map, real-time stats, and a summary modal with slider inputs for energy, happiness, and behavior metrics.

## Styling
- `www/css/styles.css`: Shared layout (full-height flex container, map/content sizing, footer/navigation styles) and icon colors/sizing for walk controls.
- `www/css/index.css`: Splash page styling (logo border and centered layout tweaks).

## Key client logic
- **Splash/device readiness** (`www/js/index.js`): Registers `deviceready` so Cordova plugins are available after the splash screen.
- **Mapping & tracking** (`www/js/map.js`):
  - Initializes a Leaflet map, listens for high-accuracy location updates, and visualizes current position (marker + accuracy circle).
  - When walking mode is active, records coordinates into a polyline and computes total distance, updating the on-page stat display.
  - Handles location errors by disabling the stop-lock button and showing the error message in-place.
  - Provides UI logic for locking/unlocking the stop button and showing a Bootstrap modal with a summary map of the walked route plus slider-driven sentiment fields.
  - Uses Cordova Insomnia to keep the device awake during tracking (if available).
- **Walk statistics** (`www/js/walkStatCalcs.js`): Starts timers on page load to track duration and compute average pace from geolocation `speed`, presenting HH:MM:SS duration and km/h pace; stores the geolocation watch ID for cleanup.

## Page flow
1. Launch: `index.html` splash → auto-redirect to `home.html` after 3 seconds.
2. Navigation footer moves between Home and Map; Map's play icon opens Walk.
3. Walk page starts tracking on load, shows live map + stats, and offers a stop button gated by a lock toggle; stopping shows the modal summary and allows returning home.
