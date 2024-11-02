// reviews.js
class ReviewsSection {
    constructor() {
        this.currentPage = 1;
        this.reviewsPerPage = 2;
        this.reviews = gymReviews;
        this.filteredReviews = [...this.reviews];
        this.sortOrder = 'emotional';
        this.searchTerm = '';
        this.init();
        this.throttle = this.throttle.bind(this);
        window.toggleReview = this.toggleReview.bind(this);
    }

    init() {
        this.renderReviews();
        this.setupControls();
        this.setupPagination();
        // this.focusSearchInput();
    }
// New method to focus the search input
focusSearchInput() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.focus(); // Automatically focus the search input
    }
}

throttle(func, limit) {
    let lastFunc;
    let lastRan;

    return function(...args) {
        const context = this;

        if (!lastRan) {
            func.apply(context, args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(function() {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(context, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
}

calculateStats() {
    const reviews = this.reviews;
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    
    return {
        totalReviews: reviews.length,
        averageRating: (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1),
        recentReviews: reviews.filter(r => new Date(r.date) > monthAgo).length
    };
}

    toggleReview(button) {
        const card = button.closest('.review-card');
        card.classList.toggle('expanded');
        button.textContent = card.classList.contains('expanded') ? 'View Less' : 'View More';
    }

    sortReviews(reviews) {
        switch (this.sortOrder) {
            case 'newest':
                return [...reviews].sort((a, b) => {
                    const dateA = this.getDateFromRelative(a.date);
                    const dateB = this.getDateFromRelative(b.date);
                    return dateB - dateA;
                });
            case 'oldest':
                return [...reviews].sort((a, b) => {
                    const dateA = this.getDateFromRelative(a.date);
                    const dateB = this.getDateFromRelative(b.date);
                    return dateA - dateB;
                });
            case 'emotional':
                return this.emotionalImpactSort(reviews);
            default:
                return reviews;
        }
    }
    parseRelativeDate(relativeDate) {
        const now = new Date();
        const number = parseInt(relativeDate);
        
        if (relativeDate.includes('month')) {
            const date = new Date(now);
            date.setMonth(date.getMonth() - number);
            return date.getTime();
        } else if (relativeDate.includes('year')) {
            const date = new Date(now);
            date.setFullYear(date.getFullYear() - number);
            return date.getTime();
        } else if (relativeDate.includes('week')) {
            const date = new Date(now);
            date.setDate(date.getDate() - (number * 7));
            return date.getTime();
        } else {
            return now.getTime(); // fallback to current date
        }
    }

    emotionalImpactSort(reviews) {
        const emotionalKeywords = {
            high: ['transformation', 'changed my life', 'journey', 'incredible', 'magic', 
                   'overcome', 'never thought possible', 'anxiety', 'confidence', 
                   'life-changing', 'personal', 'struggle', 'chronic pain', 'amazing',
                   'best decision', 'grateful', 'love', 'passionate', 'supportive'],
            medium: ['excellent', 'great experience', 'community', 'progress', 
                    'improvement', 'dedication', 'helpful', 'motivated', 'encouraging'],
            low: ['good', 'nice', 'okay', 'fine', 'satisfied']
        };

        function getEmotionalScore(text) {
            let score = 0;
            text = text.toLowerCase();
            
            emotionalKeywords.high.forEach(keyword => {
                if (text.includes(keyword.toLowerCase())) score += 3;
            });
            
            emotionalKeywords.medium.forEach(keyword => {
                if (text.includes(keyword.toLowerCase())) score += 2;
            });
            
            emotionalKeywords.low.forEach(keyword => {
                if (text.includes(keyword.toLowerCase())) score += 1;
            });

            score += text.length / 200;
            score += (text.split('.').length - 1) * 0.5;
            
            return score;
        }

        return [...reviews].sort((a, b) => {
            const scoreA = getEmotionalScore(a.text);
            const scoreB = getEmotionalScore(b.text);
            return scoreB - scoreA;
        });
    }
    
    getDateFromRelative(relativeDate) {
        const now = new Date();
        
        // Handle "X days ago"
        if (relativeDate.includes('days ago')) {
            const days = parseInt(relativeDate);
            return now - (days * 24 * 60 * 60 * 1000);
        }
        
        // Handle "a month ago" or "X months ago"
        if (relativeDate.includes('month')) {
            const months = relativeDate.startsWith('a ') ? 1 : parseInt(relativeDate);
            const date = new Date(now);
            date.setMonth(date.getMonth() - months);
            return date.getTime();
        }
        
        // Handle "a year ago" or "X years ago"
        if (relativeDate.includes('year')) {
            const years = relativeDate.startsWith('a ') ? 1 : parseInt(relativeDate);
            const date = new Date(now);
            date.setFullYear(date.getFullYear() - years);
            return date.getTime();
        }
        
        // Handle "X weeks ago"
        if (relativeDate.includes('week')) {
            const weeks = relativeDate.startsWith('a ') ? 1 : parseInt(relativeDate);
            const date = new Date(now);
            date.setDate(date.getDate() - (weeks * 7));
            return date.getTime();
        }
    
        // If we can't parse the date, return current time
        return now.getTime();
    }
    
    filterReviews() {
        // Filter reviews based on the search term
        this.filteredReviews = this.reviews.filter(review => 
            review.text.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
    
        // Sort reviews if sortOrder is specified
        this.filteredReviews = this.sortReviews(this.filteredReviews); // Sort after filtering
    
        // Render the reviews for the current page
        this.renderReviews(); // Render the filtered reviews
    }

    renderStats() {
        const stats = this.calculateStats();
        return `
        `;
    }

    renderControls() {
        return `
            <div class="controls-section">
                <input 
                    type="text" 
                    placeholder="Search reviews..." 
                    class="search-box"
                    id="search-input"
                >
                <select class="sort-select" id="sort-select">
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="emotional">Most Impactful</option>
                </select>
            </div>
        `;
    }

    renderReviews() {
        const sortedReviews = this.sortReviews(this.filteredReviews);
        const startIndex = (this.currentPage - 1) * this.reviewsPerPage;
        const endIndex = startIndex + this.reviewsPerPage;
        const currentReviews = sortedReviews.slice(startIndex, endIndex);
        const reviewsHTML = currentReviews.map((review, index) => `
            <div class="review-card" style="--delay: ${index * 0.1}s">
                <div class="review-header">
                    <div class="avatar">${review.author[0]}</div>
                    <div class="review-info">
                        <h3>${review.author}</h3>
                        <div class="stars-row">
                            ${this.renderStars(review.rating)}
                        </div>
                    </div>
                </div>
                <div class="review-text">
                    ${review.text.split('\n\n').map(paragraph => 
                        `<p>${paragraph.trim()}</p>`
                    ).join('')}
                </div>
                <span class="view-more" onclick="toggleReview(this)">View More</span>
                <div class="review-date">
                    ${review.date}
                </div>
            </div>
        `).join('');

        const reviewsSection = document.getElementById('reviews-section');
        reviewsSection.innerHTML = `
            <div class="reviews-container">
                <div class="section-header">
                    <h2 class="section-title">What Our Members Say</h2>
                    <p class="section-description">
                        Read authentic reviews from our valued members about their experience with us. 
                        Discover how our community, coaches, and facilities have helped them achieve their goals.
                    </p>
                    ${this.renderStats()}
                </div>
                ${this.renderControls()}
                <div class="reviews-grid">
                    ${reviewsHTML}
                </div>
                <div class="pagination">
                    <button class="pagination-button" id="prev-page" ${this.currentPage === 1 ? 'disabled' : ''}>
                        Previous
                    </button>
                    <span>Page ${this.currentPage} of ${Math.ceil(sortedReviews.length / this.reviewsPerPage)}</span>
                    <button class="pagination-button" id="next-page" 
                        ${this.currentPage >= Math.ceil(sortedReviews.length / this.reviewsPerPage) ? 'disabled' : ''}>
                        Next
                    </button>
                </div>
            </div>
        `;
        this.setupControls();
    }

    renderStars(rating) {
        return Array(5).fill(0)
            .map((_, i) => `<span class="${i < rating ? 'star' : 'empty-star'}">★</span>`)
            .join('');
    }

    setupControls() {
        const searchInput = document.getElementById('search-input');
        const sortSelect = document.getElementById('sort-select');
    
        // Set initial values for search input and sort select
        if (searchInput) {
            searchInput.value = this.searchTerm; // Set the initial value
            searchInput.addEventListener('input', this.throttle((e) => {
                this.searchTerm = e.target.value; // Update search term
                this.filterReviews(); // Call to filter reviews
                this.focusSearchInput(); // Retain focus on the search input
            }, 200)); // Throttle with a limit of 200 milliseconds
        }
    
        if (sortSelect) {
            sortSelect.value = this.sortOrder; // Set the initial value
            sortSelect.addEventListener('change', (e) => {
                this.sortOrder = e.target.value; // Update sort order
                this.currentPage = 1; // Reset to the first page when sorting changes
                this.filterReviews(); // Call to filter reviews with new sort order
                this.focusSearchInput(); // Retain focus on the search input
            });
        }
    
        this.setupPagination(); // Call to setup pagination if needed
    }
    setupPagination() {
        const prevButton = document.getElementById('prev-page');
        const nextButton = document.getElementById('next-page');
    
        if (prevButton) {
            prevButton.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.renderReviews();
                }
            });
        }
    
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                console.log('Filtered Reviews Length:', this.filteredReviews.length);
                console.log('Current Page Before Increment:', this.currentPage);
                if (this.currentPage < Math.ceil(this.filteredReviews.length / this.reviewsPerPage)) {
                    this.currentPage++;
                    console.log('Current Page After Increment:', this.currentPage);
                    this.renderReviews();
                }
            });
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ReviewsSection();
});