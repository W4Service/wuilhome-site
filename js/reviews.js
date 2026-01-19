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
        'Airbnb': '<svg width="14" height="14" viewBox="0 0 64 64" fill="#FF5A5F"><path d="M32 48.8c-3.5-4.4-5.7-8.5-6.5-11.9-.3-1.3-.4-2.6-.2-3.9.1-1 .5-1.9 1-2.7.6-.9 1.5-1.6 2.6-2 1.1-.4 2.2-.6 3.1-.6.9 0 1.8.2 2.6.6 1.1.4 2 1.1 2.6 2 .5.8.9 1.7 1 2.7.2 1.3.1 2.6-.2 3.9-.8 3.4-3 7.5-6.5 11.9zm25.6 3c-.5 3.3-2.7 6.2-5.8 7.4-1.3.5-2.6.8-3.9.8-1.2 0-2.3-.2-3.4-.5-2.1-.7-3.9-2-5.7-3.7-3-3.1-5.7-7.4-7.8-12.3-1.1-2.6-2-5.1-2.5-7.5-.6-2.4-.8-4.6-.6-6.8.2-2.1.7-4 1.6-5.8.9-1.7 2.1-3.1 3.7-4.2 1.6-1.1 3.4-1.7 5.5-1.9 2.1-.2 4.2.2 6.2 1.2 2 .9 3.8 2.3 5.4 4.2 1.6 1.9 2.8 4.2 3.7 6.8.9 2.7 1.3 5.6 1.3 8.7 0 3.2-.6 6.3-1.6 9.5-.8 2.4-1.7 4.7-3 6.9z"/></svg>',
        'BookingCom': '<svg width="14" height="14" viewBox="0 0 24 24" fill="#003580"><path d="M2.273 0h19.454C22.982 0 24 1.018 24 2.273v19.454C24 22.982 22.982 24 21.727 24H2.273C1.018 24 0 22.982 0 21.727V2.273C0 1.018 1.018 0 2.273 0zm5.318 6.273c-1.5 0-2.727 1.227-2.727 2.727v6c0 1.5 1.227 2.727 2.727 2.727h1.364V12.91h1.909c1.5 0 2.727-1.227 2.727-2.727v-.182c0-1.5-1.227-2.727-2.727-2.727H7.591zm1.364 2.182h1.909c.3 0 .545.245.545.545v.182c0 .3-.245.545-.545.545H8.955V8.455zm6.136-2.182v11.454h2.182v-4.364h1.909c1.5 0 2.727-1.227 2.727-2.727V9.91c0-1.5-1.227-2.727-2.727-2.727h-4.091zm2.182 2.182h1.909c.3 0 .545.245.545.545v.727c0 .3-.245.545-.545.545h-1.909V8.455z"/></svg>',
        'Booking': '<svg width="14" height="14" viewBox="0 0 24 24" fill="#003580"><path d="M2.273 0h19.454C22.982 0 24 1.018 24 2.273v19.454C24 22.982 22.982 24 21.727 24H2.273C1.018 24 0 22.982 0 21.727V2.273C0 1.018 1.018 0 2.273 0zm5.318 6.273c-1.5 0-2.727 1.227-2.727 2.727v6c0 1.5 1.227 2.727 2.727 2.727h1.364V12.91h1.909c1.5 0 2.727-1.227 2.727-2.727v-.182c0-1.5-1.227-2.727-2.727-2.727H7.591zm1.364 2.182h1.909c.3 0 .545.245.545.545v.182c0 .3-.245.545-.545.545H8.955V8.455zm6.136-2.182v11.454h2.182v-4.364h1.909c1.5 0 2.727-1.227 2.727-2.727V9.91c0-1.5-1.227-2.727-2.727-2.727h-4.091zm2.182 2.182h1.909c.3 0 .545.245.545.545v.727c0 .3-.245.545-.545.545h-1.909V8.455z"/></svg>'
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
