/**
 * ============================================================
 * HAYLO HOTEL — AUTH PAGE LOGIC
 * assets/js/auth.js
 *
 * Responsibilities:
 *  1.  State machine  — toggle body[data-auth-state]
 *  2.  Form transitions  — active / exiting classes + timing
 *  3.  Brand toggle pills — sync all toggle triggers
 *  4.  Login validation
 *  5.  Register validation (name, email, password match)
 *  6.  Password strength meter
 *  7.  Password show/hide toggle
 *  8.  Social auth stubs (Google, Apple, X)
 *  9.  Submit button loading state
 *  10. Parallax subtle mouse-move on brand panel (desktop)
 *  11. Particle depth shift on state change
 * ============================================================
 */

(function () {
    'use strict';

    /* ──────────────────────────────────────────────────────
       §0  CONSTANTS & DOM REFS
    ────────────────────────────────────────────────────── */

    var TRANSITION_MS = 480;   // matches CSS transition duration
    var isTransitioning = false;

    var body = document.body;
    var formLogin = document.getElementById('form-login');
    var formRegister = document.getElementById('form-register');

    // All elements that trigger a state change
    var allToggleBtns = Array.from(
        document.querySelectorAll('[data-target="login"], [data-target="register"]')
    );

    // Brand-panel toggle buttons (the pill group)
    var brandToggleLogin = document.getElementById('toggle-login');
    var brandToggleRegister = document.getElementById('toggle-register');


    /* ──────────────────────────────────────────────────────
       §1  STATE MACHINE
       Central function. Everything else derives from state.
    ────────────────────────────────────────────────────── */

    /**
     * Switch the page to a given auth state ('login' | 'register').
     * Guards against re-triggering while a transition is in progress.
     */
    function setState(targetState) {
        var currentState = body.getAttribute('data-auth-state');
        if (currentState === targetState || isTransitioning) return;

        isTransitioning = true;

        var leavingForm = currentState === 'login' ? formLogin : formRegister;
        var enteringForm = targetState === 'login' ? formLogin : formRegister;

        // 1. Mark leaving form as exiting
        leavingForm.classList.remove('active');
        leavingForm.classList.add('exiting');

        // 2. Update body attribute (drives all CSS state changes —
        //    images, taglines, toggle pill, etc.)
        body.setAttribute('data-auth-state', targetState);

        // 3. Update brand-panel toggle button aria states
        syncToggleButtons(targetState);

        // 4. After exit animation completes, bring in the new form
        setTimeout(function () {
            leavingForm.classList.remove('exiting');

            // Reset entering form field cascade by removing + re-adding active
            enteringForm.classList.remove('active');

            // Tiny rAF pause so browser registers the class removal
            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    enteringForm.classList.add('active');
                    isTransitioning = false;

                    // Clear any validation state on the newly shown form
                    clearFormErrors(enteringForm);
                });
            });
        }, TRANSITION_MS);
    }

    /**
     * Sync all brand-panel toggle buttons to reflect current state.
     */
    function syncToggleButtons(state) {
        if (brandToggleLogin) {
            var loginActive = state === 'login';
            brandToggleLogin.classList.toggle('active', loginActive);
            brandToggleLogin.setAttribute('aria-pressed', String(loginActive));
        }
        if (brandToggleRegister) {
            var regActive = state === 'register';
            brandToggleRegister.classList.toggle('active', regActive);
            brandToggleRegister.setAttribute('aria-pressed', String(regActive));
        }
    }

    /**
     * Wire all elements with [data-target] to setState().
     */
    function initStateTriggers() {
        allToggleBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                setState(btn.dataset.target);
            });
        });
    }


    /* ──────────────────────────────────────────────────────
       §2  VALIDATION UTILITIES
    ────────────────────────────────────────────────────── */

    function isValidEmail(val) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val.trim());
    }

    function setFieldError(groupId, show) {
        var group = document.getElementById(groupId);
        if (!group) return;
        group.classList.toggle('has-error', show);
        var input = group.querySelector('.auth-input');
        if (input) {
            input.classList.toggle('error', show);
            input.classList.toggle('valid', !show && input.value.trim() !== '');
        }
    }

    function clearFormErrors(form) {
        if (!form) return;
        var groups = Array.from(form.querySelectorAll('.form-group'));
        groups.forEach(function (g) {
            g.classList.remove('has-error');
            var input = g.querySelector('.auth-input');
            if (input) {
                input.classList.remove('error', 'valid');
            }
        });
        // Reset password strength
        var fill = form.querySelector('.pw-strength-fill');
        var label = form.querySelector('.pw-strength-label');
        if (fill) fill.className = 'pw-strength-fill';
        if (label) label.textContent = '';
    }

    /**
     * Live validation: validate a field on blur and clear error on input.
     */
    function attachLiveValidation(inputId, groupId, validateFn) {
        var input = document.getElementById(inputId);
        if (!input) return;

        input.addEventListener('blur', function () {
            setFieldError(groupId, !validateFn(input.value));
        });

        input.addEventListener('input', function () {
            var group = document.getElementById(groupId);
            if (group && group.classList.contains('has-error')) {
                if (validateFn(input.value)) setFieldError(groupId, false);
            }
        });
    }


    /* ──────────────────────────────────────────────────────
       §3  LOGIN FORM VALIDATION & SUBMIT
    ────────────────────────────────────────────────────── */

    function initLoginForm() {
        if (!formLogin) return;

        // Live validation
        attachLiveValidation('lg-email', 'lg-email-group', function (v) {
            return isValidEmail(v);
        });

        attachLiveValidation('lg-password', 'lg-pw-group', function (v) {
            return v.trim().length >= 1;
        });

        formLogin.addEventListener('submit', function (e) {
            e.preventDefault();
            var emailVal = (document.getElementById('lg-email') || {}).value || '';
            var pwVal = (document.getElementById('lg-password') || {}).value || '';

            var emailOk = isValidEmail(emailVal);
            var pwOk = pwVal.trim().length >= 1;

            setFieldError('lg-email-group', !emailOk);
            setFieldError('lg-pw-group', !pwOk);

            if (!emailOk || !pwOk) return;

            // Loading state
            setLoadingState('login-submit-btn', true);

            // ── PLACEHOLDER: Replace with your real auth call ──────
            // Example: firebase.auth().signInWithEmailAndPassword(email, password)
            //          .then(() => window.location.href = 'dashboard.html')
            //          .catch(err => showAuthError(err.message));
            console.info('[Haylo Auth] Login →', emailVal);

            // Simulate network delay for demo
            setTimeout(function () {
                setLoadingState('login-submit-btn', false);
                // Redirect to dashboard on success (uncomment when backend is ready)
                // window.location.href = 'dashboard.html';
                showToast('Welcome back to Haylo. Redirecting…');
            }, 1600);
        });
    }


    /* ──────────────────────────────────────────────────────
       §4  REGISTER FORM VALIDATION & SUBMIT
    ────────────────────────────────────────────────────── */

    function initRegisterForm() {
        if (!formRegister) return;

        // Live validation wiring
        attachLiveValidation('rg-name', 'rg-name-group', function (v) {
            return v.trim().split(/\s+/).length >= 2;
        });

        attachLiveValidation('rg-email', 'rg-email-group', function (v) {
            return isValidEmail(v);
        });

        // Confirm password live match
        var confirmInput = document.getElementById('rg-confirm');
        var passwordInput = document.getElementById('rg-password');

        if (confirmInput && passwordInput) {
            confirmInput.addEventListener('input', function () {
                var match = confirmInput.value === passwordInput.value;
                if (confirmInput.value.length > 0) {
                    setFieldError('rg-confirm-group', !match);
                }
            });

            confirmInput.addEventListener('blur', function () {
                if (confirmInput.value.length > 0) {
                    setFieldError('rg-confirm-group', confirmInput.value !== passwordInput.value);
                }
            });
        }

        formRegister.addEventListener('submit', function (e) {
            e.preventDefault();

            var nameVal = (document.getElementById('rg-name') || {}).value || '';
            var emailVal = (document.getElementById('rg-email') || {}).value || '';
            var pwVal = (document.getElementById('rg-password') || {}).value || '';
            var confirmVal = (document.getElementById('rg-confirm') || {}).value || '';
            var termsEl = document.getElementById('rg-terms');
            var termsOk = termsEl ? termsEl.checked : false;

            var nameOk = nameVal.trim().split(/\s+/).length >= 2;
            var emailOk = isValidEmail(emailVal);
            var pwOk = pwVal.length >= 8;
            var matchOk = pwVal === confirmVal && confirmVal.length > 0;

            setFieldError('rg-name-group', !nameOk);
            setFieldError('rg-email-group', !emailOk);
            setFieldError('rg-pw-group', !pwOk);
            setFieldError('rg-confirm-group', !matchOk);

            if (!nameOk || !emailOk || !pwOk || !matchOk) {
                // Scroll to first error
                var firstErr = formRegister.querySelector('.form-group.has-error .auth-input');
                if (firstErr) firstErr.focus();
                return;
            }

            if (!termsOk) {
                showToast('Please agree to the Terms of Service to continue.');
                if (termsEl) termsEl.focus();
                return;
            }

            setLoadingState('register-submit-btn', true);

            // ── PLACEHOLDER: Replace with your real registration call ──
            // Example: firebase.auth().createUserWithEmailAndPassword(email, password)
            console.info('[Haylo Auth] Register →', emailVal);

            setTimeout(function () {
                setLoadingState('register-submit-btn', false);
                showToast('Account created. Welcome to Haylo.');
                // Redirect after registration:
                // setTimeout(() => window.location.href = 'dashboard.html', 1000);
            }, 2000);
        });
    }


    /* ──────────────────────────────────────────────────────
       §5  PASSWORD STRENGTH METER
    ────────────────────────────────────────────────────── */

    function initPasswordStrength() {
        var input = document.getElementById('rg-password');
        var fill = document.getElementById('pw-strength-fill');
        var label = document.getElementById('pw-strength-label');
        if (!input || !fill || !label) return;

        function getStrength(pw) {
            if (!pw) return { level: '', score: 0, label: '' };
            var score = 0;
            if (pw.length >= 8) score++;
            if (pw.length >= 12) score++;
            if (/[A-Z]/.test(pw)) score++;
            if (/[0-9]/.test(pw)) score++;
            if (/[^A-Za-z0-9]/.test(pw)) score++;

            if (score <= 1) return { level: 'weak', score: 1, label: 'Weak' };
            else if (score === 2) return { level: 'fair', score: 2, label: 'Fair' };
            else if (score === 3) return { level: 'good', score: 3, label: 'Good' };
            else return { level: 'strong', score: 4, label: 'Strong' };
        }

        input.addEventListener('input', function () {
            var result = getStrength(input.value);
            fill.className = 'pw-strength-fill' + (result.level ? ' ' + result.level : '');
            label.textContent = result.label ? result.label + ' password' : '';

            // Also update field-level validation error in real time
            setFieldError('rg-pw-group', input.value.length > 0 && input.value.length < 8);
        });
    }


    /* ──────────────────────────────────────────────────────
       §6  PASSWORD SHOW / HIDE TOGGLE
    ────────────────────────────────────────────────────── */

    function initPasswordToggles() {
        var toggles = Array.from(document.querySelectorAll('.pw-toggle'));

        toggles.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var targetId = btn.dataset.target;
                var input = document.getElementById(targetId);
                if (!input) return;

                var isText = input.type === 'text';
                input.type = isText ? 'password' : 'text';
                btn.setAttribute('aria-label', isText ? 'Show password' : 'Hide password');

                // Swap icon — closed-eye SVG path
                var svg = btn.querySelector('svg');
                if (!svg) return;
                if (!isText) {
                    // Showing: render closed-eye
                    svg.innerHTML = (
                        '<path d="M1 8 C3 4 13 4 15 8"/>' +
                        '<path d="M1 8 C3 12 13 12 15 8"/>' +
                        '<line x1="3" y1="5" x2="13" y2="11"/>'
                    );
                } else {
                    // Hiding: render open-eye
                    svg.innerHTML = (
                        '<path d="M1 8 C3 4 13 4 15 8 C13 12 3 12 1 8Z"/>' +
                        '<circle cx="8" cy="8" r="2"/>'
                    );
                }
            });
        });
    }


    /* ──────────────────────────────────────────────────────
       §7  SUBMIT BUTTON LOADING STATE
    ────────────────────────────────────────────────────── */

    function setLoadingState(btnId, isLoading) {
        var btn = document.getElementById(btnId);
        if (!btn) return;
        btn.classList.toggle('loading', isLoading);
        btn.textContent = isLoading ? 'Please wait…' : btn.dataset.originalText || btn.textContent;
        if (!isLoading && !btn.dataset.originalText) {
            // Store original text on first call
            btn.dataset.originalText = btn.textContent;
        }
    }


    /* ──────────────────────────────────────────────────────
       §8  TOAST NOTIFICATION
       A subtle floating message at the bottom of the form.
    ────────────────────────────────────────────────────── */

    function showToast(message) {
        // Remove any existing toast
        var existing = document.getElementById('auth-toast');
        if (existing) existing.parentElement.removeChild(existing);

        var toast = document.createElement('div');
        toast.id = 'auth-toast';
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');

        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '5rem',
            left: '50%',
            transform: 'translateX(-50%) translateY(12px)',
            background: 'rgba(5,11,9,0.95)',
            backdropFilter: 'blur(20px)',
            border: '0.5px solid rgba(176,141,87,0.3)',
            color: '#ede7da',
            fontFamily: '"Montserrat", sans-serif',
            fontSize: '0.7rem',
            letterSpacing: '0.08em',
            padding: '0.85rem 1.75rem',
            borderRadius: '100px',
            zIndex: '9999',
            opacity: '0',
            transition: 'opacity 0.4s ease, transform 0.4s ease',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
        });

        toast.textContent = message;
        document.body.appendChild(toast);

        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                toast.style.opacity = '1';
                toast.style.transform = 'translateX(-50%) translateY(0)';
            });
        });

        setTimeout(function () {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(8px)';
            setTimeout(function () {
                if (toast.parentElement) toast.parentElement.removeChild(toast);
            }, 450);
        }, 3200);
    }


    /* ──────────────────────────────────────────────────────
       §9  SOCIAL AUTH STUBS
       Logs intent; replace with real OAuth calls.
    ────────────────────────────────────────────────────── */

    function initSocialAuth() {
        var providers = [
            { id: 'btn-google-login', provider: 'Google' },
            { id: 'btn-google-register', provider: 'Google' },
        ];

        providers.forEach(function (p) {
            var btn = document.getElementById(p.id);
            if (!btn) return;
            btn.addEventListener('click', function () {
                console.info('[Haylo Auth] Social →', p.provider);
                // PLACEHOLDER: e.g. firebase.auth().signInWithPopup(googleProvider)
                showToast('Connecting to ' + p.provider + '…');
            });
        });

        // Generic small social buttons
        var smallBtns = Array.from(document.querySelectorAll('.btn-social-small'));
        smallBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var label = btn.getAttribute('aria-label') || 'Social';
                showToast('Connecting to ' + label.replace('Continue with ', '').replace('Register with ', '') + '…');
            });
        });
    }


    /* ──────────────────────────────────────────────────────
       §10  BRAND PANEL MOUSE PARALLAX  (Desktop only)
       A subtle depth shift on the background images as
       the mouse moves across the left panel.
    ────────────────────────────────────────────────────── */

    function initBrandParallax() {
        if ('ontouchstart' in window) return;
        if (window.innerWidth < 900) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        var brand = document.querySelector('.auth-brand');
        var bgLogin = document.querySelector('.brand-bg-login');
        var bgRegister = document.querySelector('.brand-bg-register');
        if (!brand || !bgLogin || !bgRegister) return;

        var targetX = 0;
        var targetY = 0;
        var currentX = 0;
        var currentY = 0;

        brand.addEventListener('mousemove', function (e) {
            var rect = brand.getBoundingClientRect();
            // Normalised -1 to 1
            targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
            targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        });

        brand.addEventListener('mouseleave', function () {
            targetX = 0;
            targetY = 0;
        });

        var MAX_SHIFT = 8; // px

        function parallaxLoop() {
            currentX += (targetX - currentX) * 0.06;
            currentY += (targetY - currentY) * 0.06;

            var state = body.getAttribute('data-auth-state');
            var activeBg = state === 'login' ? bgLogin : bgRegister;

            var shiftX = currentX * MAX_SHIFT;
            var shiftY = currentY * MAX_SHIFT;

            // Only move the active background
            activeBg.style.transform = (
                'translateX(' + shiftX + 'px) translateY(' + shiftY + 'px) scale(1.08)'
            );

            requestAnimationFrame(parallaxLoop);
        }

        requestAnimationFrame(parallaxLoop);
    }


    /* ──────────────────────────────────────────────────────
       §11  INPUT FOCUS GLOW ENHANCEMENT
       Dynamically adjusts the emerald glow intensity
       based on which field is currently focused.
    ────────────────────────────────────────────────────── */

    function initInputGlow() {
        var inputs = Array.from(document.querySelectorAll('.auth-input'));

        inputs.forEach(function (input) {
            input.addEventListener('focus', function () {
                // Subtle body-level ambient shift
                document.querySelector('.auth-forms').style.setProperty(
                    '--active-glow', 'rgba(10,43,34,0.22)'
                );
            });

            input.addEventListener('blur', function () {
                document.querySelector('.auth-forms').style.setProperty(
                    '--active-glow', 'rgba(10,43,34,0.12)'
                );
            });
        });
    }


    /* ──────────────────────────────────────────────────────
       §12  STORE SUBMIT BUTTON ORIGINAL TEXT
       Must run before any submit attempts.
    ────────────────────────────────────────────────────── */

    function initButtonText() {
        ['login-submit-btn', 'register-submit-btn'].forEach(function (id) {
            var btn = document.getElementById(id);
            if (btn) btn.dataset.originalText = btn.textContent.trim();
        });
    }


    /* ──────────────────────────────────────────────────────
       §13  KEYBOARD NAVIGATION — toggle with Tab flow
       When user tabs past the brand-toggle area on desktop,
       focus jumps correctly into the active form.
    ────────────────────────────────────────────────────── */

    function initKeyboardNav() {
        document.addEventListener('keydown', function (e) {
            // Escape: no-op on auth (can't navigate away easily)
            if (e.key === 'Escape') {
                var active = document.querySelector('.auth-form.active .auth-input');
                if (active) active.blur();
            }
        });
    }


    /* ──────────────────────────────────────────────────────
       §14  REDUCED MOTION — instant transitions
    ────────────────────────────────────────────────────── */

    function checkReducedMotion() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            // Override transition duration to near-zero
            var style = document.createElement('style');
            style.textContent = (
                '.auth-form { transition: none !important; }' +
                '.brand-bg   { transition: none !important; }' +
                '.brand-toggle-indicator { transition: none !important; }'
            );
            document.head.appendChild(style);
            // Also shorten JS transition wait
            TRANSITION_MS = 50;
        }
    }


    /* ──────────────────────────────────────────────────────
       INIT — wire everything up
    ────────────────────────────────────────────────────── */

    function init() {
        checkReducedMotion();
        initButtonText();
        initStateTriggers();
        initLoginForm();
        initRegisterForm();
        initPasswordStrength();
        initPasswordToggles();
        initSocialAuth();
        initBrandParallax();
        initInputGlow();
        initKeyboardNav();

        // Ensure initial state is visually correct
        syncToggleButtons(body.getAttribute('data-auth-state') || 'login');
    }

    // Run when DOM is ready
    if (document.readyState !== 'loading') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }

})();