document.addEventListener("DOMContentLoaded", () => {
    // Select elements to animate
    const popElements = document.querySelectorAll('.card, .form-container, .result-box');
    
    // Add initialization class
    popElements.forEach(el => el.classList.add('card-pop'));

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    let staggerTimeout = null;
    let staggerCounter = 0;

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const delay = staggerCounter * 250; // 250ms between each card
                staggerCounter++;
                
                setTimeout(() => {
                    entry.target.classList.add('is-visible');
                }, delay);
            } else {
                entry.target.classList.remove('is-visible');
            }
        });

        // Reset the counter shortly after a batch is processed
        clearTimeout(staggerTimeout);
        staggerTimeout = setTimeout(() => {
            staggerCounter = 0;
        }, 100);
    }, observerOptions);

    // Start observing
    popElements.forEach(el => observer.observe(el));
});
