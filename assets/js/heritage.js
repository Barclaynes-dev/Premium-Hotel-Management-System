/**
 * ============================================================
 * HAYLO HOTEL — HERITAGE PAGE MOTION SYSTEM
 * assets/js/heritage.js
 *
 * Responsibilities:
 *  1. Hero parallax (rAF-throttled scroll listener)
 *  2. Intersection Observer scroll-reveal system
 *  3. Timeline spine draw + dot reveals
 *  4. Ticker duplication for seamless infinite loop
 *  5. Scroll-position progress indicator
 *  6. Number counter animation on first reveal
 * ============================================================
 */

(function () {
    'use strict';

    /* ──────────────────────────────────────────────────────
       §0  UTILITIES
    ────────────────────────────────────────────────────── */

    /** Clamp a number between min and max. */
    function clamp(val, min, max) {
        return Math.min(Math.max(val, min), max);
    }

    /** Linear interpolate between a and b by t (0-1). */
    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    /** Run fn once when DOM is ready. */
    function onReady(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    /** Debounce — returns a function that only fires after `delay` ms of quiet. */
    function debounce(fn, delay) {
        var timer;
        return function () {
            clearTimeout(timer);
            timer = setTimeout(fn, delay);
        };
    }

    /** requestAnimationFrame-throttled scroll listener. */
    function rafScroll(callback) {
        var ticking = false;
        window.addEventListener('scroll', function () {
            if (!ticking) {
                requestAnimationFrame(function () {
                    callback(window.scrollY);
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }


    /* ──────────────────────────────────────────────────────
       §1  HERO PARALLAX
       Shifts the parallax background at 25% of scroll speed,
       creating a subtle depth separation between bg and text.
    ────────────────────────────────────────────────────── */

    function initHeroParallax() {
        var bg = document.getElementById('hero-parallax-bg');
        var hero = document.getElementById('heritage-hero');
        if (!bg || !hero) return;

        // Current and target Y value (for smooth lerp)
        var currentY = 0;
        var targetY = 0;

        // Store hero height to stop parallax once scrolled past
        var heroH = hero.offsetHeight;

        rafScroll(function (scrollY) {
            heroH = hero.offsetHeight;
            targetY = scrollY;
        });

        // Smooth render loop independent of scroll events
        function renderLoop() {
            if (window.scrollY <= heroH + 200) {
                // Smooth lerp toward target (0.08 easing factor)
                currentY = lerp(currentY, targetY, 0.08);

                // Shift background at 25% of page scroll speed
                var shift = currentY * 0.25;
                bg.style.transform = 'translateY(' + shift + 'px)';
            }
            requestAnimationFrame(renderLoop);
        }

        requestAnimationFrame(renderLoop);

        // Recalculate on resize
        window.addEventListener('resize', debounce(function () {
            heroH = hero.offsetHeight;
        }, 200));
    }


    /* ──────────────────────────────────────────────────────
       §2  SCROLL-REVEAL SYSTEM (Intersection Observer)
       Adds `.visible` to elements with `.reveal` class.
       Supports `data-delay` attribute for stagger (seconds).
    ────────────────────────────────────────────────────── */

    function initScrollReveal() {
        var reveals = Array.from(document.querySelectorAll('.reveal'));
        if (!reveals.length) return;

        // If IntersectionObserver isn't available, just show everything
        if (!('IntersectionObserver' in window)) {
            reveals.forEach(function (el) { el.classList.add('visible'); });
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var el = entry.target;
                    var delay = parseFloat(el.dataset.delay || 0);

                    setTimeout(function () {
                        el.classList.add('visible');
                    }, delay * 1000);

                    // Only reveal once
                    observer.unobserve(el);
                }
            });
        }, {
            threshold: 0.15,   // 15% visible before triggering
            rootMargin: '0px 0px -60px 0px'   // slight bottom offset
        });

        reveals.forEach(function (el) {
            observer.observe(el);
        });
    }


    /* ──────────────────────────────────────────────────────
       §3  TIMELINE ANIMATION
       a) Draws the vertical spine when timeline enters view.
       b) Reveals milestone dots + cards in staggered sequence.
    ────────────────────────────────────────────────────── */

    function initTimeline() {
        var spine = document.getElementById('timeline-spine');
        var section = document.getElementById('timeline');
        var items = Array.from(document.querySelectorAll('.tl-item'));
        if (!section || !items.length) return;

        var spineDrawn = false;

        if (!('IntersectionObserver' in window)) {
            // Fallback: show everything immediately
            if (spine) spine.classList.add('drawn');
            items.forEach(function (item) { item.classList.add('visible'); });
            return;
        }

        // Observe the whole timeline section for the spine
        var spineObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting && !spineDrawn) {
                    spineDrawn = true;
                    if (spine) spine.classList.add('drawn');
                    spineObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.05 });

        spineObserver.observe(section);

        // Observe each timeline item individually for staggered dots
        var itemObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var el = entry.target;
                    var index = parseInt(el.dataset.tlIndex || 0, 10);

                    // Stagger each item by 120ms × its index
                    setTimeout(function () {
                        el.classList.add('visible');
                    }, index * 120);

                    itemObserver.unobserve(el);
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -40px 0px'
        });

        items.forEach(function (item) {
            itemObserver.observe(item);
        });
    }


    /* ──────────────────────────────────────────────────────
       §4  TICKER DUPLICATION
       Clones ticker items so the marquee loops seamlessly
       regardless of viewport width.
    ────────────────────────────────────────────────────── */

    function initTicker() {
        var track = document.getElementById('ticker-track');
        if (!track) return;

        // Clone the original set of items and append for seamless loop
        var originalHTML = track.innerHTML;
        track.innerHTML = originalHTML + originalHTML;

        // Pause on reduced-motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            track.style.animationPlayState = 'paused';
        }
    }


    /* ──────────────────────────────────────────────────────
       §5  SCROLL PROGRESS INDICATOR
       A 1px gold line that grows across the very top of the
       viewport as the user scrolls through the page.
    ────────────────────────────────────────────────────── */

    function initScrollProgress() {
        // Create the element
        var bar = document.createElement('div');
        bar.id = 'scroll-progress-bar';
        bar.setAttribute('aria-hidden', 'true');

        Object.assign(bar.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            height: '1px',
            width: '0%',
            background: 'linear-gradient(90deg, var(--clr-emerald-glow), var(--clr-gold))',
            zIndex: '2000',
            pointerEvents: 'none',
            transition: 'width 0.1s linear',
        });

        document.body.appendChild(bar);

        rafScroll(function () {
            var doc = document.documentElement;
            var scrolled = doc.scrollTop || document.body.scrollTop;
            var total = doc.scrollHeight - doc.clientHeight;
            var pct = total > 0 ? (scrolled / total) * 100 : 0;
            bar.style.width = clamp(pct, 0, 100) + '%';
        });
    }


    /* ──────────────────────────────────────────────────────
       §6  ANIMATED NUMBER COUNTERS
       When figure elements come into view, count up from 0
       to their displayed value over ~1.4 seconds.
    ────────────────────────────────────────────────────── */

    function initCounters() {
        var figures = Array.from(document.querySelectorAll('.fig-num'));
        if (!figures.length) return;

        if (!('IntersectionObserver' in window)) return;

        /**
         * Easing: ease-out-quart
         */
        function easeOutQuart(t) {
            return 1 - Math.pow(1 - t, 4);
        }

        /**
         * Animate a single counter element.
         * Handles numeric values, years, percentages, and suffixed numbers.
         */
        function animateCounter(el) {
            var raw = el.textContent.trim();
            var num = parseFloat(raw.replace(/[^0-9.]/g, ''));
            if (isNaN(num)) return;

            // Detect suffix/prefix
            var prefix = raw.match(/^[^0-9]*/)[0];
            var suffix = raw.match(/[^0-9]*$/)[0];

            var start = 0;
            var duration = 1400; // ms
            var startTs = null;

            // For large year-like numbers, start from nearby
            if (num > 1000) {
                start = num - Math.min(num * 0.05, 50);
            }

            function step(ts) {
                if (!startTs) startTs = ts;
                var progress = Math.min((ts - startTs) / duration, 1);
                var eased = easeOutQuart(progress);
                var current = Math.round(lerp(start, num, eased));

                el.textContent = prefix + current + suffix;

                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    el.textContent = raw; // Ensure exact final value
                }
            }

            requestAnimationFrame(step);
        }

        var counterObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        figures.forEach(function (el) {
            counterObserver.observe(el);
        });
    }


    /* ──────────────────────────────────────────────────────
       §7  CURSOR GLOW (Desktop only)
       A subtle emerald-gold halo that follows the cursor,
       giving the page an expensive interactive feel.
    ────────────────────────────────────────────────────── */

    function initCursorGlow() {
        // Skip on touch devices and on reduced-motion preference
        if ('ontouchstart' in window) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        if (window.innerWidth < 1024) return;

        var glow = document.createElement('div');
        glow.id = 'cursor-glow';
        glow.setAttribute('aria-hidden', 'true');

        Object.assign(glow.style, {
            position: 'fixed',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(10,43,34,0.18) 0%, rgba(176,141,87,0.04) 40%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: '9999',
            transform: 'translate(-50%, -50%)',
            transition: 'opacity 0.4s ease',
            opacity: '0',
            willChange: 'transform',
        });

        document.body.appendChild(glow);

        var mouseX = 0;
        var mouseY = 0;
        var curX = 0;
        var curY = 0;

        document.addEventListener('mousemove', function (e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
            glow.style.opacity = '1';
        });

        document.addEventListener('mouseleave', function () {
            glow.style.opacity = '0';
        });

        function glowLoop() {
            curX = lerp(curX, mouseX, 0.1);
            curY = lerp(curY, mouseY, 0.1);
            glow.style.transform = 'translate(' + (curX - 160) + 'px, ' + (curY - 160) + 'px)';
            requestAnimationFrame(glowLoop);
        }

        requestAnimationFrame(glowLoop);
    }


    /* ──────────────────────────────────────────────────────
       §8  SECTION BACKGROUND TRANSITIONS
       Smoothly shifts the page's ambient emerald glow based
       on which section is currently most visible — giving
       the feeling of the page "breathing" as you scroll.
    ────────────────────────────────────────────────────── */

    function initSectionGlows() {
        if (!('IntersectionObserver' in window)) return;

        // Map each section id to an ambient color value
        var glowMap = {
            'heritage-hero': 'rgba(10,43,34,0.0)',
            'recognition': 'rgba(10,43,34,0.0)',
            'origin': 'rgba(10,43,34,0.08)',
            'timeline': 'rgba(10,43,34,0.12)',
            'philosophy': 'rgba(10,43,34,0.18)',
            'vision': 'rgba(10,43,34,0.10)',
        };

        var activeGlow = document.createElement('div');
        activeGlow.id = 'ambient-glow-layer';
        activeGlow.setAttribute('aria-hidden', 'true');

        Object.assign(activeGlow.style, {
            position: 'fixed',
            inset: '0',
            pointerEvents: 'none',
            zIndex: '-1',
            background: 'transparent',
            transition: 'background 1.2s ease',
        });

        document.body.appendChild(activeGlow);

        var sectionObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var id = entry.target.id;
                    var clr = glowMap[id] || 'rgba(10,43,34,0.06)';
                    activeGlow.style.background = clr;
                }
            });
        }, { threshold: 0.3 });

        Object.keys(glowMap).forEach(function (id) {
            var el = document.getElementById(id);
            if (el) sectionObserver.observe(el);
        });
    }


    /* ──────────────────────────────────────────────────────
       §9  TIMELINE HOVER RIPPLE
       When a user hovers a timeline item, a brief radial
       ripple emerges from the central dot — premium micro-FX.
    ────────────────────────────────────────────────────── */

    function initTimelineRipple() {
        var items = Array.from(document.querySelectorAll('.tl-dot'));

        items.forEach(function (dot) {
            dot.addEventListener('mouseenter', function () {
                // Only run if already visible (animated in)
                if (!dot.closest('.tl-item').classList.contains('visible')) return;

                // Create and attach a temporary ripple ring
                var ripple = document.createElement('span');
                ripple.setAttribute('aria-hidden', 'true');

                Object.assign(ripple.style, {
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '0',
                    height: '0',
                    transform: 'translate(-50%, -50%)',
                    border: '1px solid rgba(176,141,87,0.5)',
                    borderRadius: '0',
                    pointerEvents: 'none',
                    animation: 'ripple-ring 0.65s ease-out forwards',
                });

                // Inject keyframe if not already present
                if (!document.getElementById('ripple-style')) {
                    var style = document.createElement('style');
                    style.id = 'ripple-style';
                    style.textContent =
                        '@keyframes ripple-ring {' +
                        '  from { width: 0; height: 0; opacity: 0.8; transform: translate(-50%,-50%) rotate(45deg); }' +
                        '  to   { width: 40px; height: 40px; opacity: 0; transform: translate(-50%,-50%) rotate(45deg); }' +
                        '}';
                    document.head.appendChild(style);
                }

                // Make dot parent relative for positioning
                var dotWrap = dot.parentElement;
                dotWrap.style.position = 'relative';
                dotWrap.appendChild(ripple);

                // Remove after animation
                setTimeout(function () {
                    if (ripple.parentElement) ripple.parentElement.removeChild(ripple);
                }, 700);
            });
        });
    }


    /* ──────────────────────────────────────────────────────
       §10  PHILOSOPHY CARD TILT (Desktop)
       Subtle 3D perspective tilt on the glassmorphic card
       as the mouse moves across it — makes it feel tactile.
    ────────────────────────────────────────────────────── */

    function initCardTilt() {
        if ('ontouchstart' in window) return;
        if (window.innerWidth < 1024) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        var card = document.querySelector('.philosophy-card');
        if (!card) return;

        var MAX_TILT = 4; // degrees

        card.addEventListener('mousemove', function (e) {
            var rect = card.getBoundingClientRect();
            var cx = rect.left + rect.width / 2;
            var cy = rect.top + rect.height / 2;
            var dx = (e.clientX - cx) / (rect.width / 2);
            var dy = (e.clientY - cy) / (rect.height / 2);
            var tiltX = clamp(-dy * MAX_TILT, -MAX_TILT, MAX_TILT);
            var tiltY = clamp(dx * MAX_TILT, -MAX_TILT, MAX_TILT);

            card.style.transform = (
                'perspective(900px) ' +
                'rotateX(' + tiltX + 'deg) ' +
                'rotateY(' + tiltY + 'deg) ' +
                'scale3d(1.012, 1.012, 1.012)'
            );
            card.style.transition = 'transform 0.1s ease';
        });

        card.addEventListener('mouseleave', function () {
            card.style.transform = '';
            card.style.transition = 'transform 0.55s ease';
        });
    }


    /* ──────────────────────────────────────────────────────
       §11  REDUCED MOTION SUPPORT
       Respect the user's OS preference by disabling all
       custom animations while keeping content visible.
    ────────────────────────────────────────────────────── */

    function initReducedMotion() {
        if (!window.matchMedia) return;
        var mq = window.matchMedia('(prefers-reduced-motion: reduce)');

        function applyReducedMotion(active) {
            if (active) {
                // Make all .reveal elements immediately visible
                Array.from(document.querySelectorAll('.reveal')).forEach(function (el) {
                    el.classList.add('visible');
                    el.style.transition = 'none';
                    el.style.animation = 'none';
                });
            }
        }

        applyReducedMotion(mq.matches);
        mq.addEventListener('change', function (e) {
            applyReducedMotion(e.matches);
        });
    }


    /* ──────────────────────────────────────────────────────
       INIT — Run everything when DOM is ready
    ────────────────────────────────────────────────────── */

    onReady(function () {

        // Motion preference check runs first so it can
        // short-circuit the rest if needed.
        initReducedMotion();

        initHeroParallax();
        initScrollReveal();
        initTimeline();
        initTicker();
        initScrollProgress();
        initCounters();
        initCursorGlow();
        initSectionGlows();
        initTimelineRipple();
        initCardTilt();

    });

})();