// Mobile nav toggle
    (function () {
      const toggle = document.getElementById('nav-toggle');
      const drawer = document.getElementById('nav-mobile-drawer');
      if (!toggle || !drawer) return;

      toggle.addEventListener('click', function () {
        const isOpen = drawer.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(isOpen));
        drawer.setAttribute('aria-hidden', String(!isOpen));
      });

      // Close drawer on link click
      drawer.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          drawer.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
          drawer.setAttribute('aria-hidden', 'true');
        });
      });
    })();

    // Header scroll state
    (function () {
      const header = document.getElementById('site-header');
      if (!header) return;
      window.addEventListener('scroll', function () {
        header.classList.toggle('scrolled', window.scrollY > 60);
      }, { passive: true });
    })();