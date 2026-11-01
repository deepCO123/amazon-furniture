# Amazon Furniture

A premium full-stack furniture e-commerce platform built for modern online retail operations. The project combines a Next.js storefront with a secure Express backend and production-oriented deployment tooling, designed to feel enterprise-ready while remaining easy to run locally.

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express 5" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB Atlas" />
  <img src="https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
</p>

## Overview

This repository contains:

- A modern storefront built with Next.js 16 and React 19
- A secure Express API for authentication, product management, orders, and business logic
- MongoDB integration with fallback data handling
- Admin dashboard and commerce flows for checkout, payments, and invoicing
- Production setup guides for deployment and environment configuration

## Key Features

- Product catalog with category filtering and sort options
- Shopping cart and checkout experience
- Admin dashboard for product and order management
- Authentication and authorization support
- PDF invoicing and email workflows
- Cloud-ready deployment setup with Docker and example nginx configs
- Local development scripts and production readiness documentation

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB / MongoDB Atlas |
| Auth | JWT, bcrypt, secure cookies |
| Email | Nodemailer |
| State | Zustand |
| Forms | React Hook Form + Zod |
| UI | Framer Motion, Anime.js, Lucide React |

## Project Structure

```text
amazon-furniture/
├── .github/                          # GitHub automation and project config
├── backend/                         # Express API server
│   ├── scripts/                     # Seed, reset, verification scripts
│   ├── .env                         # Local backend environment config
│   ├── package.json                 # Backend dependencies and scripts
│   └── server.js                    # Main backend entry point
├── ecom-furniture-main/
│   └── ecom-furniture-main/          # Frontend Next.js application
│       ├── src/                     # App Router pages, components, stores, lib
│       ├── public/                  # Static assets and screenshots
│       ├── package.json             # Frontend dependencies and scripts
│       └── next.config.*            # Next.js configuration
├── amazon-logo-pack/                # Brand/logo assets
├── image/                           # Image resources
├── docker-compose.yml               # Container orchestration setup
├── nginx.conf.example               # Reverse proxy example config
├── package.json                     # Root orchestration scripts
├── RUN_APP.md                       # Local run guide
├── DEPLOYMENT_GUIDE.md              # Deployment notes
├── PRODUCTION_SETUP.md              # Production configuration guide
├── PROJECT_TECH_STACK.md            # Technology overview
├── AMAZON_FURNITURE_FINAL_PRODUCTION_READINESS_REPORT.md
├── start-project.bat                # Windows one-click launcher
├── start-cloudflare.bat             # Cloudflare tunnel launcher
├── .gitignore                       # Git ignore rules
└── README.md                        # Repository landing page
```

## Quick Start

### 1) Install dependencies

```bash
npm run install:all
```

### 2) Start the full stack

```bash
npm run dev
```

This launches:

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### 3) Alternative run modes

```bash
npm run backend
npm run frontend
```

## Available Scripts

```bash
npm run dev              # Run frontend + backend together
npm run backend          # Run Express server only
npm run frontend         # Run Next.js frontend only
npm run build            # Build frontend production bundle
npm run start            # Start production frontend
npm run install:all      # Install root + frontend + backend dependencies
npm run seed             # Seed backend data
npm test                 # Run backend tests
```

## Documentation

This repository includes structured project documentation for setup and deployment:

- [RUN_APP.md](./RUN_APP.md) — complete local startup guide
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) — deployment instructions
- [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md) — production environment setup
- [PROJECT_TECH_STACK.md](./PROJECT_TECH_STACK.md) — architecture and tool overview
- [AMAZON_FURNITURE_FINAL_PRODUCTION_READINESS_REPORT.md](./AMAZON_FURNITURE_FINAL_PRODUCTION_READINESS_REPORT.md) — readiness assessment and notes

## Environment Notes

The project includes local configuration files for development. For production deployments, ensure you update credentials such as:

- MongoDB connection string
- JWT secret
- SMTP credentials
- Cloudinary / storage config
- CORS and allowed origin settings

## License

This project is currently shared as a code repository for learning, internal use, and custom deployment work. If you plan to publish or commercialize it, confirm licensing terms before distribution.

## Contributing

Contributions are welcome. For a clean workflow:

1. Fork the repository
2. Create a feature branch
3. Commit clear, focused changes
4. Open a pull request with a concise summary

## Contact / Project Context

This project is intended as an e-commerce storefront and backend system for a premium furniture business, with strong emphasis on clean structure, documentation, and deployment readiness.

---

Made for a professional Amazon Furniture storefront experience.
