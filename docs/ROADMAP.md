# Project Roadmap & Feature Milestones

This document tracks planned, active, and completed milestones for Andrew Stanwix's personal portfolio website.

---

## 🎯 Milestone 1: Architecture & Data Decoupling (Completed)

- [x] Decouple competencies into `data/competencies.json` with dynamic badge rendering.
- [x] Implement accessible tab switching for competency categories with ARIA attributes.
- [x] Dark/light theme persistence and toggle synchronization.
- [x] Decouple qualifications into `data/qualifications.json`.
- [x] Implement qualification auto-scrolling ticker (5 visible, scrolling 3 items every 4 seconds, continuous loop).
- [x] Add qualification hover pause and interactive competence tooltip bar.
- [x] Add permanent CV (PDF) link to header, persistent across desktop and mobile screens.
- [x] Decouple projects into `data/projects.json` with 4 category tabs (`Web Projects`, `Java`, `Full Stack`, `Other`).
- [x] Enrich footer with training status, contact shortcuts, and dynamic copyright.
- [x] Document Google Apps Script & n8n webhook setup for direct Gmail inbox routing with labels.

---

## 🚀 Future Milestones

### Milestone 2: Content & Profile Expansion
- [x] **About Me Section**: Refresh biography, background story from 20 years culinary leadership to software engineering and IT administration.
- [x] **Hobbies & Interests Integration**: Consolidated into main index page (Section 5: "Beyond the Code" covering culinary discipline, golf focus, and global travel adaptability).
- [ ] **Interactive Timeline**: Visual progression timeline connecting past certifications (IFAGE, Udemy) with real-world project deliveries.
- [ ] **Project Showcases**: Add deep-dive modal views or sub-pages for featured projects with live demonstrations and GitHub repository links.

### Milestone 3: Contact Form Webhook Live Activation
- [ ] Deploy Google Apps Script Web App or n8n workflow.
- [ ] Connect `index.html` contact form via `fetch()` POST with user-friendly submission feedback (loading spinner, success message, error fallback).
- [ ] Automatic email routing to Gmail with label `Portfolio Contact`.

### Milestone 4: Comprehensive Styling & Animation Polish
- [ ] Refine typography, fluid spacing tokens (`clamp()`), and card elevation shadows.
- [ ] Subtle scroll-triggered reveal animations using `IntersectionObserver`.
- [ ] Performance audit: image optimization (WebP formats, responsive `srcset`).
- [ ] Final accessibility (a11y) audit ensuring WCAG 2.1 AA compliance.
