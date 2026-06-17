# GREENUP — DATABASE SCHEMA DOCUMENTATION

**Version**: 1.0  
**Date**: June 2026  
**Database**: PostgreSQL (Supabase)  
**Status**: Production Ready

---

## 1. SCHEMA OVERVIEW

### Entity-Relationship Diagram (ERD)

```
┌────────────────┐
│   profiles     │
├────────────────┤
│ id (PK, UUID)  │◄───┐
│ username (U)   │    │
│ full_name      │    │
│ college        │    │  1:M
│ country        │    │
│ bio            │    │
│ avatar_url     │    │
│ points         │    │
│ trees          │    │
│ cleanups       │    │
│ waste_kg       │    │
│ streak         │    │
│ last_action_on │    │
│ quiz_wins      │    │
│ created_at     │    │
└────────────────┘    │
                      │
                  ┌───┴──────────┐
                  │              │
          ┌───────▼────────┐  ┌──▼──────────────┐
          │    actions     │  │  team_members   │
          ├────────────────┤  ├─────────────────┤
          │ id (PK, BIGINT)│  │ team_id (FK,PK) │
          │ user_id (FK)   │  │ user_id (FK,PK) │
          │ kind (enum)    │  │ role (enum)     │
          │ title          │  │ joined_at       │
          │ species        │  └─────────────────┘
          │ photo_url      │       ▲
          │ before_url     │       │
          │ after_url      │       │ M:M
          │ weight_kg      │       │
          │ points         │       │
          │ lat            │    ┌──┴──────────┐
          │ lng            │    │    teams    │
          │ place          │    ├─────────────┤
          │ team_id (FK)   ├───►│ id (PK)     │
          │ created_at     │    │ name (U)    │
          └────────────────┘    │ org         │
                                │ description │
                                │ logo_url    │
                                │ created_by  │
                                │ created_at  │
                                └─────────────┘

          ┌─────────────────┐
          │   donations     │
          ├─────────────────┤
          │ id (PK, BIGINT) │
          │ user_id (FK)    │
          │ donor_name      │
          │ amount          │
          │ currency        │
          │ created_at      │
          └─────────────────┘
```

---

## 2. TABLES

### Table: `profiles`

**Purpose**: User profile data, points, gamification stats

**Columns**:

| Column Name | Type | Constraints | Notes |
|------------|------|-------------|-------|
| `id` | `uuid` | PK, NOT NULL | Supabase auth.users.id |
| `username` | `varchar(24)` | UNIQUE, NOT NULL | 3–24 alphanumeric + underscore; auto-generated from email if not provided |
| `full_name` | `varchar(255)` | | User's real name |
| `college` | `varchar(255)` | | University, school, or organization |
| `country` | `varchar(2)` | | ISO 2-letter country code (e.g., 'IN', 'US', 'GB') |
| `bio` | `text` | | Short bio, max 200 chars |
| `avatar_url` | `text` | | Public URL to avatar image in Supabase Storage |
| `points` | `integer` | DEFAULT 0 | Total points earned |
| `trees` | `integer` | DEFAULT 0 | Count of trees planted |
| `cleanups` | `integer` | DEFAULT 0 | Count of cleanups logged |
| `waste_kg` | `numeric(10, 2)` | DEFAULT 0 | Total kg of waste collected |
| `streak` | `integer` | DEFAULT 0 | Current consecutive-day action streak |
| `last_action_on` | `date` | | Date of most recent action (tracks streak) |
| `quiz_wins` | `integer` | DEFAULT 0 | Count of correct daily quiz answers |
| `created_at` | `timestamp` | DEFAULT now() | Account creation date |

**Indexes**:
```sql
CREATE INDEX idx_profiles_points ON profiles(points DESC);
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_created_at ON profiles(created_at DESC);
```

**RLS Policies**:
```sql
-- Anyone can view profiles
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "profiles_update" ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Users can delete their own profile (right to be forgotten)
CREATE POLICY "profiles_delete" ON profiles FOR DELETE 
  USING (auth.uid() = id);
```

**Triggers**:
```sql
-- On signup, create profile with username derived from email
CREATE TRIGGER handle_new_user AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

FUNCTION handle_new_user():
  - Extract email prefix as base username
  - Check uniqueness; append random suffix if exists
  - Insert into profiles table with username
```

---

### Table: `actions`

**Purpose**: Logged environmental actions (trees, cleanups)

**Columns**:

| Column Name | Type | Constraints | Notes |
|------------|------|-------------|-------|
| `id` | `bigint` | PK, AUTO_INCREMENT | Unique action ID |
| `user_id` | `uuid` | FK → profiles.id, NOT NULL | User who logged action |
| `kind` | `enum('tree', 'cleanup')` | NOT NULL | Action type |
| `title` | `varchar(255)` | | Short title (e.g., "Oak at park") |
| `species` | `varchar(255)` | | Tree species (e.g., "Oak") or waste category |
| `note` | `text` | | Optional notes or description |
| `waste_types` | `text` | | For cleanup: comma-separated types (plastic, metal, paper, organic, other) |
| `weight_kg` | `numeric(10, 2)` | | For cleanup: estimated weight in kg |
| `points` | `integer` | NOT NULL | Points awarded for action |
| `lat` | `numeric(9, 6)` | | GPS latitude |
| `lng` | `numeric(9, 6)` | | GPS longitude |
| `place` | `varchar(255)` | | Reverse-geocoded place name (e.g., "Bangalore, India") |
| `photo_url` | `text` | NOT NULL | Public URL to action photo in Supabase Storage |
| `before_url` | `text` | | For cleanup: before photo |
| `after_url` | `text` | | For cleanup: after photo |
| `team_id` | `bigint` | FK → teams.id (nullable) | Optional team credit |
| `created_at` | `timestamp` | DEFAULT now() | Timestamp of action |

**Indexes**:
```sql
CREATE INDEX idx_actions_created_at ON actions(created_at DESC);
CREATE INDEX idx_actions_user_id ON actions(user_id);
CREATE INDEX idx_actions_team_id ON actions(team_id);
CREATE INDEX idx_actions_kind ON actions(kind);
```

**Realtime**:
```sql
ALTER TABLE actions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE actions;
```

**RLS Policies**:
```sql
-- Anyone can view actions (for world map, gallery)
CREATE POLICY "actions_select" ON actions FOR SELECT USING (true);

-- Users can insert only own actions
CREATE POLICY "actions_insert" ON actions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own actions
CREATE POLICY "actions_update" ON actions FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can delete their own actions
CREATE POLICY "actions_delete" ON actions FOR DELETE 
  USING (auth.uid() = user_id);
```

---

### Table: `teams`

**Purpose**: Team metadata and ownership

**Columns**:

| Column Name | Type | Constraints | Notes |
|------------|------|-------------|-------|
| `id` | `bigint` | PK, AUTO_INCREMENT | Unique team ID |
| `name` | `varchar(40)` | UNIQUE, NOT NULL | Team name (3–40 chars) |
| `org` | `varchar(255)` | | Organization name (e.g., "NIT Manipur") |
| `description` | `text` | | Team description (max 500 chars) |
| `logo_url` | `text` | | Public URL to team logo in Supabase Storage |
| `created_by` | `uuid` | FK → profiles.id, NOT NULL | Team creator (becomes owner) |
| `created_at` | `timestamp` | DEFAULT now() | Team creation date |

**Indexes**:
```sql
CREATE INDEX idx_teams_name ON teams(name);
CREATE INDEX idx_teams_created_by ON teams(created_by);
```

**RLS Policies**:
```sql
-- Anyone can view team metadata
CREATE POLICY "teams_select" ON teams FOR SELECT USING (true);

-- Authenticated users can create teams
CREATE POLICY "teams_insert" ON teams FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Team creator (owner) can update team
CREATE POLICY "teams_update" ON teams FOR UPDATE 
  USING (auth.uid() = created_by);

-- Team creator can delete team
CREATE POLICY "teams_delete" ON teams FOR DELETE 
  USING (auth.uid() = created_by);
```

---

### Table: `team_members`

**Purpose**: Membership and roles (join table for teams & profiles)

**Columns**:

| Column Name | Type | Constraints | Notes |
|------------|------|-------------|-------|
| `team_id` | `bigint` | FK → teams.id, PK | Team ID |
| `user_id` | `uuid` | FK → profiles.id, PK | User ID |
| `role` | `enum('owner', 'member')` | DEFAULT 'member' | User's role in team |
| `joined_at` | `timestamp` | DEFAULT now() | Join date |

**Indexes**:
```sql
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
```

**RLS Policies**:
```sql
-- Anyone can view team membership
CREATE POLICY "team_members_select" ON team_members FOR SELECT USING (true);

-- Authenticated users can join teams (insert themselves)
CREATE POLICY "team_members_insert" ON team_members FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can leave teams (delete themselves)
CREATE POLICY "team_members_delete" ON team_members FOR DELETE 
  USING (auth.uid() = user_id);
```

---

### Table: `donations`

**Purpose**: Track donations for fundraising and donor recognition

**Columns**:

| Column Name | Type | Constraints | Notes |
|------------|------|-------------|-------|
| `id` | `bigint` | PK, AUTO_INCREMENT | Unique donation ID |
| `user_id` | `uuid` | FK → profiles.id (nullable) | Donor's user ID (NULL if anonymous) |
| `donor_name` | `varchar(255)` | | Donor's name or "Anonymous" |
| `amount` | `numeric(12, 2)` | NOT NULL | Donation amount |
| `currency` | `char(3)` | NOT NULL | ISO 4217 currency code (e.g., 'USD', 'INR') |
| `created_at` | `timestamp` | DEFAULT now() | Donation timestamp |

**Indexes**:
```sql
CREATE INDEX idx_donations_created_at ON donations(created_at DESC);
CREATE INDEX idx_donations_user_id ON donations(user_id);
```

**RLS Policies**:
```sql
-- Anyone can view donations (leaderboard)
CREATE POLICY "donations_select" ON donations FOR SELECT USING (true);

-- Authenticated users and anonymous can insert donations
CREATE POLICY "donations_insert" ON donations FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL OR true);
```

---

## 3. STORAGE BUCKETS

### Bucket: `proofs`

**Purpose**: Before/after photos for actions

**Path Structure**:
```
proofs/
  ├── {user_id}/
  │   ├── {action_id}/
  │   │   ├── photo.jpg (main action photo)
  │   │   ├── before.jpg (cleanup before)
  │   │   └── after.jpg (cleanup after)
```

**Access Control**:
- **Public Read**: Anyone can view images (CDN)
- **Authenticated Write**: Users can upload to own folder only

**RLS Policy**:
```sql
CREATE POLICY "proofs_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'proofs');

CREATE POLICY "proofs_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'proofs' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

### Bucket: `avatars`

**Purpose**: User and team profile pictures

**Path Structure**:
```
avatars/
  ├── {user_id}/
  │   └── avatar.jpg
  ├── teams/
  │   └── {team_id}/
  │       └── logo.jpg
```

**Access Control**:
- **Public Read**: Anyone can view avatars
- **Authenticated Write**: Users can upload own avatar

**RLS Policy**:
```sql
CREATE POLICY "avatars_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## 4. DATA TYPES & CONSTRAINTS

### Custom Enums
```sql
CREATE TYPE action_kind AS ENUM ('tree', 'cleanup');
CREATE TYPE team_role AS ENUM ('owner', 'member');
```

### Numeric Constraints
- **Latitude**: -90.000000 to 90.000000 (6 decimal places = ~0.11 m precision)
- **Longitude**: -180.000000 to 180.000000 (6 decimal places = ~0.11 m precision)
- **Weight**: 0.1 to 1000 kg (2 decimal places)
- **Amount**: 0.01 to 999,999.99 (2 decimal places, supports micro-transactions)
- **Points**: 0 to 999,999 (integer)

### String Constraints
- **Username**: 3–24 alphanumeric + underscore, unique, case-insensitive (collate ci)
- **Team Name**: 3–40 characters, unique
- **Email**: RFC 5322 compliant, enforced by Supabase Auth

---

## 5. DATA RELATIONSHIPS

### 1-to-Many (Profiles → Actions)
```
One user can have many actions
Example: Arjun (user_id: abc123) has:
  - Action 1: Plant oak tree
  - Action 2: Cleanup plastic
  - Action 3: Plant mango tree
```

**Query**:
```sql
SELECT a.* FROM actions a
WHERE a.user_id = 'abc123'
ORDER BY a.created_at DESC;
```

### 1-to-Many (Teams → Team Members)
```
One team can have many members
Example: "NIT Manipur Environmental Club" (team_id: 5) has:
  - Arjun (owner)
  - Zara (member)
  - Marcus (member)
```

**Query**:
```sql
SELECT p.username, tm.role FROM team_members tm
JOIN profiles p ON tm.user_id = p.id
WHERE tm.team_id = 5
ORDER BY tm.joined_at;
```

### Many-to-Many (Profiles ↔ Teams)
```
One user can be in many teams
One team can have many users
Example: Zara is in:
  - "NIT Manipur Environmental Club"
  - "African Youth Climate Action"
```

**Query**:
```sql
SELECT t.name FROM teams t
JOIN team_members tm ON t.id = tm.team_id
WHERE tm.user_id = 'zara_id'
ORDER BY tm.joined_at DESC;
```

### 1-to-Many (Profiles → Donations)
```
One user can make multiple donations
One user can receive multiple donations (future)
```

---

## 6. CALCULATED FIELDS & VIEWS

### User Stats (Materialized from Actions)

These fields on `profiles` are **updated** (not calculated in real-time):

```sql
-- After each action, trigger updates:
UPDATE profiles SET
  points = (SELECT SUM(points) FROM actions WHERE user_id = $1),
  trees = (SELECT COUNT(*) FROM actions WHERE user_id = $1 AND kind = 'tree'),
  cleanups = (SELECT COUNT(*) FROM actions WHERE user_id = $1 AND kind = 'cleanup'),
  waste_kg = (SELECT COALESCE(SUM(weight_kg), 0) FROM actions WHERE user_id = $1 AND kind = 'cleanup'),
  last_action_on = (SELECT MAX(created_at)::date FROM actions WHERE user_id = $1)
WHERE id = $1;
```

### Team Stats (Computed on-demand)

```sql
SELECT 
  t.id, t.name,
  COUNT(DISTINCT tm.user_id) AS member_count,
  COALESCE(SUM(p.points), 0) AS total_points,
  COALESCE(SUM(p.trees), 0) AS total_trees,
  COALESCE(SUM(p.cleanups), 0) AS total_cleanups,
  COALESCE(SUM(p.waste_kg), 0) AS total_waste_kg
FROM teams t
LEFT JOIN team_members tm ON t.id = tm.team_id
LEFT JOIN profiles p ON tm.user_id = p.id
GROUP BY t.id, t.name
ORDER BY total_points DESC;
```

---

## 7. DATA RETENTION POLICIES

| Table | Retention | Policy | Notes |
|-------|-----------|--------|-------|
| **profiles** | Indefinite | Keep until user deletion (GDPR right to be forgotten) | Can be anonymized |
| **actions** | Indefinite | Keep as historical record | Anonymize if profile deleted |
| **teams** | Indefinite | Keep as historical record | Allow archiving |
| **team_members** | Indefinite | Keep for audit trail | Allow soft-delete (status='left') |
| **donations** | Indefinite | Keep for tax/accounting | Anonymize donor details if requested |
| **proofs (images)** | 30 days unused | Delete images not referenced by actions | Manual cleanup job (future) |
| **avatars (images)** | Until profile deletion | Delete when user account deleted | Stored in Supabase Storage |

---

## 8. BACKUP & DISASTER RECOVERY

### Automated Backups (Supabase)
- **Frequency**: Daily at midnight UTC
- **Retention**: 30 days point-in-time recovery
- **Location**: Supabase's geo-redundant storage
- **Access**: Via Supabase Dashboard → Backups

### Manual Export (for compliance)
```sql
-- Export all data as CSV
\copy (SELECT * FROM profiles) TO 'profiles.csv' WITH (FORMAT csv, HEADER true);
\copy (SELECT * FROM actions) TO 'actions.csv' WITH (FORMAT csv, HEADER true);
-- Repeat for other tables
```

### Recovery Procedure
1. Identify time of corruption/issue
2. Go to Supabase Dashboard → Backups
3. Choose backup time closest to issue
4. Click "Restore from backup"
5. Verify data integrity
6. Monitor app for 24 hours

---

## 9. PERFORMANCE OPTIMIZATION

### Indexes Strategy
- **High-cardinality**: `points`, `created_at` (used in ORDER BY, WHERE clauses)
- **Foreign keys**: `user_id`, `team_id` (used in JOINs)
- **String search**: `username`, `team name` (used in search filters)

### Query Optimization Tips
```sql
-- BAD: Fetch all actions, then filter in app
SELECT * FROM actions; -- Returns 100,000 rows

-- GOOD: Filter in database
SELECT * FROM actions WHERE created_at > now() - interval '7 days' LIMIT 100;

-- BAD: N+1 queries (loop fetching user for each action)
FOR action IN (SELECT * FROM actions) {
  user = fetch_profile(action.user_id); -- 1000+ queries!
}

-- GOOD: Single JOIN query
SELECT a.*, p.username FROM actions a
JOIN profiles p ON a.user_id = p.id
ORDER BY a.created_at DESC LIMIT 100;
```

### Connection Pooling
- Supabase provides connection pooling (PgBouncer) by default
- Max connections: 100 (adjustable with plan)
- Client-side: Supabase SDK handles pool internally

---

## 10. SCHEMA MIGRATION PROCESS

### Adding a New Column
```sql
-- 1. Create migration file: migrations/20260617_add_column.sql
ALTER TABLE profiles ADD COLUMN social_media_url TEXT;

-- 2. Apply: Run in Supabase SQL Editor
-- 3. Update: Bump schema version in code
-- 4. Deploy: Commit and push to main (CI/CD)
```

### Version Control
```
SCHEMA_VERSION = "1.0" (in code)

On breaking schema changes:
- Increment major version
- Create migration file
- Test against migration
- Deploy migration before app release
```

---

**End of Database Schema Documentation**

*Update this document whenever tables, indexes, or policies change. Test all migrations in staging before production deployment.*
