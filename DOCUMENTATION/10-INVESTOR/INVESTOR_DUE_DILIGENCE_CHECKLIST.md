# GREENUP — INVESTOR DUE DILIGENCE CHECKLIST

**Version**: 1.0  
**Date**: June 2026  
**Status**: Pre-Investor (Private Beta)  
**Target**: For Seed/Series A fundraising (2027+)

---

## OVERVIEW

This document outlines what investors will request during due diligence. The checklist below shows current status and what needs to be completed before fundraising.

---

## 1. TECHNICAL DUE DILIGENCE

### Code Quality & Architecture
- [ ] Source code review (code architecture, patterns, scalability)
- [ ] Dependency audit (no critical CVEs, license compliance)
- [ ] Performance testing (load testing at 10K concurrent users)
- [ ] Security audit (penetration test, vulnerability scan)
- [ ] Code coverage (test suite, unit/integration/e2e tests)

**Current Status**:
- ✅ Source code: Well-structured, documented, minimal dependencies
- ✅ License compliance: MIT + open-source libraries verified
- ⏳ Performance: Load tested informally; needs formal load test
- ❌ Security audit: Not yet done; planned for Q3 2026
- ❌ Test suite: Minimal; needs investment in testing

**Owner**: Delin Meitei  
**Timeline**: Q3 2026 (before Series A)

---

### Infrastructure & Scalability
- [ ] Infrastructure architecture documented
- [ ] Database scalability plan
- [ ] CDN/caching strategy
- [ ] Disaster recovery tested
- [ ] Monitoring & alerting setup
- [ ] SLA definition (uptime guarantee)

**Current Status**:
- ✅ Architecture: Documented (03-TECHNICAL/SYSTEM_ARCHITECTURE.md)
- ✅ Database: Supabase auto-scaling included
- ✅ CDN: GitHub Pages + Supabase CDN
- ⏳ DR tested: Backup procedure documented, not tested
- ⏳ Monitoring: Supabase dashboard available, need dashboards
- ⏳ SLA: Target 99.5% uptime, not formalized

**Owner**: Delin Meitei  
**Timeline**: Q2 2026 (ongoing)

---

### Technology Stack
- [ ] Frontend frameworks & versions (vanilla ES6+, CDN libraries)
- [ ] Backend services (Supabase PostgreSQL, Auth, Storage)
- [ ] External API integrations (Google Maps, ipapi.co)
- [ ] DevOps & deployment (GitHub Pages, CI/CD)
- [ ] Tech debt assessment

**Status**: ✅ Complete—see DOCUMENTATION/03-TECHNICAL

---

## 2. LEGAL & COMPLIANCE DUE DILIGENCE

### Entity & Formation
- [ ] Certificate of Incorporation (or equivalent)
- [ ] Articles of Association / Operating Agreement
- [ ] Cap table (share ownership, options, vesting)
- [ ] Shareholder agreements
- [ ] Board resolutions (if applicable)

**Current Status**:
- ❌ Entity: Not yet formed
- ❌ Articles: N/A (pending entity formation)
- ❌ Cap table: Verbal agreement only; needs formalization
- ❌ Shareholder agreement: Not signed
- ❌ Board: Not formed yet

**Timeline**: CRITICAL—must complete in Month 1 (before Series A)

---

### Intellectual Property
- [ ] IP assignment agreements (founder → company)
- [ ] Copyright registrations (source code, documentation)
- [ ] Trademark registrations (brand name, logo)
- [ ] Patent search (confirm no infringement)
- [ ] License agreements (for third-party IP)
- [ ] Open-source compliance (FOSS licenses verified)

**Current Status**:
- ❌ IP assignment: Not signed; draft template prepared
- ❌ Copyright: Automatic upon creation; not formally registered
- ❌ Trademark: Not filed; search required before filing
- ✅ Patent search: Likely non-patent IP; no search done
- ✅ License agreements: Open-source used under MIT/Apache 2.0
- ✅ Open-source compliance: Verified (all compliant)

**Timeline**: CRITICAL—months 1–2 (before Seed)

---

### Regulatory Compliance
- [ ] Privacy Policy (GDPR, CCPA, local laws)
- [ ] Terms of Service
- [ ] Data Processing Agreements (with Supabase, Google)
- [ ] GDPR compliance (if EU users)
- [ ] CCPA compliance (if California users)
- [ ] Data retention & deletion policies
- [ ] Incident response procedures

**Current Status**:
- ⏳ Privacy Policy: Template drafted; legal review pending
- ⏳ Terms of Service: Not drafted; critical for MVP
- ⏳ DPA: Supabase has DPA; need to sign
- ⏳ GDPR: Partial compliance; full audit needed
- ⏳ CCPA: Partial compliance; full audit needed
- ✅ Data retention: Documented in DATABASE_SCHEMA.md
- ✅ Incident response: Security procedures documented

**Timeline**: Q2–Q3 2026 (before public launch)

---

### Commercial Agreements
- [ ] Customer Terms of Service (published)
- [ ] Privacy Policy (published)
- [ ] Acceptable Use Policy (AUP)
- [ ] Founder agreements (signed)
- [ ] Advisor agreements (if applicable)
- [ ] Vendor contracts (Supabase, Google Maps)
- [ ] Employment agreements (for future team)

**Status**: Mostly pending; see timeline above

---

## 3. FINANCIAL DUE DILIGENCE

### Capitalization & Funding
- [ ] Current funding sources (bootstrapped, grants, loans)
- [ ] Previous funding rounds (valuations, terms, cap table)
- [ ] Stock ledger / option pool
- [ ] Board of advisors / investors
- [ ] Financial statements (YTD P&L, balance sheet)

**Current Status**:
- ✅ Funding: Bootstrapped by Delin (amount unknown—to clarify)
- ❌ Cap table: No previous rounds; needs creation
- ❌ Stock ledger: To be created at entity formation
- ❌ Advisory board: Informal advisors only; no formal board
- ❌ Financial statements: No revenue yet; minimal expenses

**Timeline**: Ongoing (prepare for Seed fundraising)

---

### Revenue & Traction
- [ ] User acquisition (DAU, MAU, growth rate)
- [ ] Revenue to date (donations, premium, B2B)
- [ ] Unit economics (CAC, LTV, payback period)
- [ ] Customer retention (churn rate, repeat donations)
- [ ] Financial projections (3-year P&L, cash flow)
- [ ] Marketing spend & ROI

**Current Status**:
- ⏳ Users: 0 (private beta); demo mode only
- ⏳ Revenue: $0 (donations simulated until Seed round)
- ⏳ Metrics: Not yet tracked; need analytics dashboard
- ⏳ Retention: No user cohort data yet
- ✅ Projections: 3-year model created (09-BUSINESS/BUSINESS_MODEL.md)
- ⏳ Marketing: Minimal; will scale post-funding

**Timeline**: Ongoing (track from beta launch)

---

### Expense & Burn Rate
- [ ] Current monthly burn rate
- [ ] Fixed vs. variable costs
- [ ] Runway (months of operations remaining)
- [ ] Unit economics by feature/user segment
- [ ] Headcount & compensation

**Current Status**:
- ⏳ Burn: ~$2K–$5K/month (infrastructure); Delin unpaid
- ✅ Costs: Documented (BUSINESS_MODEL.md)
- ⏳ Runway: Depends on personal funding (TBD)
- ⏳ Unit economics: Projected; not yet validated
- ✅ Headcount: 2 (Delin + Punshiba, unpaid)

**Timeline**: Ongoing

---

## 4. PRODUCT DUE DILIGENCE

### Product Roadmap
- [ ] Feature roadmap (3-year plan)
- [ ] Current version & release history
- [ ] Development velocity (commits, releases per month)
- [ ] Quality metrics (bugs, uptime, performance)
- [ ] User feedback & satisfaction (NPS, surveys)

**Status**:
- ✅ Roadmap: 3-phase plan (DOCUMENTATION/02-PRODUCT/PRD.md)
- ✅ Version: 1.0 released (GitHub commit: 664afc7)
- ⏳ Velocity: Only 2 commits so far; need ongoing releases
- ⏳ Quality: No formal metrics; need monitoring
- ⏳ Feedback: Beta users TBD; need feedback loop

---

### User Acquisition & Retention
- [ ] User growth metrics (DAU, MAU, signup rate)
- [ ] Activation rate (% who complete onboarding)
- [ ] Retention cohorts (% active by month after signup)
- [ ] Churn analysis (when/why users leave)
- [ ] NPS or CSAT surveys
- [ ] Content marketing strategy

**Status**:
- ❌ No users yet (private beta)
- ⏳ Onboarding: Tested internally; needs user testing
- ⏳ Retention: Not yet measurable
- ⏳ Churn: N/A
- ⏳ NPS: Not yet surveyed
- ⏳ Marketing: Strategy planned; execution pending

**Timeline**: Ongoing after beta launch

---

## 5. MARKET & COMPETITIVE DUE DILIGENCE

### Market Size & Opportunity
- [ ] TAM (Total Addressable Market) calculation
- [ ] SAM (Serviceable Available Market) estimate
- [ ] SOM (Serviceable Obtainable Market) projection
- [ ] Market growth rate (environmental, edtech sectors)
- [ ] Pricing power analysis

**Status**:
- ✅ TAM: ~200M students globally (01-PROJECT-INFO)
- ⏳ SAM: ~50M students in universities with sustainability movements
- ⏳ SOM: Not yet calculated; depends on marketing spend & conversion
- ⏳ Growth rate: Environmental market growing 15–20% annually
- ⏳ Pricing: Model validated through interviews (TBD—need evidence)

---

### Competitive Landscape
- [ ] Direct competitors (Forest.app, Oroeco, Loom)
- [ ] Indirect competitors (fitness tracking, social networks)
- [ ] Competitive advantages (differentiation)
- [ ] Barriers to entry (network effects, switching costs)
- [ ] Market share assumptions

**Status**:
- ✅ Competitors identified: Forest.app, Oroeco, Loom (02-PRODUCT/PRD.md)
- ✅ Differentiation: GPS + photo proof, teams, open donations
- ⏳ Barriers: Community (teams, leaderboards) creates network effects
- ⏳ Market share: TBD based on beta results

---

## 6. TEAM DUE DILIGENCE

### Founder Background
- [ ] Founder education & prior experience
- [ ] Relevant domain expertise (environment, tech, startups)
- [ ] Track record (previous exits, failures, learning)
- [ ] References (previous employers, mentors, investors)

**Current Status** (Delin Meitei):
- ✅ Education: [TBD—add founder background]
- ✅ Domain expertise: Software engineering (proven in codebase)
- ⏳ Track record: [TBD—add details]
- ⏳ References: [TBD—add 3 professional references]

**Current Status** (Punshiba Ningthoujam):
- ✅ Strategy & product expertise: [TBD—add details]
- ⏳ References: [TBD—add 3 professional references]

---

### Key Person Risk
- [ ] Dependency on founder(s)
- [ ] Key person insurance (if applicable)
- [ ] Succession plan
- [ ] Advisory board

**Status**:
- 🔴 High risk: All technical decisions depend on Delin
- ❌ Key person insurance: Not yet obtained
- ⏳ Succession: No plan yet; need to hire CTO post-Seed
- ⏳ Advisory board: Informal only; need 2–3 formal advisors

---

## 7. DUE DILIGENCE CHECKLIST (INVESTOR PERSPECTIVE)

### Information Request (Standard)
- [ ] Cap table (latest, fully-diluted)
- [ ] Articles of Incorporation & bylaws
- [ ] Board resolutions (if any)
- [ ] Shareholder agreements
- [ ] Stock purchase agreements
- [ ] Option grants & agreements
- [ ] Employment agreements (current & template)
- [ ] Non-compete & non-solicitation agreements
- [ ] Customer contracts (if any)
- [ ] Vendor contracts
- [ ] Insurance policies
- [ ] Tax returns (corporate & personal—confidential)
- [ ] Financial statements (YTD)
- [ ] Bank statements (last 12 months)
- [ ] IP assignment agreements
- [ ] Trademark/copyright registrations
- [ ] Privacy policy & Terms of Service
- [ ] GDPR/CCPA compliance documentation
- [ ] Product documentation (PRD, roadmap, architecture)
- [ ] Customer list & retention data
- [ ] Competitive analysis
- [ ] Growth projections
- [ ] Use of proceeds (how will funding be spent?)

### Red Flag Items (Must Address Before Fundraising)
- 🔴 No legal entity formed
- 🔴 IP not assigned to company
- 🔴 No founder agreement signed
- 🔴 Missing privacy policy & ToS
- 🔴 Unclear cap table or vesting schedule
- 🔴 Key person dependency without backup
- 🔴 No financial tracking or projections
- 🔴 Regulatory non-compliance (GDPR, CCPA)

---

## 8. DATA ROOM STRUCTURE (FOR INVESTORS)

Organize documents in Supabase or cloud storage (encrypted):

```
/GREENUP_DATA_ROOM/
├── 01_FORMATION
│   ├── Articles of Incorporation
│   ├── Operating Agreement
│   ├── Cap Table (current & historical)
│   └── Board Resolutions
├── 02_IP
│   ├── IP Assignment Agreement (Delin → Company)
│   ├── Trademark Application (if filed)
│   ├── Copyright Registrations
│   └── License Agreements
├── 03_LEGAL
│   ├── Founder Agreement
│   ├── Privacy Policy
│   ├── Terms of Service
│   ├── Advisor Agreements
│   └── Employment Agreement (template)
├── 04_FINANCIAL
│   ├── YTD P&L
│   ├── Bank Statements (12 months)
│   ├── Tax Returns (corporate)
│   ├── 3-Year Projections
│   └── Expense Report
├── 05_PRODUCT
│   ├── Product Roadmap
│   ├── System Architecture Documentation
│   ├── Database Schema
│   ├── API Documentation
│   └── Screenshots/Demo Videos
├── 06_MARKET
│   ├── Competitive Analysis
│   ├── Market Research (if any)
│   ├── Customer Research (surveys, interviews)
│   └── TAM/SAM/SOM Analysis
├── 07_TEAM
│   ├── Founder Bios & Résumés
│   ├── References (1–2 per founder)
│   ├── Advisory Board (if any)
│   └── Team Hiring Plans
├── 08_SECURITY
│   ├── Security Audit Results (if done)
│   ├── Data Processing Agreement (Supabase)
│   ├── Insurance Policies
│   └── Compliance Checklist (GDPR, CCPA)
└── 09_MISC
    ├── Press Coverage (if any)
    ├── Awards (if any)
    └── User Testimonials
```

---

## 9. CRITICAL PATH TO INVESTOR-READY STATUS

### Immediate (Month 1—CRITICAL)
- [ ] Form legal entity (LLC, LLP, or Pvt Ltd)
- [ ] Sign founder agreement (Delin + Punshiba)
- [ ] IP assignment agreement (Delin → Company)
- [ ] Create cap table & vesting schedule
- [ ] Trademark search & filing plan

**Owner**: Delin + Legal advisor  
**Effort**: 40–60 hours  
**Cost**: $2K–$5K (legal fees)

---

### Important (Months 1–2)
- [ ] Privacy Policy (legal review)
- [ ] Terms of Service (legal review)
- [ ] Supabase DPA signing
- [ ] Security audit (preliminary)
- [ ] Financial statements (YTD)
- [ ] Investor pitch deck

**Owner**: Delin + legal/financial advisor  
**Effort**: 60–80 hours  
**Cost**: $3K–$8K

---

### Recommended (Months 2–3)
- [ ] Formal advisory board (2–3 advisors, signed agreements)
- [ ] Penetration test / security audit (full)
- [ ] Tax filings (corporate, incorporation, GST)
- [ ] Insurance (D&O, liability)
- [ ] Data room setup (for investor access)

**Owner**: Delin + advisors  
**Effort**: 40–60 hours  
**Cost**: $5K–$15K

---

### Phase 2 (Months 3–6)
- [ ] User metrics dashboard (Google Analytics, custom tracking)
- [ ] Beta user testimonials & NPS survey
- [ ] Competitor analysis deep-dive
- [ ] Financial projections (detailed, sensitive analysis)
- [ ] Product roadmap (detailed Phase 1–2)

**Owner**: Delin + Punshiba  
**Effort**: 80–100 hours  
**Cost**: $2K–$5K

---

## 10. INVESTOR READINESS SUMMARY

| Category | Status | Timeline |
|----------|--------|----------|
| **Legal Entity** | ❌ Not formed | Month 1 (CRITICAL) |
| **IP Assignment** | ❌ Not signed | Month 1 (CRITICAL) |
| **Founder Agreement** | ❌ Not signed | Month 1 (CRITICAL) |
| **Privacy & ToS** | ⏳ Drafted, needs review | Month 1–2 |
| **Security Audit** | ❌ Not done | Month 2–3 |
| **Financial Statements** | ⏳ Will create | Ongoing |
| **User Traction** | ⏳ Pre-launch (beta soon) | Ongoing |
| **Market Analysis** | ✅ Drafted | Complete |
| **Product Roadmap** | ✅ Drafted | Complete |
| **Data Room** | ❌ Not set up | Month 2 |

**Overall Readiness**: **🔴 Not Yet Ready for Seed Fundraising**

**Estimated time to investor-ready status**: **3 months** (with focused execution)

---

**End of Investor Due Diligence Checklist**

*This document should be reviewed monthly as progress is made toward fundraising. Use as a control list to ensure no critical items are missed before approaching investors.*
