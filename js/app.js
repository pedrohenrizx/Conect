// SPA Routing and Theme Logic

const navLinks = document.querySelectorAll('.nav-link');
const viewSections = document.querySelectorAll('.view-section');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navLinksContainer = document.getElementById('nav-links');

// Handle SPA Routing
function switchView(targetId) {
    // Remove active class from all links
    navLinks.forEach(link => {
        link.classList.remove('active', 'text-gray-900', 'dark:text-white');
        link.classList.add('text-gray-600', 'dark:text-gray-400');
    });

    // Hide all views and remove animation class
    viewSections.forEach(section => {
        section.classList.remove('active', 'fade-in');
    });

    // Add active class to clicked link
    const activeLink = document.querySelector(`.nav-link[data-target="${targetId}"]`);
    if (activeLink) {
        activeLink.classList.add('active', 'text-gray-900', 'dark:text-white');
        activeLink.classList.remove('text-gray-600', 'dark:text-gray-400');
    }

    // Show target view with animation
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
        targetSection.classList.add('active');
        // Trigger reflow to restart animation
        void targetSection.offsetWidth;
        targetSection.classList.add('fade-in');
    }

    // Close mobile menu if open
    if (window.innerWidth < 768) {
        navLinksContainer.classList.add('hidden');
    }
}

// Attach event listeners to navigation links
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('data-target');
        switchView(targetId);
    });
});

// Mobile menu toggle
mobileMenuBtn.addEventListener('click', () => {
    navLinksContainer.classList.toggle('hidden');
});

// Theme Toggling Logic
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIconDark = document.getElementById('theme-icon-dark');
const themeIconLight = document.getElementById('theme-icon-light');
const htmlElement = document.documentElement;

// Check saved theme or system preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    htmlElement.classList.add('dark');
    themeIconDark.classList.add('hidden');
    themeIconLight.classList.remove('hidden');
} else {
    htmlElement.classList.remove('dark');
    themeIconLight.classList.add('hidden');
    themeIconDark.classList.remove('hidden');
}

themeToggleBtn.addEventListener('click', () => {
    htmlElement.classList.toggle('dark');
    const isDark = htmlElement.classList.contains('dark');

    if (isDark) {
        localStorage.setItem('theme', 'dark');
        themeIconDark.classList.add('hidden');
        themeIconLight.classList.remove('hidden');
    } else {
        localStorage.setItem('theme', 'light');
        themeIconLight.classList.add('hidden');
        themeIconDark.classList.remove('hidden');
    }
});
