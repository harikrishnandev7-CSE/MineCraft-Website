# Mind Craft 🧠⛏️

Mind Craft is an interactive hybrid competitive coding and puzzle-solving platform. Participants find physical QR codes placed in an event venue, scan them to collect fragments of code, arrange and assemble the fragments logically on an interactive assembly board, inspect/modify the resulting code in an embedded editor, and submit solutions evaluated against automated test cases via a Judge0 execution engine in real-time.

---

## 🚀 Key Features

- **QR-Driven Code Discovery:** Physical or digital QR codes decode into encrypted blocks with language tags, order hints, and logic fragments.
- **Drag-and-Drop Assembly Board:** Visual canvas where participants reorder code snippets into coherent programs.
- **Live Code Editor & Runner:** Monaco/Ace-ready multi-language editor connected to a self-hosted Judge0 compiler/sandbox.
- **Timed Challenges & Sessions:** Real-time event countdown, session management, and automated anti-cheating tracking.
- **Live Leaderboard:** Real-time rank calculation based on test cases passed, execution duration, and penalty scores.
- **Admin Control Center:** Comprehensive dashboard for challenge authoring, QR code printing, session monitoring, and test runners.

---

## 📂 Project Architecture

```
├── frontend/          # React (Vite) + Tailwind CSS + Redux Toolkit SPA
├── backend/           # Node.js + Express REST API + MongoDB / Redis
├── judge0/            # Sandboxed multi-language code execution infrastructure
├── infrastructure/    # Azure VM setup guides, Nginx reverse proxy configs
├── docs/              # Comprehensive API, architecture, and event runbooks
├── tests/             # Backend, frontend, and load testing suites
└── scripts/           # Challenge creation, QR generation, and DB seed utilities
```

---

## 🛠️ Quick Start

### Prerequisites
- Node.js >= 18.x
- Docker & Docker Compose
- MongoDB & Redis (or run via Docker Compose)

### 1. Backend Setup
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### 3. Full Stack Docker Compose
```bash
docker-compose up --build
```

---

## 📜 License
MIT License. See [LICENSE](LICENSE) for details.
