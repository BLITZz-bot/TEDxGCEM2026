# TEDxGCEM 2026 — Project Progress & Development Changelog

## 📋 Executive Overview
This document details all technical implementations, architectural enhancements, database migrations, security workflows, and feature sets completed for the **TEDxGCEM 2026** platform.

---

## 🚀 Key Features & Implementations Completed

### 1. Multi-Ticket Purchasing & Per-Delegate Registration
* **Quantity Selector (1–10 Tickets)**:
  * Allows a logged-in user to purchase multiple delegate passes in a single transaction.
  * Real-time price breakdown and dynamic seat reservation checking against the active tier's remaining capacity.
* **Per-Delegate Information Capture**:
  * When $N > 1$ passes are selected, the system generates interactive delegate tabs (`[ 👤 Delegate 1 (You) ]`, `[ 👤 Delegate 2 ]`, ..., `[ 👤 Delegate N ]`).
  * Each delegate requires full attendee information:
    * **Full Name** `*` (compulsory)
    * **Email Address** `*` (compulsory — can be teammate's personal email or buyer's email)
    * **Phone Number** `*` (compulsory — 10-digit mobile number)
    * **Role / Designation** `*` (compulsory — dropdown with options: Student, Faculty, Working Professional, etc.)
    * **College / University / Company** `*` (compulsory)
    * **How Did You Hear About Us?** `*` (compulsory)
    * **LinkedIn Profile** (optional)
* **Intelligent Auto-Propagation**:
  * When the ticket purchaser (Delegate 1) inputs *"How Did You Hear About Us?"* (e.g. *Instagram*, *College Notice*, *Friend*), the value is **automatically synced across all other delegates**, eliminating redundant data entry while allowing per-delegate customization if needed.

---

### 2. Promo Code Policy & Financial Security Rules
* **Strict Single-Ticket Discount Policy**:
  * Promo discount codes / passcodes are strictly reserved for **individual registrations (1 ticket)**.
  * If a user selects $> 1$ ticket:
    * The frontend disables and clears the coupon input field with an explanatory badge: *"Promo discount codes are valid only for individual single-ticket registrations (1 ticket)."*
    * The backend API (`/api/payment/create-order`) enforces server-side validation, rejecting any multi-seat order with coupon codes attached.
* **Capacity & Sold Seat Tracking**:
  * Real-time calculation (`getTierSoldCounts` in `src/lib/ticket-service.ts`) sums `ticket_count` across confirmed registrations to prevent tier overselling.
* **Razorpay Cryptographic Signature Verification**:
  * Every transaction verifies `razorpay_signature` using HMAC-SHA256 hashing against `RAZORPAY_KEY_SECRET` before storing registrations or marking passes as confirmed.

---

### 3. Database Schema & Supabase Architecture
* **`public.registrations` Table Enhancements**:
  * **Removed `UNIQUE(email)` constraint**: Enables a single Gmail user or department coordinator to purchase tickets for multiple participants across multiple transactions.
  * **`buyer_email TEXT`**: Links all tickets in a group order to the purchasing Google account.
  * **`ticket_count INTEGER DEFAULT 1 NOT NULL`**: Tracks the quantity of tickets purchased.
  * **Optimized Indexes**: Added non-unique B-tree indexes `idx_registrations_email` and `idx_registrations_buyer_email` for high-speed pass lookups.
* **Row Level Security (RLS)**:
  * Updated select security policies: users can read passes if `auth.uid() = user_id OR auth.jwt() ->> 'email' = email OR auth.jwt() ->> 'email' = buyer_email`.
* **Single Source of Truth**:
  * [`supabase_schema.sql`](file:///d:/Projects%20Working%20in%20Progress/TEDxGCEM/supabase_schema.sql) contains the master idempotent script with all table definitions, migration guards (`IF NOT EXISTS`, `IF EXISTS`), seeds, and security policies.

---

### 4. Pass Hub, Badge Generator & Gate QR Verification
* **Individual Registration Rows & Unique Passes**:
  * Every attendee in a multi-seat booking gets their own distinct record in Supabase with a unique ticket UUID (`TEDX-XXXXXXXX`) and individual QR verification payload.
* **Multi-Pass Switcher in "Get My Pass"**:
  * When a buyer visits the pass portal, the system fetches all badges linked to their account (`email` or `buyer_email`).
  * Displays a pass switcher tab bar (`[ 🎟️ Rahul (Pass #1) ] [ 🎟️ Priya (Pass #2) ]`) allowing the user to view and download badges for every attendee.
* **High-Resolution HTML5 Canvas Badge Renderer (800 × 1200 px)**:
  * Generates an official printable portrait pass badge with custom lanyard graphic, attendee name, role, institution, and individual scannable QR code.
  * Auto-names the downloaded PNG file specifically to the attendee: `TEDxGCEM_Pass_<AttendeeName>_<TicketID>.png`.
* **Event-Day Gate QR Scanner (`/api/verify-pass`)**:
  * Scanning any pass badge loads a server-rendered verification card showing authentication status, attendee name, designation, college, and payment receipt confirmation.

---

### 5. Admin Console Updates
* **Attendee Directory**:
  * Displays every delegate as an individual row.
  * Highlights group bookings with a dedicated `↳ Booked by: buyer@email.com` tag.
* **Excel & CSV Export Engine**:
  * Exports full delegate rosters with custom Bookman Antiqua typography (9pt) and structured columns including Buyer Email, Ticket ID, Status, Amount Paid, Payment Method, and Tier.

---

## 🛠️ File Modification Summary

| File Path | Role & Changes |
|---|---|
| [`supabase_schema.sql`](file:///d:/Projects%20Working%20in%20Progress/TEDxGCEM/supabase_schema.sql) | Master idempotent SQL schema with multi-ticket columns, index migrations, and updated RLS policies. |
| [`src/lib/ticket-service.ts`](file:///d:/Projects%20Working%20in%20Progress/TEDxGCEM/src/lib/ticket-service.ts) | Real-time tier capacity calculation summing `ticket_count` per booking. |
| [`src/app/api/payment/create-order/route.ts`](file:///d:/Projects%20Working%20in%20Progress/TEDxGCEM/src/app/api/payment/create-order/route.ts) | Order creation with quantity support, capacity verification, and strict single-ticket coupon validation. |
| [`src/app/api/payment/verify/route.ts`](file:///d:/Projects%20Working%20in%20Progress/TEDxGCEM/src/app/api/payment/verify/route.ts) | Cryptographic signature validation and individual attendee pass insertion into Supabase. |
| [`src/app/api/pass/route.ts`](file:///d:/Projects%20Working%20in%20Progress/TEDxGCEM/src/app/api/pass/route.ts) | Pass retrieval API querying tickets by attendee `email` or `buyer_email`. |
| [`src/app/api/verify-pass/route.ts`](file:///d:/Projects%20Working%20in%20Progress/TEDxGCEM/src/app/api/verify-pass/route.ts) | Gate QR check-in verification rendering individual attendee credentials. |
| [`src/components/sections/RegisterNow.tsx`](file:///d:/Projects%20Working%20in%20Progress/TEDxGCEM/src/components/sections/RegisterNow.tsx) | Multi-seat UI, delegate tabs, compulsory field validation, and referral auto-sync. |
| [`src/components/sections/GetMyPass.tsx`](file:///d:/Projects%20Working%20in%20Progress/TEDxGCEM/src/components/sections/GetMyPass.tsx) | Pass switcher tabs and individual canvas PNG badge download engine. |
| [`src/components/sections/AdminConsole.tsx`](file:///d:/Projects%20Working%20in%20Progress/TEDxGCEM/src/components/sections/AdminConsole.tsx) | Attendee management table showing buyer metadata and updated data exports. |

---

## 🔍 Verification & Quality Assurance

* **TypeScript Compilation**: `npx tsc --noEmit` &rarr; **0 errors**.
* **Next.js Production Build**: `npm run build` &rarr; **Compiled successfully in 5.7s**.
* **Version Control**: Committed (`4b79f03`) and pushed directly to `origin/main` on GitHub repository [`BLITZz-bot/TEDxGCEM2026`](https://github.com/BLITZz-bot/TEDxGCEM2026).
