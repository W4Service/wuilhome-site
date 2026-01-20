/**
 * Wuilhome Reviews Widget
 * Charge et affiche les avis depuis Channex via le fichier JSON
 */

(function() {
    'use strict';

    // Configuration
    const REVIEWS_JSON_PATH = '/data/reviews.json';

    // Icônes des plateformes
    const platformIcons = {
        'Airbnb': '<svg width="14" height="14" viewBox="0 0 64 64" fill="#FF5A5F"><path d="M60.9 45.487l-.966-2.305-1.475-3.27-.062-.062a661.83 661.83 0 0 0-14.15-28.957l-.198-.384-1.524-3.073a18.4 18.4 0 0 0-2.305-3.52A10.35 10.35 0 0 0 32.027 0a10.76 10.76 0 0 0-8.203 3.84 22.1 22.1 0 0 0-2.305 3.52l-1.735 3.395c-4.956 9.615-9.74 19.342-14.163 28.957l-.062.124c-.384 1.053-.892 2.13-1.413 3.284-.322.702-.644 1.47-.966 2.305a14.4 14.4 0 0 0-.768 6.914 13.63 13.63 0 0 0 8.327 10.631 13.16 13.16 0 0 0 5.192 1.028 14.57 14.57 0 0 0 1.66-.124 16.93 16.93 0 0 0 6.406-2.18 32.44 32.44 0 0 0 7.943-6.666 33.62 33.62 0 0 0 7.943 6.666 16.92 16.92 0 0 0 6.406 2.18c.55.073 1.105.114 1.66.124 1.783.018 3.55-.332 5.192-1.028a13.63 13.63 0 0 0 8.327-10.631 12.11 12.11 0 0 0-.582-6.852zM32.026 48.82c-3.457-4.362-5.7-8.45-6.468-11.92-.314-1.277-.38-2.6-.198-3.903.127-.965.48-1.886 1.028-2.7a6.79 6.79 0 0 1 5.638-2.825c2.236-.086 4.362.974 5.638 2.813a6.17 6.17 0 0 1 1.028 2.69 10.3 10.3 0 0 1-.198 3.903c-.768 3.395-3 7.435-6.468 11.92zm25.562 3c-.5 3.337-2.7 6.166-5.836 7.435a9.7 9.7 0 0 1-4.857.706 12.6 12.6 0 0 1-4.87-1.66 29.91 29.91 0 0 1-7.298-6.195c4.225-5.192 6.8-9.913 7.757-14.163a16.11 16.11 0 0 0 .322-5.452c-.238-1.567-.832-3.06-1.735-4.362-2.062-2.942-5.453-4.666-9.045-4.597-3.572-.046-6.942 1.65-9.033 4.547-.903 1.303-1.497 2.794-1.735 4.362a13.31 13.31 0 0 0 .322 5.452c.966 4.225 3.593 9.033 7.757 14.225a28.79 28.79 0 0 1-7.298 6.195 12.6 12.6 0 0 1-4.882 1.71 10.26 10.26 0 0 1-4.87-.644C9.16 58.12 6.94 55.292 6.45 51.954a10.61 10.61 0 0 1 .582-4.956c.198-.644.508-1.24.83-2.044.446-1.028.966-2.12 1.475-3.2l.062-.124c4.424-9.54 9.157-19.28 14.1-28.772l.186-.458 1.536-2.95a14.05 14.05 0 0 1 1.846-2.838 6.73 6.73 0 0 1 10.247 0 13.87 13.87 0 0 1 1.747 2.813l1.536 2.95.186.384c4.87 9.553 9.628 19.28 14.04 28.834v.062c.508 1.028.966 2.18 1.475 3.2.322.768.644 1.413.83 2.044a10.81 10.81 0 0 1 .446 4.956z" fill-rule="evenodd"/></svg>',
        'BookingCom': '<img src="/images/booking-logo.svg" alt="Booking.com" style="width: 18px; height: 18px; vertical-align: middle;">',
        'Booking': '<img src="/images/booking-logo.svg" alt="Booking.com" style="width: 18px; height: 18px; vertical-align: middle;">'
    };

    // Formater la date en français
    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('fr-FR', options);
    }

    // Générer les étoiles (Airbnb uniquement)
    function generateStars(rating) {
        // Convertir la note /10 en /5
        const ratingOutOf5 = rating / 2;
        const fullStars = Math.floor(ratingOutOf5);
        const hasHalfStar = ratingOutOf5 % 1 >= 0.5;
        let stars = '';

        for (let i = 0; i < fullStars; i++) {
            stars += '★';
        }
        if (hasHalfStar) {
            stars += '☆';
        }
        for (let i = fullStars + (hasHalfStar ? 1 : 0); i < 5; i++) {
            stars += '☆';
        }
        return stars;
    }

    // Générer l'affichage du rating selon la plateforme
    function formatRating(rating, platform) {
        if (platform === 'Booking' || platform === 'BookingCom') {
            // Booking.com : afficher la note sur 10
            return `<span class="booking-rating">${rating}/10</span>`;
        } else {
            // Airbnb : afficher les étoiles
            return generateStars(rating);
        }
    }

    // Obtenir les initiales du nom
    function getInitials(name) {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length === 1) {
            return parts[0].charAt(0).toUpperCase();
        }
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }

    // Tronquer le commentaire si trop long
    function truncateComment(comment, maxLength = 200) {
        if (comment.length <= maxLength) return comment;
        return comment.substring(0, maxLength).trim() + '...';
    }

    // Créer une carte d'avis
    function createReviewCard(review, isAnimated = true) {
        const card = document.createElement('div');
        card.className = 'testimonial-card' + (isAnimated ? ' animate-on-scroll' : '');

        // Forcer la visibilité si non animé
        if (!isAnimated) {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }

        const platformIcon = platformIcons[review.platform] || platformIcons['Booking'];
        const platformName = review.platform === 'BookingCom' ? 'Booking.com' : review.platform;

        card.innerHTML = `
            <div class="testimonial-author">
                <div class="testimonial-info">
                    <div class="name">${review.guest_name}</div>
                    <div class="role">
                        ${platformIcon}
                        <span>${platformName}</span>
                    </div>
                    <div class="testimonial-rating">${formatRating(review.rating, review.platform)}</div>
                </div>
                <div class="testimonial-avatar">${getInitials(review.guest_name)}</div>
            </div>
            <p class="testimonial-text">${truncateComment(review.comment)}</p>
        `;

        return card;
    }

    // Charger et afficher les avis
    async function loadReviews(containerId, limit = 15) {
        console.log('loadReviews called with:', containerId, limit);
        const container = document.getElementById(containerId);
        console.log('Container found:', !!container, container);

        if (!container) {
            console.error('Container not found:', containerId);
            return;
        }

        try {
            console.log('Fetching reviews from:', REVIEWS_JSON_PATH);
            const response = await fetch(REVIEWS_JSON_PATH);
            console.log('Fetch response:', response.ok, response.status);

            if (!response.ok) throw new Error('Failed to fetch reviews');

            const data = await response.json();
            console.log('Reviews data:', data);

            if (!data.reviews || data.reviews.length === 0) {
                console.log('No reviews found');
                container.innerHTML = '<p class="no-reviews">Aucun avis disponible pour le moment.</p>';
                return;
            }

            // Vider le conteneur
            console.log('Clearing container and creating grid');
            container.innerHTML = '';

            // Créer la grille
            const grid = document.createElement('div');
            grid.className = 'reviews-grid';

            // Ajouter les avis (limité au nombre demandé)
            const reviewsToShow = data.reviews.slice(0, limit);
            console.log('Reviews to show:', reviewsToShow.length);

            reviewsToShow.forEach((review, index) => {
                console.log('Adding review', index + 1, review.guest_name);
                grid.appendChild(createReviewCard(review, false));
            });

            container.appendChild(grid);
            console.log('Grid appended to container, reviews loaded!');

            // Réinitialiser les animations si nécessaire
            if (typeof initScrollAnimations === 'function') {
                initScrollAnimations();
            }

        } catch (error) {
            console.error('Error loading reviews:', error);
            container.innerHTML = '<p class="reviews-error">Impossible de charger les avis. Veuillez réessayer plus tard.</p>';
        }
    }

    // Exposer la fonction globalement
    window.WuilhomeReviews = {
        load: loadReviews
    };

    // Charger automatiquement si l'élément existe
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Reviews.js: DOM Content Loaded');

        // Attacher les listeners après un court délai
        setTimeout(function() {
            // Pour index.html - charger quand on clique sur l'onglet Voyageurs
            const travelersBtn = document.querySelector('[data-target="travelers"]');
            console.log('Reviews.js: Travelers button found:', !!travelersBtn);

            if (travelersBtn) {
                let loaded = false;
                travelersBtn.addEventListener('click', function(e) {
                    console.log('Reviews.js: Travelers button clicked, loaded:', loaded);
                    if (!loaded) {
                        loaded = true;
                        // Attendre que l'onglet soit visible
                        requestAnimationFrame(function() {
                            console.log('Reviews.js: Loading travelers reviews...');
                            loadReviews('travelers-reviews', 3);
                        });
                    }
                }, true); // Use capture phase
            }

            // Pour avis/index.html - charger quand on clique sur l'onglet Voyageurs
            const guestsBtn = document.querySelector('[data-target="guests"]');
            console.log('Reviews.js: Guests button found:', !!guestsBtn);

            if (guestsBtn) {
                let loaded = false;
                guestsBtn.addEventListener('click', function(e) {
                    console.log('Reviews.js: Guests button clicked, loaded:', loaded);
                    if (!loaded) {
                        loaded = true;
                        requestAnimationFrame(function() {
                            console.log('Reviews.js: Loading guests reviews...');
                            loadReviews('guests-reviews', 15);
                        });
                    }
                }, true);
            }
        }, 200);
    });
})();
