# Apex Rents - Modern Property & Rental Management Web Application

Apex Rents is a high-performance, modern Next.js rental management application built with React, TypeScript, and Tailwind CSS. It synchronizes with a live Django REST Framework (DRF) backend API (`https://rent-api-xjs4.onrender.com/`) with instant fallback to an interactive Demo (Mock) Mode.

---

## ✨ Features

- 📱 **100% Fully Responsive Layout**: Off-canvas mobile navigation drawer, expandable mobile search, responsive stat grids, and touch-optimized data tables.
- ⚡ **Dual API Engine**: Seamlessly switch between the live DRF API backend and offline interactive Demo Mode.
- 🏢 **Property Management Directory**: Track occupied vs. vacant units, search listings, and manage property parameters.
- 📜 **Tenancy Contracts & Leases**: Monitor active, pending, and expired lease agreements across properties.
- 💳 **Financial Ledger & Analytics**: Revenue tracking, payment transaction log, and monthly income progress visualizer.
- 🔧 **Maintenance Kanban System**: Drag/click status workflow (Pending → In Progress → Resolved) for urgent repairs.
- 🔐 **JWT Auth Integration**: Full authentication flow connected to DRF token endpoints (`/api/accounts/token/`).

---

## 🚀 Deployment Instructions

### 1. Deploy on Vercel (Recommended)
1. Push this repository to GitHub/GitLab/Bitbucket.
2. Go to [Vercel Dashboard](https://vercel.com/new) and import the repository.
3. Configure Environment Variables (optional, defaults to live API):
   - `NEXT_PUBLIC_API_BASE_URL` = `https://rent-api-xjs4.onrender.com`
4. Click **Deploy**.

### 2. Deploy on Netlify / Render
```bash
# Build the production bundle
npm run build

# Preview production build locally
npm run start
```

### 3. Docker Deployment
A standard Node.js Docker container can be built with:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
```

---

## 🛠 Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run TypeScript & ESLint validation
npm run lint

# Build production bundle
npm run build
```
