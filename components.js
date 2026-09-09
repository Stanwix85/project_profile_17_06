/**
 * components.js
 * Asynchronously loads shared HTML components (header and footer) via fetch(),
 * configures active navigation links, mobile menu behaviors, and theme switching.
 */

// Initialize theme early to avoid theme flashing
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
}
initTheme();

async function loadComponent(elementId, filePath, callback) {
    const targetElement = document.getElementById(elementId);
    if (!targetElement) return;

    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to load ${filePath} (status: ${response.status})`);
        }
        const html = await response.text();
        targetElement.innerHTML = html;
        if (typeof callback === 'function') {
            callback(targetElement);
        }
    } catch (error) {
        console.warn(
            `[components.js] Could not load ${filePath} via fetch(). Note: fetch() requires an HTTP server (e.g. 'python3 -m http.server' or Live Server) and is blocked by browser CORS policy on file:// URLs.`,
            error
        );
    }
}

/**
 * Configures the navigation bar based on the current page:
 * 1. Hides the current page link from desktop nav (.nav-wide) so only other destinations appear.
 * 2. Rewrites in-page anchor links when on index.html for instant smooth scrolling.
 * 3. Closes the mobile hamburger menu when a menu link is tapped.
 */
function setupNavigation(headerElement) {
    const pathname = window.location.pathname;
    const filename = pathname.substring(pathname.lastIndexOf('/') + 1) || 'index.html';
    const isHome = filename === '' || filename === 'index.html';

    // 1. Desktop navigation: hide current page link
    const desktopLinks = headerElement.querySelectorAll('.nav-wide');
    desktopLinks.forEach(link => {
        const pageKey = link.getAttribute('data-page');
        if (isHome && pageKey === 'home') {
            link.style.display = 'none';
        } else if (filename === 'projects.html' && pageKey === 'projects') {
            link.style.display = 'none';
        } else if ((filename === 'hobbies.html' || filename === 'hobbie.html') && pageKey === 'hobbies') {
            link.style.display = 'none';
        }
    });

    // 2. Mobile menu & desktop in-page link smoothing on index.html
    const menuLinks = headerElement.querySelectorAll('#menu a');
    const allNavLinks = headerElement.querySelectorAll('#menu a, .nav-wide');
    if (isHome) {
        allNavLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('index.html#')) {
                link.setAttribute('href', href.replace('index.html', ''));
            }
        });
    }

    // 3. Auto-close mobile burger menu upon link click
    const menuToggle = headerElement.querySelector('#menu-toggle');
    if (menuToggle) {
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.checked = false;
            });
        });
    }
}

/**
 * Configures the dark/light theme toggle button:
 * - Updates button icon and aria-label based on the active theme.
 * - Handles theme toggles and persists preference in localStorage.
 */
function setupThemeToggle(headerElement) {
    const themeToggleBtn = headerElement.querySelector('#theme-toggle');
    if (!themeToggleBtn) return;

    function updateButton(theme) {
        const isDark = theme === 'dark';
        themeToggleBtn.textContent = isDark ? '☀️' : '🌙';
        themeToggleBtn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
        themeToggleBtn.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    }

    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    updateButton(currentTheme);

    themeToggleBtn.addEventListener('click', () => {
        const activeTheme = document.documentElement.getAttribute('data-theme');
        const nextTheme = activeTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem('theme', nextTheme);
        updateButton(nextTheme);
    });
}

/**
 * Configures category tabs switching:
 * - Switches active state on tab buttons and corresponding tab panels.
 * - Updates WAI-ARIA attributes (aria-selected, aria-controls).
 */
function setupTabs() {
    const tabNavs = document.querySelectorAll('[role="tablist"]');
    tabNavs.forEach(tabNav => {
        const tabs = tabNav.querySelectorAll('[role="tab"]');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetId = tab.getAttribute('aria-controls');
                const container = tab.closest('.competence-tabs-wrapper') || document;
                const panels = container.querySelectorAll('[role="tabpanel"]');

                // Update tab buttons
                tabs.forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');

                // Switch active tab panel
                panels.forEach(panel => {
                    panel.classList.remove('active');
                });
                const targetPanel = document.getElementById(targetId);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                }
            });
        });
    });
}

/**
 * Category mapping from tab panel IDs to category names
 */
const CATEGORY_MAP = {
    'tab-languages': 'Languages & Frameworks',
    'tab-devops': 'DevOps & Infrastructure',
    'tab-security': 'Security & Compliance',
    'tab-platforms': 'Platforms & Operating Systems',
    'tab-tools': 'Developer Tools & Environments'
};

/**
 * Category name to tab panel ID mapping
 */
const CATEGORY_TO_TAB = {
    'Languages & Frameworks': 'tab-languages',
    'DevOps & Infrastructure': 'tab-devops',
    'Security & Compliance': 'tab-security',
    'Platforms & Operating Systems': 'tab-platforms',
    'Developer Tools & Environments': 'tab-tools'
};

/**
 * Creates a badge element for a competence
 */
function createCompetenceBadge(competence) {
    const badge = document.createElement('span');
    badge.className = 'competence-badge';
    badge.setAttribute('data-competence-id', competence.id);
    badge.setAttribute('title', competence.tooltipText);

    // Create icon SVG element
    const iconSvg = document.createElement('img');
    iconSvg.className = 'competence-icon';
    iconSvg.src = competence.svg;
    iconSvg.alt = `${competence.name} icon`;
    iconSvg.width = 20;
    iconSvg.height = 20;

    // Create checkmark SVG element
    const checkSvg = document.createElement('img');
    checkSvg.className = 'competence-check';
    checkSvg.src = competence.check;
    checkSvg.alt = 'Checkmark';
    checkSvg.width = 20;
    checkSvg.height = 20;

    // Create name text
    const nameSpan = document.createElement('span');
    nameSpan.className = 'competence-name';
    nameSpan.textContent = competence.name;

    // Build badge structure: icon + name + check
    badge.appendChild(iconSvg);
    badge.appendChild(nameSpan);
    badge.appendChild(checkSvg);

    return badge;
}

/**
 * Loads competencies from JSON and populates the tab panels
 */
async function loadCompetencies() {
    try {
        const response = await fetch('data/competencies.json');
        if (!response.ok) {
            throw new Error(`Failed to load competencies.json (status: ${response.status})`);
        }
        const data = await response.json();
        const competencies = data.competencies || [];

        // Group competencies by category
        const competenciesByCategory = {};
        competencies.forEach(comp => {
            if (!competenciesByCategory[comp.category]) {
                competenciesByCategory[comp.category] = [];
            }
            competenciesByCategory[comp.category].push(comp);
        });

        // For each category, find the matching tab panel and populate it
        Object.keys(CATEGORY_TO_TAB).forEach(categoryName => {
            const tabId = CATEGORY_TO_TAB[categoryName];
            const panel = document.getElementById(tabId);
            
            if (panel && competenciesByCategory[categoryName]) {
                // Clear existing placeholder content
                panel.innerHTML = '';
                
                // Create new content structure
                const contentDiv = document.createElement('div');
                contentDiv.className = 'competence-category-content';
                
                const title = document.createElement('h3');
                title.textContent = categoryName;
                title.className = 'competence-category-title';
                
                const grid = document.createElement('div');
                grid.className = 'competence-grid';
                
                // Add all competence badges
                competenciesByCategory[categoryName].forEach(comp => {
                    const badge = createCompetenceBadge(comp);
                    grid.appendChild(badge);
                });
                
                contentDiv.appendChild(title);
                contentDiv.appendChild(grid);
                panel.appendChild(contentDiv);
            }
        });

        console.log('[components.js] Competencies loaded successfully');
    } catch (error) {
        console.warn(
            '[components.js] Could not load competencies.json via fetch(). Note: fetch() requires an HTTP server (e.g. \'python3 -m http.server\' or Live Server) and is blocked by browser CORS policy on file:// URLs.',
            error
        );
    }
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        setupTabs();
    } catch (err) {
        console.error('[components.js] Error in setupTabs:', err);
    }
    loadComponent('site-header', 'components/header.html', (headerElement) => {
        try {
            setupNavigation(headerElement);
        } catch (err) {
            console.error('[components.js] Error in setupNavigation:', err);
        }
        try {
            setupThemeToggle(headerElement);
        } catch (err) {
            console.error('[components.js] Error in setupThemeToggle:', err);
        }
    });
    loadComponent('site-footer', 'components/footer.html');
    
    // Load competencies data
    try {
        loadCompetencies();
    } catch (err) {
        console.error('[components.js] Error in loadCompetencies:', err);
    }
});
