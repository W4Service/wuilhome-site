/* ============================
   Wuilhome - Main JavaScript
   ============================ */

document.addEventListener('DOMContentLoaded', () => {
    // Navigation scroll effect
    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('navbar');
        if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    // Mobile hamburger menu
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    body.appendChild(overlay);

    function toggleMenu() {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        overlay.classList.toggle('active');
        body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        hamburger.setAttribute('aria-expanded', navLinks.classList.contains('active'));
    }

    function closeMenu() {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        overlay.classList.remove('active');
        body.style.overflow = '';
        hamburger.setAttribute('aria-expanded', 'false');
    }

    if (hamburger) {
        hamburger.addEventListener('click', toggleMenu);
        overlay.addEventListener('click', closeMenu);

        // Close menu on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 991) {
                    closeMenu();
                }
            });
        });

        // Handle dropdown on mobile and keyboard accessibility
        const dropdowns = document.querySelectorAll('.dropdown');
        dropdowns.forEach(dropdown => {
            const dropdownLink = dropdown.querySelector(':scope > a');
            const dropdownMenu = dropdown.querySelector('.dropdown-menu');

            if (dropdownLink) {
                // Mobile: toggle on click
                dropdownLink.addEventListener('click', (e) => {
                    if (window.innerWidth <= 991) {
                        e.preventDefault();
                        dropdown.classList.toggle('active');
                    }
                });

                // Desktop keyboard: toggle on Enter/Space
                dropdownLink.addEventListener('keydown', (e) => {
                    if (window.innerWidth > 991 && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        dropdown.classList.toggle('keyboard-open');
                    }
                    // Arrow down to first menu item
                    if (e.key === 'ArrowDown' && dropdownMenu) {
                        e.preventDefault();
                        const firstLink = dropdownMenu.querySelector('a');
                        if (firstLink) firstLink.focus();
                    }
                });
            }

            // Keyboard navigation within dropdown menu
            if (dropdownMenu) {
                const menuLinks = dropdownMenu.querySelectorAll('a');
                menuLinks.forEach((link, index) => {
                    link.addEventListener('keydown', (e) => {
                        if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            const next = menuLinks[index + 1] || menuLinks[0];
                            next.focus();
                        }
                        if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            const prev = menuLinks[index - 1] || dropdownLink;
                            prev.focus();
                        }
                        if (e.key === 'Escape') {
                            dropdown.classList.remove('keyboard-open');
                            dropdownLink.focus();
                        }
                    });
                });
            }

            // Close dropdown when focus leaves
            dropdown.addEventListener('focusout', (e) => {
                setTimeout(() => {
                    if (!dropdown.contains(document.activeElement)) {
                        dropdown.classList.remove('keyboard-open');
                    }
                }, 0);
            });
        });

        // Close menu on resize to desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth > 991) {
                closeMenu();
                document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('active'));
            }
        });

        // Close menu on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                closeMenu();
            }
        });
    }

    // Scroll animation observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));

    // Testimonials tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.testimonials-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.target).classList.add('active');
        });
    });

    // Mise à jour du lien "Voir tous les avis" selon l'onglet actif
    const testimonialsCta = document.querySelector('.testimonials-cta a');
    if (testimonialsCta) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.target;
                testimonialsCta.href = target === 'travelers' ? 'avis/#voyageurs' : 'avis/';
            });
        });
    }

    // Sur la page avis, activer l'onglet selon le hash de l'URL
    if (window.location.hash === '#voyageurs') {
        const guestsTab = document.querySelector('.tab-btn[data-target="guests"]');
        if (guestsTab) {
            guestsTab.click();
        }
    }

    // FAQ accordion
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', function(e) {
            e.preventDefault();
            const item = this.parentElement;
            const isActive = item.classList.contains('active');

            // Fermer tous les items
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));

            // Ouvrir l'item cliqué s'il n'était pas déjà ouvert
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
});
