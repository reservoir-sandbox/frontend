# Reservoir Sandbox (Frontend)

Reservoir Sandbox is a web-based malware analysis dashboard. It lets users upload samples, track their processing pipeline, and review the resulting analysis — including static analysis findings, YARA rule matches, and ML-based classification reports.

## Tech Stack

- **JavaScript / TypeScript**
- **React**
- **Tailwind CSS**
- **shadcn/ui** — component library (Radix-based primitives)
- **oxlint** — linting
- **Vite** — build tool
- **Docker** — containerized deployment

## Features

- User authentication (login / register) with protected routes
- File upload for submitting samples
- Static analysis report viewer
- YARA rule match report viewer
- ML-based classification report viewer
- Past reports history
- Responsive sidebar navigation
- Loading screen / global loading state

## Quick Start (Docker)

Build the image:

```bash
docker build --build-arg VITE_API_URL="https://backend-app-1:8000/api/v1" -t frontend-app .
```

Run the container:

```bash
docker run -d \
  -p 80:80 \
  --name frontend-prod \
  --restart unless-stopped \
  --network backend_default \
  -e API_BASE_URL="http://backend-app-1:8000/api/v1" \
  frontend-app
```

## Local Development

```bash
npm install
npm run dev
```

## Folder Structure

```
frontend/
├── Dockerfile
├── README.md
├── components.json          # shadcn/ui configuration
├── eslint.config.js
├── index.html
├── package.json
├── public/
│   └── profile-pics/         # static user avatar assets
├── src/
│   ├── App.tsx                # root application component
│   ├── assets/                 # images, logos, banners
│   ├── components/
│   │   ├── BaseNode/            # base node component for tree/graph views
│   │   ├── FileUpload/          # sample upload component
│   │   ├── MLReport/            # ML classification report view
│   │   ├── ProcessNode/         # process tree node component
│   │   ├── ProcessTree/         # process tree visualization
│   │   ├── Sidebar/             # navigation sidebar
│   │   ├── StaticAnalysisReport/ # static analysis report view
│   │   ├── YARAReport/          # YARA match report view
│   │   └── ui/                  # shadcn/ui primitives (button, card, table, etc.)
│   ├── contexts/
│   │   ├── AuthContext.tsx      # authentication state/context
│   │   └── LoadingContext.tsx   # global loading state/context
│   ├── hooks/
│   │   ├── use-file-upload.ts
│   │   └── use-mobile.ts
│   ├── lib/
│   │   └── utils.ts             # shared utility functions
│   ├── main.tsx                 # application entry point
│   ├── pages/
│   │   ├── LoadingScreen/       # loading screen page
│   │   ├── Login/               # login page (with tests)
│   │   ├── MainPage/            # main dashboard page
│   │   ├── PastReports/         # past reports listing page (with tests)
│   │   ├── ProtectedLayout/     # layout wrapper for authenticated routes
│   │   ├── Register/            # registration page (with tests)
│   │   └── Report/              # single report detail page
│   ├── style.css                # global styles
│   ├── test/
│   │   └── setup.ts             # test environment setup
│   ├── types/
│   │   └── auth.ts              # authentication-related types
│   └── utils/
│       └── api.ts               # API client/helpers
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

## Environment Variables

| Variable         | Description                                  |
|------------------|-----------------------------------------------|
| `VITE_API_URL`   | Backend API base URL, set at build time       |
