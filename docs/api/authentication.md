# Authentication API

### POST `/api/auth/login`
Logs in an administrator or registered participant.
**Request Body:**
```json
{ "email": "admin@mindcraft.io", "password": "..." }
```

### POST `/api/participants/join`
Registers a team using an event session code.
**Request Body:**
```json
{ "teamName": "ByteBusters", "sessionCode": "MINDCRAFT-2026" }
```
