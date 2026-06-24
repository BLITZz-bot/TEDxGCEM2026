# TEDxGCEM Portal

A premium, high-performance web platform built for the **TEDxGCEM** conference. Designed with a bold, cyber-brutalist aesthetic, the application integrates dynamic backend content management, real-time database settings, and interactive motion features.

---

## 🚀 Tech Stack

### Frontend & UI
* **Framework**: Next.js (App Router)
* **Logic & Rendering**: React & TypeScript
* **Animations**: Framer Motion (used for 3D card flips, page transitions, and smooth hover effects)
* **Styling**: Tailwind CSS (custom HSL color palette, dark mode grids, and cyberpunk elements)
* **Interactive Visuals**: HTML5 Canvas API (custom vector physics simulations for touch-interactive background particle constellations)
* **Icons**: Lucide React

### Backend, Database & Storage
* **Hosting Platform**: Vercel
* **Database**: Supabase (PostgreSQL)
* **Authentication**: Supabase Auth (Google OAuth)
* **API Architecture**: Next.js Serverless Route Handlers (configured with `force-dynamic` parameters for live updates)
* **Email Transmission**: Resend Email API client with an automatic fallback to standard Nodemailer SMTP

---

## 💎 Core Features

### 1. Zero Hardcoding & Server-Side Rendering (SSR)
* **Dynamic Year & Dates**: The event year (e.g., `2026`) is calculated dynamically from the main event date database record, ensuring consistency across all registration forms, passes, countdowns, and footers.
* **No Dynamic Layout Flashing**: The root homepage uses Server-Side Rendering (SSR) to pre-fetch the custom settings, theme names, and countdown targets from the database *before* sending HTML to the client. This avoids any placeholder or styling flashes during hydration.

### 2. Interactive Constellation Backgrounds
* **Full-Viewport (Speakers Section)**: Interactive cursor-fleeing node connection physics simulation on desktop and mobile.
* **Bottom-Viewport (Team Section)**: A dedicated mobile-only background constellation restricted to the bottom 75% height of the container to align behind the member directories on touch devices.

### 3. Dynamic Admin Control Panel
* **Registrations Panel**: Tracks and lists signed-up attendees, ticket codes, and OAuth IDs.
* **Inbox System**: Stores and lists customer inquiry forms.
* **Settings Panel**: Configures event descriptions, custom dates, location names, themes, and countdown clocks in real-time.
* **Visibility Toggles**: Instantly hides/reveals public sections (such as Speakers or Team tab directories) from the navigation bar. When toggled off, it automatically renders a premium Brutalist "Coming Soon" placeholder block.
* **Content Managers**: Provides CRUD capabilities for corporate partners, speakers, and team lists with a built-in media compiler for profile photos.

### 4. Resend & Nodemailer Mail Dispatch
* **Session Verification**: The mail endpoint validates the caller's server session tokens to prevent open-relay mail spoofing.
* **API Delivery**: Forwards submitted contacts to administrators using the Resend API client.
* **SMTP Failover**: Automatically activates standard SMTP mailing using local mail protocols if the Resend API key is unconfigured. Built with a strict connection timeout limit to prevent serverless function hangs.

---

## 🛠️ Offline Reliability & Fallbacks
To guarantee 100% website uptime, the application handles database downtime gracefully:
* **Server-side JSON Caching**: When retrieving speakers or organizing committee members, the service code queries Supabase first. If Supabase is offline or rate-limited, it automatically reads fallback JSON arrays stored locally on the server filesystem (`team.json` / `speakers.json`).
* **Hardcoded Fallbacks**: If both Supabase and the local file system caches fail, the system renders built-in default lists to prevent layout breakage.

---

## ⚙️ Environment Configuration

To run this project locally or in production, configure the following environment variables in a `.env.local` file. Do not share these credentials publicly:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anonymous-api-key

# Mail Dispatch (Resend Primary)
RESEND_API_KEY=re_your_api_key_string
RESEND_FROM_EMAIL=onboarding@resend.dev
ADMIN_EMAIL=yourgmail@example.com

# Mail Dispatch (SMTP Failover)
SMTP_HOST=smtp.example.com
SMTP_PORT=465
SMTP_USER=smtp-user@example.com
SMTP_PASS=secure-password-here
SMTP_SECURE=true

## 💻 Local Development

First, install the package dependencies:
```bash
npm install
```

Start the local development server:
```bash
npm run dev
```

Run TypeScript compilation checks:
```bash
npx tsc --noEmit
```

Build the optimized production package:
```bash
npm run build
```
