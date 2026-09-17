# Data Architecture & Schemas

This document defines the schemas, conventions, and relationships for all decoupled JSON datasets located in the `data/` directory.

---

## 1. Competencies & Skills (`data/competencies.json`)

Stores all technical competencies, programming languages, platforms, and developer tooling displayed on `index.html`.

### Schema Definition
```json
{
  "competencies": [
    {
      "id": "string",            // Unique slug identifier (e.g., 'javascript')
      "name": "string",          // Display title (e.g., 'JavaScript')
      "category": "string",      // Category name matching CATEGORY_TO_TAB
      "svg": "string",           // Relative path to icon SVG (e.g., 'image/icons/javascript.svg')
      "tooltipText": "string",   // Contextual hover description displayed via CSS ::before
      "projects": ["string"],    // Optional list of portfolio projects utilizing this competency
      "check": "string"          // Path to verification check SVG ('check-primary.svg' or 'check-secondary.svg')
    }
  ]
}
```

### Supported Categories:
1. `Languages & Frameworks` (`#tab-languages`)
2. `DevOps & Infrastructure` (`#tab-devops`)
3. `Security & Compliance` (`#tab-security`)
4. `Platforms & Operating Systems` (`#tab-platforms`)
5. `Developer Tools & Environments` (`#tab-tools`)

### Checkmark Indicators:
- `image/icons/check-primary.svg`: Primary / core competency.
- `image/icons/check-secondary.svg`: Secondary / familiar competency.

---

## 2. Qualifications & Training (`data/qualifications.json`)

Stores academic degrees, certifications, bootcamps, and technical accreditations displayed on `index.html` in the auto-scrolling ticker.

### Schema Definition
```json
{
  "qualifications": [
    {
      "id": "string",                  // Unique identifier (e.g., 'tech-it-ifage')
      "qualification_name": "string",  // Title of the qualification (e.g., 'Technicien IT')
      "school": "string",              // Institution or platform (e.g., 'IFAGE', 'Udemy')
      "date": "string",                // Year or date range (e.g., '2025', '2023 - 2024')
      "competence": "string",          // Key competencies gained (e.g., 'Systems Admin, Networking')
      "description": "string"          // Detailed description shown in the interactive hover tooltip
    }
  ]
}
```

### Ticker Behavior:
- Rendered into a viewport displaying 5 qualifications simultaneously.
- Every 4 seconds, the ticker scrolls upwards by 3 items.
- On mouse hover (`mouseenter`), auto-scrolling pauses and an interactive tooltip bar displays the `competence` and `description`.
- On mouse leave (`mouseleave`), auto-scrolling resumes.

---

## 3. Projects Portfolio (`data/projects.json`)

Stores all portfolio projects displayed on `projects.html` categorized into four tabs.

### Schema Definition
```json
{
  "categories": [
    "Web Projects",
    "Java",
    "Full Stack",
    "Other"
  ],
  "projects": [
    {
      "id": "string",             // Unique slug identifier (e.g., 'colour-game')
      "title": "string",          // Project title (e.g., 'Colour Game')
      "category": "string",       // One of the 4 defined categories
      "image": "string",          // Relative path to project thumbnail image
      "description": "string",    // Short project summary
      "tags": ["string"],         // Array of technology badges (e.g., ['JavaScript', 'CSS3'])
      "demoUrl": "string",        // Live demonstration link or '#'
      "githubUrl": "string"       // Source code repository URL or '#'
    }
  ]
}
```

### Categories & Tab Switcher:
- `Web Projects`: Frontend HTML5/CSS3/JavaScript interactive web tools.
- `Java`: Java and Spring Boot backend applications.
- `Full Stack`: End-to-end full stack web applications.
- `Other`: Community initiatives, cybersecurity projects, and scripts.

---

## 4. Best Practices for Modifying Data

1. **Keep IDs unique**: Slugs should be lowercase alphanumeric with hyphens (`web-dev-ifage`).
2. **Verify asset paths**: Make sure all paths referenced in `svg` or `image` exist in `image/` or `image/icons/`.
3. **Validate JSON formatting**: Avoid trailing commas; ensure valid JSON before committing.
