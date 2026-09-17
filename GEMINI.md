# GEMINI.md - Project Profile (Andrew Stanwix)

This document provides context, conventions, and architectural guidelines for AI agents and developers working on this codebase.

---

## 1. Project Overview

This repository contains a responsive personal portfolio and profile website for **Andrew Stanwix** (Web Developer and Programmer), built during training at Campus Numérique.

- **Primary Goal**: Showcase developer background, skills/competencies, qualifications, personal interests, and contact information.
- **Architecture**: Lightweight, static multi-page website without build tools or bundlers.

---

## 2. Directory & File Structure

```
.
├── index.html                  # Main portfolio homepage (banner, intro, competence tabs, qualification ticker, about me, beyond the code/hobbies, contact, footer)
├── projects.html               # Projects showcase page (4 category tabs: Web, Java, Full Stack, Other)
├── components/                 # Reusable HTML partials loaded via fetch()
│   ├── header.html             # Shared navigation, CV link, theme toggle, and mobile burger menu
│   └── footer.html             # Shared footer with credentials, quick links, and social icons
├── components.js               # Client-side component loader, tab controller, qualification ticker, and badge renderer
├── data/                       # Structured JSON datasets
│   ├── competencies.json       # Competencies data (IDs, names, categories, icon SVGs, tooltips, check status)
│   ├── qualifications.json     # Academic & bootcamp qualifications, competences, and tooltip descriptions
│   └── projects.json           # Categorized portfolio projects with tech tags and repository/demo links
├── docs/                       # Modular project documentation and architecture guides
│   ├── ROADMAP.md              # Staged feature roadmap & milestone tracking
│   ├── DATA_ARCHITECTURE.md    # Data schemas and conventions for JSON datasets
│   └── CONTACT_WEBHOOK_SETUP.md# Guide for connecting contact form to Gmail with automated label
├── assets/                     # Downloadable assets and documents
│   └── Andrew_Stanwix_CV.pdf   # Curriculum Vitae (PDF)
├── styles.css                  # Core CSS stylesheet containing theme variables, layouts, tabs, ticker, and responsive styles
├── image/                      # Image assets (PNG, JFIF, photography)
│   └── icons/                  # SVG icons for tech stack, tools, platforms, and checkmark indicators
└── GEMINI.md                   # Workspace rules and project documentation
```

---

## 3. Technology Stack & Dependencies

- **HTML5**: Semantic markup (`<header>`, `<nav>`, `<section>`, `<footer>`, `<table>`, `<form>`).
- **CSS3**: Custom CSS using CSS Custom Properties (variables), Flexbox, and CSS Grid.
- **Bootstrap 5.3.8**: Loaded via CDN (`https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css`) on `index.html` and `projects.html` for utility styling and form controls.
- **JavaScript (Vanilla)**:
  - `components.js` uses `fetch()` to dynamically inject `components/header.html` and `components/footer.html` into placeholder tags (`#site-header`, `#site-footer`) across pages, while managing active page states.
  - **Dynamic Competency Badges**: `loadCompetencies()` fetches `data/competencies.json` and renders interactive competency badges dynamically into category tab panels.
  - **Accessible Tab Switching**: `setupTabs()` handles category tab switching (`[role="tablist"]`, `[role="tab"]`, `[role="tabpanel"]`) with full ARIA state management.
- **Pure CSS Mobile Navigation**: Uses the checkbox toggle pattern (`#menu-toggle` with `<label class="burger-menu">`).
- **Form Handling**: Contact form on `index.html` submits via GET request to `https://httpbin.org/get` for testing.
- **Icons & Assets**: Inline SVG icons (LinkedIn, GitHub) in footer, and an extensive local SVG library in `image/icons/` for technologies, tools, platforms, and competency verification checks.

---

## 4. Competency & Skills Architecture

The competence section on `index.html` is powered by a decoupled JSON data structure and dynamic client-side rendering:

### Data Schema (`data/competencies.json`)
Each entry represents a skill or tool with the following fields:
```json
{
  "id": "javascript",
  "name": "JavaScript",
  "category": "Languages & Frameworks",
  "svg": "image/icons/javascript.svg",
  "tooltipText": "Core programming language for web interactivity and frontend logic\n\nProjects: Harry Potter Fan site, Follow the snitch, Robofriends Directory, Decoupled Portfolio Website, MJC Festi'Môm Ticketing Platform, Budget app, Swiss Cybersecurity Interactive Quiz",
  "projects": [
    "Harry Potter Fan site",
    "Follow the snitch",
    "Robofriends Directory",
    "Decoupled Portfolio Website",
    "MJC Festi'Môm Ticketing Platform",
    "Budget app",
    "Swiss Cybersecurity Interactive Quiz"
  ],
  "check": "image/icons/check-primary.svg"
}
```

- **Categories**:
  1. `Languages & Frameworks` (`#tab-languages`)
  2. `DevOps & Infrastructure` (`#tab-devops`)
  3. `Security & Compliance` (`#tab-security`)
  4. `Platforms & Operating Systems` (`#tab-platforms`)
  5. `Developer Tools & Environments` (`#tab-tools`)
- **Verification Indicators**:
  - `check-primary.svg`: Primary / core competency.
  - `check-secondary.svg`: Secondary / familiar competency.

### Badge UI & Interactions
- Badges (`.competence-badge`) contain the technology icon, title, and checkmark.
- Badges feature hover animations (`translateY(-2px)`) and dynamic pure CSS tooltips via `::before` pseudo-elements with downward pointer arrows (`::after`).
- Tooltips dynamically resize to fit content, format multiple lines (`white-space: pre-line`), and display linked portfolio projects.
- Full dark mode support for badges, tabs, and tooltips.

---

## 5. Design & Styling System

### Theme Tokens & CSS Variables (`styles.css`)
The site uses a standardized semantic token system in `:root` and supports dark mode via `[data-theme="dark"]` attribute:

- **Brand & Palette**:
  - `--color-primary`: Main theme blue (`rgb(18, 76, 151)` light / `#1e3a8a` dark)
  - `--color-primary-dark`: Darker blue (`#3914bf` light / `#0f172a` dark)
  - `--color-accent-purple`: Accent purple (`blueviolet` light / `#4c1d95` dark)
- **Surfaces & Backgrounds**:
  - `--color-bg-nav` / `--color-bg-footer`: Header/nav/footer background
  - `--color-bg-menu-mobile`: Mobile dropdown background
  - `--color-border-divider`: Section divider borders
- **Typography**:
  - `--color-text-dark`: Main content text
  - `--color-text-light`: Muted/secondary text
  - `--color-text-heading`: Banner and section headings
  - `--color-text-white`: Bright/nav link text
- **Gradients & Transitions**:
  - `--gradient-part-blue`: Primary hero section gradient
  - `--gradient-section-purple`: Qualifications table gradient
  - `--transition-smooth`: Image hover transitions (`transform 0.2s ease-in-out`)
  - `--theme-transition`: Smooth transition when toggling themes
- **Legacy Aliases (Preserved for compatibility)**:
  - `--background-blue`, `--background-grey`, `--font-grey`, `--font-black`

### Theme Switching
- Managed in `components.js` using `#theme-toggle` button in `components/header.html`.
- Persists user theme preference in `localStorage`.
- Automatically respects system `prefers-color-scheme: dark`.

### Responsive Breakpoints
1. **Mobile (< 575px)**:
   - Hamburger icon displayed; collapsible `#menu` dropdown.
   - Single-column stacked layouts.
2. **Tablet / iPad (576px – 768px)**:
   - Hamburger menu retained with adjusted font sizes and spacing.
   - Larger banner and typography.
3. **Laptop / Medium Desktop (769px – 1100px)**:
   - Full desktop navbar (`.nav-wide` visible, hamburger hidden).
   - 2-column CSS grid layout for competence/hobby cards (`.container-div`).
4. **Large Desktop (≥ 1101px)**:
   - Expanded margins and header spacing.

---

## 6. Development & Serving Workflow

Because this is a pure static site, no installation (`npm install`) or compilation step is required.

### Local Development Server
Because `fetch()` is used to load components and JSON data, running under an HTTP server is required (browsers block local `file://` fetch requests due to CORS):

```bash
# Python 3 built-in HTTP server
python3 -m http.server 8000

# Or using Node (if installed)
npx serve .
```

Then visit `http://localhost:8000` in the browser.

---

## 7. Conventions & Guidelines for AI Agents

- **Preserve Existing Code**: Do NOT make unsolicited modifications, refactors, or formatting changes to existing HTML, CSS, or image files unless explicitly requested by the user.
- **Navigation Consistency**: If modifying navigation links, update `components/header.html`, which is shared across `index.html` and `projects.html`.
- **Competencies & Skills Updates**: To add or update skills, modify `data/competencies.json` and ensure the corresponding SVG asset is present in `image/icons/`. Categories must match the mappings in `components.js` (`CATEGORY_TO_TAB` and `CATEGORY_MAP`).
- **Asset Paths**: Use relative paths for assets (`image/...`, `image/icons/...`, and `styles.css`). Note that image extensions include both `.png`, `.jfif`, and `.svg`.
- **CSS Consistency**: Rely on the existing CSS variables in `styles.css` for color consistency rather than hardcoding arbitrary color values.
- **Preserve Comments**: Maintain developer comments and historical code blocks.

---

## 8. Architectural & Feature Documentation

For deep technical specifications and step-by-step guides, refer to the modular documentation in `docs/`:

- [Project Roadmap & Milestones](file:///mnt/c/Users/stanw/Documents/campus_num/project_profile_17_06/docs/ROADMAP.md) - Staged development plans and future enhancements.
- [Data Architecture & Schemas](file:///mnt/c/Users/stanw/Documents/campus_num/project_profile_17_06/docs/DATA_ARCHITECTURE.md) - Specifications for `competencies.json`, `qualifications.json`, and `projects.json`.
- [Contact Webhook Setup Guide](file:///mnt/c/Users/stanw/Documents/campus_num/project_profile_17_06/docs/CONTACT_WEBHOOK_SETUP.md) - Setup for routing contact form submissions to Gmail with an automated `Portfolio Contact` label.
