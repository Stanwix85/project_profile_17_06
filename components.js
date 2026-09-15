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
 * Configures the CV language selection dropdown:
 * - Toggles dropdown on click
 * - Manages ARIA expanded states
 * - Closes dropdown on outside click or Escape key
 */
function setupCvDropdown(headerElement) {
    const dropdown = headerElement.querySelector('.cv-dropdown');
    if (!dropdown) return;

    const toggleBtn = dropdown.querySelector('.cv-dropdown-toggle');
    const menu = dropdown.querySelector('.cv-dropdown-menu');
    if (!toggleBtn || !menu) return;

    function openMenu() {
        dropdown.classList.add('open');
        toggleBtn.setAttribute('aria-expanded', 'true');
    }

    function closeMenu() {
        dropdown.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
    }

    toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (dropdown.classList.contains('open')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
            closeMenu();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMenu();
        }
    });

    menu.querySelectorAll('.cv-dropdown-item').forEach(item => {
        item.addEventListener('click', () => {
            closeMenu();
        });
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
        try {
            setupCvDropdown(headerElement);
        } catch (err) {
            console.error('[components.js] Error in setupCvDropdown:', err);
        }
    });
    loadComponent('site-footer', 'components/footer.html');
    
    // Load competencies data
    try {
        loadCompetencies();
    } catch (err) {
        console.error('[components.js] Error in loadCompetencies:', err);
    }

    // Load qualifications ticker (on index.html)
    try {
        loadQualifications();
    } catch (err) {
        console.error('[components.js] Error in loadQualifications:', err);
    }

    // Load dynamic projects (on projects.html)
    try {
        loadProjects();
    } catch (err) {
        console.error('[components.js] Error in loadProjects:', err);
    }

    // Configure contact form AJAX handler (on index.html)
    try {
        setupContactForm();
    } catch (err) {
        console.error('[components.js] Error in setupContactForm:', err);
    }
});

/**
 * Loads qualifications from data/qualifications.json
 * - Displays 5 items at a time in the viewport
 * - Automatically scrolls up by 3 items every 4 seconds in a continuous loop
 * - Pauses on hover
 * - Displays training competencies and description in the interactive tooltip bar on hover
 */
let tickerTimer = null;

async function loadQualifications() {
    const listElement = document.getElementById('qualifications-list');
    const viewportElement = document.getElementById('qualifications-viewport');
    if (!listElement || !viewportElement) return;

    try {
        const response = await fetch('data/qualifications.json');
        if (!response.ok) {
            throw new Error(`Failed to load qualifications.json (status: ${response.status})`);
        }
        const data = await response.json();
        let qualifications = data.qualifications || [];
        if (qualifications.length === 0) return;

        // Ensure at least 8 items for a smooth 5-visible + 3-scrolling buffer
        while (qualifications.length < 8) {
            qualifications = qualifications.concat(data.qualifications || []);
        }

        const placeholderEl = document.getElementById('tooltip-placeholder');
        const contentEl = document.getElementById('tooltip-content');
        const titleEl = document.getElementById('tooltip-qual-title');
        const metaEl = document.getElementById('tooltip-qual-meta');
        const compEl = document.getElementById('tooltip-competence-text');
        const descEl = document.getElementById('tooltip-description-text');

        function showTooltip(item) {
            if (placeholderEl && contentEl) {
                placeholderEl.style.display = 'none';
                contentEl.style.display = 'block';
            }
            if (titleEl) titleEl.textContent = item.qualification_name;
            if (metaEl) metaEl.textContent = `${item.school} • ${item.date}`;
            if (compEl) compEl.textContent = item.competence;
            if (descEl) descEl.textContent = item.description;
        }

        // Render rows
        listElement.innerHTML = '';
        qualifications.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'qualification-row';
            li.setAttribute('data-id', item.id || `qual-${index}`);
            li.setAttribute('tabindex', '0');

            const mainDiv = document.createElement('div');
            mainDiv.className = 'qual-col-main';

            const qualTitle = document.createElement('span');
            qualTitle.className = 'qual-title-text';
            qualTitle.textContent = item.qualification_name;

            const qualSchool = document.createElement('span');
            qualSchool.className = 'qual-school-text';
            qualSchool.textContent = ` — ${item.school}`;

            mainDiv.appendChild(qualTitle);
            mainDiv.appendChild(qualSchool);

            const dateSpan = document.createElement('span');
            dateSpan.className = 'qual-col-date';
            dateSpan.textContent = item.date;

            li.appendChild(mainDiv);
            li.appendChild(dateSpan);

            // Hover & Focus events for tooltip and pause
            li.addEventListener('mouseenter', () => {
                pauseTicker();
                listElement.querySelectorAll('.qualification-row').forEach(r => r.classList.remove('active-hover'));
                li.classList.add('active-hover');
                showTooltip(item);
            });

            li.addEventListener('focus', () => {
                pauseTicker();
                listElement.querySelectorAll('.qualification-row').forEach(r => r.classList.remove('active-hover'));
                li.classList.add('active-hover');
                showTooltip(item);
            });

            // Mobile click/tap interaction
            li.addEventListener('click', () => {
                listElement.querySelectorAll('.qualification-row').forEach(r => r.classList.remove('active-hover'));
                li.classList.add('active-hover');
                showTooltip(item);
            });

            listElement.appendChild(li);
        });

        // Continuous Loop Animation
        let isAnimating = false;

        function scrollNext() {
            if (isAnimating) return;
            const items = listElement.querySelectorAll('.qualification-row');
            if (items.length < 5) return;

            const firstItemHeight = items[0].getBoundingClientRect().height || 48;
            const scrollDistance = firstItemHeight * 3;

            isAnimating = true;
            listElement.style.transition = 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)';
            listElement.style.transform = `translateY(-${scrollDistance}px)`;

            setTimeout(() => {
                // Move top 3 items to bottom
                for (let i = 0; i < 3; i++) {
                    const topItem = listElement.querySelector('.qualification-row');
                    if (topItem) {
                        listElement.appendChild(topItem);
                    }
                }
                // Instantly reset translateY to 0
                listElement.style.transition = 'none';
                listElement.style.transform = 'translateY(0)';
                void listElement.offsetHeight; // Force DOM reflow
                isAnimating = false;
            }, 720);
        }

        function startTicker() {
            if (tickerTimer) clearInterval(tickerTimer);
            tickerTimer = setInterval(scrollNext, 4000);
        }

        function pauseTicker() {
            if (tickerTimer) {
                clearInterval(tickerTimer);
                tickerTimer = null;
            }
        }

        // Viewport hover handlers
        viewportElement.addEventListener('mouseenter', pauseTicker);
        viewportElement.addEventListener('mouseleave', () => {
            listElement.querySelectorAll('.qualification-row').forEach(r => r.classList.remove('active-hover'));
            startTicker();
        });

        startTicker();
        console.log('[components.js] Qualifications ticker active');
    } catch (err) {
        console.warn('[components.js] Could not load qualifications.json via fetch():', err);
    }
}

/**
 * Opens a project live demo in a centered popup window.
 * - Laptop/desktop screens (>= 768px): fixed size around 600px x 600px.
 * - Mobile/tablet screens (< 768px): dynamically scaled to fit within the viewport (95vw / 95vh).
 * - Graceful fallback to opening in a new tab if popup blockers intercept the window.
 */
function openDemoPopup(url, title = 'Project Demo') {
    const screenW = window.screen.availWidth || window.innerWidth || 800;
    const screenH = window.screen.availHeight || window.innerHeight || 700;

    let width = 600;
    let height = 620;

    // Small devices scale dynamically based on screen size
    if (screenW < 768 || screenH < 680) {
        width = Math.min(600, Math.floor(screenW * 0.95));
        height = Math.min(620, Math.floor(screenH * 0.95));
    }

    const left = Math.max(0, Math.floor((screenW - width) / 2));
    const top = Math.max(0, Math.floor((screenH - height) / 2));

    const windowFeatures = `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=no,toolbar=no,menubar=no,location=no`;

    try {
        const popup = window.open(url, 'ProjectDemoWindow', windowFeatures);
        if (!popup || popup.closed || typeof popup.closed === 'undefined') {
            window.open(url, '_blank', 'noopener,noreferrer');
        } else {
            popup.focus();
        }
    } catch (err) {
        console.warn('[components.js] Popup blocked, opening in new tab:', err);
        window.open(url, '_blank', 'noopener,noreferrer');
    }
}

/**
 * Loads projects from data/projects.json
 * - Configures category selector squares (tabs)
 * - Renders project cards with tech tags and links
 * - Updates category item counts
 */
async function loadProjects() {
    const gridElement = document.getElementById('projects-grid');
    if (!gridElement) return;

    try {
        const response = await fetch('data/projects.json');
        if (!response.ok) {
            throw new Error(`Failed to load projects.json (status: ${response.status})`);
        }
        const data = await response.json();
        const projects = data.projects || [];
        const categories = data.categories || ['Web Projects', 'Java', 'Full Stack', 'Other'];

        // Update counts in category tabs
        categories.forEach(cat => {
            const count = projects.filter(p => p.category === cat).length;
            const slug = cat.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const countEl = document.getElementById(`count-${slug}`);
            if (countEl) countEl.textContent = count;
        });

        let activeCategory = 'Web Projects';

        function renderProjects(category) {
            gridElement.innerHTML = '';
            const filtered = projects.filter(p => p.category === category);

            if (filtered.length === 0) {
                gridElement.innerHTML = `
                    <div class="no-projects-msg">
                        <p>Projects in <strong>${category}</strong> will be added shortly.</p>
                    </div>`;
                return;
            }

            filtered.forEach(p => {
                const card = document.createElement('article');
                card.className = 'project-card';
                card.setAttribute('data-category', p.category);

                // Project Image
                const imgContainer = document.createElement('div');
                imgContainer.className = 'project-card-image-wrapper';

                const img = document.createElement('img');
                img.src = p.image || 'image/code.png';
                img.alt = `${p.title} preview`;
                img.className = 'project-card-img';
                imgContainer.appendChild(img);

                // Project Content
                const body = document.createElement('div');
                body.className = 'project-card-body';

                const catBadge = document.createElement('span');
                catBadge.className = 'project-category-badge';
                catBadge.textContent = p.category;

                const title = document.createElement('h3');
                title.className = 'project-card-title';
                title.textContent = p.title;

                const desc = document.createElement('p');
                desc.className = 'project-card-desc';
                desc.textContent = p.description;

                const tagsDiv = document.createElement('div');
                tagsDiv.className = 'project-tags';
                (p.tags || []).forEach(tag => {
                    const tagSpan = document.createElement('span');
                    tagSpan.className = 'project-tag-pill';
                    tagSpan.textContent = tag;
                    tagsDiv.appendChild(tagSpan);
                });

                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'project-card-actions';

                if (p.demoUrl && p.demoUrl !== '#') {
                    const demoLink = document.createElement('a');
                    demoLink.href = p.demoUrl;
                    demoLink.className = 'btn-project btn-demo';
                    demoLink.textContent = 'Live Demo ↗';

                    const isPopupDemo = p.popup === true || p.id === 'colour-game-project' || (typeof p.demoUrl === 'string' && p.demoUrl.includes('myGame'));

                    if (isPopupDemo) {
                        demoLink.setAttribute('role', 'button');
                        demoLink.setAttribute('aria-label', `Play ${p.title} live demo in popup window`);
                        demoLink.addEventListener('click', (e) => {
                            e.preventDefault();
                            openDemoPopup(p.demoUrl, p.title);
                        });
                    } else {
                        demoLink.target = p.demoUrl.startsWith('http') ? '_blank' : '_self';
                        if (p.demoUrl.startsWith('http')) demoLink.rel = 'noopener noreferrer';
                    }

                    actionsDiv.appendChild(demoLink);
                }

                if (p.githubUrl && p.githubUrl !== '#') {
                    const ghLink = document.createElement('a');
                    ghLink.href = p.githubUrl;
                    ghLink.target = '_blank';
                    ghLink.rel = 'noopener noreferrer';
                    ghLink.className = 'btn-project btn-github';
                    ghLink.textContent = 'GitHub';
                    actionsDiv.appendChild(ghLink);
                }

                body.appendChild(catBadge);
                body.appendChild(title);
                body.appendChild(desc);
                body.appendChild(tagsDiv);
                if (actionsDiv.children.length > 0) {
                    body.appendChild(actionsDiv);
                }

                card.appendChild(imgContainer);
                card.appendChild(body);
                gridElement.appendChild(card);
            });

            // Adjust single leftover cards to span full row and center
            updateGridCardSpans();
        }

        /**
         * Checks if the last row of the projects grid contains leftover cards.
         * - On desktop (> 1024px, 3 across):
         *     - Remainder 1: Spans full width and displays in the middle.
         *     - Remainder 2: Offsets the pair to display in the middle.
         * - On tablet/medium (> 700px up to 1024px, 2 across):
         *     - Remainder 1: Spans full width and displays in the middle.
         */
        function updateGridCardSpans() {
            const cards = Array.from(gridElement.querySelectorAll('.project-card'));
            if (cards.length === 0) return;

            // Reset full-span and pair-start classes
            cards.forEach(card => {
                card.classList.remove('project-card-span-full', 'project-card-pair-start');
            });

            const winWidth = window.innerWidth;

            if (winWidth > 1024) {
                // 3 across layout
                const remainder = cards.length % 3;
                if (remainder === 1) {
                    cards[cards.length - 1].classList.add('project-card-span-full');
                } else if (remainder === 2) {
                    cards[cards.length - 2].classList.add('project-card-pair-start');
                }
            } else if (winWidth > 700) {
                // 2 across layout
                const remainder = cards.length % 2;
                if (remainder === 1) {
                    cards[cards.length - 1].classList.add('project-card-span-full');
                }
            }
        }

        // Re-evaluate card spans when the viewport is resized
        window.addEventListener('resize', updateGridCardSpans);

        // Wire category tab click handlers
        const categoryCards = document.querySelectorAll('.project-category-card');
        categoryCards.forEach(btn => {
            btn.addEventListener('click', () => {
                categoryCards.forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-selected', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');
                activeCategory = btn.getAttribute('data-category');
                renderProjects(activeCategory);
            });
        });

        // Initial render with default category
        renderProjects(activeCategory);
        console.log('[components.js] Projects loaded successfully');
    } catch (err) {
        console.warn('[components.js] Could not load projects.json via fetch():', err);
    }
}

/**
 * Configures contact form AJAX submission:
 * - Prevents default full-page redirect to Google Apps Script.
 * - Submits form data via fetch() using POST and no-cors mode.
 * - Provides inline user feedback (sending, success message, or error).
 */
function setupContactForm() {
    const form = document.getElementById('contact-form') || document.querySelector('#contact form');
    if (!form) return;

    let statusDiv = form.querySelector('.contact-status-msg');
    if (!statusDiv) {
        statusDiv = document.createElement('div');
        statusDiv.className = 'contact-status-msg mt-3';
        statusDiv.style.display = 'none';
        form.appendChild(statusDiv);
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.textContent : 'Submit';

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
        }

        statusDiv.style.display = 'block';
        statusDiv.className = 'contact-status-msg mt-3 alert alert-info';
        statusDiv.textContent = 'Sending your message...';

        try {
            const formData = new FormData(form);
            const params = new URLSearchParams(formData);
            const actionUrl = form.getAttribute('action');

            await fetch(actionUrl, {
                method: 'POST',
                body: params,
                mode: 'no-cors'
            });

            statusDiv.className = 'contact-status-msg mt-3 alert alert-success';
            statusDiv.textContent = '✅ Thank you! Your message has been sent. I will get back to you shortly.';
            form.reset();

        } catch (err) {
            console.error('[components.js] Contact form submission failed:', err);
            statusDiv.className = 'contact-status-msg mt-3 alert alert-danger';
            statusDiv.textContent = '⚠️ Could not send message automatically. Please email me directly at andrewstanwix@gmail.com.';
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        }
    });
}

