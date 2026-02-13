// Menu Hamburger
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// Fechar menu ao clicar em um link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        if (navLinks) {
            navLinks.classList.remove('active');
        }
    });
});

// Smooth scroll para links internos
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Efeito de scroll na navbar
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (!navbar) {
        return;
    }

    if (window.scrollY > 100) {
        navbar.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.3)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
    }
});

// Animacao ao entrar na view (Intersection Observer)
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observar elementos de cards
document.querySelectorAll('.member-card, .music-card, .gallery-item, .stat').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
});

// Funcionalidade do botao CTA
const ctaButton = document.querySelector('.cta-button');
if (ctaButton) {
    ctaButton.addEventListener('click', () => {
        const musicSection = document.getElementById('music');
        if (musicSection) {
            musicSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// Formulario de newsletter
const newsletterForm = document.querySelector('.newsletter');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = e.target.querySelector('input[type="email"]');
        const email = emailInput ? emailInput.value : '';
        if (email) {
            alert(`Obrigado ${email}, voc? foi inscrito em nossa newsletter!`);
            e.target.reset();
        }
    });
}

// Efeito na galeria
document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
        item.style.filter = 'brightness(0.8)';
        setTimeout(() => {
            item.style.filter = 'brightness(1)';
        }, 200);
    });
});

// Animacao de entrada da pagina
window.addEventListener('load', () => {
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.animation = 'fadeInUp 0.8s ease';
    }
});

// Scroll reveal para secoes
const revealSection = (entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
        }
    });
};

const sectionObserver = new IntersectionObserver(revealSection, {
    threshold: 0.15
});

document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0.7';
    sectionObserver.observe(section);
});

// Lightbox para galeria
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const lightboxClose = document.querySelector('.lightbox-close');
const galleryItems = document.querySelectorAll('.gallery-item');
const memberImages = document.querySelectorAll('.member-image');

// Funcao para abrir lightbox
function openLightbox(imageSrc) {
    if (imageSrc && lightbox && lightboxImage && lightboxClose) {
        lightboxImage.src = imageSrc;
        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
        lightboxClose.focus();
    }
}

// Abrir lightbox ao clicar na imagem da galeria
galleryItems.forEach(item => {
    item.addEventListener('click', () => {
        const imageSrc = item.getAttribute('data-image');
        openLightbox(imageSrc);
    });

    // Suporte a keyboard (Enter/Space para role="button")
    item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const imageSrc = item.getAttribute('data-image');
            openLightbox(imageSrc);
        }
    });

    // Adicionar cursor pointer no hover
    item.style.cursor = 'pointer';
});

// Abrir lightbox ao clicar na imagem do membro
memberImages.forEach(item => {
    item.addEventListener('click', () => {
        const imageSrc = item.getAttribute('data-image');
        openLightbox(imageSrc);
    });
});

// Fechar lightbox ao clicar no botao close
if (lightbox && lightboxClose) {
    lightboxClose.addEventListener('click', () => {
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
    });
}

// Fechar lightbox ao clicar fora da imagem
if (lightbox) {
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.classList.remove('active');
            lightbox.setAttribute('aria-hidden', 'true');
        }
    });
}

// Fechar lightbox com ESC
document.addEventListener('keydown', (e) => {
    if (lightbox && e.key === 'Escape' && lightbox.classList.contains('active')) {
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
    }
});

// Lazy-load das capas das Top Musicas
const albumCovers = {
    'TASTE IT BACK': './capa_taste_it_back.jpg',
    'LOVE POTION': './capa_love_potion.jpg',
    WILDFLOWER: './capa_wildflower.jpg',
    'FALLEN ANGEL': './capa_fallen_angels.jpg'
};

const albumObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const art = entry.target;
            const card = art.closest('.music-card');
            const titleEl = card ? card.querySelector('h3') : null;
            const songTitle = titleEl
                ? titleEl.textContent.replace(/'/g, '').trim().split('(')[0].trim()
                : '';
            const src = albumCovers[songTitle];

            if (src && !art.dataset.loaded) {
                art.style.backgroundImage = `url('${src}')`;
                art.style.backgroundSize = 'cover';
                art.style.backgroundPosition = 'center';
                art.setAttribute('role', 'img');
                const title = titleEl ? titleEl.textContent.trim() : songTitle;
                art.setAttribute('aria-label', `Capa da m?sica ${title}`);
                art.dataset.loaded = 'true';
            }

            obs.unobserve(art);
        }
    });
}, { rootMargin: '100px 0px', threshold: 0.1 });

document.querySelectorAll('.music-card .album-art').forEach(art => {
    albumObserver.observe(art);
});

