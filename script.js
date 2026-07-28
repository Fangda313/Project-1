// Scroll Progress Bar
window.addEventListener('scroll', () => {
    const scrollProgress = document.querySelector('.scroll-progress');
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = (window.scrollY / scrollableHeight) * 100;
    scrollProgress.style.width = scrolled + '%';
});

// Header Scroll Effect
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Scroll Reveal Animation
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, observerOptions);

// Observe all elements with animation classes
const animatedElements = document.querySelectorAll(
    '.scroll-reveal, .slide-in-left, .slide-in-right, .slide-in-bottom, .zoom-in, .counter-animation'
);

animatedElements.forEach(el => observer.observe(el));

// Counter Animation
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
            entry.target.classList.add('counted');
            animateCounter(entry.target);
        }
    });
}, { threshold: 0.5 });

const counters = document.querySelectorAll('.counter');
counters.forEach(counter => counterObserver.observe(counter));

function animateCounter(counter) {
    const target = parseInt(counter.getAttribute('data-target'));
    const duration = 2000; // 2 seconds
    const increment = target / (duration / 16); // 60fps
    let current = 0;

    const updateCounter = () => {
        current += increment;
        if (current < target) {
            counter.textContent = formatNumber(Math.ceil(current));
            requestAnimationFrame(updateCounter);
        } else {
            counter.textContent = formatNumber(target);
        }
    };

    updateCounter();
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(0) + 'M+';
    } else if (num >= 10000) {
        return (num / 1000).toFixed(0) + 'K+';
    } else if (num >= 1000) {
        return num.toLocaleString() + '+';
    }
    return num + '+';
}

// Smooth Scroll for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Parallax Effect for Hero Section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroContent = document.querySelector('.hero-content');
    const floatingElements = document.querySelector('.floating-elements');
    
    if (heroContent && scrolled < window.innerHeight) {
        heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
        heroContent.style.opacity = 1 - (scrolled / 600);
    }
    
    if (floatingElements && scrolled < window.innerHeight) {
        floatingElements.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
});

// Add Hover Effect to Features
document.querySelectorAll('.feature').forEach((feature, index) => {
    feature.style.transitionDelay = `${index * 0.1}s`;
});

// Add Hover Effect to Testimonials
document.querySelectorAll('.testimonial').forEach((testimonial, index) => {
    testimonial.style.transitionDelay = `${index * 0.15}s`;
});

// Stagger Animation for Features
const featureObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('active');
            }, index * 100);
        }
    });
}, { threshold: 0.2 });

document.querySelectorAll('.feature').forEach(feature => {
    featureObserver.observe(feature);
});

// Add interactive cursor effect (optional - adds a subtle glow on hover)
document.addEventListener('mousemove', (e) => {
    const features = document.querySelectorAll('.feature:hover');
    features.forEach(feature => {
        const rect = feature.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        feature.style.setProperty('--mouse-x', `${x}px`);
        feature.style.setProperty('--mouse-y', `${y}px`);
    });
});

// Log page load
console.log('🐝 StoryBee website loaded successfully!');
console.log('Scroll down to see amazing animations! ✨');
