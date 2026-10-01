# Backend Architecture

- **Framework:** Express.js REST API.
- **Authentication:** JWT tokens with dual roles (`admin`, `participant`).
- **Data Persistence:** MongoDB schemas (`User`, `Challenge`, `QRBlock`, `ParticipantSession`, `Submission`, `TestCase`, `Event`).
- **Safety:** Express Rate Limiters for endpoints, HMAC/SHA-256 signatures for QR blocks.
