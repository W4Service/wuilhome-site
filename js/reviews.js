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
        'Airbnb': '<svg width="16" height="16" viewBox="0 0 24 24" fill="#FF5A5F"><path d="M12.001 18.275c-1.353-1.697-2.217-3.229-2.531-4.534-.24-.97-.18-1.79.09-2.477.27-.687.72-1.223 1.35-1.607.63-.39 1.32-.585 2.07-.585.75 0 1.44.195 2.07.585.63.384 1.08.92 1.35 1.607.27.687.33 1.507.09 2.477-.314 1.305-1.178 2.837-2.531 4.534h.042zm9.549 1.807c-.195 1.307-1.052 2.403-2.278 2.901-.615.255-1.26.375-1.905.375-.54 0-1.08-.09-1.59-.255-1.02-.33-1.935-.93-2.82-1.845-1.5-1.56-2.85-3.675-3.915-6.135-.555-1.29-.975-2.535-1.26-3.735-.285-1.185-.39-2.31-.315-3.375.075-1.065.345-2.025.795-2.88.45-.855 1.065-1.56 1.845-2.115.78-.555 1.695-.87 2.745-.945 1.05-.075 2.085.12 3.105.585 1.02.465 1.92 1.17 2.7 2.115.78.945 1.395 2.085 1.845 3.42.45 1.335.66 2.79.63 4.365-.03 1.575-.3 3.165-.81 4.77-.375 1.185-.87 2.34-1.485 3.465l.045.045c.585-.87 1.095-1.695 1.53-2.475.435-.78.78-1.5 1.035-2.16.255-.66.435-1.29.54-1.89.105-.6.135-1.17.09-1.71-.045-.54-.165-1.035-.36-1.485-.195-.45-.465-.84-.81-1.17-.345-.33-.765-.585-1.26-.765-.495-.18-1.05-.27-1.665-.27-.615 0-1.2.09-1.755.27-.555.18-1.065.45-1.53.81-.465.36-.87.78-1.215 1.26-.345.48-.615 1.02-.81 1.62-.195.6-.3 1.23-.315 1.89-.015.66.06 1.32.225 1.98.165.66.42 1.32.765 1.98.345.66.78 1.32 1.305 1.98.525.66 1.14 1.32 1.845 1.98.705.66 1.5 1.29 2.385 1.89l.03.03z"/></svg>',
        'BookingCom': '<svg width="16" height="16" viewBox="0 0 24 24" fill="#003580"><path d="M2.273 0h19.454C22.982 0 24 1.018 24 2.273v19.454C24 22.982 22.982 24 21.727 24H2.273C1.018 24 0 22.982 0 21.727V2.273C0 1.018 1.018 0 2.273 0zm5.318 6.273c-1.5 0-2.727 1.227-2.727 2.727v6c0 1.5 1.227 2.727 2.727 2.727h1.364V12.91h1.909c1.5 0 2.727-1.227 2.727-2.727v-.182c0-1.5-1.227-2.727-2.727-2.727H7.591zm1.364 2.182h1.909c.3 0 .545.245.545.545v.182c0 .3-.245.545-.545.545H8.955V8.455zm6.136-2.182v11.454h2.182v-4.364h1.909c1.5 0 2.727-1.227 2.727-2.727V9.91c0-1.5-1.227-2.727-2.727-2.727h-4.091zm2.182 2.182h1.909c.3 0 .545.245.545.545v.727c0 .3-.245.545-.545.545h-1.909V8.455z"/></svg>',
        'Booking': '<svg width="16" height="16" viewBox="0 0 24 24" fill="#003580"><path d="M2.273 0h19.454C22.982 0 24 1.018 24 2.273v19.454C24 22.982 22.982 24 21.727 24H2.273C1.018 24 0 22.982 0 21.727V2.273C0 1.018 1.018 0 2.273 0zm5.318 6.273c-1.5 0-2.727 1.227-2.727 2.727v6c0 1.5 1.227 2.727 2.727 2.727h1.364V12.91h1.909c1.5 0 2.727-1.227 2.727-2.727v-.182c0-1.5-1.227-2.727-2.727-2.727H7.591zm1.364 2.182h1.909c.3 0 .545.245.545.545v.182c0 .3-.245.545-.545.545H8.955V8.455zm6.136-2.182v11.454h2.182v-4.364h1.909c1.5 0 2.727-1.227 2.727-2.727V9.91c0-1.5-1.227-2.727-2.727-2.727h-4.091zm2.182 2.182h1.909c.3 0 .545.245.545.545v.727c0 .3-.245.545-.545.545h-1.909V8.455z"/></svg>'
    };

    // Formater la date en français
    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('fr-FR', options);
    }

    // Générer les étoiles
    function generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
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

        const platformIcon = platformIcons[review.platform] || platformIcons['Booking'];
        const platformName = review.platform === 'BookingCom' ? 'Booking.com' : review.platform;

        card.innerHTML = `
            <div class="review-platform">
                ${platformIcon}
                <span>${platformName}</span>
            </div>
            <p class="testimonial-text">${truncateComment(review.comment)}</p>
            <div class="testimonial-author">
                <div class="testimonial-avatar" style="background: linear-gradient(135deg, #1E3A5F, #2291D3);">${getInitials(review.guest_name)}</div>
                <div class="testimonial-info">
                    <div class="name">${review.guest_name}</div>
                    <div class="role">${formatDate(review.date)}</div>
                    <div class="testimonial-rating">${generateStars(review.rating)}</div>
                </div>
            </div>
        `;

        return card;
    }

    // Charger et afficher les avis
    async function loadReviews(containerId, limit = 15) {
        const container = document.getElementById(containerId);
        if (!container) return;

        try {
            const response = await fetch(REVIEWS_JSON_PATH);
            if (!response.ok) throw new Error('Failed to fetch reviews');

            const data = await response.json();

            if (!data.reviews || data.reviews.length === 0) {
                container.innerHTML = '<p class="no-reviews">Aucun avis disponible pour le moment.</p>';
                return;
            }

            // Vider le conteneur
            container.innerHTML = '';

            // Créer la grille
            const grid = document.createElement('div');
            grid.className = 'reviews-grid';

            // Ajouter les avis (limité au nombre demandé)
            const reviewsToShow = data.reviews.slice(0, limit);
            reviewsToShow.forEach(review => {
                grid.appendChild(createReviewCard(review));
            });

            container.appendChild(grid);

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
        // Pour index.html - charger au clic sur l'onglet Voyageurs
        const travelersTab = document.querySelector('[data-target="travelers"]');
        const travelersContainer = document.getElementById('travelers-reviews');

        if (travelersTab && travelersContainer) {
            let loaded = false;
            travelersTab.addEventListener('click', function() {
                if (!loaded) {
                    loadReviews('travelers-reviews', 3);
                    loaded = true;
                }
            });
        }

        // Pour avis/index.html - charger au clic sur l'onglet Voyageurs
        const guestsTab = document.querySelector('[data-target="guests"]');
        const guestsContainer = document.getElementById('guests-reviews');

        if (guestsTab && guestsContainer) {
            let loaded = false;
            guestsTab.addEventListener('click', function() {
                if (!loaded) {
                    loadReviews('guests-reviews', 15);
                    loaded = true;
                }
            });
        }
    });
})();
