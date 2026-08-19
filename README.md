# TEDxGCEM 2026 — Official Digital Platform

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase_PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Razorpay](https://img.shields.io/badge/Razorpay_Payments-02042B?style=for-the-badge&logo=razorpay&logoColor=3395FF)
![Resend](https://img.shields.io/badge/Resend_Email_API-000000?style=for-the-badge&logo=resend&logoColor=white)
![Google OAuth](https://img.shields.io/badge/Google_OAuth_2.0-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel_Hosting-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)

**Official Live Platform:** [https://tedxgcem.in](https://tedxgcem.in)

*An independently organized TED event operated under official license from TED Conferences LLC at Gopalan College of Engineering and Management (GCEM), Bangalore.*

</div>

---

## 🚀 Tech Stack & Architecture

### Frontend & Visual Engineering
* **Framework:** Next.js (App Router Architecture)
* **Core & Logic:** React & TypeScript
* **Styling & Theme:** Tailwind CSS (Custom HSL Dark Mode & Cyber-Brutalist Aesthetic)
* **Animation Engine:** Framer Motion (3D interactive card tilts, smooth tab switches, entrance reveals)
* **Graphics & Simulation:** HTML5 Canvas API (Real-time physics vector constellation backgrounds)
* **Icons:** Lucide React

### Backend, Database & Infrastructure
* **Database:** Supabase (PostgreSQL with Row Level Security - RLS)
* **Authentication:** Supabase Auth with Google OAuth 2.0
* **Payment Gateway:** Razorpay API (UPI / QR / Cards / NetBanking / HMAC-SHA256 Signature Verification)
* **Transactional Emails:** Resend Email API (`team@tedxgcem.in` with DNS DKIM/SPF verification)
* **Hosting & CDN:** Vercel Edge Serverless Infrastructure

---

## 💎 Core Features

### 1. Multi-Tier Ticketing & Group Bookings
* **Dynamic Capacity Tracking:** Real-time seat allocation across tiers (Early Bird, Phase 1, Phase 2, Phase 3).
* **Group Delegations:** Single checkout supporting multiple attendees with individual pass allocations.
* **Promo Engine:** 10-minute promo passcodes with automated countdown expirations and single-use redemption tracking.

### 2. Digital QR Pass Generator ("Get My Pass")
* **Instant Verification:** Attendees sign in via Google to download their high-resolution 800 × 1200px lanyard badge (.PNG).
* **Unique Pass ID & QR Code:** Dynamic QR code encodes attendee identity and event day check-in verification URLs.
* **Multi-Pass Switcher:** Buyers who purchased passes for friends can browse and download all individual passes from a unified portal.

### 3. Automated Transactional Email Delivery
* **Resend Integration:** Dispatches from verified domain `team@tedxgcem.in`.
* **Buyer Summary Email:** Complete transaction receipt, Razorpay payment reference, and attendee list.
* **Delegate Seat Email:** Individual seat passes delivered directly to each attendee's email inbox.
* **Contact Us Relay:** Form submissions delivered instantly to `tedxgcem@gmail.com` with one-click attendee reply headers.

### 4. Real-Time Admin Command Console
* **Registrations Ledger:** Search, filter, and inspect registrations and check-in statuses.
* **Security Password Protection:** Deleting any registration record requires server-side `ADMIN_DELETE_PASSWORD` verification.
* **QR Check-in Scanner:** Camera-enabled scanner to validate attendees at the venue and grant entry.
* **Dynamic Settings Manager:** Toggle sections (Speakers, Team, Schedule, Tickets), adjust event dates, and update themes on the fly.
* **Excel & CSV Export:** Formatted multi-column spreadsheet export for on-ground registration desk teams.

---

## ⚙️ Environment Configuration

Create a `.env.local` file in your root directory:

```env
# 1. Supabase Database & Auth
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key

# 2. Administrator Access & Security
ADMIN_EMAIL=tedxgcem@gmail.com
ADMIN_DELETE_PASSWORD=your_secure_admin_deletion_password

# 3. Resend Email Delivery (Domain: tedxgcem.in)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=team@tedxgcem.in
NEXT_PUBLIC_SITE_URL=https://tedxgcem.in

# 4. Razorpay Payment Gateway
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxxxxxxxx
```

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Run typecheck & build
npm run build
```

---

<div align="center">

© 2026 TEDxGCEM. This independent TEDx event is operated under license from TED.

</div>
