document.addEventListener('DOMContentLoaded', () => {
    // 1. Manejo robusto del Preloader
    const loader = document.querySelector('.loader-wrapper');
    
    const hideLoader = () => {
        if (loader) {
            loader.style.transition = 'opacity 0.5s ease';
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }
    };

    // Ocultar cuando todo cargue
    window.addEventListener('load', hideLoader);

    // Fallback: Si después de 3 segundos no cargó (por alguna imagen pesada o error), ocultar igual
    setTimeout(hideLoader, 3000);

    // 2. Inicializar AOS con precaución
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            once: true,
            offset: 100
        });
    }

    // 3. Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });

    // 4. Mobile Menu Toggle
    const menuBtn = document.querySelector('.menu-btn');
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            document.querySelector('#contacto').scrollIntoView({ behavior: 'smooth' });
        });
    }

    // 5. Admin Button Logic (Visible and Temporal)
    const adminBtn = document.getElementById('admin-btn');
    if (adminBtn) {
        adminBtn.addEventListener('click', () => {
            window.location.href = "Admin/admin.html";
        });
    }
});
