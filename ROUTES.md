# Application Routes

Complete list of all page routes in the Book.am application.

## Public Routes

| URL Pattern | Dynamic Params Needed? | Purpose | Example URL |
|------------|------------------------|---------|-------------|
| `/` | No | Home page listing all businesses (directory view) | `/` |
| `/[slug]` | Yes: `slug` (business slug from database) | Public business page showing services and business info | `/barber-evo` or `/admin-shop` |
| `/[slug]/book/[serviceId]` | Yes: `slug` (business slug), `serviceId` (service CUID) | Booking form to select staff, date, and time for a service | `/barber-evo/book/clx123abc456` |
| `/[slug]/book/[serviceId]/confirm` | Yes: `slug`, `serviceId` + Query params: `date` (YYYY-MM-DD), `time` (HH:mm), `staffId` (optional) | Customer details form and verification before creating booking | `/barber-evo/book/clx123abc456/confirm?date=2024-01-15&time=10:00&staffId=clx456def789` |
| `/[slug]/book/[serviceId]/success` | Yes: `slug`, `serviceId` + Query param: `bookingId` (booking CUID) | Booking confirmation success page with booking details | `/barber-evo/book/clx123abc456/success?bookingId=clx789ghi012` |

## Dashboard Routes (Protected - Requires Authentication)

| URL Pattern | Dynamic Params Needed? | Purpose | Example URL |
|------------|------------------------|---------|-------------|
| `/dashboard/login` | No | Business login page with phone verification | `/dashboard/login` |
| `/dashboard` | No (uses session cookie for businessId) | Main dashboard showing booking list for today | `/dashboard` |
| `/dashboard/calendar` | No (uses session cookie for businessId) | Calendar day view showing all staff bookings | `/dashboard/calendar` |
| `/dashboard/clients` | No | Client management page (placeholder - coming soon) | `/dashboard/clients` |
| `/dashboard/settings` | No | Settings page (placeholder - coming soon) | `/dashboard/settings` |
| `/dashboard/settings/staff` | No (uses session cookie for businessId) | Staff management page to add/edit staff, schedules, and time off | `/dashboard/settings/staff` |

## Notes

- **Authentication**: All `/dashboard/*` routes require a valid `business_session` cookie. Middleware redirects to `/dashboard/login` if not authenticated.
- **Dynamic Params**: 
  - `slug`: Unique business identifier (e.g., "barber-evo", "admin-shop")
  - `serviceId`: Service CUID from the Service model
  - `staffId`: Staff CUID from the Staff model (optional for booking)
  - `bookingId`: Booking CUID from the Booking model
- **Query Parameters**:
  - `date`: Format `YYYY-MM-DD` (e.g., "2024-01-15")
  - `time`: Format `HH:mm` (e.g., "10:00", "14:30")
- **Route Groups**: 
  - `(auth)` and `(main)` are Next.js route groups that don't affect the URL structure
- **404 Handling**: Dynamic routes like `/[slug]` have a `not-found.tsx` that renders when business is not found

## Testing Checklist

### Public Routes
- [ ] `/` - Verify all businesses are listed
- [ ] `/[slug]` - Test with valid business slug
- [ ] `/[slug]` - Test with invalid slug (should show 404)
- [ ] `/[slug]/book/[serviceId]` - Test staff selection and date/time picker
- [ ] `/[slug]/book/[serviceId]/confirm` - Test with valid date/time params
- [ ] `/[slug]/book/[serviceId]/confirm` - Test without date/time (should redirect)
- [ ] `/[slug]/book/[serviceId]/success` - Test with valid bookingId

### Dashboard Routes
- [ ] `/dashboard/login` - Test login flow
- [ ] `/dashboard` - Test booking list view
- [ ] `/dashboard/calendar` - Test calendar day view
- [ ] `/dashboard/clients` - Verify placeholder page
- [ ] `/dashboard/settings` - Verify placeholder page
- [ ] `/dashboard/settings/staff` - Test staff CRUD operations
- [ ] `/dashboard/*` - Test redirect to login when not authenticated
