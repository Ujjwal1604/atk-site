document.addEventListener('DOMContentLoaded', () => {
    // ------------------------
    // THEME TOGGLE CODE
    // ------------------------
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
        const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

        const applyTheme = (theme) => {
            if (theme === 'dark') {
                document.body.classList.add('dark-mode');
                themeToggle.innerHTML = sunIcon;
            } else {
                document.body.classList.remove('dark-mode');
                themeToggle.innerHTML = moonIcon;
            }
        };

        themeToggle.addEventListener('click', () => {
            const newTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
            localStorage.setItem('theme', newTheme);
            applyTheme(newTheme);
        });

        let savedTheme = localStorage.getItem('theme');
        if (!savedTheme) {
            savedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        applyTheme(savedTheme);
    }

    // ------------------------
    // PUBLICATIONS FILTER LOGIC
    // ------------------------
    if (document.getElementById("pub-list")) {
        initPublicationSearch();
    }

    // ------------------------
    // FOOTER TRANSPERANCY LOGIC
    // ------------------------
    window.addEventListener('scroll', updateFooterTransparency);
    window.addEventListener('resize', updateFooterTransparency);
    requestAnimationFrame(updateFooterTransparency); // safer on first frame

    // ------------------------
    // ALUMNI FILTER LOGIC
    // ------------------------
    setupSearch('phd-search', 'phd-results', 'phd-no-results');
    setupSearch('postdoc-search', 'postdoc-results', 'postdoc-no-results');
    setupSearch('joint-phd-search', 'joint-phd', 'joint-phd-no-results');
    setupSearch('pg-search', 'pg-projects', 'pg-no-results');
    setupSearch('btech-search', 'btech-projects', 'btech-no-results');

});


function initPublicationSearch() {
    extractFilters();
    document.getElementById("search-box").addEventListener("input", filterPublications);
    document.getElementById("year-filter").addEventListener("change", filterPublications);
    document.getElementById("journal-filter").addEventListener("change", filterPublications);
}

function extractFilters() {
    const items = document.querySelectorAll(".searchable");
    const years = new Set();
    const journals = new Set();

    items.forEach(item => {
        const citationEl = item.querySelector(".citation");
        const yearEl = citationEl.querySelector("b");
        const journalEl = citationEl.querySelector("i");

        if (yearEl) {
            const year = yearEl.textContent.trim();
            item.dataset.year = year;
            years.add(year);
        }

        if (journalEl) {
            const journal = journalEl.textContent.trim();
            item.dataset.journal = journal;
            journals.add(journal);
        }

        // Store original HTML to restore formatting later
        citationEl.dataset.original = citationEl.innerHTML;
    });

    const yearSelect = document.getElementById("year-filter");
    [...years].sort((a, b) => b - a).forEach(y => {
        yearSelect.add(new Option(y, y));
    });

    const journalSelect = document.getElementById("journal-filter");
    [...journals].sort().forEach(j => {
        journalSelect.add(new Option(j, j));
    });
}

function filterPublications() {
    const query = document.getElementById("search-box").value.toLowerCase();
    const year = document.getElementById("year-filter").value;
    const journal = document.getElementById("journal-filter").value;

    document.querySelectorAll(".searchable").forEach(item => {
        const citationSpan = item.querySelector(".citation");
        const originalHTML = citationSpan.dataset.original;
        const rawText = citationSpan.textContent.toLowerCase();

        const matchesQuery = rawText.includes(query);
        const matchesYear = !year || item.dataset.year === year;
        const matchesJournal = !journal || item.dataset.journal === journal;

        if (matchesQuery && matchesYear && matchesJournal) {
            item.style.display = "list-item";

            if (query) {
                const tempDiv = document.createElement("div");
                tempDiv.innerHTML = originalHTML;

                const walker = document.createTreeWalker(tempDiv, NodeFilter.SHOW_TEXT);
                while (walker.nextNode()) {
                    const node = walker.currentNode;
                    const regex = new RegExp(`(${query})`, "gi");
                    if (regex.test(node.nodeValue)) {
                        const span = document.createElement("span");
                        span.innerHTML = node.nodeValue.replace(regex, "<mark>$1</mark>");
                        node.parentNode.replaceChild(span, node);
                    }
                }

                citationSpan.innerHTML = tempDiv.innerHTML;
            } else {
                citationSpan.innerHTML = originalHTML;
            }
        } else {
            item.style.display = "none";
            citationSpan.innerHTML = originalHTML;
        }
    });
}



function updateFooterTransparency() {
    const footer = document.getElementById('sticky-footer');
    if (!footer) return;

    const distanceToBottom = document.documentElement.scrollHeight - (window.scrollY + window.innerHeight);

    if (distanceToBottom < 5) {
        footer.classList.add('opaque');
    } else {
        footer.classList.remove('opaque');
    }
}

function setupSearch(searchInputId, containerId, noResultsId) {
    const searchInput = document.getElementById(searchInputId);
    const container = document.getElementById(containerId);
    const noResults = document.getElementById(noResultsId);
    
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        const items = container.querySelectorAll('[data-searchable]');
        let visibleCount = 0;
        
        items.forEach(item => {
            const searchText = item.getAttribute('data-searchable');
            if (!query || searchText.includes(query)) {
                item.style.display = '';
                visibleCount++;
            } else {
                item.style.display = 'none';
            }
        });
        
        if (visibleCount === 0) {
            noResults.classList.remove('d-none');
            // Hide table if it's a table container
            const table = container.querySelector('.table-responsive');
            if (table) table.style.display = 'none';
        } else {
            noResults.classList.add('d-none');
            const table = container.querySelector('.table-responsive');
            if (table) table.style.display = '';
        }
    });
}