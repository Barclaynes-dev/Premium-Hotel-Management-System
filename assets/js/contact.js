/**
 * ============================================================
 * HAYLO HOTEL — CONTACT PAGE LOGIC
 * assets/js/contact.js
 *
 * Responsibilities:
 *  1. Gmail force-redirect on form submit
 *  2. Client-side form validation (name, email, message)
 *  3. Floating label polyfill for date/select fields
 *  4. Textarea character counter
 *  5. Scroll-reveal (Intersection Observer)
 *  6. FAQ accordion
 *  7. Map reveal on scroll
 * ============================================================
 */

(function () {
    'use strict';

    /* ──────────────────────────────────────────────────────
       UTILITY
    ────────────────────────────────────────────────────── */

    function onReady(fn) {
        if (document.readyState !== 'loading') fn();
        else document.addEventListener('DOMContentLoaded', fn);
    }

    function debounce(fn, delay) {
        var t;
        return function () { clearTimeout(t); t = setTimeout(fn, delay); };
    }


    /* ──────────────────────────────────────────────────────
       §1  GMAIL FORCE-REDIRECT
       Gathers all form fields and opens Gmail compose
       with Subject + Body pre-filled. Falls back to a
       mailto: link if window.open is blocked by the browser.
    ────────────────────────────────────────────────────── */

    var RECIPIENT = 'hello@haylohotel.com';

    function buildGmailURL(fields) {
        var subject = encodeURIComponent(fields.subject || 'Guest Enquiry — Haylo Hotel');

        var lines = [];

        lines.push('Dear Haylo Concierge Team,');
        lines.push('');
        lines.push(fields.message || '');
        lines.push('');
        lines.push('— Enquiry Details —');

        if (fields.name) lines.push('Name      : ' + fields.name);
        if (fields.email) lines.push('Email     : ' + fields.email);
        if (fields.phone) lines.push('Phone     : ' + fields.phone);
        if (fields.subject) lines.push('Subject   : ' + fields.subject);
        if (fields.arrival) lines.push('Arrival   : ' + fields.arrival);
        if (fields.departure) lines.push('Departure : ' + fields.departure);

        lines.push('');
        lines.push('Kind regards,');
        lines.push(fields.name || 'Guest');

        var body = encodeURIComponent(lines.join('\n'));

        return (
            'https://mail.google.com/mail/?view=cm&fs=1' +
            '&to=' + encodeURIComponent(RECIPIENT) +
            '&su=' + subject +
            '&body=' + body
        );
    }

    function initGmailRedirect() {
        var form = document.getElementById('contact-form');
        var submitBtn = document.getElementById('submit-btn');
        var success = document.getElementById('form-success');
        if (!form) return;

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            // Run validation first — abort if invalid
            if (!validateForm()) return;

            // Gather all fields
            var fields = {
                name: (form.querySelector('#contact-name') || {}).value || '',
                email: (form.querySelector('#contact-email') || {}).value || '',
                phone: (form.querySelector('#contact-phone') || {}).value || '',
                subject: (form.querySelector('#contact-subject') || {}).value || 'General Enquiry',
                arrival: (form.querySelector('#contact-arrival') || {}).value || '',
                departure: (form.querySelector('#contact-departure') || {}).value || '',
                message: (form.querySelector('#contact-message') || {}).value || '',
            };

            var gmailURL = buildGmailURL(fields);

            // Sending state
            if (submitBtn) {
                submitBtn.classList.add('sending');
                var btnText = submitBtn.querySelector('span:first-child');
                if (btnText) btnText.textContent = 'Opening Gmail…';
            }

            // Open Gmail compose in a new tab
            var gmailWindow = window.open(gmailURL, '_blank', 'noopener,noreferrer');

            // Fallback if pop-up was blocked
            if (!gmailWindow || gmailWindow.closed || typeof gmailWindow.closed === 'undefined') {
                // Build a plain mailto as last resort
                var fallback = 'mailto:' + RECIPIENT +
                    '?subject=' + encodeURIComponent(fields.subject || 'Guest Enquiry — Haylo Hotel') +
                    '&body=' + encodeURIComponent(
                        fields.message + '\n\n— ' + fields.name + ' · ' + fields.email
                    );
                window.location.href = fallback;
            }

            // Show success state after a short delay
            setTimeout(function () {
                if (form && success) {
                    form.style.opacity = '0';
                    form.style.transition = 'opacity 0.4s ease';

                    setTimeout(function () {
                        form.style.display = 'none';
                        success.classList.add('visible');
                        success.focus();
                    }, 400);
                }
            }, 600);
        });
    }


    /* ──────────────────────────────────────────────────────
       §2  CLIENT-SIDE FORM VALIDATION
       Validates required fields and email format.
       Marks fields with .valid / .error classes for CSS.
    ────────────────────────────────────────────────────── */

    function validateField(input) {
        var field = input.closest('.form-field');
        if (!field) return true;

        var val = input.value.trim();
        var valid = true;

        // Required check
        if (input.required && val === '') {
            valid = false;
        }

        // Email format check
        if (input.type === 'email' && val !== '') {
            var emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRx.test(val)) valid = false;
        }

        field.classList.toggle('valid', valid && val !== '');
        field.classList.toggle('error', !valid);
        return valid;
    }

    function validateForm() {
        var form = document.getElementById('contact-form');
        if (!form) return true;

        var required = Array.from(form.querySelectorAll('[required]'));
        var allValid = true;

        required.forEach(function (input) {
            if (!validateField(input)) allValid = false;
        });

        // Scroll to first error
        if (!allValid) {
            var firstError = form.querySelector('.form-field.error input, .form-field.error textarea');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstError.focus();
            }
        }

        return allValid;
    }

    function initValidation() {
        var form = document.getElementById('contact-form');
        if (!form) return;

        // Validate on blur (when user leaves a field)
        form.addEventListener('blur', function (e) {
            var target = e.target;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                validateField(target);
            }
        }, true); // capture phase so it fires on all inputs

        // Clear error state on input
        form.addEventListener('input', function (e) {
            var target = e.target;
            var field = target.closest('.form-field');
            if (field && field.classList.contains('error')) {
                validateField(target);
            }
        });
    }


    /* ──────────────────────────────────────────────────────
       §3  FLOATING LABEL POLYFILL
       Date inputs and selects don't trigger CSS
       :not(:placeholder-shown), so we add .has-value class.
    ────────────────────────────────────────────────────── */

    function initFloatingLabels() {
        var form = document.getElementById('contact-form');
        if (!form) return;

        var fields = Array.from(form.querySelectorAll('input[type="date"], select'));

        function checkValue(el) {
            var field = el.closest('.form-field');
            if (!field) return;
            var hasVal = el.value && el.value !== '';
            field.classList.toggle('has-value', hasVal);
        }

        // CSS targets .has-value input + label — inject the rule once
        var styleId = 'floating-label-polyfill';
        if (!document.getElementById(styleId)) {
            var style = document.createElement('style');
            style.id = styleId;
            style.textContent =
                '.form-field.has-value input + label,' +
                '.form-field.has-value select + label {' +
                '  transform: translateY(-22px);' +
                '  font-size: 0.5rem;' +
                '  letter-spacing: 0.28em;' +
                '  text-transform: uppercase;' +
                '  color: var(--clr-gold);' +
                '}';
            document.head.appendChild(style);
        }

        fields.forEach(function (el) {
            checkValue(el);
            el.addEventListener('change', function () { checkValue(el); });
            el.addEventListener('input', function () { checkValue(el); });
        });
    }


    /* ──────────────────────────────────────────────────────
       §4  TEXTAREA CHARACTER COUNTER
    ────────────────────────────────────────────────────── */

    function initCharCounter() {
        var textarea = document.getElementById('contact-message');
        var counter = document.getElementById('msg-counter');
        if (!textarea || !counter) return;

        var max = parseInt(textarea.getAttribute('maxlength') || '800', 10);

        function update() {
            var len = textarea.value.length;
            counter.textContent = len + ' / ' + max;
            counter.classList.toggle('near-limit', len >= max * 0.85);
        }

        textarea.addEventListener('input', update);
        update();
    }


    /* ──────────────────────────────────────────────────────
       §5  SCROLL-REVEAL  (Intersection Observer)
       Adds .visible to elements with .c-reveal class.
       Respects data-delay attribute (seconds).
    ────────────────────────────────────────────────────── */

    function initScrollReveal() {
        var reveals = Array.from(document.querySelectorAll('.c-reveal'));
        if (!reveals.length) return;

        if (!('IntersectionObserver' in window)) {
            reveals.forEach(function (el) { el.classList.add('visible'); });
            return;
        }

        // Respect prefers-reduced-motion
        var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reducedMotion) {
            reveals.forEach(function (el) { el.classList.add('visible'); });
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;

                var el = entry.target;
                var delay = parseFloat(el.dataset.delay || 0);

                setTimeout(function () {
                    el.classList.add('visible');
                }, delay * 1000);

                observer.unobserve(el);
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -50px 0px',
        });

        reveals.forEach(function (el) { observer.observe(el); });
    }


    /* ──────────────────────────────────────────────────────
       §6  FAQ ACCORDION
       Single-open: opening one item closes the others.
       Accessible: aria-expanded + hidden on answer panels.
    ────────────────────────────────────────────────────── */

    function initFAQ() {
        var list = document.getElementById('faq-list');
        if (!list) return;

        var items = Array.from(list.querySelectorAll('.faq-item'));

        items.forEach(function (item) {
            var btn = item.querySelector('.faq-question');
            var answer = item.querySelector('.faq-answer');
            if (!btn || !answer) return;

            btn.addEventListener('click', function () {
                var isOpen = item.classList.contains('open');

                // Close all
                items.forEach(function (other) {
                    var otherBtn = other.querySelector('.faq-question');
                    var otherAnswer = other.querySelector('.faq-answer');
                    other.classList.remove('open');
                    if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
                    if (otherAnswer) otherAnswer.hidden = true;
                });

                // Toggle clicked
                if (!isOpen) {
                    item.classList.add('open');
                    btn.setAttribute('aria-expanded', 'true');
                    answer.hidden = false;
                }
            });

            // Keyboard: Space / Enter already trigger click on buttons —
            // no extra handler needed.
        });
    }


    /* ──────────────────────────────────────────────────────
       §7  MAP REVEAL ON SCROLL
       Triggers the dark-themed iframe to animate in once
       it enters the viewport.
    ────────────────────────────────────────────────────── */

    function initMapReveal() {
        var mapWrap = document.getElementById('map-wrapper');
        if (!mapWrap) return;

        if (!('IntersectionObserver' in window)) {
            mapWrap.classList.add('revealed');
            return;
        }

        var mapObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    mapWrap.classList.add('revealed');
                    mapObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        mapObserver.observe(mapWrap);
    }


    /* ──────────────────────────────────────────────────────
       §8  INFO BLOCK ENTRANCE STAGGER
       Each info-block gets a slight entrance delay so the
       left column feels alive on first load.
    ────────────────────────────────────────────────────── */

    function initInfoBlockStagger() {
        var blocks = Array.from(document.querySelectorAll('.info-block'));
        if (!blocks.length) return;

        if (!('IntersectionObserver' in window)) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        var style = document.createElement('style');
        style.textContent =
            '.info-block { opacity: 0; transform: translateX(-20px); transition: opacity 0.55s ease, transform 0.55s cubic-bezier(0.22,1,0.36,1); }' +
            '.info-block.block-visible { opacity: 1; transform: translateX(0); }';
        document.head.appendChild(style);

        var blockObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var el = entry.target;
                var index = blocks.indexOf(el);
                setTimeout(function () {
                    el.classList.add('block-visible');
                }, index * 90);
                blockObserver.unobserve(el);
            });
        }, { threshold: 0.2 });

        blocks.forEach(function (b) { blockObserver.observe(b); });
    }


    /* ──────────────────────────────────────────────────────
       §9  SUBMIT BUTTON — HOVER RIPPLE
       A subtle radial ripple emanates from click position
       on the submit button — premium micro-interaction.
    ────────────────────────────────────────────────────── */

    function initButtonRipple() {
        var btn = document.getElementById('submit-btn');
        if (!btn) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        // Inject ripple keyframe once
        if (!document.getElementById('btn-ripple-style')) {
            var s = document.createElement('style');
            s.id = 'btn-ripple-style';
            s.textContent =
                '@keyframes btn-ripple {' +
                '  from { width: 0; height: 0; opacity: 0.35; transform: translate(-50%,-50%); }' +
                '  to   { width: 180px; height: 180px; opacity: 0; transform: translate(-50%,-50%); }' +
                '}';
            document.head.appendChild(s);
        }

        btn.addEventListener('click', function (e) {
            var rect = btn.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;

            var ripple = document.createElement('span');
            Object.assign(ripple.style, {
                position: 'absolute',
                left: x + 'px',
                top: y + 'px',
                background: 'rgba(176,141,87,0.25)',
                borderRadius: '50%',
                pointerEvents: 'none',
                animation: 'btn-ripple 0.65s ease-out forwards',
                zIndex: '0',
            });

            btn.style.position = 'relative';
            btn.appendChild(ripple);
            setTimeout(function () {
                if (ripple.parentElement) ripple.parentElement.removeChild(ripple);
            }, 700);
        });
    }


    /* ──────────────────────────────────────────────────────
       INIT — Run everything on DOM ready
    ────────────────────────────────────────────────────── */

    onReady(function () {
        initGmailRedirect();
        initValidation();
        initFloatingLabels();
        initCharCounter();
        initScrollReveal();
        initFAQ();
        initMapReveal();
        initInfoBlockStagger();
        initButtonRipple();
    });

})();