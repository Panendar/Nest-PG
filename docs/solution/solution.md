# Product Solution — PG Management Platform

## Product Vision

The product addresses a fragmented PG discovery experience where students must physically visit or manually coordinate across multiple accommodations to evaluate options. The source states a centralized, location-aware platform that lets users discover, compare, and contact PG owners in one place, reducing search friction and effort. Current pain is concentrated on students who need quick local decision-making, while PG owners also suffer from limited visibility and inconsistent direct reach to potential tenants.

## Why Now

[MISSING: no "why now" trigger found — architect must provide the reason this is being built now rather than later]

## Core Value Proposition

This platform combines capabilities that are presented together as its USP: hybrid radius-plus-city search, real-time listing and availability updates, and a dual-role structure for both users and owners. The distinct value is not just listing PGs, but enabling fast, localized comparison and direct owner contact in a single system, while giving owners lightweight listing control and immediate lead access.

## Success Definition

[MISSING: no measurable metrics found — architect must provide targets with numbers and timeframes]

Evidence-based success signals currently defined are directional only: growth in listings and contact requests week over week, balanced growth of users and owners, low listing churn, high active listing ratio, and stable response time under 3 seconds. The metrics catalog is comprehensive (traffic, conversion, engagement, listing activity), but lacks explicit numeric targets and deadlines.

## Module List

**Discovery & Visitor Access** (`visitor-discovery`)

- **What it does:** Provides anonymous browsing and preview search by city/town and radius, with conversion CTAs into registered roles.
- **Why now:** The platform’s core promise is centralized PG discovery; visitor entry is required to capture top-of-funnel demand and feed user/owner registration.
- **Non-goals:**
  - Does not provide full listing detail access for anonymous visitors.
  - Does not support direct owner contact without authentication.
  - [MISSING: additional explicit visitor non-goals from source scope boundaries]

**User Experience** (`user-experience`)

- **What it does:** Enables authenticated users to run full search, compare listing details, and contact owners.
- **Why now:** User-side discovery-to-contact is the primary value outcome explicitly described in product overview and success statements.
- **Non-goals:**
  - Favorites are optional future scope, not required in current phase.
  - [MISSING: additional explicit user non-goals from source scope boundaries]

**Owner Listing Management** (`owner-listings`)

- **What it does:** Lets owners create, update, and manage listings, media, and availability.
- **Why now:** Real-time supply freshness and owner participation are required for reliable discovery and for generating consistent inquiries.
- **Non-goals:**
  - [MISSING: explicit owner-module non-goals (what owner workflows are out of scope in this phase)]

**Administration & Moderation** (`admin-operations`)

- **What it does:** Manages users/listings, moderation decisions, and platform-level insight tracking.
- **Why now:** Governance and listing quality control are needed to sustain trust, active listing quality, and conversion monitoring from launch.
- **Non-goals:**
  - [MISSING: explicit admin-module non-goals (out-of-scope controls, workflows, or responsibilities)]
