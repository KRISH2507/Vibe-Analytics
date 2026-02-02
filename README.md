# Insight Weaver

A full-stack application with separate frontend and backend.

## Project Structure

```
insight-weaver-main/
├── backend/           # Node.js/Express backend
│   ├── src/
│   │   ├── app.ts
│   │   ├── server.ts
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   └── routes/
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/          # React + Vite frontend
    ├── src/
    │   ├── components/
    │   ├── hooks/
    │   ├── lib/
    │   ├── pages/
    │   ├── App.tsx
    │   └── main.tsx
    ├── public/
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    └── tailwind.config.ts
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

The backend server will start on the configured port (check backend configuration).

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend development server will start on port 8080 (or 8081 if 8080 is in use).
You can access it at: http://localhost:8081/

## Development

### Frontend

- **Dev Server**: `cd frontend && npm run dev`
- **Build**: `cd frontend && npm run build`
- **Preview**: `cd frontend && npm run preview`
- **Lint**: `cd frontend && npm run lint`
- **Test**: `cd frontend && npm run test`

### Backend

- **Dev Server**: `cd backend && npm run dev`
- **Build**: `cd backend && npm run build`

## Technologies

### Frontend
- React 18
- TypeScript
- Vite
- TailwindCSS
- Radix UI Components
- React Router
- React Query (TanStack Query)
- Framer Motion
- Recharts

### Backend
- Node.js
- Express
- TypeScript

## Notes

- The frontend and backend are completely separate projects
- Each has its own `node_modules`, `package.json`, and `tsconfig.json`
- The frontend uses path aliases (`@/*`) that map to the `src/` directory
- Port 8080 is the default for the frontend, but it will use 8081 if 8080 is occupied
