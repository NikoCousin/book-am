# Book.am - Project Context

A booking platform for barbers, salons, and spas in Armenia. This document provides a comprehensive overview of the codebase structure, technology stack, database schema, and key implementation details.

---

## Tech Stack

### Core Framework
- **Next.js 16.1.4** - React framework with App Router
- **React 19.2.3** - UI library
- **TypeScript 5** - Type safety

### Database & ORM
- **SQLite** - Database (via `dev.db` file)
- **Prisma 7.2.0** - ORM with LibSQL adapter
- **@prisma/adapter-libsql** - SQLite adapter for Prisma

### Styling & UI
- **Tailwind CSS 4** - Utility-first CSS framework
- **Lucide React** - Icon library
- **@tailwindcss/postcss** - PostCSS integration

### Data Fetching & State
- **SWR 2.3.8** - Data fetching and caching library
- **React Compiler** - React optimization

### Validation & Utilities
- **Zod 4.3.5** - Schema validation
- **date-fns 4.1.0** - Date manipulation and formatting

### Development Tools
- **ESLint** - Code linting
- **tsx** - TypeScript execution for scripts
- **dotenv** - Environment variable management

---

## Project Structure

```
bookam/
├── prisma/
│   ├── schema.prisma          # Database schema definition
│   ├── seed.ts                # Database seeding script
│   └── migrations/            # Prisma migration files
│
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── [slug]/            # Dynamic business pages
│   │   │   ├── page.tsx       # Business public page
│   │   │   └── book/
│   │   │       └── [serviceId]/
│   │   │           ├── page.tsx           # Booking form (date/time selection)
│   │   │           ├── confirm/
│   │   │           │   └── page.tsx      # Customer details & verification
│   │   │           └── success/
│   │   │               └── page.tsx       # Booking confirmation page
│   │   │
│   │   ├── dashboard/         # Business dashboard
│   │   │   ├── (auth)/
│   │   │   │   └── login/
│   │   │   │       └── page.tsx           # Business login
│   │   │   └── (main)/
│   │   │       ├── layout.tsx              # Dashboard layout with sidebar
│   │   │       ├── page.tsx                # Main dashboard (booking list)
│   │   │       ├── calendar/
│   │   │       │   └── page.tsx            # Calendar view (placeholder)
│   │   │       ├── clients/
│   │   │       │   └── page.tsx            # Client management (placeholder)
│   │   │       └── settings/
│   │   │           └── page.tsx            # Settings (placeholder)
│   │   │
│   │   ├── api/               # API routes
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts          # Business login endpoint
│   │   │   │   ├── logout/route.ts        # Logout endpoint
│   │   │   │   └── session/route.ts       # Session check endpoint
│   │   │   └── bookings/
│   │   │       ├── create/route.ts        # Create booking
│   │   │       └── route.ts               # Get booked slots
│   │   │   └── dashboard/
│   │   │       └── bookings/
│   │   │           ├── route.ts           # Get bookings for dashboard
│   │   │           └── [id]/route.ts      # Update booking status/reschedule
│   │   │
│   │   ├── page.tsx           # Landing page
│   │   ├── layout.tsx         # Root layout
│   │   ├── globals.css        # Global styles
│   │   └── middleware.ts      # Route protection middleware
│   │
│   ├── components/
│   │   ├── booking/
│   │   │   ├── booking-form.tsx           # Date/time selection form
│   │   │   ├── confirm-form.tsx           # Customer details & verification
│   │   │   ├── date-picker.tsx            # Date selection component
│   │   │   ├── time-slots.tsx             # Time slot selection component
│   │   │   └── add-to-calendar-button.tsx # Calendar integration
│   │   │
│   │   ├── dashboard/
│   │   │   ├── booking-list.tsx            # Booking list with status management
│   │   │   ├── login-form.tsx             # Business login form
│   │   │   ├── reschedule-modal.tsx       # Reschedule booking modal
│   │   │   └── sidebar.tsx                # Dashboard navigation sidebar
│   │   │
│   │   └── ui/
│   │       └── button.tsx                  # Reusable button component
│   │
│   └── lib/
│       ├── prisma.ts           # Prisma client singleton
│       └── booking.ts          # Booking utility functions
│
├── public/                     # Static assets
├── dev.db                      # SQLite database file
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── next.config.ts              # Next.js configuration
└── eslint.config.mjs          # ESLint configuration
```

---

## Database Schema

### Models Overview

#### **Business**
Multi-tenant business entities (barbershops, salons, spas).

- `id` (String, CUID) - Primary key
- `name` (String) - Business name
- `slug` (String, unique) - URL-friendly identifier
- `type` (String) - Business type: "barber", "salon", "spa" (default: "salon")
- `description` (String, optional) - Business description
- `address` (String, optional) - Physical address
- `city` (String, optional) - City
- `phone` (String, optional) - Contact phone
- `email` (String, unique) - Business email
- `password` (String) - Hashed password (not currently used for login)
- `imageUrl` (String, optional) - Business image
- `isVerified` (Boolean) - Verification status
- `createdAt`, `updatedAt` (DateTime) - Timestamps

**Relations:**
- `staff` - One-to-many with Staff
- `services` - One-to-many with Service
- `bookings` - One-to-many with Booking

---

#### **Staff**
Staff members associated with a business.

- `id` (String, CUID) - Primary key
- `businessId` (String) - Foreign key to Business
- `name` (String) - Staff member name
- `email` (String, optional) - Contact email
- `phone` (String, optional) - Contact phone
- `imageUrl` (String, optional) - Profile image
- `isActive` (Boolean) - Active status
- `createdAt`, `updatedAt` (DateTime) - Timestamps

**Relations:**
- `business` - Many-to-one with Business
- `services` - Many-to-many with Service
- `schedules` - One-to-many with Schedule
- `timeOffs` - One-to-many with TimeOff
- `bookings` - One-to-many with Booking

---

#### **Service**
Services offered by a business.

- `id` (String, CUID) - Primary key
- `businessId` (String) - Foreign key to Business
- `name` (String) - Service name
- `description` (String, optional) - Service description
- `duration` (Int) - Duration in minutes
- `price` (Int) - Price in AMD (Armenian Dram)
- `isActive` (Boolean) - Active status
- `createdAt`, `updatedAt` (DateTime) - Timestamps

**Relations:**
- `business` - Many-to-one with Business
- `staff` - Many-to-many with Staff
- `bookings` - One-to-many with Booking

---

#### **Schedule**
Weekly working schedules for staff members.

- `id` (String, CUID) - Primary key
- `staffId` (String) - Foreign key to Staff
- `dayOfWeek` (Int) - Day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
- `startTime` (String) - Start time in "HH:mm" format (e.g., "09:00")
- `endTime` (String) - End time in "HH:mm" format (e.g., "18:00")
- `isActive` (Boolean) - Active status

**Constraints:**
- Unique constraint on `[staffId, dayOfWeek]` - One schedule per staff per day

**Relations:**
- `staff` - Many-to-one with Staff

---

#### **TimeOff**
Staff time-off periods (vacations, sick leave, etc.).

- `id` (String, CUID) - Primary key
- `staffId` (String) - Foreign key to Staff
- `startDate` (DateTime) - Time-off start date
- `endDate` (DateTime) - Time-off end date
- `reason` (String, optional) - Reason for time off
- `createdAt` (DateTime) - Creation timestamp

**Relations:**
- `staff` - Many-to-one with Staff

---

#### **Customer**
Customer records identified by phone number.

- `id` (String, CUID) - Primary key
- `phone` (String, unique) - Phone number (Armenian format: +374XXXXXXXX)
- `name` (String, optional) - Customer name
- `email` (String, optional) - Customer email
- `createdAt`, `updatedAt` (DateTime) - Timestamps

**Relations:**
- `bookings` - One-to-many with Booking
- `verificationCodes` - One-to-many with VerificationCode

---

#### **Booking**
Appointment bookings.

- `id` (String, CUID) - Primary key
- `businessId` (String) - Foreign key to Business
- `staffId` (String) - Foreign key to Staff
- `serviceId` (String) - Foreign key to Service
- `customerId` (String) - Foreign key to Customer
- `date` (DateTime) - Booking date
- `startTime` (String) - Start time in "HH:mm" format
- `endTime` (String) - End time in "HH:mm" format (calculated from service duration)
- `status` (String) - Booking status:
  - `"pending"` - Initial state
  - `"confirmed"` - Confirmed booking
  - `"completed"` - Service completed
  - `"cancelled"` - Cancelled booking
  - `"no-show"` - Customer didn't show up
  - `"rescheduled"` - Booking was rescheduled
- `notes` (String, optional) - Additional notes
- `createdAt`, `updatedAt` (DateTime) - Timestamps

**Indexes:**
- `businessId`, `staffId`, `customerId`, `date` - For efficient querying

**Relations:**
- `business` - Many-to-one with Business
- `staff` - Many-to-one with Staff
- `service` - Many-to-one with Service
- `customer` - Many-to-one with Customer

---

#### **VerificationCode**
SMS verification codes for customer verification (currently used in UI but not fully integrated).

- `id` (String, CUID) - Primary key
- `customerId` (String) - Foreign key to Customer
- `code` (String) - 6-digit verification code
- `expiresAt` (DateTime) - Code expiration time
- `isUsed` (Boolean) - Whether code has been used
- `createdAt` (DateTime) - Creation timestamp

**Relations:**
- `customer` - Many-to-one with Customer

---

## Key Logic

### Authentication Flow

**Business Login:**
1. Business enters phone number at `/dashboard/login`
2. Frontend validates Armenian phone format (`+374XXXXXXXX`)
3. POST to `/api/auth/login` with `action: "send-code"`
4. Backend verifies business exists by phone number
5. Frontend generates a 6-digit code (in production, this would be sent via SMS)
6. User enters verification code
7. POST to `/api/auth/login` with `action: "verify"`
8. Backend sets `business_session` cookie with business ID
9. Redirect to `/dashboard`

**Session Management:**
- Session stored in HTTP-only cookie: `business_session`
- Cookie expires in 7 days
- Middleware (`src/middleware.ts`) protects all `/dashboard/*` routes
- If no session exists, redirects to `/dashboard/login`
- If session exists on login page, redirects to `/dashboard`

**Current Implementation Notes:**
- Password field exists in Business model but is not used
- Verification code is generated client-side (for development)
- SMS integration is not implemented (placeholder logic exists)

---

### Public Booking Flow

**Step 1: Business Page (`/{slug}`)**
- Fetches business by slug with active services and staff
- Displays business info (name, type, address, phone)
- Lists all active services with price and duration
- Each service links to `/{slug}/book/{serviceId}`

**Step 2: Date & Time Selection (`/{slug}/book/{serviceId}`)**
- Fetches business, service, and staff schedules
- Date picker shows next 14 days (excluding days without schedule)
- When date selected:
  - Fetches existing bookings for that date via `/api/bookings?businessId={id}&date={date}`
  - Generates time slots based on staff schedule for that day of week
  - Filters out booked slots
  - Displays available 30-minute intervals
- User selects date and time
- Clicking "Continue" navigates to confirm page with query params

**Step 3: Customer Details & Verification (`/{slug}/book/{serviceId}/confirm`)**
- Displays booking summary (service, date, time, price)
- Customer enters:
  - Name (required)
  - Phone number (required, Armenian format: `+374XXXXXXXX`)
  - Email (optional)
  - Notes (optional)
- Frontend generates 6-digit verification code
- User enters code to verify
- On verification, POST to `/api/bookings/create`

**Step 4: Booking Creation (`/api/bookings/create`)**
1. Validates request data with Zod schema
2. Verifies service exists and is active
3. Gets first active staff member for business (currently auto-assigns)
4. Checks time slot availability (conflicts with existing confirmed/pending bookings)
5. Finds or creates customer by phone number
6. Calculates end time from service duration
7. Creates booking with status `"confirmed"`
8. Returns booking ID

**Step 5: Success Page (`/{slug}/book/{serviceId}/success`)**
- Displays booking confirmation
- Shows booking details (service, date, time, business info)
- Displays booking reference ID
- Option to add to calendar
- Link back to business page

---

### Dashboard Booking Management

**Booking List View (`/dashboard`):**
- Fetches bookings for selected date via `/api/dashboard/bookings?date={date}`
- Displays bookings in chronological order
- Shows customer info, service, time, and status
- Date navigation (prev/next/today buttons)

**Status Management:**
- Business can update booking status via PATCH `/api/dashboard/bookings/{id}`
- Valid statuses: `pending`, `confirmed`, `completed`, `cancelled`, `no-show`, `rescheduled`
- Actions available for `confirmed` bookings:
  - **Complete** - Marks as `completed`
  - **No Show** - Marks as `no-show`
  - **Reschedule** - Opens modal to select new date/time
  - **Cancel** - Marks as `cancelled`

**Rescheduling:**
1. Opens reschedule modal with date/time picker
2. Validates new slot availability
3. PATCH to `/api/dashboard/bookings/{id}` with `reschedule: true`, `date`, `time`
4. Backend calculates new end time from service duration
5. Updates booking with new date/time and status `"rescheduled"`
6. Refreshes booking list (both old and new dates if different)

**Data Fetching:**
- Uses SWR for client-side data fetching
- Automatic revalidation on mutations
- Optimistic updates via `mutate()` calls

---

### Availability Checking

**Time Slot Generation:**
- Function: `generateTimeSlots(startTime, endTime, intervalMinutes)`
- Default interval: 30 minutes
- Generates slots from start to end time (e.g., "09:00" to "18:00" = 09:00, 09:30, 10:00, ...)

**Conflict Detection:**
- When booking, checks for existing bookings with:
  - Same `businessId`
  - Same `date`
  - Same `startTime`
  - Status in `["pending", "confirmed"]`
- If conflict exists, returns 409 error

**Schedule-Based Availability:**
- Only shows dates where staff has active schedules
- Filters out days without schedule entries
- Respects day-of-week schedules (0=Sunday, 6=Saturday)

---

### Customer Management

**Auto-Create/Update:**
- Customers identified by unique phone number
- On booking creation:
  - If customer exists: Updates name and email (if provided)
  - If customer doesn't exist: Creates new customer record
- Phone number format: `+374XXXXXXXX` (Armenian format)

**Verification Codes:**
- VerificationCode model exists but not fully integrated
- Currently, codes are generated client-side for UI flow
- In production, would be stored in database and sent via SMS

---

### Utility Functions (`src/lib/booking.ts`)

- `getNext14Days(closedDays)` - Returns array of next 14 available dates
- `generateTimeSlots(startTime, endTime, intervalMinutes)` - Generates time slot array
- `formatDateShort(date)` - Formats as "EEE, MMM d"
- `formatDateFull(date)` - Formats as "EEEE, MMMM d, yyyy"
- `formatTime(time)` - Converts "HH:mm" to "h:mm AM/PM"
- `isDateInPast(date)` - Checks if date is in the past
- `isSameDateAs(date1, date2)` - Compares two dates

---

## Current Limitations & Placeholders

1. **Settings Page** - Placeholder only
2. **Calendar View** - Placeholder only
3. **Clients Page** - Placeholder only
4. **SMS Integration** - Not implemented (verification codes shown in UI for development)
5. **Staff Selection** - Currently auto-assigns first active staff member
6. **Time-Off Handling** - Model exists but not used in availability checking
7. **Business Registration** - Landing page links to `/register` but route doesn't exist
8. **Password Authentication** - Business model has password field but login uses phone/SMS only

---

## Environment & Configuration

- **Database**: SQLite file at `./dev.db`
- **Prisma Client**: Configured with LibSQL adapter for SQLite
- **Session Cookie**: `business_session` (HTTP-only, 7-day expiration)
- **Currency**: Armenian Dram (AMD) - formatted with `Intl.NumberFormat("hy-AM")`
- **Phone Format**: Armenian format required (`+374XXXXXXXX`)

---

## Development Notes

- React Compiler enabled for optimization
- TypeScript strict mode
- ESLint configured with Next.js rules
- Tailwind CSS 4 with PostCSS
- Prisma migrations tracked in `prisma/migrations/`
- Seed script available: `npm run seed`
