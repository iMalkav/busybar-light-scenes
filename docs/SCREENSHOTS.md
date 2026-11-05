# Native screenshots

Captured from a physical BUSY Bar on 2026-11-05T13:52:50.645691+00:00.
Firmware: `r1051` (dev); HTTP API: `27.15.0`.

- [Front display](../screenshots/front.png): unmodified 72 × 16 PNG for the catalog.
- [Rear display](../screenshots/back.png): native 160 × 80 PNG for documentation.
- [Capture record](../screenshots/capture.json): settings, firmware, input events and hashes.

Default scene names are displayed. No command was sent to a smart-home system.

The device framebuffer was read through `/api/screen` and encoded as PNG. No
image generation, resizing or retouching was used for the source PNGs.
The app was installed and launched for capture, then quit; the original settings
were restored. Comprehensive device testing and testing on the latest release
firmware remain separate release checks.
