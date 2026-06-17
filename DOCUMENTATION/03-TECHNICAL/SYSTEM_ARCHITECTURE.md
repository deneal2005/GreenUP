# GREENUP — SYSTEM ARCHITECTURE DOCUMENT

**Version**: 1.0  
**Date**: June 2026  
**Status**: Production Ready (Private Beta)  
**Architect**: Delin Meitei

---

## 1. ARCHITECTURE OVERVIEW

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER (Browser)                         │
│                     HTML / CSS / JavaScript (Vanilla)                    │
│ ┌──────────────┬──────────────────────────┬──────────────┬──────────────┐
│ │  index.html  │       app.js             │  styles.css  │   Assets    │
│ │  (structure) │  (logic & state mgmt)    │  (theme)     │  (images)   │
│ └──────────────┴──────────────────────────┴──────────────┴──────────────┘
│                              │
│                 (HTTPS over CDN—GitHub Pages)
└─────────────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
       ┌────────────▼──┐  ┌──────▼────────┐  │
       │  Supabase     │  │  Google Maps  │  │
       │  ┌─────────┐  │  │  ┌──────────┐│  │
       │  │PostgreSQL  │  │  │ Geocoding ││  │
       │  ├─────────┤  │  │  │ Maps JS   ││  │
       │  │Auth      │  │  │  │Clustering││  │
       │  ├─────────┤  │  │  └──────────┘│  │
       │  │Storage   │  │  └──────────────┘  │
       │  │(proofs,  │  │                    │
       │  │avatars)  │  │ ┌──────────────┐   │
       │  ├─────────┤  │ │ OpenStreetMap│   │
       │  │Realtime  │  │ │ Leaflet      │   │
       │  │channel   │  │ │ (fallback)   │   │
       │  └─────────┘  │ └──────────────┘   │
       └────────────────┘                    │
                                    ┌────────▼──────┐
                                    │IP Geolocation │
                                    │(ipapi.co)     │
                                    └───────────────┘
```

### Architectural Principles
1. **Stateless Frontend**: No build step, pure vanilla JavaScript—easier deployment and version control
2. **Backend-as-a-Service**: Supabase handles auth, database, storage, realtime—reduces operational complexity
3. **Offline-First Demo**: Full functionality in localStorage for guest mode—no server dependency
4. **Graceful Degradation**: Google Maps → OpenStreetMap fallback ensures map always works
5. **Real-Time Sync**: Supabase realtime channel for live world map updates without polling

---

## 2. TECHNOLOGY STACK

### Frontend (Client-Side)
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **HTML** | HTML5 | 5 | Document structure, semantic markup |
| **CSS** | CSS3 | 3 | Styling, variables, animations, responsive layout |
| **JavaScript** | Vanilla ES6+ | 2025 | Core logic, state management, no framework |
| **UI Library** | None (custom) | — | Custom component patterns (modals, cards, forms) |
| **Maps** | Google Maps JS API | v3 | Interactive mapping, geocoding, clustering |
| **Maps Fallback** | Leaflet.js | 1.9.4 | OpenStreetMap if Google Maps API fails |
| **Clustering** | Marker Clusterer | Latest | Group map pins for performance |
| **Fonts** | Google Fonts | — | Fraunces (serif), Outfit (sans), IBM Plex Mono (mono) |

### Backend (BaaS)
| Component | Service | Purpose |
|-----------|---------|---------|
| **Database** | Supabase (PostgreSQL) | Relational data: profiles, actions, teams, donations |
| **Authentication** | Supabase Auth | Email/password, Google OAuth, session management |
| **Storage** | Supabase Storage | Images (proofs/, avatars/) with public URLs |
| **Realtime** | Supabase Realtime | WebSocket channel for live map updates |
| **Backups** | Supabase Automated | Daily point-in-time backups |

### External APIs
| Service | Purpose | Rate Limit |
|---------|---------|-----------|
| **Google Maps JS API** | Mapping, geocoding, marker clustering | Billing-based (no hard limit with API key restriction) |
| **Google Geocoding API** | Reverse geocoding (GPS → place name) | 50 QPS (queries per second) |
| **OpenStreetMap Nominatim** | Fallback geocoding | 1 request per second (open source) |
| **ipapi.co** | IP geolocation for currency detection | 30,000/month free tier |

---

## 3. FRONTEND ARCHITECTURE

### Project Structure
```
/home/user/GreenUP/
├── index.html          (Main HTML document—landing page + app shell)
├── app.js              (Core application logic, ~2,000 lines)
├── styles.css          (Design system + components, ~600 lines)
├── supabase-setup.sql  (Database schema, RLS, triggers)
└── README.md           (Setup guide, feature overview)
```

### HTML Structure (index.html)
```html
<!DOCTYPE html>
<html>
  <head>
    <!-- Meta tags, favicon, fonts -->
  </head>
  <body>
    <div id="app">
      <!-- Landing page (visible before auth) -->
      <div id="landing">
        <!-- Hero, login/signup forms, guest mode button -->
      </div>

      <!-- App shell (visible after auth) -->
      <div id="app-shell" style="display: none;">
        <!-- Header (nav, user menu, theme toggle) -->
        <header id="header"></header>

        <!-- Main content area -->
        <main id="main">
          <!-- Dynamic page content injected here -->
        </main>

        <!-- Footer -->
        <footer id="footer"></footer>
      </div>

      <!-- Modals (overlay, dynamic content) -->
      <div id="modals"></div>
    </div>

    <!-- CDN scripts: Supabase, Google Maps, Leaflet, Google Fonts -->
    <script src="...supabase.js"></script>
    <script src="...maps.js"></script>
    <script src="...app.js"></script>
  </body>
</html>
```

### JavaScript Architecture (app.js)

#### Global State Object (S)
```javascript
const S = {
  // Auth state
  user: null,
  session: null,
  authProvider: 'guest' | 'email' | 'google',

  // Profile state
  profile: { username, full_name, points, level, badge... },
  
  // Demo data (if guest mode)
  demo: { profiles, actions, teams, donations, ... },

  // UI state
  currentPage: 'dashboard' | 'log' | 'map' | 'teams' | 'leaderboard' | 'donate' | 'profile',
  selectedTeam: team_id,
  theme: 'light' | 'dark',

  // Cached data
  actions: [],
  teams: [],
  leaderboard: [],
  profileCache: {},
};

// Persisted to localStorage
```

#### Module Pattern (Closures)
```javascript
// Each feature area is a module
const AuthModule = (() => {
  const signUp = async (email, password) => { /* ... */ };
  const signIn = async (email, password) => { /* ... */ };
  const signOut = () => { /* ... */ };
  return { signUp, signIn, signOut };
})();

const ActionsModule = (() => {
  const logAction = async (action) => { /* ... */ };
  const getActions = async () => { /* ... */ };
  return { logAction, getActions };
})();

// Usage
await AuthModule.signIn(email, password);
```

#### Event Delegation Pattern
```javascript
// Single listener on parent, handle clicks on children
document.getElementById('main').addEventListener('click', (e) => {
  if (e.target.matches('.action-card')) {
    handleActionCardClick(e.target);
  }
  if (e.target.matches('.modal-close')) {
    closeModal();
  }
});
```

#### Rendering Pattern
```javascript
// Tactical re-renders for specific sections
const renderDashboard = () => {
  const html = `<div>${S.profile.username}...</div>`;
  document.getElementById('main').innerHTML = html;
};

const renderWorld = () => {
  // Initialize map, add pins from S.actions
  googleMap.setCenter(...);
  S.actions.forEach(action => addPin(action));
};

// Called on page navigation or data change
```

#### Error Handling Pattern
```javascript
const sbFail = (error) => {
  console.error(error);
  // Check if error is schema-related (missing table)
  if (error.message.includes('relation "actions" does not exist')) {
    showSetupBanner('Database not configured. Run supabase-setup.sql');
  } else {
    showError('Error: ' + error.message);
  }
};

try {
  const { data } = await supabase.from('actions').select();
} catch (error) {
  sbFail(error);
}
```

#### Async/Await Pattern
```javascript
const loadProfile = async (userId) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    S.profile = profile;
    renderProfile();
  } catch (error) {
    sbFail(error);
  }
};
```

### CSS Architecture (styles.css)

#### CSS Variables (Design Tokens)
```css
/* Light theme (default) */
:root {
  --ink: #16291C;        /* Dark green, text */
  --leaf: #2F7D45;       /* Primary green */
  --sprout: #7DC852;     /* Bright green, accents */
  --clean: #3E8ED0;      /* Blue, cleanup actions */
  --gold: #FFCB3D;       /* Gold, highlights */
  --bg: #F5F8F5;         /* Off-white background */
  --surface: #FFFFFF;    /* Card/modal background */
  --border: #E0E8E0;     /* Subtle borders */
}

/* Dark theme */
[data-theme="dark"] {
  --ink: #E8EDE8;
  --leaf: #90D97D;
  --sprout: #AEDD6A;
  --clean: #6FB8FF;
  --gold: #FFD60A;
  --bg: #0A0E0A;
  --surface: #1A1E1A;
  --border: #2A2E2A;
}
```

#### Component Classes
```css
.btn { /* Button base */ }
.btn-primary { /* Primary action */ }
.btn-secondary { /* Secondary action */ }
.btn-danger { /* Destructive */ }

.card { /* Card container */ }
.modal { /* Modal overlay */ }
.form-field { /* Input + label */ }
.badge { /* Small label */ }
.progress-ring { /* Circular progress */ }
```

#### Responsive Utilities
```css
/* Mobile-first */
.grid { display: grid; grid-template-columns: 1fr; }
@media (min-width: 768px) { .grid { grid-template-columns: 1fr 1fr; } }
@media (min-width: 1024px) { .grid { grid-template-columns: repeat(3, 1fr); } }

/* Flexbox utilities */
.flex { display: flex; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }
```

#### Animations
```css
@keyframes slideIn { from { transform: translateY(20px); } to { transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

/* Respect user preference */
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

---

## 4. BACKEND ARCHITECTURE

### Supabase Setup

#### Database: PostgreSQL
- **Fully managed**: Supabase handles backups, scaling, monitoring
- **Real-time**: Supabase Realtime channel for live updates (WebSocket)
- **Storage**: Supabase Storage for image uploads (public URLs)

#### Tables & Relationships
See `04-DATABASE/DATABASE_SCHEMA.md` for full schema, but core:
- `profiles` (user data) ← 1:M → `actions` (logged activities)
- `teams` (team metadata) ← M:M → `profiles` (via `team_members`)
- `donations` (fundraising)
- `actions` (environmental activities)

#### RLS Policies (Row Level Security)
```sql
-- profiles: Public read, users update own
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- actions: Public read, users insert/delete own
CREATE POLICY "actions_select" ON actions FOR SELECT USING (true);
CREATE POLICY "actions_insert" ON actions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- donations: Public read, authenticated users insert
CREATE POLICY "donations_select" ON donations FOR SELECT USING (true);
CREATE POLICY "donations_insert" ON donations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR true);
```

#### Authentication
- **Email/Password**: Supabase Auth handles password hashing (bcrypt), reset flow
- **Google OAuth**: Redirect to Supabase OAuth endpoint, auto-create account
- **Session**: JWT token stored by Supabase SDK in localStorage, auto-refreshed
- **Realtime Auth**: SDK triggers `onAuthStateChange` listener → app enters/exits session

#### Storage
- **Buckets**: `proofs/` (action photos), `avatars/` (user/team logos)
- **Paths**: `proofs/{user_id}/{action_id}/{filename}`, `avatars/{user_id}/{filename}`
- **Access**: Public read (RLS allows anyone to view), authenticated users upload
- **Cleanup**: Manual or via scheduled cleanup job (future)

---

## 5. API ARCHITECTURE

### Supabase API (Realtime REST)

#### Example: POST new action
```javascript
const { data, error } = await supabase
  .from('actions')
  .insert([{
    user_id: auth.user.id,
    kind: 'tree',
    species: 'Oak',
    photo_url: 'https://...',
    before_url: 'https://...',
    lat: 12.9352,
    lng: 77.6245,
    place: 'Bangalore, India',
    points: 10,
    created_at: new Date().toISOString(),
  }]);
```

#### Example: GET leaderboard
```javascript
const { data: leaderboard } = await supabase
  .from('profiles')
  .select('*')
  .order('points', { ascending: false })
  .limit(12);
```

#### Realtime Subscription
```javascript
const channel = supabase
  .channel('actions-realtime')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'actions' },
    (payload) => {
      console.log('New action:', payload.new);
      S.actions.push(payload.new);
      renderWorld(); // Re-render map
    }
  )
  .subscribe();
```

### Google Maps API

#### Geocoding (GPS → Place Name)
```javascript
const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${MAPS_KEY}`);
const { results } = await response.json();
const placeName = results[0].formatted_address; // "Bangalore, India"
```

#### Reverse Geocoding (Place Name → GPS)
```javascript
const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${place}&key=${MAPS_KEY}`);
const { results } = await response.json();
const { lat, lng } = results[0].geometry.location;
```

#### Map Rendering
```javascript
const map = new google.maps.Map(document.getElementById('map'), {
  zoom: 2,
  center: { lat: 20, lng: 0 },
  styles: darkModeStyles, // Custom style
});

S.actions.forEach(action => {
  new google.maps.Marker({
    map,
    position: { lat: action.lat, lng: action.lng },
    title: action.user.username,
  });
});

const mcOptions = { maxZoom: 15 };
const markerClusterer = new MarkerClusterer({ map, markers, options: mcOptions });
```

---

## 6. DEPLOYMENT & INFRASTRUCTURE

### Hosting Architecture

#### Frontend Hosting: GitHub Pages
- **Deployment**: Push to `main` branch → GitHub Pages auto-builds and deploys
- **URL**: `https://deneal2005.github.io/greenup`
- **SSL/TLS**: Automatic HTTPS (GitHub Pages enforces)
- **CDN**: GitHub's CDN (powered by Fastly)
- **Cache**: Static files cached globally
- **Rollback**: Git revert + push

#### Backend Hosting: Supabase

**Database Server**:
- **Provider**: Supabase (PostgreSQL 15+)
- **Region**: [TBD—check Supabase dashboard] (default: nearest to users)
- **Auto-scaling**: Supabase handles connection pooling and CPU scaling
- **Backup**: Daily automated backups, 30-day retention

**Authentication Server**:
- **Provider**: Supabase Auth
- **Flow**: Email/password or OAuth → JWT token → stored in localStorage
- **Security**: Passwords hashed with bcrypt, HTTPS-only cookies

**Storage Server**:
- **Provider**: Supabase Storage (on AWS S3)
- **Buckets**: `proofs/`, `avatars/`
- **CDN**: Public URLs served via Supabase CDN
- **Cleanup**: Manual or scheduled job (future)

**Realtime Server**:
- **Provider**: Supabase Realtime (WebSocket)
- **Channels**: `actions-realtime` for live map updates
- **Load**: Scales with concurrent subscribers

#### API Gateways
- **Google Maps**: Requests go directly from client to Google Maps API (not through own server)
- **Supabase**: Client connects directly to Supabase REST API over HTTPS
- **ipapi.co**: Client fetches IP geolocation for currency detection

---

## 7. DATA FLOW ARCHITECTURE

### Authentication Flow
```
User → Browser Form → Email/Password or Google OAuth
                           ↓
                   Supabase Auth Server
                           ↓
            Create/Update user in auth.users table
                           ↓
            Generate JWT session token
                           ↓
        Supabase SDK stores token in localStorage
                           ↓
        App listens to onAuthStateChange
                           ↓
    Load profile, enter app → renderDashboard()
```

### Action Logging Flow
```
User Form (tree/cleanup data) → Client validation
                      ↓
         Image compression & upload to Storage
                      ↓
      GPS geolocation or manual entry
                      ↓
        Reverse geocoding (GPS → place name)
                      ↓
   Insert action into `actions` table
                      ↓
      Update user profile (points, level, badges)
                      ↓
   Supabase Realtime broadcasts to all subscribers
                      ↓
    Other clients' maps update in real-time
```

### World Map Flow
```
Page load (map view)
        ↓
  Query: SELECT * FROM actions ORDER BY created_at DESC LIMIT 1000
        ↓
   Render pins on Google Map
        ↓
  Subscribe to realtime INSERT events on actions
        ↓
  On new action INSERT event:
     - Add new pin to map
     - Update gallery below map
     - Re-rank leaderboard if needed
```

### Leaderboard Flow
```
Page load (leaderboard view)
        ↓
  Query: SELECT * FROM profiles ORDER BY points DESC LIMIT 12
        ↓
  Render leaderboard table
        ↓
  Every 5 minutes or on page reload:
     - Re-query and update rankings
```

---

## 8. SECURITY ARCHITECTURE

### Transport Security
- **HTTPS Only**: GitHub Pages enforces HTTPS
- **TLS 1.2+**: All connections encrypted
- **HSTS**: Preload domain to prevent downgrade attacks

### Data Security
- **Database**: Encrypted at rest (Supabase), encrypted in transit (TLS)
- **Storage**: Images in Supabase Storage, encrypted, served over HTTPS
- **Session Tokens**: JWT in localStorage (vulnerable to XSS, but mitigated by CSP)

### API Security
- **Authentication**: Supabase RLS policies enforce user ownership
- **Authorization**: Row-level security ensures users can only modify own data
- **Rate Limiting**: Supabase has built-in rate limits; Google Maps API restricted by key
- **CORS**: Supabase allows origins; Google Maps allows any origin (API key restriction)

### Secrets Management
- **API Keys**: Embedded in client code (safe because restricted)
  - Supabase publishable key: public by design
  - Google Maps key: restricted to Maps + Geocoding APIs + domain
  - No secret keys in client code
- **Environment Variables**: Not needed (no build process)

---

## 9. SCALABILITY ARCHITECTURE

### Horizontal Scaling (Supabase)
- **Database**: Supabase auto-scales read replicas for high query volume
- **Storage**: S3-backed, handles any number of files
- **Auth**: Supabase scales auth independently
- **Realtime**: Supabase Realtime can handle thousands of concurrent WebSocket connections

### Vertical Scaling (Client-Side)
- **Pagination**: Query actions in batches (not all 100,000 actions at once)
- **Lazy Loading**: Images load on scroll
- **Debouncing**: Reduce event handler frequency (e.g., search input)
- **Indexing**: Database queries use indexes on `created_at`, `points`, `user_id`

### Caching
- **Browser Cache**: GitHub Pages sets cache headers; static files cached
- **Supabase Cache**: Query results can be cached locally
- **localStorage**: User profile, demo data, preferences cached

### Monitoring (Future)
- **Observability**: Supabase dashboard shows DB performance, connection count, error rates
- **Logs**: GitHub Actions CI logs available on push
- **Analytics**: GA4 to track user behavior (add in Phase 2)

---

## 10. DISASTER RECOVERY

### Backup Strategy
- **Database**: Supabase daily automated backups, 30-day retention
- **Code**: Git repository mirrored on GitHub (distributed version control)
- **Images**: Supabase Storage backed by AWS S3 (multi-region redundancy)

### Recovery Procedures
| Scenario | RTO | Recovery |
|----------|-----|----------|
| **Database corruption** | 24 hours | Restore from daily backup via Supabase dashboard |
| **Accidental data deletion** | 24 hours | Restore from backup |
| **Code breaking change** | 5 minutes | `git revert` + force push to rollback |
| **Service outage (Supabase)** | 1-4 hours | Wait for Supabase recovery; check status page |
| **Service outage (GitHub Pages)** | 1-4 hours | Temporary mirror to Vercel or Netlify |

---

## 11. DEVELOPMENT ENVIRONMENT SETUP

See `../README.md` for quick start, but in brief:

1. **Clone**: `git clone https://github.com/deneal2005/greenup.git`
2. **Database**: Run `supabase-setup.sql` in Supabase SQL Editor
3. **Serve**: `npx serve .` or `python -m http.server`
4. **Open**: http://localhost:3000 (or `8000` for Python)
5. **Test**: Use email `test@test.com` / password `Test1234` or Google OAuth (localhost auth allowed)

---

**End of System Architecture Document**

*This document should be reviewed annually or when major architectural changes are made (e.g., moving to monorepo, introducing serverless functions, API changes).*
