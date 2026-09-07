# TEDxGCEM 2026 — Official Digital Platform

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase_PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![UPI QR](https://img.shields.io/badge/UPI_QR_Payments-0074E4?style=for-the-badge&logo=google-pay&logoColor=white)
![Razorpay](https://img.shields.io/badge/Razorpay_Payments-02042B?style=for-the-badge&logo=razorpay&logoColor=3395FF)
![Resend](https://img.shields.io/badge/Resend_Email_API-000000?style=for-the-badge&logo=resend&logoColor=white)
![Google OAuth](https://img.shields.io/badge/Google_OAuth_2.0-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Cloudflare](https://img.shields.io/badge/Cloudflare_Turnstile-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)

**Official Live Platform:** [https://tedxgcem.in](https://tedxgcem.in)

*An independently organized TED event operated under official license from TED Conferences LLC at Gopalan College of Engineering and Management (GCEM), Bangalore.*

</div>

---

## 💳 Payment Architectures & Branch Guide

This repository maintains **two distinct payment architectures** distributed across dedicated git branches:

| Architecture | Branch | Fee / Commission | Payment Channels | Verification Method | Best For |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UPI QR Code Payment & Mobile Handoff** *(Current)* | `v2-upi-payments` | **0% (Zero Fee)** | Google Pay, PhonePe, Paytm, CRED, BHIM, Bank UPI apps | 12-Digit Bank UTR + Receipt Screenshot Proof (Supabase Storage) | Zero-commission direct checkout with automated desktop-to-mobile QR handoff |
| **Razorpay Payment Gateway** | `dev` | ~2% + GST | Credit/Debit Cards, NetBanking, UPI, Wallets | Automated Server-Side HMAC-SHA256 Signature Verification | Fully automated commercial gateway checkout |

---

### Method 1: Dynamic UPI QR Code Payment + Cross-Device Mobile Handoff (`v2-upi-payments`)

The `v2-upi-payments` branch bypasses commercial gateway commissions by implementing a custom NPCI-compliant dynamic UPI QR code flow with cross-device session synchronization.

#### Key Capabilities:
1. **Dynamic NPCI QR & Intent Trigger:**
   * Generates dynamic UPI QR codes encoding the institution's VPA, verified payee name, and dynamic tier pricing (`amount`).
   * On mobile devices, one-tap intent buttons launch **PhonePe**, **Google Pay**, **Paytm**, or **CRED** directly with the amount pre-filled.
2. **Cross-Device Mobile QR Handoff (Supabase Realtime):**
   * Laptop/desktop users scan a "Mobile Handoff QR" with their smartphone camera.
   * The phone opens an authenticated mobile session, the user pays via their banking app, and submits their screenshot and UTR.
   * The desktop screen **automatically detects the payment via Supabase Realtime WebSocket** and transitions to the confirmed pass screen without a page refresh!
3. **Anti-Fraud UTR Idempotency & Bot Defense:**
   * Enforces a database-level `UNIQUE` index on `utr_number` to eliminate duplicate payment submissions.
   * Integrated with **Cloudflare Turnstile** for zero-friction bot verification before receipt submissions.
4. **Permanent Receipt Proof Storage:**
   * Uploaded payment screenshots (PNG, JPG, WebP) are stored in the dedicated Supabase Storage bucket `payment-proofs`.
   * Admins can inspect receipts via an interactive lightbox modal in the Admin Console or via clickable hyperlinks in Excel.
5. **Consolidated Single-Row Group Bookings:**
   * Multi-pass purchases (e.g. 5 tickets) appear as **1 unified transaction row** (showing the full amount paid) instead of fragmenting into separate entries.
   * Displays the **Ticket Unit Price**, **Pass Quantity**, and a dedicated **Co-Participants Column** formatting details of Passes #2 through #N.
6. **Executive Excel & CSV Reporting:**
   * Generates executive Bookman Antiqua spreadsheets with real-time KPI totals, revenue breakdowns, co-participant lists, and clickable screenshot proof hyperlinks.

---

### Method 2: Razorpay Payment Gateway (`dev`)

The `dev` branch integrates standard commercial checkout via the official Razorpay JavaScript SDK and server-side verification APIs.

#### Key Capabilities:
1. **Automated Gateway Checkout:**
   * Opens the standard Razorpay checkout modal supporting Credit/Debit Cards, NetBanking, Wallets, and UPI.
2. **Cryptographic Verification:**
   * Server-side route `/api/payment/verify` checks the `razorpay_signature` against `razorpay_order_id` and `razorpay_payment_id` using HMAC-SHA256 hashing.
3. **Automated Webhooks:**
   * Handles asynchronous payment success/failure webhooks for edge cases where the user's browser closes prematurely.

---

## 🔀 Switching Between Branches

To switch between the two architectures on your local machine:

```bash
# Switch to UPI QR Code Architecture (Zero Fee, Mobile Handoff, UTR + Screenshot)
git checkout v2-upi-payments

# Switch to Razorpay Gateway Architecture (Cards, NetBanking, Automated Gateway)
git checkout dev
```

---

## 💎 Core Platform Features

### 1. Phased Ticketing & Capacity Management
* **Dynamic Capacity Progression:** Automatic phase roll-overs (Early Bird → Phase 1 → Phase 2 → Phase 3) as ticket quotas fill up.
* **Live Seat Pricing:** Dedicated unit price display per tier (`₹300.00 / pass`, `₹400.00 / pass`, etc.).
* **10-Minute Promo Engine:** Flash coupon passcodes with live countdown timers and single-use redemption tracking.

### 2. Dual-Mode Digital Pass Generator ("Get My Pass")
* **Registered Delegates:** Downloads the original **800 × 1200 classic badge** complete with the circular mock lanyard hole, `x = independently organized TED event` subtitle, and the signature **Barcode Strip**.
* **Special Guests (VIPs):** Downloads the **1000 × 1600 Ultra-HD luxury badge** with capsule slot and VIP pass styling.
* **Multi-Pass Switcher:** Group buyers and dual-tier holders cycle between their badges via interactive switcher tabs (`[ 🎟️ Pass #1: Name ]` / `[ ★ VIP Guest: Name ]`).
* **Real-Time Download Telemetry:** Tracks download timestamps and counts non-blockingly via `/api/pass/track-download`.

### 3. Special Guest Passes Management
* **Zero-Price VIP Pass Directory:** Issue official passes for keynote speakers, faculty, guests of honor, and sponsors.
* **Instant Resend Email Dispatch:** Dispatches branded invitation emails with direct download links and check-in instructions.
* **Live Download Status Badges:** Admin directory displays real-time download status (`○ Not Downloaded` / `📥 Downloaded (1x)` with timestamp tooltips).

### 4. Automated Transactional Email Delivery
* **Resend Integration:** Dispatches branded emails from the verified domain with DKIM/SPF verification.
* **Buyer Receipt Email:** Full transaction breakdown, UTR reference, and attendee registry.
* **Individual Delegate Pass Email:** Every participant receives their personal admission pass in their inbox.
* **Contact Us Relay:** Inquiries routed directly to the organizing committee with one-click reply headers.

### 5. Admin Command Console
* **4-Card KPI Overview:** Real-time counters for Pending Approvals, Total Registered People, Special Guest Passes, and Inbox Messages.
* **Single-Row Group Ledger:** Multi-ticket registrations display as 1 row showing the buyer, quantity, unit price, full amount, and expandable co-participants.
* **Receipt Proof Inspector:** One-click lightbox viewer for uploaded UPI screenshot proofs.
* **QR Check-in Scanner:** Camera-enabled hardware/mobile scanner that validates primary delegates, co-participants, and special guests.
* **Live Excel & CSV Export:** Clean spreadsheets generated on demand with live KPI totals.

---

## 🗄️ Database Architecture (`supabase_schema.sql`)

The repository includes a single, unified master schema file: **`supabase_schema.sql`**.

It provides idempotent provisioning for:
* `registrations` (attendees, payments, UTR, screenshot URLs, approval status, download counts)
* `complimentary_passes` (VIP passes, pass codes, email delivery, download counts)
* `ticket_tiers` (tier capacities, prices, statuses)
* `coupons` (10-minute ephemeral discount codes)
* `registration_drafts` (mobile QR handoff drafts with Supabase Realtime publication)
* `payment-proofs` (Supabase Storage bucket with 2.5MB upload rules)
* `event_settings`, `team_members`, `speakers`, `partners`, and `messages`
* **Complete Row Level Security (RLS)** policies for all tables.

To run, simply paste the contents of `supabase_schema.sql` into your **Supabase SQL Editor** and execute.

---

## 🚀 Tech Stack

### Frontend & Visual Engineering
* **Framework:** Next.js (App Router Architecture)
* **Core & Logic:** React & TypeScript
* **Styling & Theme:** Tailwind CSS (Custom HSL Dark Mode & Cyber-Brutalist Aesthetic)
* **Animation Engine:** Framer Motion (3D interactive card tilts, smooth tab switches, entrance reveals)
* **Graphics & Simulation:** HTML5 Canvas API (Real-time physics vector constellation backgrounds)
* **QR Codes:** Local client-side canvas generation (`qrcode.react`)

### Backend, Database & Infrastructure
* **Database:** Supabase (PostgreSQL with Row Level Security - RLS)
* **Authentication:** Supabase Auth with Google OAuth 2.0
* **Storage Bucket:** Supabase Storage (`payment-proofs` bucket for receipts)
* **Security & Bot Protection:** Cloudflare Turnstile
* **Transactional Emails:** Resend Email API
* **Hosting & CDN:** Vercel Edge Serverless Infrastructure

---

## ⚙️ Environment Configuration

Create a `.env.local` file in your root directory based on `.env.example`:

### For `v2-upi-payments` Branch:
```env
# 1. Supabase Database, Auth & Storage
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# 2. UPI QR Code Configuration (Safe placeholders — configure privately in .env.local)
NEXT_PUBLIC_UPI_ID=your_merchant_vpa@bank
NEXT_PUBLIC_UPI_NAME=Your Organization / Event Name

# 3. Security & Anti-Bot Protection
TURNSTILE_SECRET_KEY=0x4AAAAAAA...
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAA...

# 4. Administrator Access & Security
ADMIN_EMAIL=your-admin-email@example.com
ADMIN_DELETE_PASSWORD=your_secure_admin_deletion_password

# 5. Resend Email Delivery
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=team@yourdomain.com
NEXT_PUBLIC_SITE_URL=https://tedxgcem.in
```

### For `dev` Branch (Razorpay):
```env
# 1. Supabase Database & Auth
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key

# 2. Administrator Access & Security
ADMIN_EMAIL=your-admin-email@example.com
ADMIN_DELETE_PASSWORD=your_secure_admin_deletion_password

# 3. Resend Email Delivery
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=team@yourdomain.com
NEXT_PUBLIC_SITE_URL=https://tedxgcem.in

# 4. Razorpay Gateway API Keys
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

# 3. Run typecheck & production build
npm run build
```

---

<div align="center">

© 2026 TEDxGCEM. This independent TEDx event is operated under license from TED Conferences LLC.

</div>
