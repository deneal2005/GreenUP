# GREENUP — SECURITY POLICIES & PROCEDURES

**Version**: 1.0  
**Date**: June 2026  
**Status**: Draft (Pre-Launch Review Required)  
**Security Officer**: [TBD—Founder responsibility until hire]

---

## 1. SECURITY OVERVIEW

### Security Goals
1. **Confidentiality**: Protect user data from unauthorized access
2. **Integrity**: Prevent unauthorized modification of data
3. **Availability**: Ensure app is operational (99.5% uptime target)
4. **Authenticity**: Verify users and actions are legitimate
5. **Compliance**: Meet GDPR, CCPA, and industry standards

### Threat Model
**Assets at Risk**:
- User profiles (PII: name, email, location, college)
- Action photos (EXIF data, location, appearance)
- Authentication tokens (session hijacking)
- Database credentials (in Supabase)
- API keys (Google Maps, ipapi.co)

**Threat Actors**:
- External attackers (data breach, account takeover)
- Malicious users (fake actions, harassment)
- Insiders (admin misuse, social engineering)
- Third-party vendors (Supabase breach, Google Maps misuse)

**Likelihood**: Medium (small target; low-value data)  
**Impact**: Medium (data exposure, reputation damage)

---

## 2. AUTHENTICATION & ACCESS CONTROL

### Authentication Methods

#### 2.1 Email / Password
- **Implementation**: Supabase Auth (bcrypt hashing)
- **Password Requirements**:
  - Minimum 8 characters
  - 1 uppercase letter
  - 1 lowercase letter
  - 1 number
  - Special characters optional
- **Session Duration**: 1 year (auto-refresh via Supabase SDK)
- **Multi-Factor Authentication (MFA)**: Not yet implemented; planned for Phase 2

#### 2.2 Google OAuth 2.0
- **Flow**: User → App → Google → JWT → Supabase
- **Scopes**: `email`, `profile` (minimal)
- **Account Linking**: Auto-links if email matches existing account
- **Token Refresh**: Automatic via Supabase SDK
- **Revocation**: User can disconnect from account settings (future)

#### 2.3 Guest / Demo Mode
- **Storage**: localStorage (client-side, no server)
- **Data**: Not synced across devices
- **Persistence**: Survives browser close; lost on cache clear
- **Upgrade Path**: Users can sign up and import demo data (future)
- **Risk**: Low (demo data only, no real PII on first use)

### Authorization Model

#### Role-Based Access Control (RBAC)
- **User Roles** (implicit):
  - **Unauthenticated**: Read-only access (world map, leaderboards, public profiles)
  - **Authenticated User**: Read/write own data
  - **Team Owner**: Manage team (add/remove members, edit settings)
  - **Admin** (future): Moderate content, ban users

#### Row-Level Security (RLS)
All tables enforced via Supabase RLS policies:

**Example: Actions Table**
```sql
-- Public read
CREATE POLICY "actions_select" ON actions 
  FOR SELECT USING (true);

-- Users can insert own actions
CREATE POLICY "actions_insert" ON actions 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update/delete own actions
CREATE POLICY "actions_update" ON actions 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "actions_delete" ON actions 
  FOR DELETE USING (auth.uid() = user_id);
```

### Session Management
- **Token Type**: JWT (JSON Web Token)
- **Storage**: localStorage (browser)
- **Expiration**: 1 year
- **Refresh**: Automatic by Supabase SDK
- **Sign Out**: Clear token from localStorage, redirect to landing page
- **Session Hijacking Protection**:
  - HTTPS-only (no HTTP fallback)
  - Secure flag on auth cookies (if used)
  - CORS restricts cross-origin token access
  - No token in URL (prevents leakage in logs)

---

## 3. DATA PROTECTION

### Encryption in Transit
- **HTTPS / TLS 1.2+**: All communications encrypted
- **Certificate**: Issued by Let's Encrypt (GitHub Pages, Supabase)
- **HSTS**: HTTP Strict-Transport-Security header
- **Certificate Pinning**: Not implemented; low-priority

### Encryption at Rest
- **Database**: Supabase PostgreSQL encryption at rest (AWS KMS)
- **Storage**: Supabase Storage (S3-backed) encryption
- **Backups**: Encrypted backups in Supabase vault
- **Sensitive Fields**: No additional application-level encryption (passwords handled by Supabase)

### PII Data Handling
**Collected PII**:
- Email (authentication)
- Name (optional, user profile)
- Location (college, country—optional)
- Photos (action proof, profile avatar)
- GPS coordinates (action location)

**Storage Minimization**:
- Collect only necessary PII (no phone, SSN, etc.)
- Photos compressed and stored in Supabase (no local servers)
- GPS coordinates stored at 6 decimal places (~0.11 m precision; sufficient for verification)

**Retention**:
- Keep while account active
- Allow users to delete own data (GDPR right to be forgotten)
- Anonymize photos if profile deleted (future automation)

### Data Isolation
- **Multi-tenant**: Single Supabase project, RLS isolates data by user
- **No Cross-Contamination**: RLS policies prevent user A from accessing user B's data
- **Admin Access**: Supabase admin panel allows data access (risk: insider threat)

---

## 4. API SECURITY

### Authentication to Supabase
- **Publishable Key**: `sb_publishable_...` (safe to expose in client code)
- **No Secret Key**: Never embed secret key in client (would expose in GitHub)
- **RLS Enforcement**: Supabase enforces RLS for all queries, even with publishable key

### Rate Limiting
- **Supabase**: Built-in rate limits per project
  - Free tier: 2 requests/second per IP for writes
  - Paid tier: Auto-scales
- **Google Maps**: Billing-based limits (no hard cap with API key)
- **ipapi.co**: 30,000/month free tier

### API Key Restriction
- **Google Maps API Key**:
  - Application restrictions: Website application type
  - Domain restrictions: `localhost:*` (dev), `deneal2005.github.io` (prod)
  - API restrictions: Maps JavaScript API, Geocoding API only
  - Prevents key misuse in other apps

### CORS (Cross-Origin Resource Sharing)
- **Supabase**: CORS configured to allow all origins (safe with RLS)
- **Google Maps**: CORS configured per API key restrictions
- **No CORS Issues**: Frontend and Supabase are separate origins; same-origin policy avoided

---

## 5. SECRET MANAGEMENT

### API Keys & Secrets

**Public (Safe to Expose)**:
- Supabase publishable key
- Google Maps API key (restricted)
- GitHub repository URL

**Secret (Never Embed in Code)**:
- Supabase secret/admin key
- Supabase JWT signing key
- Database password (handled by Supabase)
- Google OAuth client secret (handled by Supabase)

**Current Status**:
- ✅ No secrets in client code (app.js is public)
- ✅ All secrets managed by Supabase
- ⚠️ Database credentials: Only Delin has access to Supabase dashboard (personal account)
- ⚠️ Future: Migrate to company account when entity formed

### Key Rotation
- **Google Maps Key**: Rotate annually (optional; restrict by domain instead)
- **Supabase**: Use built-in key rotation if added
- **Process**: Generate new key, deploy update, revoke old key (no downtime)

---

## 6. VULNERABILITY MANAGEMENT

### Dependency Security
- **Frontend**: All libraries via CDN (Google, Supabase, Leaflet)
- **CVE Monitoring**:
  - Check vendor security advisories monthly
  - Test updates in staging before production
  - Patch critical vulnerabilities within 24 hours

### Code Review
- **Requirement**: 2+ approvals before merge to main
- **Focus Areas**:
  - SQL injection (parameterized queries prevent; RLS double-checks)
  - XSS (sanitize user input, escape HTML)
  - CSRF (Supabase handles; no state-changing GET requests)
  - Logic flaws (manual review of authentication, points calculation)

### Security Testing
- **Automated**: GitHub security scanning (Dependabot) — enabled
- **Manual**: Quarterly security review before major release
- **Penetration Testing**: Planned before public launch (Phase 1.5)

---

## 7. INCIDENT RESPONSE PLAN

### Incident Classification
| Severity | Description | Response Time | Examples |
|----------|-------------|---|----------|
| **Critical** | Data breach, active attack, service down | <1 hour | Unauthorized access, RDS down, API key leaked |
| **High** | Suspected unauthorized access, vulnerability | <4 hours | Suspicious activity, vulnerability disclosed |
| **Medium** | Minor security event, user complaint | <24 hours | Account takeover, fake action submission |
| **Low** | Information, security improvement | <1 week | Documentation update, minor UX risk |

### Response Procedures

**Critical: Data Breach Suspected**
1. ✅ Isolate: Disable affected accounts if active intrusion
2. ✅ Assess: Determine scope (how many records, what data)
3. ✅ Notify: Inform affected users within 24 hours
4. ✅ Remediate: Apply patch, rotate credentials
5. ✅ Post-Mortem: Document root cause, prevent recurrence
6. ✅ Report: File incident report (GDPR Article 33 if applicable)

**High: Vulnerability Disclosed**
1. ✅ Verify: Reproduce and confirm vulnerability
2. ✅ Plan: Design fix; estimate time to deploy
3. ✅ Communicate: Post on GitHub (if public disclosure) or vendor
4. ✅ Patch: Deploy fix to production
5. ✅ Document: Update security policy with lesson learned

**Medium: Account Takeover**
1. ✅ Confirm: Verify account compromise (check action history, IP logs)
2. ✅ Isolate: Reset password, invalidate sessions
3. ✅ Notify: Email user; offer password reset
4. ✅ Investigate: Determine attack vector (phishing, weak password, credential stuffing)
5. ✅ Document: Add to incident log

### Incident Communication
- **Internal**: Notify Delin immediately (Founder/CTO)
- **Users**: Email within 24 hours if data affected
- **Investors** (if applicable): Disclose material breaches
- **Regulators**: Notify authority if GDPR/CCPA breach and >500 records

---

## 8. COMPLIANCE FRAMEWORKS

### GDPR (General Data Protection Regulation)
**Applicability**: Yes (EU users likely)

**Status**: ⚠️ Partial Compliance
- [x] Data Processing Agreement with Supabase
- [x] RLS isolates data by user
- [ ] Privacy Policy (draft pending)
- [ ] Terms of Service (draft pending)
- [ ] Data Retention Policy (documented in 04-DATABASE)
- [ ] User deletion mechanism (technical capability ready; UI pending)
- [ ] Data Export capability (technical ready; UI pending)

**Key Requirements**:
- Users have right to access, rectify, delete data
- Clear consent for data collection
- Data Protection Officer (future, if 50+ employees)
- Processing agreements with vendors

### CCPA (California Consumer Privacy Act)
**Applicability**: Yes (California users)

**Status**: ⚠️ Partial Compliance
- [x] Supabase Privacy Shield certified
- [ ] Privacy Policy (draft pending)
- [ ] California-specific disclosures
- [x] Technical capability for user deletion
- [x] Technical capability for data export

**Key Requirements**:
- Users have right to know, delete, opt-out
- "Do Not Sell My Personal Information" link
- Privacy notice at collection time

### PCI DSS (Payment Card Industry)
**Applicability**: No (donations currently simulated; not PCI-required yet)

**Status**: ⏳ Future (when real payment processing added)
- Will use certified payment processor (Stripe, Razorpay)
- App will not store card data (processor handles)

---

## 9. THIRD-PARTY SECURITY

### Supabase Trust
- **Certifications**: SOC 2, ISO 27001 (verify on supabase.com/trust)
- **Security**: Encryption at rest/transit, DDoS protection, backup redundancy
- **Audit**: Annual third-party audit
- **Breach Response**: SLA commits 72 hours for critical patches

### Google Cloud Security
- **Certifications**: SOC 2, ISO 27001, HIPAA
- **API Security**: Key restrictions, rate limiting, audit logs
- **Breach Response**: Google's SLA for API availability

### Dependence Risks
- **Supabase Down**: App loses all data access (no offline fallback except demo mode)
- **Google Maps Down**: Map fallback to OpenStreetMap
- **IPv4 Down**: Timezone detection fails; fallback to USD currency

---

## 10. SECURITY CHECKLIST (Pre-Launch)

### Infrastructure
- [ ] HTTPS enforced (no HTTP)
- [ ] HSTS header enabled (GitHub Pages default)
- [ ] TLS 1.2+ minimum version
- [ ] DDoS protection enabled (GitHub Pages / Supabase)
- [ ] Backups automated and tested
- [ ] Monitoring/alerting active

### Application
- [ ] Input validation (email, username format, file types)
- [ ] Output encoding (HTML escaping, sanitization)
- [ ] SQL injection prevention (parameterized queries via SDK)
- [ ] XSS prevention (no `innerHTML` with user input)
- [ ] CSRF protection (not needed for stateless API)
- [ ] Authentication tests passing
- [ ] Authorization tests passing

### Data
- [ ] PII encrypted in transit (HTTPS)
- [ ] PII encrypted at rest (Supabase default)
- [ ] Passwords hashed (Supabase bcrypt)
- [ ] API keys restricted and rotated
- [ ] Logs don't contain sensitive data
- [ ] Test data sanitized before production

### Compliance
- [ ] Privacy Policy published
- [ ] Terms of Service published
- [ ] GDPR/CCPA notices displayed
- [ ] Data Processing Agreement signed (Supabase)
- [ ] User can request data deletion
- [ ] User can export data
- [ ] Incident response plan documented

### Documentation
- [ ] Security policies (this document) ✅
- [ ] Incident response procedures documented
- [ ] Access control matrix (who can do what)
- [ ] Security training for any team members
- [ ] Third-party security notes captured

---

## 11. ONGOING SECURITY ACTIVITIES

### Monthly
- [ ] Check Supabase/Google security advisories
- [ ] Review authentication logs for anomalies
- [ ] Verify backups completing successfully

### Quarterly
- [ ] Security code review (focus on auth, data access)
- [ ] Update dependency inventory
- [ ] Review and test incident response plan
- [ ] Audit API key usage (rotate if needed)

### Annually
- [ ] Full security audit (internal or third-party)
- [ ] Penetration testing
- [ ] Privacy impact assessment
- [ ] Compliance review (GDPR, CCPA, etc.)
- [ ] Update security policies

---

## 12. SECURITY CONTACTS

| Role | Name | Email | Availability |
|------|------|-------|---|
| Security Lead (Interim) | Delin Meitei | delinthangjam@gmail.com | 24/7 emergency |
| Security Officer (Future) | [TBD] | [TBD] | TBD |

**Vulnerability Disclosure**: security@greenup.app (to be established)

---

**End of Security Policies Document**

*This document should be reviewed quarterly and updated whenever security-related changes occur (new features, vendor changes, incident learnings). Conduct annual third-party security audit before major milestone (public launch, fundraising, acquisition).*
