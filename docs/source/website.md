# Website Structure — PG Management Platform

## Visitor (Anonymous)

### Features
- Browse PG listings (limited details)
- Search by:
  - City/Town
  - Radius (preview only)
- View sample listings

### CTA
- Register as User
- Register as Owner

---

## User Section (Authenticated)

### Features
- Full access to PG listings
- Advanced search:
  - Radius filter (default 3km, adjustable)
  - City/Town selection
- View:
  - Photos
  - Amenities
  - Pricing
  - Location

### Actions
- Contact PG owner
- Save favorites (optional future feature)

---

## Owner Section (Authenticated)

### Features
- Add new PG
- Upload:
  - Photos
  - Pricing
  - Amenities
  - Address (with geolocation)

### Actions
- Edit/Delete listings
- Update availability
- View user inquiries

---

## Admin Section

### User Management
- View users and owners
- Monitor activity

### Listing Management
- Approve/reject PG listings
- Moderate content

### Insights
- Track:
  - Listings
  - Users
  - Engagement
  - Conversion rates

---

## Data Model (High Level)

### User
- id
- name
- email
- phone
- role (user/owner)

### PG Listing
- id
- owner_id
- title
- description
- price
- amenities
- images
- location (lat, lng)
- city

### Contact
- id
- user_id
- pg_id
- message
- timestamp

---

## Key Flows

### User Flow
Register → Search → View PG → Contact Owner

### Owner Flow
Register → Add PG → Upload Details → Receive Contacts

### System Flow
Search → Filter (radius/city) → Fetch listings → Display results
