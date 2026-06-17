# GREENUP — COMPREHENSIVE ACTION PLAN

**Version**: 1.0  
**Date**: June 2026  
**Status**: Strategic Priority Roadmap  
**Owner**: Delin Meitei (with Punshiba input on strategy items)

---

## OVERVIEW

This document consolidates all work items from the documentation package into a prioritized action plan. Items are categorized by urgency and grouped by function.

**Key Principle**: Fix the foundation (legal, IP, security) before scaling operations.

---

## PART 1: CRITICAL (Immediately—Do Not Delay)

### Phase: NOW (Next 2–4 Weeks)

These items are blockers for any fundraising, partnership, or scale.

---

#### 1.1 LEGAL ENTITY FORMATION ⚖️ BLOCKING

| # | Task | Owner | Effort | Cost | Timeline | Dependencies |
|---|------|-------|--------|------|----------|---|
| 1 | **Form company entity** (LLC, LLP, or Pvt Ltd depending on jurisdiction) | Delin | 8 hours | $2K–$5K | Week 1–2 | Need: jurisdiction decision (US? India? Both?) |
| 2 | Draft & sign **Founder Agreement** (equity split 70/30, vesting 4yr/1yr cliff) | Delin + Punshiba + Legal | 16 hours | $1K–$3K | Week 2–3 | Entity must exist first |
| 3 | **IP Assignment Agreement** (Delin → Company for all code, docs, assets) | Delin + Legal | 8 hours | $500–$1.5K | Week 2–3 | Entity must exist first |
| 4 | Create & maintain **Cap Table** (share ledger, fully diluted) | Delin + Accountant | 4 hours | $200 | Week 3 | Entity, founder agreement done |
| 5 | **Vesting schedule** setup (4-year vest, 1-year cliff, monthly thereafter) | Delin + Accountant | 4 hours | $200 | Week 3 | Cap table created |

**Blocker Resolution**: These must be done before approaching any investor or hiring employees.

**Success Criteria**:
- ✅ Company registered at business bureau
- ✅ Founder agreement signed by both founders
- ✅ IP assigned to company (documented)
- ✅ Cap table created (signed off by both)
- ✅ Vesting schedules defined & documented

---

#### 1.2 INTELLECTUAL PROPERTY PROTECTION

| # | Task | Owner | Effort | Cost | Timeline | Dependencies |
|---|------|-------|--------|------|----------|---|
| 6 | **Trademark search** ("GreenUP" name, logo; USPTO, EUIPO, India IPO databases) | Delin + Trademark attorney | 12 hours | $500 | Week 1–2 | None |
| 7 | **Trademark application filing** (start with US, then EU, India; WIPO international) | Trademark attorney | 8 hours | $1.5K–$3K | Week 3–4 | Trademark search completed |
| 8 | Add **LICENSE file** (MIT License) to GitHub repository | Delin | 1 hour | $0 | Week 1 | None |
| 9 | Create **ACKNOWLEDGMENTS.md** (list all open-source dependencies & licenses) | Delin | 2 hours | $0 | Week 1 | None |
| 10 | Create **Contributor License Agreement (CLA)** template (for future developers) | Legal | 6 hours | $500 | Week 2 | None |

**Success Criteria**:
- ✅ No trademark conflicts found
- ✅ TM applications submitted (US + EU + India)
- ✅ Repository has LICENSE file visible
- ✅ ACKNOWLEDGMENTS file lists all dependencies
- ✅ CLA ready for GitHub (when contributors arrive)

---

#### 1.3 SECURITY & COMPLIANCE (PRE-PUBLIC)

| # | Task | Owner | Effort | Cost | Timeline | Dependencies |
|---|------|-------|--------|------|----------|---|
| 11 | **Privacy Policy** (draft, legal review, publish) | Delin + Privacy attorney | 20 hours | $1K–$2K | Week 2–4 | None |
| 12 | **Terms of Service** (draft, legal review, publish) | Delin + Privacy attorney | 20 hours | $1K–$2K | Week 2–4 | None |
| 13 | Sign **Supabase Data Processing Agreement (DPA)** | Delin | 2 hours | $0 | Week 1 | Entity formed |
| 14 | **Security audit** (preliminary; identify critical vulnerabilities) | Security consultant | 40 hours | $3K–$5K | Week 3–4 | Audit firm hired |
| 15 | Remediate **critical security findings** (fix bugs, harden API) | Delin | 20 hours | $0 | Week 4+ | Security audit completed |

**Success Criteria**:
- ✅ Privacy Policy published on website
- ✅ Terms of Service published on website
- ✅ Supabase DPA signed
- ✅ Security audit report received
- ✅ All critical findings fixed or documented as "accepted risk"

---

#### 1.4 FOUNDER CLARITY & DOCUMENTATION

| # | Task | Owner | Effort | Cost | Timeline | Dependencies |
|---|------|-------|--------|------|----------|---|
| 16 | Document **Delin's full background** (education, prior experience, references) | Delin | 2 hours | $0 | Week 1 | None |
| 17 | Document **Punshiba's background** (education, roles, references) | Punshiba | 2 hours | $0 | Week 1 | None |
| 18 | Collect **3 professional references** per founder | Both | 2 hours | $0 | Week 1 | None |
| 19 | Create **high-level founder bios** (for pitch deck, investor meetings) | Delin | 2 hours | $0 | Week 1 | None |

**Success Criteria**:
- ✅ Founder bios written & reviewed by investors
- ✅ References available for investor calls
- ✅ No major gaps in track record

---

### Phase: WEEKS 3–4 (Complete Critical Phase)

Review all above items; ensure 100% completion before moving to Important phase.

**Checkpoint**: Schedule investor-readiness review call with legal advisor.

---

## PART 2: IMPORTANT (Within 30 Days)

### Phase: Weeks 2–4 (Parallel with Critical)

These items enable fundraising and scaled operations. High priority but not blocking.

---

#### 2.1 FINANCIAL SETUP & FORECASTING

| # | Task | Owner | Effort | Cost | Timeline | Dependencies |
|---|------|-------|--------|------|----------|---|
| 20 | Set up **business bank account** (company name) | Delin + Accountant | 4 hours | $100–$300 | Week 2 | Entity formed |
| 21 | Create **YTD financial statements** (P&L, balance sheet, cash flow) | Accountant | 8 hours | $500–$1K | Week 3 | Entity formed, expenses documented |
| 22 | Document **all expenses to date** (infrastructure, tools, legal, travel) | Delin | 4 hours | $0 | Week 2 | Bank account set up |
| 23 | Create **3-year financial projections** (detailed P&L, assumptions, sensitivity) | Delin + Accountant | 16 hours | $500 | Week 3 | YTD statements done; BUSINESS_MODEL.md reference |
| 24 | Calculate **use of proceeds** (how will Series A $ be spent?) | Delin + Punshiba | 4 hours | $0 | Week 4 | Projections done |

**Success Criteria**:
- ✅ Business bank account open & funded
- ✅ YTD P&L shows actual expenses
- ✅ 3-year model shows path to profitability (or clear investment thesis)
- ✅ Use of proceeds documented (hiring, product, marketing)

---

#### 2.2 PRODUCT SETUP FOR LAUNCH

| # | Task | Owner | Effort | Cost | Timeline | Dependencies |
|---|------|-------|--------|------|----------|---|
| 25 | Finalize **analytics setup** (Google Analytics or Mixpanel for user tracking) | Delin | 4 hours | $0–$100 | Week 2 | None |
| 26 | Create **KPI dashboard** (MAU, retention, donation rate, etc.) | Delin | 8 hours | $0–$200 | Week 3 | Analytics set up |
| 27 | Set up **error tracking** (Sentry or similar) for production monitoring | Delin | 2 hours | $0–$29/month | Week 2 | None |
| 28 | Design **beta user recruitment plan** (50–100 early users for feedback) | Delin + Punshiba | 4 hours | $0 | Week 3 | None |
| 29 | Recruit **5–10 beta testers** (friends, environmental club leaders, advisors) | Delin + Punshiba | 8 hours | $0 | Week 3–4 | Plan done |
| 30 | Create **beta user feedback form** (Google Form or Typeform) | Delin | 2 hours | $0 | Week 3 | None |

**Success Criteria**:
- ✅ Analytics tracking active (can see user flows)
- ✅ KPI dashboard shows baseline metrics
- ✅ Error tracking in place (alerts on failures)
- ✅ 5–10 beta testers signed up
- ✅ Feedback mechanism in place

---

#### 2.3 DOMAIN & BRANDING

| # | Task | Owner | Effort | Cost | Timeline | Dependencies |
|---|------|-------|--------|------|----------|---|
| 31 | **Acquire greenup.app domain** (or alternative: greenup.co, greenupapp.com) | Delin | 2 hours | $10–$50/year | Week 1 | None |
| 32 | Set up **domain DNS** (redirect to GitHub Pages or prepare for migration) | Delin | 1 hour | $0 | Week 1 | Domain purchased |
| 33 | Create **brand guidelines** (colors, fonts, logo usage, voice/tone) | Delin | 4 hours | $0 | Week 2 | None |
| 34 | Create **logo variations** (light/dark, icon, full wordmark, favicon) | Designer | 8 hours | $200–$500 | Week 2–3 | Branding done |

**Success Criteria**:
- ✅ Domain purchased & working
- ✅ Brand guidelines documented
- ✅ Logo & assets ready for all platforms

---

#### 2.4 DATA ROOM PREPARATION

| # | Task | Owner | Effort | Cost | Timeline | Dependencies |
|---|------|-------|--------|------|----------|---|
| 35 | Create **data room structure** (folders for all due diligence docs) | Delin | 4 hours | $0–$100 (secure storage) | Week 3 | Entity formed |
| 36 | **Collect all documents** (articles, agreements, financial, product docs) | Delin | 8 hours | $0 | Week 3–4 | Documents exist |
| 37 | Set up **secure access control** (who can view what documents) | Delin | 2 hours | $0 | Week 4 | Data room structure done |
| 38 | Create **data room index** (document list with descriptions) | Delin | 2 hours | $0 | Week 4 | Documents collected |

**Success Criteria**:
- ✅ Data room organized & searchable
- ✅ All critical documents uploaded
- ✅ Access control configured
- ✅ Investor can self-service due diligence

---

#### 2.5 PARTNERSHIPS & RELATIONSHIPS

| # | Task | Owner | Effort | Cost | Timeline | Dependencies |
|---|------|-------|--------|------|----------|---|
| 39 | Recruit **2–3 formal advisors** (domain experts: climate, edtech, sustainability) | Delin + Punshiba | 12 hours | $0 | Week 2–4 | Brand & vision clear |
| 40 | Create **advisor agreement** (role, expectations, equity stake if any) | Legal | 6 hours | $500 | Week 3 | Advisors identified |
| 41 | Approach **3 universities** for beta partnership (NIT Manipur, Delhi U, UC Berkeley) | Punshiba + Delin | 8 hours | $0 | Week 3–4 | Product ready |
| 42 | Reach out to **2 environmental NGOs** (TNC, WWF) for awareness/partnership | Punshiba | 4 hours | $0 | Week 4 | Product ready |

**Success Criteria**:
- ✅ 2–3 advisors committed & agreements signed
- ✅ 2–3 universities interested in beta
- ✅ 1–2 NGO partnership discussions underway

---

## PART 3: RECOMMENDED (Within 90 Days)

### Phase: Months 2–3

Items that strengthen position but don't block fundraising.

---

#### 3.1 OPERATIONAL INFRASTRUCTURE

| # | Task | Owner | Effort | Cost | Timeline | Dependencies |
|---|------|-------|--------|------|----------|---|
| 43 | Migrate **Supabase project to company account** (currently personal) | Delin | 8 hours | $0 | Month 2 | Entity formed |
| 44 | Migrate **Google Maps API to company billing** (currently personal) | Delin | 4 hours | $0 | Month 2 | Entity formed |
| 45 | Set up **GitHub organization** (transfer repo from personal account) | Delin | 2 hours | $0 | Month 2 | None |
| 46 | Establish **company email** (hello@greenup.app, support@greenup.app) | Delin | 2 hours | $50–$100/year | Month 1 | Domain purchased |
| 47 | Set up **team communication tool** (Slack, Discord for future team) | Delin | 2 hours | $0–$150/month | Month 2 | None |
| 48 | Create **documentation wiki** (internal how-tos, onboarding docs) | Delin | 8 hours | $0 | Month 2–3 | None |

**Success Criteria**:
- ✅ All company accounts in company name (not personal)
- ✅ GitHub org has proper access control
- ✅ Company email active
- ✅ Communication tools ready for team growth

---

#### 3.2 TESTING & QUALITY ASSURANCE

| # | Task | Owner | Effort | Cost | Timeline | Dependencies |
|---|------|-------|--------|------|----------|---|
| 49 | Create **unit test suite** (test core logic: points, levels, badges) | Delin | 16 hours | $0 | Month 2–3 | None |
| 50 | Create **integration tests** (test API calls, Supabase queries) | Delin | 16 hours | $0 | Month 2–3 | Unit tests done |
| 51 | Conduct **load testing** (simulate 1K, 10K, 100K concurrent users) | Delin or QA consultant | 20 hours | $0–$2K | Month 2–3 | Load test tools set up |
| 52 | Create **quality assurance checklist** (for each release) | Delin | 4 hours | $0 | Month 2 | None |

**Success Criteria**:
- ✅ Test suite >50% code coverage
- ✅ Load test passes at 10K concurrent users
- ✅ QA checklist integrated into release process

---

#### 3.3 LEGAL & COMPLIANCE DEEP-DIVE

| # | Task | Owner | Effort | Cost | Timeline | Dependencies |
|---|------|-------|--------|------|----------|---|
| 53 | **Full GDPR compliance audit** (identify gaps, create remediation plan) | Compliance consultant | 20 hours | $2K–$5K | Month 2 | Privacy policy done |
| 54 | **Full CCPA compliance audit** (California-specific requirements) | Compliance consultant | 16 hours | $2K–$4K | Month 2 | Privacy policy done |
| 55 | Obtain **Errors & Omissions (E&O) insurance** (for liability protection) | Insurance broker | 4 hours | $1K–$2K/year | Month 2 | None |
| 56 | Obtain **Directors & Officers (D&O) insurance** (if board members exist) | Insurance broker | 4 hours | $2K–$5K/year | Month 3 | Board formed |

**Success Criteria**:
- ✅ GDPR gaps identified & remediation plan created
- ✅ CCPA compliance documented
- ✅ Insurance policies active

---

#### 3.4 MARKETING & VISIBILITY

| # | Task | Owner | Effort | Cost | Timeline | Dependencies |
|---|------|-------|--------|------|----------|---|
| 57 | Create **company blog/Medium publication** (thought leadership on sustainability) | Delin + Punshiba | 8 hours | $0–$100 | Month 2 | None |
| 58 | Create **founder LinkedIn profiles** (both founders; update with GreenUP) | Both | 2 hours | $0 | Month 1 | None |
| 59 | Draft **press release** (for private beta launch; "Student-led platform...") | Punshiba + PR | 4 hours | $0–$500 (PR agency) | Month 2–3 | Product ready |
| 60 | Reach out to **2–3 sustainability journalists/bloggers** (Techcrunch, VentureBeat) | Punshiba | 4 hours | $0 | Month 2 | Press release done |
| 61 | Create **social media accounts** (Twitter, Instagram, TikTok for GreenUP) | Punshiba | 4 hours | $0 | Month 1 | Branding done |

**Success Criteria**:
- ✅ Social media profiles up & posting
- ✅ Blog active (weekly posts about sustainability/product)
- ✅ Press coverage from 1–2 outlets

---

#### 3.5 METRICS & ANALYTICS MATURITY

| # | Task | Owner | Effort | Cost | Timeline | Dependencies |
|---|------|-------|--------|------|----------|---|
| 62 | Create **retention cohort analysis** (track % of users by signup month) | Delin | 8 hours | $0 | Month 2 | Analytics set up |
| 63 | Set up **custom events tracking** (action logged, tree/cleanup ratio, team joined) | Delin | 6 hours | $0 | Month 2 | Analytics set up |
| 64 | Create **weekly metrics report** (email to founders with key stats) | Delin | 4 hours | $0 | Month 3 | Analytics mature |
| 65 | Conduct **user interviews** (5–10 beta users; understand motivations, pain points) | Punshiba | 10 hours | $0 | Month 3 | Beta users engaged |

**Success Criteria**:
- ✅ Weekly metrics report running
- ✅ Cohort analysis shows retention trends
- ✅ User interviews captured & documented
- ✅ Clear data to inform product decisions

---

## PART 4: FUTURE (Before Major Milestones)

### 4.1 BEFORE SEED FUNDRAISING (Month 3–4)

| # | Task | Owner | Effort | Timeline |
|---|------|-------|--------|----------|
| 66 | Pitch deck created (20 slides: problem, solution, market, team, ask, financials) | Delin | 16 hours | Month 3 |
| 67 | Investor prospect list (50+ VCs, angels, impact funds) | Punshiba | 8 hours | Month 3 |
| 68 | Intro meetings with 10 warm investors (through advisors, network) | Delin + Punshiba | 20 hours | Month 3–4 |
| 69 | Prepare for 5 investor pitches (practice, refine story) | Both | 10 hours | Month 4 |
| 70 | First SAFE/convertible note signed (milestone!) | Delin + Investor | 4 hours | Month 4+ |

---

### 4.2 BEFORE PUBLIC LAUNCH (Month 4–6)

| # | Task | Owner | Effort | Timeline |
|---|------|-------|--------|----------|
| 71 | Create **public press release** (GreenUP public launch; tree planting stats) | Punshiba + PR | 4 hours | Month 5 |
| 72 | Execute **marketing blitz** (social media, press, influencer outreach) | Punshiba + Marketing | 40 hours | Month 5–6 |
| 73 | Create **video demo** (2–3 min; show core features, value prop) | Video producer | 16 hours | $500–$1.5K | Month 4–5 |
| 74 | Scale **infrastructure** (test at 100K concurrent users; optimize) | Delin | 20 hours | Month 5–6 |
| 75 | Hire **first engineer/PM** (expand team post-launch) | Delin | 20 hours | Month 5–6 |

---

### 4.3 BEFORE SERIES A (Month 9–12)

| # | Task | Owner | Effort | Timeline |
|---|------|-------|--------|----------|
| 76 | Achieve 50K–100K active users (milestone!) | Team | — | Month 9–12 |
| 77 | Generate $50K–$100K in donations (prove business model) | Team | — | Month 9–12 |
| 78 | Close 2–3 B2B customers (university, NGO, corporate) | Punshiba | 20 hours | Month 9–12 |
| 79 | Hire **full leadership team** (CTO, VP Product, Head of Growth) | Delin + Board | 40 hours | Month 9–12 |
| 80 | Conduct **Series A due diligence prep** (customer interviews, data room refresh) | Delin | 20 hours | Month 11–12 |

---

## PART 5: PRIORITY MATRIX

### Urgency vs. Impact

```
HIGH IMPACT / IMMEDIATE
├─ Legal entity formation
├─ IP assignment
├─ Founder agreement
├─ Trademark filing
├─ Security audit
└─ Privacy Policy & ToS

HIGH IMPACT / SOON (30 DAYS)
├─ Financial statements
├─ Data room setup
├─ Beta user recruitment
├─ Advisor recruitment
└─ Domain acquisition

MEDIUM IMPACT / SOON
├─ Analytics setup
├─ Testing infrastructure
├─ Blog/social media
└─ GitHub org transfer

MEDIUM IMPACT / LATER
├─ Compliance audits
├─ Insurance policies
├─ Pitch deck
└─ Detailed marketing plan
```

---

## PART 6: RESOURCE ALLOCATION

### Estimated Hours & Costs (6-Month Plan)

| Phase | Hours (Delin) | Hours (Punshiba) | Hours (Contractors) | Cost |
|---|---|---|---|---|
| Critical (Weeks 1–4) | 80 | 20 | 60 (lawyer, accountant) | $8K–$15K |
| Important (Weeks 2–4) | 60 | 40 | 40 (designer, security) | $5K–$8K |
| Recommended (Months 2–3) | 120 | 40 | 80 (consultants) | $8K–$12K |
| Future (Months 4–6) | 100 | 120 | 100 (PR, video, dev) | $10K–$20K |
| **TOTAL (6 months)** | 360 | 220 | 280 | **$31K–$55K** |

**Assumption**: Founder labor donated (no salary); contractors hired as needed.

---

## PART 7: SUCCESS CRITERIA & CHECKPOINTS

### Month 1 Checkpoint (End of Critical Phase)
- [ ] Company entity registered
- [ ] Founder agreement signed
- [ ] IP assigned to company
- [ ] Trademark search completed & filed
- [ ] Privacy Policy published
- [ ] Security audit initiated
- [ ] Beta users recruited (5+)

**Go/No-Go Decision**: If all green, proceed to Important phase. If any red, pause and resolve first.

---

### Month 3 Checkpoint (End of Recommended Phase)
- [ ] YTD financial statements complete
- [ ] 3-year projections modeled
- [ ] Analytics tracking active
- [ ] 20+ beta users engaged
- [ ] 2–3 advisors onboarded
- [ ] 2–3 university partnerships exploring
- [ ] Data room live for investors

**Go/No-Go Decision**: If green, ready for Seed pitch prep. If gaps, continue execution in parallel.

---

### Month 6 Checkpoint (Ready for Growth)
- [ ] 100+ active users beta testing
- [ ] Fundraising deck complete
- [ ] First investor conversations happening
- [ ] Metrics show strong retention (>50% month 1 retention)
- [ ] Clear product-market fit signals
- [ ] Marketing plan executed

**Go/No-Go Decision**: Ready to raise Seed round or scale bootstrap operation.

---

## PART 8: RISK MITIGATION

### Top 5 Risks & Contingencies

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|-----------|
| **Legal/IP dispute** (unclear ownership) | Company unfundable | High | Execute founder agreement ASAP (Week 2) |
| **Security incident** (before public) | Reputational + financial | Medium | Hire security consultant (Week 3) |
| **Low user traction** (beta flops) | No product-market fit signal | Medium | Pivot to B2B/university focus if needed |
| **Founder burnout** (Delin overwhelmed) | Project stalls | Medium | Hire 1st engineer by Month 3 |
| **Competitive threat** (large player copies) | Market share threat | Low | Move fast on Phase 2; build community moat |

---

## PART 9: FINAL CHECKLIST

### Am I Ready to Execute This Plan?

- [ ] I have 10–15 hours/week available (Delin)
- [ ] I have 5–10 hours/week available (Punshiba)
- [ ] I have $30K–$50K budget (or access to funding)
- [ ] I have a lawyer on standby
- [ ] I have an accountant on standby
- [ ] I've reviewed all due diligence requirements
- [ ] I understand the risk/reward of each phase
- [ ] I'm committed to building this for 3+ years

**If YES to all**: You're ready to execute. Start with Critical phase immediately.

**If NO to any**: Adjust timeline or resource plan before starting.

---

**End of Comprehensive Action Plan**

## HOW TO USE THIS DOCUMENT

1. **Print or bookmark** this plan
2. **Assign owners** (Delin, Punshiba, or contractor) to each task
3. **Schedule weekly check-ins** (15 min sync between founders)
4. **Track progress** (mark tasks done, update timeline if needed)
5. **Escalate blockers** immediately (don't let red items slip)
6. **Celebrate milestones** (finish Critical phase = milestone!)
7. **Update quarterly** (as business evolves, revisit priorities)

---

### QUICK REFERENCE: Next 7 Days

```
WEEK 1 SPRINT:
  Monday: Meet with lawyer re: entity formation
  Tuesday: Complete founder background bios
  Wednesday: Start trademark search
  Thursday: Begin Privacy Policy draft
  Friday: Recruit 3 beta testers
  Weekend: Reflect & plan Week 2
```

**Start now. This is your path to a sustainable, fundable, acquirable business.**

---

*Created: June 2026 | Status: Active Roadmap | Next Review: July 2026*
