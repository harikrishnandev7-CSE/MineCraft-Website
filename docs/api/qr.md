# QR Block API

### POST `/api/qr/scan`
Decodes and unlocks a code block fragment.
**Request Body:**
```json
{ "qrCode": "hash_block_1", "challengeId": "65fc..." }
```
