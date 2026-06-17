# GREENUP — PRODUCT REQUIREMENTS DOCUMENT (PRD)

**Version**: 1.0  
**Date**: June 2026  
**Status**: Private Beta Ready  
**Document Owner**: Delin Meitei & Punshiba Ningthoujam

---

## 1. PRODUCT OVERVIEW

**Product Name**: GreenUP  
**Tagline**: Plant. Clean. Grow.  
**Category**: Gamified Environmental Action Platform  

### Problem Statement
Environmental action (tree planting, cleanup) is underreported, unverified, and lacks social recognition. Students and communities lack transparency into collective impact and motivation for sustained participation. Existing solutions are either too complex, require payment, or lack verification.

### Solution
A free, web-based platform that:
- Enables verified environmental action logging (GPS + photo proof)
- Gamifies participation (levels, badges, points, streaks, leaderboards)
- Builds community (teams, collective impact, social competition)
- Provides transparent, global impact tracking (interactive world map)
- Supports fundraising (multi-currency donations)

### Target Audience
- **Primary**: Global students (18–30 years)
- **Secondary**: Campus sustainability groups, environmental clubs
- **Tertiary**: Communities, NGOs, sustainability-focused organizations

### Success Criteria (Phase 1)
- 1,000+ active users within 6 months of public launch
- 50+ teams created
- 10,000+ verified environmental actions logged
- <3 second page load time
- 99% uptime
- Zero critical security incidents

---

## 2. USER ROLES & PERSONAS

### Role 1: Individual Eco-Warrior
**Name**: Arjun (22, engineering student, India)  
**Motivations**: Environmental impact, gamification, social recognition  
**Behaviors**: 
- Logs 2–3 trees/cleanups per month
- Competes on leaderboards
- Shares progress with friends
- Leaves app if no new features in 2 months
**Needs**: Easy logging, instant feedback, social competition, badges

---

### Role 2: Team Organizer
**Name**: Zara (24, environmental club president, Kenya)  
**Motivations**: Mobilize team, track collective impact, attract members  
**Behaviors**:
- Creates team, invites members, reviews team stats
- Plans cleanup campaigns
- Monitors team progress against rivals
- Uses data for reports to university
**Needs**: Team dashboards, member management, exportable stats, team achievements

---

### Role 3: Impact Tracker
**Name**: Marcus (28, sustainability officer, USA)  
**Motivations**: Document impact for reporting, fundraising, accountability  
**Behaviors**:
- Reviews world map data
- Exports CSV for annual reports
- Uses GreenUP data in funding proposals
- Monitors global trends
**Needs**: Data export, advanced filtering, impact metrics, reporting tools

---

### Role 4: Casual Participant
**Name**: Lisa (19, first-year student, UK)  
**Motivations**: Fun, social, low commitment  
**Behaviors**:
- Logs 1–2 actions per month
- Checks leaderboard occasionally
- May not return after 3 months
**Needs**: Frictionless signup, simple UX, low-pressure gamification

---

### Role 5: Donor / Supporter
**Name**: Rajesh (45, corporate sustainability lead, India)  
**Motivations**: Support environmental initiatives, transparency, alignment with CSR goals  
**Behaviors**:
- Visits app to check global impact
- Makes donations to support tree planting
- Views donor leaderboard and impact reports
**Needs**: Trust (verified data), multi-currency support, impact receipts, donor recognition

---

## 3. CORE FEATURES

### Feature 1: Action Logging
**Epic**: Users can log verified environmental actions (trees, cleanups)

#### Sub-Feature 1a: Plant a Tree
- **Description**: Log a tree planted with GPS + photo proof
- **User Flow**:
  1. Click "Log Tree"
  2. Enter tree species (autocomplete from 100+ species)
  3. Take before photo (or upload)
  4. Geo-locate using GPS (or manual entry)
  5. Review auto-reverse-geocoded location
  6. Add notes (optional)
  7. Submit → Gets 10 points
- **Data Captured**: photo, before photo, species, GPS, location name, user ID, timestamp
- **Validation**: 
  - Photo must be uploadable (JPEG/PNG, <5 MB)
  - GPS accuracy within 100 meters (or accept manual)
  - Species must be from approved list or custom-entered
- **Gamification**: +10 points, progress toward next level, unlock badges

#### Sub-Feature 1b: Log Cleanup
- **Description**: Log a cleanup activity with before/after photos and weight estimate
- **User Flow**:
  1. Click "Log Cleanup"
  2. Enter waste types (multi-select: plastic, metal, paper, organic, other)
  3. Estimate weight in kg
  4. Take before photo
  5. Take after photo
  6. Geo-locate
  7. Add notes
  8. Submit → Gets 8 + weight bonus (up to +10)
- **Data Captured**: before/after photos, weight_kg, waste types, GPS, location, user ID, timestamp
- **Validation**:
  - Both photos required
  - Weight estimate 0.1 to 1000 kg
  - Before/after timestamp difference <24 hours
- **Gamification**: +8 to +18 points, streak counter, badges
- **Before/After Slider**: Interactive verification widget allows users to drag a slider comparing before/after photos side-by-side

#### Sub-Feature 1c: Photo Verification & Compression
- **Description**: Client-side compression and CDN upload
- **Process**:
  1. User uploads original photo (mobile camera or file)
  2. Client-side: compress to max 1280px, 0.78 quality
  3. Convert to JPEG
  4. Upload to Supabase Storage (`proofs/` bucket)
  5. Generate preview URL for immediate feedback
  6. Store URL in `actions` table
- **Limits**: Max 5 MB per file, max 2 photos per action (before/after)
- **Fallback**: If upload fails, local storage cache; retry on next page load

---

### Feature 2: Gamification System

#### Sub-Feature 2a: Levels & Progression
- **Levels**:
  1. Seed (0–49 points) — Getting started
  2. Sprout (50–149 points) — Growing momentum
  3. Tree (150–399 points) — Major contributor
  4. Forest Guardian (400+ points) — Elite status
- **Visual Feedback**:
  - Circular progress ring showing % to next level
  - Level-up animation with confetti
  - Achievement notification
- **Rewards**: None yet (planned: perks, unlocked features)

#### Sub-Feature 2b: Badges (8 types)
| Badge | Requirement | Icon |
|-------|-------------|------|
| Seed Starter | Plant first tree | 🌱 |
| Clean Champ | Log first cleanup | 🧹 |
| Tree Guardian | Plant 10 trees | 🌳 |
| Trash Buster | Log 10 cleanups | 🗑️ |
| Eco Legend | Reach Forest Guardian level | 👑 |
| Quiz Whiz | Win 3 daily quizzes | 🧠 |
| Week Streak | Log action 7 consecutive days | 🔥 |
| Patron Sapling | Donate once | 💚 |

**Display**: Badge gallery on profile, notification on unlock

#### Sub-Feature 2c: Points System
- Tree: +10 points (fixed)
- Cleanup: +8 points (base) + weight bonus (1 point per kg, max +10)
- Daily Quiz: +5 points (once per day max)
- **Example**: 5 kg cleanup = 8 + 5 = 13 points

#### Sub-Feature 2d: Streak Tracking
- **Definition**: Consecutive days with at least one action (tree or cleanup)
- **Increment**: Streak +1 for first action each day
- **Reset**: Breaks after missed day at 00:00 UTC
- **Display**: Fire emoji 🔥 with count on profile
- **Gamification**: Streak badge after 7-day streak

#### Sub-Feature 2e: Daily Quiz
- **Mechanic**: 
  - 1 question per day (rotates daily from 10 eco-knowledge questions)
  - 4 multiple-choice options
  - Correct answer: +5 points + quiz_wins counter
  - Wrong answer: 0 points, can retry next day
- **Frequency**: Once per user per day (tracked by user ID + date)
- **Questions**: 
  1. How many kg CO₂ does one mature tree absorb per year? (Answer: ~21 kg)
  2. What % of ocean plastic comes from land-based sources? (Answer: ~80%)
  3. How many gallons of water does one tree save by filtering runoff per year? (Answer: ~1000)
  4. [+ 7 more predefined questions]
- **Display**: Daily quiz card on dashboard (visible only if not yet completed today)

---

### Feature 3: World Map & Visualization

#### Sub-Feature 3a: Interactive Global Map
- **Map Library**: Google Maps (with OpenStreetMap fallback)
- **Display**: All verified actions pinned to GPS coordinates
- **Filtering Options**:
  - All actions
  - Trees only
  - Cleanups only
  - Near me (within 5 km radius of user location)
- **Interactivity**:
  - Click pin → info window with action details (user, before/after photos, timestamp)
  - Clustering: Marker clusterer groups pins at low zoom
  - Real-time updates: Supabase realtime channel pushes new actions to all viewers
- **Performance**: <3 second load time, lazy-load image thumbnails
- **Mobile**: Responsive, touch-friendly, pinch-to-zoom

#### Sub-Feature 3b: Action Gallery
- **Display**: Grid of 12 most recent actions below map
- **Tile Info**: User avatar, username, action type (🌳 or 🧹), location, timestamp
- **Click**: Opens modal with full details (before/after photos, description, points earned)
- **Infinite Scroll**: Load next 12 on scroll

#### Sub-Feature 3c: Location Reverse Geocoding
- **Process**:
  1. User provides GPS coordinates
  2. Query Google Geocoding API: lat/lng → place name
  3. Fallback to OpenStreetMap Nominatim if Google fails
  4. Display place name (e.g., "Nairobi, Kenya") to user for confirmation
  5. Store place in `actions.place` field
- **Caching**: Store results locally to reduce API calls

---

### Feature 4: Leaderboards

#### Sub-Feature 4a: Solo Leaderboard
- **Ranking**: Top 12 individuals by total points (descending)
- **Columns**:
  - Rank (1–12 with visual badges)
  - Avatar + Username
  - Level icon
  - Total points
  - Trees planted
  - Cleanups logged
- **Highlight**: Current user's rank always visible (with highlight) even if <12
- **Refresh**: Update every 5 minutes or on page reload
- **Mobile**: Horizontal scroll or card stack view

#### Sub-Feature 4b: Team Leaderboard
- **Ranking**: Top 12 teams by pooled member points
- **Team Stats**:
  - Team name + logo
  - Member count
  - Total points (sum of all members)
  - Total trees planted
  - Total cleanups logged
  - Total waste kg collected
- **Click Team**: Opens team dashboard with member list, achievements, contribution breakdown

#### Sub-Feature 4c: Donor Leaderboard
- **Ranking**: Top 10 donors by cumulative donation amount (converted to primary currency, e.g., USD)
- **Views**: All-time, this month, this week
- **Display**: Donor name (or anonymous if requested), amount, flag icon for country
- **Recognition**: Donor badge on their profile

---

### Feature 5: Teams

#### Sub-Feature 5a: Create Team
- **Form**:
  - Team name (unique, 3–40 chars)
  - Organization name (optional, e.g., "NIT Manipur")
  - Description (max 500 chars)
  - Logo upload (image, optional)
- **Validation**: Name uniqueness, owner becomes first member
- **Default**: Public team (discoverable in team search)

#### Sub-Feature 5b: Join Team
- **Options**:
  - Search team by name
  - Auto-join with team code (future)
  - Accept invite link (future)
- **Confirmation**: Accept terms, auto-adds user to `team_members` table
- **Role**: Defaults to "member" (owner can promote later)

#### Sub-Feature 5c: Team Dashboard
- **Sections**:
  - **Overview**: Member count, total points, total trees/cleanups, total kg waste
  - **Member List**: Avatar, username, points, role, contribution %
  - **Recent Actions**: 10 most recent team actions with user attribution
  - **Achievements**: 6 team badges (see below)
  - **Settings** (owner only): Edit team, invite members, remove members, disband
- **Contribution Breakdown**: Pie chart or bar chart showing each member's % contribution

#### Sub-Feature 5d: Team Achievements (6 types)
| Achievement | Requirement | Icon |
|-------------|-------------|------|
| First Roots | First team member plants tree | 🌱 |
| Opening Sweep | First team cleanup logged | 🧹 |
| Tiny Forest | Team plants 100 trees together | 🌲 |
| Heavy Lifters | Team collects 500 kg waste | 💪 |
| Full Squad | 10 members join team | 👥 |
| Sapling Contender | Team ranks in top 5 leaderboard | ⭐ |

#### Sub-Feature 5e: Team Invitations
- **Feature** (future): Owner can generate invite links or email team codes
- **Current**: Users manually search and join

---

### Feature 6: Donations

#### Sub-Feature 6a: Multi-Currency Support
- **Supported Currencies**: 30+ including INR, USD, EUR, GBP, JPY, CNY, AUD, CAD, SGD, AED, SAR, NGN, KES, ZAR, BRL, MXN, IDR, PHP, THB, MYR, VND, BDT, LKR, NPR, PKR, KRW, TRY, EGP, NZD, CHF
- **Auto-Detection**: IP geolocation → country → currency (via ipapi.co, fallback to USD)
- **Manual Override**: User can select different currency
- **Exchange Rates**: Static rates in code (can upgrade to live FX API)
  - Example: ₹50 (India) ≈ $1 (USD) ≈ €0.85 (EU)

#### Sub-Feature 6b: Donation Flow
- **Interface**:
  1. User clicks "Donate"
  2. Choose donation amount (presets: $1, $5, $10, $20, custom)
  3. Auto-detected currency displayed (can change)
  4. Click "Donate" → simulated checkout (no real payment yet)
  5. Confirmation page with thank-you message and donor badge unlocked
- **Current**: Simulated donations (no Stripe/payment processor yet)
- **Tracked Data**: donor_name, amount, currency, timestamp

#### Sub-Feature 6c: Donor Recognition
- **Donor Leaderboard**: Top 10 donors by total amount
- **Badge**: "Patron Sapling" awarded after first donation
- **Profile Display**: Donor badge + total donated (optional, can hide)
- **Thank-You Email** (future): Automated email with impact metrics

#### Sub-Feature 6d: Impact Reporting
- **Funding Goal**: Donations pool toward tree planting (1 tree = [TBD currency amount])
- **Progress Tracker**: Visual bar showing % to next tree
- **Impact Message**: "Your donations have funded [X] trees globally"
- **Transparency**: Public ledger of donations and cumulative impact (anonymized)

---

### Feature 7: User Profiles

#### Sub-Feature 7a: Profile Creation
- **Form**:
  - Username (unique, 3–24 alphanumeric + underscore)
  - Full name
  - College / Organization
  - Country (dropdown)
  - Bio (max 200 chars)
  - Avatar upload
- **Validation**: Username uniqueness, email verification
- **Auto-Generate**: If no username chosen, derived from email (e.g., "arjun.r")

#### Sub-Feature 7b: Public Profile View
- **Display** (read-only for other users):
  - Avatar + Username
  - Full name, college, country, bio
  - Level badge + progress ring
  - Stats: Trees, cleanups, waste kg, total points, streak
  - Badges earned
  - Recent actions (5 most recent)
  - Member of teams (team logos clickable to team dashboard)
- **Actions**: Can DM (future), can follow (future)

#### Sub-Feature 7c: Profile Edit (Own Profile)
- **Editable Fields**: Username, full name, college, country, bio, avatar
- **Validation**: Same as creation
- **Save**: Updates `profiles` table

#### Sub-Feature 7d: Profile Stats
- **Calculated Fields** (auto-updated):
  - `points`: Sum of points from all actions + quiz wins + donations
  - `trees`: Count of actions where kind='tree'
  - `cleanups`: Count of actions where kind='cleanup'
  - `waste_kg`: Sum of weight_kg from all cleanups
  - `streak`: Current consecutive-day counter
  - `last_action_on`: Timestamp of most recent action
  - `quiz_wins`: Count of correct daily quiz answers

---

### Feature 8: Authentication & Session Management

#### Sub-Feature 8a: Email/Password Sign-Up
- **Form**: Email, password (min 8 chars, 1 uppercase, 1 number), password confirm
- **Validation**: Email unique, password strength check
- **Flow**: Submit → Supabase auth creates user → auto-login → redirect to onboarding (profile creation)

#### Sub-Feature 8b: Email/Password Sign-In
- **Form**: Email, password
- **Validation**: Credentials checked via Supabase
- **Session**: Supabase SDK manages auth token (stored in localStorage)
- **Persistence**: Session persists across browser close (logged in until user logs out)

#### Sub-Feature 8c: Google OAuth
- **Flow**: Click "Sign in with Google" → OAuth redirect to Supabase → Google consent → redirect back to app with session token
- **Account Linking**: If email matches existing account, auto-links
- **Profile**: Auto-populates name and email from Google profile

#### Sub-Feature 8d: Guest / Demo Mode
- **Access**: Click "Try as guest" on landing page
- **Data**: All stored in browser localStorage (no server sync)
- **Functionality**: Full app access (log actions, teams, donate, quiz)
- **Persistence**: Survives browser close; clears on "Sign Out"
- **Limitations**: Can't access from another device; data lost if cookies cleared
- **Conversion**: User can sign up at any time; existing demo data prompts "save or start fresh"

#### Sub-Feature 8e: Sign Out
- **Action**: Click sign out → clear Supabase session → redirect to landing page
- **Demo Mode Reset**: Clears localStorage, returns to landing page
- **Re-Login**: User can sign back in immediately

---

### Feature 9: Responsive Design & Theme

#### Sub-Feature 9a: Mobile-First Responsive Layout
- **Breakpoints**: Mobile (<640px), tablet (640–1024px), desktop (1024px+)
- **Navigation**: Hamburger menu on mobile, horizontal nav on desktop
- **Forms**: Full-width on mobile, 2-column on desktop
- **Images**: Responsive sizes (srcset), lazy loading
- **Touch**: Large tap targets (min 48px), gesture support (swipe navigation)

#### Sub-Feature 9b: Light / Dark Theme
- **Detection**: System preference via `prefers-color-scheme` media query
- **Toggle**: User can manually override in settings
- **CSS Variables**: Complete theme system (ink, leaf, sprout, clean, gold colors)
- **Persistence**: User preference saved to localStorage

#### Sub-Feature 9c: Accessibility
- **WCAG 2.1 Level AA** (target):
  - Semantic HTML (heading hierarchy, form labels)
  - Color contrast ratios (4.5:1 text, 3:1 non-text)
  - Focus indicators on all interactive elements
  - Alt text on all images
  - Keyboard navigation (Tab, Enter, Arrow keys)
  - `aria-label` on icons and buttons
- **Reduced Motion**: Respects `prefers-reduced-motion` (disables animations for users who prefer)

#### Sub-Feature 9d: Performance
- **Target Metrics**:
  - First Contentful Paint (FCP): <2 seconds
  - Largest Contentful Paint (LCP): <2.5 seconds
  - Cumulative Layout Shift (CLS): <0.1
  - Time to Interactive (TTI): <3 seconds
- **Optimizations**:
  - Minified CSS, inline critical CSS
  - Lazy-load images and iframes
  - Debounce/throttle event handlers
  - Client-side rendering (no server round-trip for each page)

---

## 4. USER STORIES & ACCEPTANCE CRITERIA

### Story 1: Plant a Tree and Earn Points
**As a** student environmentalist  
**I want to** log trees I've planted with GPS and photo proof  
**So that** my environmental contribution is verified and I can earn points and badges.

**Acceptance Criteria**:
- [ ] User can upload a tree photo (JPEG/PNG, <5 MB)
- [ ] User can select tree species from 100+ predefined list or enter custom
- [ ] GPS location auto-detects and shows place name
- [ ] User can add optional notes
- [ ] Submission creates action in database with 10 points
- [ ] User receives instant notification (+10 pts, progress bar update)
- [ ] Action appears on world map within 5 seconds
- [ ] User can view their action on public profile

**Story Points**: 8  
**Priority**: P0 (Critical)

---

### Story 2: Join a Team and Compete
**As a** environmental club member  
**I want to** join a team and contribute to collective impact  
**So that** I can compete on team leaderboard and feel part of a community.

**Acceptance Criteria**:
- [ ] User can search for existing teams by name
- [ ] User can join team with single click
- [ ] User appears on team member list immediately
- [ ] User's actions are credited to team score
- [ ] Team leaderboard updates team points in real-time
- [ ] User can switch "active team" for future submissions
- [ ] User can view team dashboard with member list and stats

**Story Points**: 5  
**Priority**: P0 (Critical)

---

### Story 3: Track Global Impact on World Map
**As a** sustainability officer  
**I want to** see all verified environmental actions on an interactive global map  
**So that** I can understand collective impact and use data for reporting.

**Acceptance Criteria**:
- [ ] Map loads with all actions pinned by GPS coordinates
- [ ] User can filter by action type (all, trees, cleanups)
- [ ] User can filter by location (near me, within 50 km)
- [ ] Click pin shows action details (user, photos, timestamp)
- [ ] Gallery below map displays 12 most recent actions with infinite scroll
- [ ] Real-time updates: new actions appear on map within 5 seconds
- [ ] Map uses Google Maps with OpenStreetMap fallback if API fails

**Story Points**: 8  
**Priority**: P0 (Critical)

---

### Story 4: Complete Daily Quiz and Earn Points
**As a** casual user  
**I want to** take a daily eco-knowledge quiz  
**So that** I can earn points and learn about environmental facts.

**Acceptance Criteria**:
- [ ] User sees 1 new question per day (rotates daily)
- [ ] 4 multiple-choice options displayed
- [ ] Correct answer gives +5 points and updates quiz_wins
- [ ] User can see explanation of correct answer
- [ ] User can only answer once per day (cooldown until next day)
- [ ] Quiz Whiz badge unlocked after 3 correct answers
- [ ] Quiz history shows on profile (past 7 days)

**Story Points**: 5  
**Priority**: P1 (Important)

---

### Story 5: Make a Donation in Multiple Currencies
**As a** donor  
**I want to** donate in my local currency  
**So that** I can support tree planting without currency conversion hassle.

**Acceptance Criteria**:
- [ ] User sees currency auto-detected based on location (or can change)
- [ ] User can enter custom amount or select presets ($1, $5, $10, $20)
- [ ] Donation flow is simple (2 screens max)
- [ ] Confirmation page shows amount and thank-you message
- [ ] Donor badge awarded immediately
- [ ] Donor appears on leaderboard (if not opted-out)
- [ ] Donation tracked in database (not yet processed via payment processor)

**Story Points**: 5  
**Priority**: P2 (Nice-to-Have)

---

### Story 6: View Personal Progress and Badges
**As a** gamified user  
**I want to** see my level, points, badges, and streak on my profile  
**So that** I can track my progress and feel motivated to continue.

**Acceptance Criteria**:
- [ ] Profile displays avatar, username, level badge, and progress ring to next level
- [ ] Stats shown: total points, trees, cleanups, waste kg, streak
- [ ] Badge gallery displays all earned badges with unlock date
- [ ] Badges earned show notification instantly after action
- [ ] Level-up triggers confetti animation and congratulation message
- [ ] Streak displayed with fire emoji and current count
- [ ] Profile can be shared publicly with read-only view

**Story Points**: 5  
**Priority**: P1 (Important)

---

## 5. NON-FUNCTIONAL REQUIREMENTS

| Requirement | Target | Notes |
|-------------|--------|-------|
| **Availability** | 99.5% uptime | Supabase SLA + CDN redundancy |
| **Response Time** | <500 ms for API calls | Realtime updates <5 seconds |
| **Load Time** | <3 seconds FCP | Lazy loading, image compression |
| **Concurrent Users** | 10,000 CCU at launch | Supabase auto-scales |
| **Data Storage** | <100 GB in year 1 | 10,000 actions × 5 MB photos = 50 GB |
| **Backup Frequency** | Daily | Supabase automated backups |
| **Security** | HTTPS only, TLS 1.2+ | GitHub Pages, Supabase encryption |
| **GDPR Compliance** | Partial (audit pending) | Data Processing Agreement with Supabase |
| **CCPA Compliance** | Partial (audit pending) | Privacy policy & user deletion tools |
| **SEO** | Indexed by search engines | Server-side rendering not required; static site OK |
| **Mobile Support** | iOS Safari, Android Chrome | No native app yet (planned) |
| **Browser Support** | Chrome, Firefox, Safari, Edge (last 2 versions) | JavaScript ES6+ required |
| **Accessibility** | WCAG 2.1 Level AA | Keyboard nav, color contrast, screen readers |
| **Localization** | English (MVP), more languages later | All UI strings in code; ready for i18n |

---

## 6. PRODUCT ROADMAP

### Phase 1: MVP (June 2026) ✅
- [x] Core action logging (trees, cleanups)
- [x] User authentication (email/password, Google OAuth, guest)
- [x] Gamification (levels, badges, points, streaks)
- [x] World map + gallery
- [x] Leaderboards (solo, team, donor)
- [x] Teams (create, join, dashboard)
- [x] Daily quiz
- [x] Donations (simulated)
- [x] User profiles
- [x] Responsive design + light/dark theme

### Phase 2: Monetization & Growth (Q3 2026)
- [ ] Payment processor integration (Stripe, Razorpay)
- [ ] Real donation checkout
- [ ] Email notifications (new followers, team updates, achievements)
- [ ] Advanced moderation (image verification, fraud detection)
- [ ] Social features (followers, messaging, team chat)
- [ ] Analytics dashboard (impact metrics, user cohorts)
- [ ] Custom team codes & invite links

### Phase 3: Mobile App (Q4 2026)
- [ ] React Native / Expo app (iOS + Android)
- [ ] Native camera integration (faster photo upload)
- [ ] Offline support (actions sync when online)
- [ ] Push notifications
- [ ] Biometric login (fingerprint, face)
- [ ] Improved location services

### Phase 4: Scale & Monetization (2027)
- [ ] B2B features (corporate teams, reporting API)
- [ ] Premium tier (advanced analytics, white-label)
- [ ] API marketplace (integration with other sustainability apps)
- [ ] Expansion to different markets (localization, local partnerships)
- [ ] Series A fundraising (optional)

---

## 7. OUT OF SCOPE (MVP)

- ❌ Payment processing (donations are simulated)
- ❌ Automated image moderation (manual or AI flagging)
- ❌ Direct messaging / chat
- ❌ Push notifications
- ❌ Native mobile apps (iOS/Android)
- ❌ Video uploads
- ❌ Advanced analytics dashboard
- ❌ API for third-party integrations
- ❌ Offline support
- ❌ Multi-language support (English only)
- ❌ Carbon credit marketplace

---

## 8. RELEASE MANAGEMENT PROCESS

### Version Numbering
- **Major.Minor.Patch** (e.g., 1.2.3)
- Major: Significant feature add or architectural change
- Minor: New features or improvements
- Patch: Bug fixes

### Release Cadence
- **Hotfixes**: As needed (critical bugs, security)
- **Feature releases**: Every 2 weeks (first 3 months), then monthly
- **Major releases**: Quarterly or as needed

### Release Checklist
- [ ] Code review (2 approvals minimum)
- [ ] All tests passing (unit, integration, e2e)
- [ ] Security audit (for sensitive changes)
- [ ] Performance testing (load test for database/API changes)
- [ ] Staging deployment
- [ ] User acceptance testing (with beta testers)
- [ ] Privacy/compliance review (if data handling changed)
- [ ] Release notes prepared
- [ ] Deployment to production
- [ ] Monitoring active (error logs, performance metrics)

### Rollback Plan
- Keep previous 5 versions on GitHub releases
- If critical issue after deploy, revert to previous commit via git revert
- Notify users of any data loss or degraded features

---

**End of Product Requirements Document**

*This document should be reviewed quarterly or when significant product decisions change. Maintain user feedback loop and adjust roadmap based on usage metrics and user requests.*
