# GREENUP — BUSINESS MODEL & REVENUE STRATEGY

**Version**: 1.0  
**Date**: June 2026  
**Status**: Early-stage (pre-revenue)

---

## 1. BUSINESS MODEL OVERVIEW

### Current Model: **Freemium + Donations**

**Core Principle**: Free access to all features, optional donations to fund tree planting

```
Free Users (100%)
    ↓
Log actions (free) → Earn badges (free) → Compete (free) → Donate (optional)
```

### Revenue Streams (Current & Planned)

| Stream | Status | Timeline | Potential |
|--------|--------|---|---|
| **Donations** | ✅ Implemented (simulated) | MVP | $10K–$50K/year (early) |
| **Premium Tier** | ⏳ Planned | Phase 2 (Q4 2026) | $100K+/year |
| **B2B Licensing** | ⏳ Planned | Phase 3 (2027) | $500K+/year |
| **Corporate Sponsorships** | ⏳ Planned | Phase 3 (2027) | $100K+/year |
| **Carbon Credit Trading** | ⏳ Planned | Phase 4 (2028) | $1M+/year |

---

## 2. PRIMARY REVENUE: DONATIONS

### Donation Mechanics

**User Flow**:
1. Click "Donate" tab
2. See impact tracker (e.g., "Your donations have funded 5 trees")
3. Select amount (presets or custom)
4. See auto-detected currency (e.g., ₹50 ≈ $1 ≈ €0.85)
5. Click donate → Confirmation page
6. Donor badge awarded
7. Appear on donor leaderboard (if not hidden)

### Pricing Strategy

**Freemium Approach**: No paywall; donations purely voluntary

**Suggested Donation Tiers** (flexible):
- ₹50 / $1 / €1 (micro-donor)
- ₹250 / $5 / €5 (supporter)
- ₹1000 / $20 / €20 (patron)
- ₹5000 / $100 / €100 (major donor)
- Custom amount (unlimited)

**One-Time vs. Recurring**: MVP supports one-time; recurring planned for Phase 2

### Impact Messaging

**Transparency**: Show donors exactly what their money funds
- "1 tree costs ₹500 to plant in India"
- "Your ₹5000 donation funds 10 trees"
- Public leaderboard (optionally) shows donor names & amounts
- Monthly impact reports (email to donors)

---

## 3. SECONDARY REVENUE: PREMIUM TIER (Phase 2)

### Premium Features (Planned, not yet implemented)

**Free Tier**:
- ✅ Action logging (unlimited)
- ✅ Leaderboards (community)
- ✅ Teams (basic)
- ✅ World map (public)
- ✅ Daily quiz (limited)

**Premium Tier** ($2–5/month):
- 🔒 Advanced analytics (action history, impact trends)
- 🔒 Custom team reports (PDF export)
- 🔒 Unlock badges faster (cosmetic)
- 🔒 Priority support (email within 24 hours)
- 🔒 Team invitations (with tracking links)
- 🔒 Ad-free experience (if ads added later)

**Projected Conversion**: 2–5% of active users → $50K–$100K/year at scale

---

## 4. TERTIARY REVENUE: B2B LICENSING (Phase 3)

### B2B Target Markets

**Universities & Colleges**:
- White-label GreenUP for campus sustainability
- Integrate with student organization management
- Data export for impact reports (accreditation, CSR)
- **Price**: $500–$5000/semester per institution

**Environmental NGOs**:
- Customized branding for conservation projects
- Impact reporting to donors and stakeholders
- Volunteer tracking and coordination
- **Price**: $2000–$10000/year

**Corporate CSR Programs**:
- Engage employees in environmental action
- Track company-wide carbon offset goals
- Use for marketing/ESG reporting
- **Price**: $5000–$50000/year (based on employee count)

**Government Programs**:
- Track public environmental initiatives (local, regional)
- Reporting for climate goals
- **Price**: $10000–$100000+/year

### B2B Features
- Customizable branding (colors, logo, domain)
- Admin dashboard for organization-level tracking
- API for data integration
- Dedicated support & onboarding
- Custom report generation

**Projected Revenue**: $500K–$2M/year (5–10 organizations at maturity)

---

## 5. SPONSORSHIPS & PARTNERSHIPS (Phase 3)

### Corporate Sponsorships

**Sponsorship Tiers**:

| Tier | Cost | Benefits |
|------|------|----------|
| **Bronze** | $10K/year | Logo on website footer |
| **Silver** | $50K/year | Logo on dashboard, monthly newsletter mention |
| **Gold** | $100K/year | Custom landing page, featured in press releases |
| **Platinum** | $250K+/year | Co-branded campaign, dedicated features |

**Example Sponsors**:
- Eco-friendly brands (TOMS, Patagonia)
- Tech companies (Microsoft, Google, Salesforce)
- Financial institutions (ESG-focused banks)
- NGOs (WWF, The Nature Conservancy)

### Strategic Partnerships

**Universities**: Co-marketing, embedded as campus sustainability tool → shared revenue model

**Environmental Groups**: Cross-promotion, referral partnerships → 10–20% revenue share

**Sustainability Platforms**: API integration (e.g., Oroeco, Loom) → Data sharing agreements

---

## 6. COST STRUCTURE & UNIT ECONOMICS

### Costs (Annual, at Scale)

| Cost Category | MVP | 10K Users | 100K Users | 1M Users |
|---|---|---|---|---|
| **Supabase Hosting** | $100 | $500 | $2,000 | $10,000 |
| **Google Maps API** | $200 | $1,000 | $5,000 | $25,000 |
| **Compute (Functions)** | $0 | $500 | $2,000 | $10,000 |
| **CDN/Storage** | $50 | $200 | $1,000 | $5,000 |
| **Email/Comms** | $0 | $100 | $500 | $2,000 |
| **Monitoring/Security** | $0 | $200 | $1,000 | $5,000 |
| **Team (Salary)** | $0 | $100K | $400K | $1M |
| **Marketing** | $0 | $20K | $100K | $500K |
| **Legal/Compliance** | $5K | $10K | $20K | $50K |
| **Misc. (Tools)** | $1K | $5K | $20K | $50K |
| **TOTAL** | ~$6.4K | ~$137.5K | ~$551.5K | ~$1.657M |

### Gross Margin

**At 100K users** (mid-scale):
- Assumed donation conversion: 5% (5,000 donors)
- Average donation: $20 (mix of small + large)
- Annual donation revenue: $100K
- **Gross margin**: ($100K − $551.5K) = −$451.5K (not profitable yet)

**At 500K users** (approaching scale):
- Donation conversion: 5% (25,000 donors)
- Average donation: $25
- Annual donation revenue: $625K
- Premium tier: 3% conversion × $3/month = $45K/year
- B2B tier (2 customers): $50K/year
- **Total revenue**: ~$720K
- **Gross margin**: ($720K − $900K) ≈ −$180K (closer to breakeven)

**Breakeven Scenario**:
- ~1M active users
- 5% donation conversion (50K donors)
- $25 average donation + 3% premium + 2–3 B2B customers
- **Projected revenue**: $1.5M–$2M/year
- **Projected costs**: $1.657M
- **Breakeven achieved** ✅

---

## 7. FINANCIAL PROJECTIONS (3-Year)

### Year 1 (2026): Bootstrapped, Pre-Revenue

| Metric | Projection |
|---|---|
| **Active Users** | 500–2,000 |
| **Revenue** | $0 (no payment processing) |
| **Costs** | $50K–$100K |
| **Funding Needed** | $100K–$200K (grants, angel, personal) |
| **Headcount** | 2 (founders only) |

### Year 2 (2027): Growth, Early Revenue

| Metric | Projection |
|---|---|
| **Active Users** | 50K–100K |
| **Monthly Active Users** | 15K–30K |
| **Donation Revenue** | $100K–$300K |
| **Premium Revenue** | $10K–$50K |
| **Total Revenue** | $110K–$350K |
| **Costs** | $300K–$500K |
| **Burn Rate** | -$150K to -$190K (still raising) |
| **Funding Round** | Seed round ($500K–$2M) |
| **Headcount** | 5–8 (1 engineer, 1 product, 1 growth, etc.) |

### Year 3 (2028): Scale, Path to Profitability

| Metric | Projection |
|---|---|
| **Active Users** | 500K–1M |
| **Monthly Active Users** | 100K–300K |
| **Donation Revenue** | $500K–$1M |
| **Premium Revenue** | $100K–$300K |
| **B2B Revenue** | $50K–$200K |
| **Total Revenue** | $650K–$1.5M |
| **Costs** | $900K–$1.2M |
| **Burn Rate** | -$250K to -$550K (may reach breakeven) |
| **Funding Round** | Series A ($5M–$15M) if pursuing growth |
| **Headcount** | 15–25 |

---

## 8. FUNDRAISING STRATEGY

### Funding Timeline

**Phase 1: Bootstrap & Grants (Now – Q4 2026)**
- Use founder savings + any early donations
- Apply for environmental grants (Bezos Earth Fund, etc.)
- No external equity (preserve dilution)
- Target: $100K–$200K

**Phase 2: Seed Round (Q1 2027)**
- Target: $500K–$2M from angel investors, impact VCs
- Give away: 10–20% equity
- Use for: Product development, 5 hires, marketing
- Post-seed valuation: $2.5M–$10M

**Phase 3: Series A (Q4 2027 – Q1 2028)**
- Target: $5M–$15M from impact-focused VCs (Sequoia, Khosla Ventures)
- Give away: 15–25% equity
- Use for: Scale to 1M users, international expansion, premium features
- Post-Series A valuation: $20M–$60M

### Investor Targeting

**Impact Investors** (aligned with environmental mission):
- Khosla Ventures (climate tech focus)
- DBL Partners (environment + society)
- Portfolia (women-founded companies)
- Omidyar Network (social impact)

**Climate-Focused VCs**:
- Fifth Season Ventures
- Energy Impact Partners
- Lowercarbon Capital

**Education/Youth VCs** (student market):
- Reach Capital (edtech)
- Learn Capital (learning platforms)

---

## 9. GO-TO-MARKET STRATEGY

### Phase 1: Campus Launch (Q2–Q4 2026)

**Target Universities**:
- NIT Manipur (founder's network)
- Delhi University, IIT Delhi (large student base)
- University of Nairobi (East Africa reach)
- UC Berkeley, MIT (US tier-1 schools)

**Tactics**:
- Direct outreach to environmental clubs
- Co-marketing with student organizations
- Gamified leaderboards (campus-specific)
- Hackathons and environmental fairs

**KPI**: 1,000 active users (500 trees, 500 cleanups logged)

### Phase 2: Regional Expansion (Q1–Q3 2027)

**Target Regions**:
- India (home region): 50K users
- East Africa: 20K users
- North America: 30K users

**Tactics**:
- Partnerships with environmental NGOs
- PR/media coverage ("students plant 100K trees")
- Influencer partnerships (climate TikTok accounts)
- Organic word-of-mouth

**KPI**: 100K active users, 10K monthly new signups

### Phase 3: Global Scale (2028+)

**Expansion**:
- 50+ countries
- B2B partnerships (universities, corporations)
- Mobile app launch (iOS, Android)
- Multi-language support

**KPI**: 1M users globally, $1M+ annual revenue

---

## 10. KEY METRICS & KPIs

### User Metrics
- **Monthly Active Users (MAU)**: Track engagement
- **User Retention**: % returning within 30 days
- **Action Logging Rate**: Trees + cleanups per user per month
- **Team Participation**: % in at least one team
- **Leaderboard Activity**: % checking leaderboard weekly

### Revenue Metrics
- **Donation Conversion Rate**: % of users who donate
- **Average Donation Size**: Mean + median
- **Donor Lifetime Value**: Total donations per donor over time
- **Premium Conversion**: % upgrading to paid features
- **Revenue Per User (ARPU)**: Monthly/annual

### Business Metrics
- **Customer Acquisition Cost (CAC)**: Cost to acquire user
- **Unit Economics**: Lifetime value / CAC
- **Churn Rate**: % of users leaving per month
- **Growth Rate**: % new users per month (target: 10–20%)

### Environmental Impact
- **Trees Planted**: Cumulative total
- **CO₂ Offset**: Calculated from trees (21 kg/tree/year)
- **Waste Collected**: Total kg cleaned up
- **Top Contributors**: Leaderboard rankings
- **Team Impact**: Collective environmental metrics

---

## 11. RISKS & CONTINGENCIES

### Risk: Low Donation Conversion
**Risk**: <2% of users donate → insufficient revenue
**Mitigation**:
- Implement recurring donation (auto-refill)
- Email campaigns highlighting impact
- Offer perks for donors (early access, premium features)
- Corporate matching programs

### Risk: Inability to Scale Globally
**Risk**: Growth stalls at 100K users due to cultural/market differences
**Mitigation**:
- Localize features (local tree species, currencies)
- Partner with regional environmental groups
- Hire in-country teams (regional expertise)

### Risk: Regulatory Compliance
**Risk**: GDPR/CCPA fines or bans in certain jurisdictions
**Mitigation**:
- Hire privacy officer (post-seed)
- Regular compliance audits
- Legal review in target markets

### Risk: Competitive Threat
**Risk**: Larger competitor (e.g., LinkedIn, TikTok) adds environmental tracking feature
**Mitigation**:
- Build strong community moat (teams, leaderboards)
- Vertical focus (students, campus sustainability)
- Move fast on Phase 2 features

---

**End of Business Model Document**

*This document should be updated quarterly as product develops, fundraising progresses, and market conditions change.*
