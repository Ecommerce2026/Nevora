/* =========================================================
   NEVORA — Front-end interactions
   Static prototype: no backend, no payments, no fake data submission.
========================================================= */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Scroll progress bar ---------- */
  var progressBar = document.getElementById('progressBar');
  function updateProgressBar() {
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  }

  /* ---------- Sticky nav: background on scroll + hide on scroll down ---------- */
  var nav = document.getElementById('siteNav');
  var lastScroll = 0;

  function updateNav() {
    var current = window.scrollY;
    if (current > 40) {
      nav.classList.add('is-scrolled');
    } else {
      nav.classList.remove('is-scrolled');
    }
    if (current > lastScroll && current > 200) {
      nav.classList.add('is-hidden');
    } else {
      nav.classList.remove('is-hidden');
    }
    lastScroll = current;
  }

  var toTopBtn = document.getElementById('toTop');
  function updateToTop() {
    if (window.scrollY > 700) {
      toTopBtn.classList.add('is-visible');
    } else {
      toTopBtn.classList.remove('is-visible');
    }
  }

  window.addEventListener('scroll', function () {
    updateProgressBar();
    updateNav();
    updateToTop();
  }, { passive: true });

  toTopBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- Mobile menu ---------- */
  var navToggle = document.getElementById('navToggle');
  var navMobile = document.getElementById('navMobile');
  navToggle.addEventListener('click', function () {
    var isOpen = navMobile.classList.toggle('is-open');
    navToggle.classList.toggle('is-active', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen);
  });
  navMobile.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navMobile.classList.remove('is-open');
      navToggle.classList.remove('is-active');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- Scroll reveal (IntersectionObserver) ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Animated stat counters ---------- */
  var statEls = document.querySelectorAll('.stat__num');
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1200;
    var start = null;

    function step(timestamp) {
      if (!start) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = Math.round(eased * target);
      el.textContent = value + suffix;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = target + suffix;
      }
    }
    window.requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window && statEls.length) {
    var statObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          statObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    statEls.forEach(function (el) { statObserver.observe(el); });
  }

  /* ---------- Image placeholders (logo.png / image-N.jpg not added yet) ---------- */
  document.querySelectorAll('[data-media-image]').forEach(function (img) {
    img.addEventListener('load', function () {
      if (img.naturalWidth > 1) img.classList.add('is-loaded');
    });
    img.addEventListener('error', function () {
      img.classList.remove('is-loaded');
    });
    if (img.complete) {
      if (img.naturalWidth > 1) {
        img.classList.add('is-loaded');
      }
    }
  });

  /* ---------- Flavor tabs ---------- */
  var flavorTabs = document.querySelectorAll('.flavors__tab');
  var flavorImages = document.querySelectorAll('[data-flavor-image]');
  var flavorTags = document.querySelectorAll('[data-flavor-tag]');
  var flavorContents = document.querySelectorAll('[data-flavor-content]');
  var flavorPlaceholderFile = document.getElementById('flavorPlaceholderFile');
  var flavorPlaceholderDesc = document.getElementById('flavorPlaceholderDesc');

  var flavorMeta = {
    signature: { file: 'image-4.jpg', desc: 'NEVORA Signature — classic Swiss-style milk chocolate bar' },
    intense: { file: 'image-5.png', desc: 'NEVORA Intense — 70% Colombian dark chocolate bar' },
    origin: { file: 'image-6.jpg', desc: 'NEVORA Origin — coffee and sea salt chocolate bar' }
  };

  function setFlavor(name) {
    flavorTabs.forEach(function (tab) {
      var active = tab.getAttribute('data-flavor') === name;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', active);
    });
    flavorImages.forEach(function (img) {
      img.classList.toggle('is-active', img.getAttribute('data-flavor-image') === name);
    });
    flavorTags.forEach(function (tag) {
      tag.classList.toggle('is-visible', tag.getAttribute('data-flavor-tag') === name);
    });
    flavorContents.forEach(function (content) {
      content.classList.toggle('is-active', content.getAttribute('data-flavor-content') === name);
    });
    if (flavorPlaceholderFile && flavorMeta[name]) {
      flavorPlaceholderFile.textContent = flavorMeta[name].file;
      flavorPlaceholderDesc.textContent = flavorMeta[name].desc;
    }
  }

  flavorTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      setFlavor(tab.getAttribute('data-flavor'));
    });
  });
  // Initialize first tag visibility
  var firstTag = document.querySelector('[data-flavor-tag="signature"]');
  if (firstTag) firstTag.classList.add('is-visible');

  /* ---------- Subscription plan toggle ---------- */
  var planToggles = document.querySelectorAll('.toggle__option');
  var priceAmount = document.querySelector('.plan-price__amount');
  var pricePeriod = document.querySelector('.plan-price__period');

  planToggles.forEach(function (option) {
    option.addEventListener('click', function () {
      planToggles.forEach(function (o) { o.classList.remove('is-active'); });
      option.classList.add('is-active');
      var plan = option.getAttribute('data-plan');
      priceAmount.textContent = priceAmount.getAttribute('data-price-' + plan);
      pricePeriod.textContent = pricePeriod.getAttribute('data-period-' + plan);
    });
  });

  var subscribeBtn = document.getElementById('subscribeBtn');
  if (subscribeBtn) {
    subscribeBtn.addEventListener('click', function () {
      document.getElementById('chocolate').scrollIntoView({ behavior: 'smooth' });
    });
  }

  /* ---------- FAQ accordion ---------- */
  var accordionTriggers = document.querySelectorAll('.accordion__trigger');
  accordionTriggers.forEach(function (trigger) {
    var panel = trigger.nextElementSibling;
    trigger.addEventListener('click', function () {
      var isOpen = trigger.getAttribute('aria-expanded') === 'true';

      accordionTriggers.forEach(function (t) {
        t.setAttribute('aria-expanded', 'false');
        t.nextElementSibling.style.maxHeight = null;
      });

      if (!isOpen) {
        trigger.setAttribute('aria-expanded', 'true');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  /* ---------- Testimonial slider ---------- */
  var track = document.getElementById('testimonialTrack');
  var dotsWrap = document.getElementById('testimonialDots');
  if (track) {
    var slides = track.children;
    var current = 0;

    for (var i = 0; i < slides.length; i++) {
      var dot = document.createElement('button');
      dot.setAttribute('aria-label', 'Show testimonial ' + (i + 1));
      if (i === 0) dot.classList.add('is-active');
      (function (index) {
        dot.addEventListener('click', function () { goToSlide(index); });
      })(i);
      dotsWrap.appendChild(dot);
    }

    function goToSlide(index) {
      current = index;
      track.style.transform = 'translateX(-' + (index * 100) + '%)';
      Array.prototype.forEach.call(dotsWrap.children, function (d, di) {
        d.classList.toggle('is-active', di === index);
      });
    }

    var autoplay = setInterval(function () {
      goToSlide((current + 1) % slides.length);
    }, 6000);

    var slider = document.getElementById('testimonialSlider');
    slider.addEventListener('mouseenter', function () { clearInterval(autoplay); });
  }

  /* ---------- Add to Bag modal ---------- */
  var bagModal = document.getElementById('bagModal');
  var bagModalFlavor = document.getElementById('bagModalFlavor');
  var bagModalCount = document.getElementById('bagModalCount');
  var bagCountBadge = document.getElementById('bagCount');
  var bagItemCount = 0;

  document.querySelectorAll('[data-add-to-bag]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      bagItemCount += 1;
      bagModalFlavor.textContent = btn.getAttribute('data-add-to-bag');
      bagModalCount.textContent = bagItemCount;
      bagCountBadge.textContent = bagItemCount;
      bagCountBadge.classList.add('is-visible');
      openModal();
    });
  });

  function openModal() {
    bagModal.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    bagModal.hidden = true;
    document.body.style.overflow = '';
  }
  bagModal.querySelectorAll('[data-modal-close]').forEach(function (el) {
    el.addEventListener('click', closeModal);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !bagModal.hidden) closeModal();
  });

  var bagToggleBtn = document.getElementById('bagToggle');
  bagToggleBtn.addEventListener('click', function () {
    document.getElementById('chocolate').scrollIntoView({ behavior: 'smooth' });
  });

  /* ---------- Newsletter form (front-end prototype, no backend connected) ---------- */
  var newsletterForm = document.getElementById('newsletterForm');
  var newsletterStatus = document.getElementById('newsletterStatus');

  newsletterForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var input = document.getElementById('newsletterEmail');
    var value = input.value.trim();
    var isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    if (!isValid) {
      newsletterStatus.textContent = 'Please enter a valid email address.';
      newsletterStatus.style.color = '#e2916a';
      return;
    }

    newsletterStatus.textContent = 'Thank you — we\'ll be in touch soon.';
    newsletterStatus.style.color = '';
    newsletterForm.reset();
  });

  /* ---------- Initial state on load ---------- */
  updateProgressBar();
  updateNav();
});
