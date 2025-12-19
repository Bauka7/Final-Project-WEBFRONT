$(document).ready(function() {
  'use strict';

  // Check authentication
function checkAuth() {
  const LS = {
    CURRENT_USER: "readowl.currentUser",
    USERS: "readowl.users"
  };

  function getLocalStorage(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  const currentUser = getLocalStorage(LS.CURRENT_USER);
  
  if (!currentUser) {
    // Not logged in, redirect to login
    if (!window.location.pathname.includes('login.html') && 
        !window.location.pathname.includes('register.html')) {
      window.location.href = 'login.html';
      return false;
    }
  } else {
    // Update profile with current user
    updateUserProfile(currentUser);
  }
  
  return true;
}

// Update profile with user data
function updateUserProfile(user) {
  // Update profile button
  $('.profile__name').text(user.firstName);
  $('.profile__avatar').text(user.avatar);
  
  // Update mini profile
  $('.mini-profile__avatar').text(user.avatar);
  
  // Update profile page
  $('.profile-header__name').text(user.firstName + ' ' + user.lastName);
  $('.profile-header__email').text(user.email);
  $('.profile-header__avatar').text(user.avatar);

  updateHomeWelcomeMessage(user.firstName);
}

function updateHomeWelcomeMessage(firstName) {
    // Update the welcome title
    $('.home-hero__title').text(`Welcome back, ${firstName}!`);
  }

// Add logout function
function initLogout() {
  const LS = {
    CURRENT_USER: "readowl.currentUser"
  };

  // Add logout button to profile page
  const $logoutBtn = $(`
    <button class="auth-btn logout-btn" style="margin-top: 20px;">
      Sign Out
    </button>
  `);
  
  $('.profile-sections').append($logoutBtn);
  
  $logoutBtn.on('click', function() {
    localStorage.removeItem(LS.CURRENT_USER);
    window.location.href = 'login.html';
  });
}

// Call checkAuth at the beginning
if (!checkAuth()) {
  return; // Stop execution if not authenticated
}

// Then continue with the rest of your existing code...
// Add this line at the very end of the document ready function:


  const LS = {
    SHELVES_MAP: "readowl.shelvesMap",
    ACTIVE_TAB: "readowl.activeTab",
    SEARCH: "readowl.search",
    SORT: "readowl.sort",
    ACTIVE_PAGE: "readowl.activePage",
    SHOP_FILTER: "readowl.shopFilter",
    SHOP_SORT: "readowl.shopSort",
    PROFILE_SETTINGS: "readowl.profileSettings",
    READING_STATS: "readowl.readingStats",
    FAVORITES: "readowl.favorites",
    RECENT_VIEWED: "readowl.recentViewed"
  };

  const norm = (s) => (s || "").toLowerCase().trim();

  const $main = $(".main");
  const $mainTopbar = $(".main > .topbar");
  const $tabsWrap = $(".tabs");
  const $tabs = $(".tab");
  const $views = $(".view");
  const $searchInput = $("#searchInput");
  const $searchWrap = $(".search");
  const $allView = $("#view-all");
  const $allGrid = $("#allGrid");
  const $sortSelect = $("#sortSelect");
  const $emptyState = $("#emptyState");
  const $modal = $("#bookModal");
  const $mTitle = $("#mTitle");
  const $mMeta = $("#mMeta");
  const $mShelf = $("#mShelf");
  const $mSave = $("#mSave");
  const $mToast = $("#mToast");
  const $menuLinks = $(".menu__item");
  const $profileBtn = $(".profile");
  const $miniProfileBtn = $(".mini-profile");

  const shelfContainers = {
    current: $("#shelf-current .books"),
    next: $("#shelf-next .books"),
    finished: $("#shelf-finished .books"),
  };

  const savedMap = (() => {
    try {
      return JSON.parse(localStorage.getItem(LS.SHELVES_MAP) || "{}");
    } catch {
      return {};
    }
  })();
  

  function saveShelfMap() {
    localStorage.setItem(LS.SHELVES_MAP, JSON.stringify(savedMap));
  }

  function getLocalStorage(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  function setLocalStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Error saving to localStorage:", e);
    }
  }

  function initParallax() {
    $(window).on('scroll', function() {
      const scrolled = $(window).scrollTop();
      const parallaxElements = $('.parallax-element');
      
      parallaxElements.each(function() {
        const $el = $(this);
        const speed = $el.data('speed') || 0.5;
        const yPos = -(scrolled * speed);
        $el.css('transform', `translateY(${yPos}px)`);
      });

      $('.home-hero, .shop-header, .news-header').each(function() {
        const $hero = $(this);
        const heroTop = $hero.offset().top;
        const heroHeight = $hero.outerHeight();
        const scrollTop = $(window).scrollTop();
        const windowHeight = $(window).height();
        
        if (scrollTop + windowHeight > heroTop && scrollTop < heroTop + heroHeight) {
          const progress = (scrollTop + windowHeight - heroTop) / (heroHeight + windowHeight);
          $hero.find('.parallax-bg').css('transform', `translateY(${progress * 30}px)`);
        }
      });
    });

    $('.stat-card, .trending-book, .shop-book, .news-card').on('mousemove', function(e) {
      const $card = $(this);
      const cardOffset = $card.offset();
      const x = e.pageX - cardOffset.left;
      const y = e.pageY - cardOffset.top;
      const centerX = $card.outerWidth() / 2;
      const centerY = $card.outerHeight() / 2;
      const moveX = (x - centerX) / 10;
      const moveY = (y - centerY) / 10;
      
      $card.css('transform', `translateY(-4px) rotateX(${-moveY}deg) rotateY(${moveX}deg)`);
    }).on('mouseleave', function() {
      $(this).css('transform', 'translateY(0) rotateX(0) rotateY(0)');
    });
  }

  function initAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          $(entry.target).addClass('animate-in');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    $('.stat-card, .trending-book, .digest-card, .recommendation-card, .shop-book, .news-card, .achievement').each(function() {
      observer.observe(this);
    });

    $('.home-stats, .trending-books, .digest-grid, .shop-grid, .news-grid').children().each(function(index) {
      $(this).css('animation-delay', `${index * 0.1}s`);
    });
  }

  function moveBookToShelf(bookEl, shelfKey) {
    const $book = $(bookEl);
    const target = shelfContainers[shelfKey];
    if (!target || !target.length) return;

    target.append($book);
    $book.attr('data-shelf', shelfKey);
    savedMap[$book.data('id')] = shelfKey;
    saveShelfMap();
    
    $book.css({
      transform: 'scale(0.8)',
      opacity: 0
    }).animate({
      opacity: 1
    }, 300).css('transform', 'scale(1)');
  }

  $.each(savedMap, function(bookId, shelfKey) {
    const $book = $(`.book[data-id="${bookId}"]`);
    const target = shelfContainers[shelfKey];
    if ($book.length && target.length) {
      target.append($book);
      $book.attr('data-shelf', shelfKey);
    }
  });

  $(".shelf").each(function() {
    const shelfKey = $(this).data('shelf');
    $(this).find(".book").each(function() {
      if (!$(this).data('shelf')) {
        $(this).attr('data-shelf', shelfKey);
      }
    });
  });

  function clearMainKeepTopbar() {
    $("#shelfPanel").remove();
    $tabsWrap.hide();
    $searchWrap.hide();
    $("#view-shelves, #view-all").hide().removeClass('view--active');
  }

  function showLibrary() {
    $("#view-home, #view-shop, #view-news, #view-profile").hide().removeClass('view--active');
    $("#view-shelves").show().addClass('view--active');
    $tabsWrap.hide();
    $searchWrap.hide();
  }

  function setActiveMenu(pageKey) {
    $menuLinks.removeClass('is-active').removeAttr('aria-current');
    $menuLinks.filter(`[data-page="${pageKey}"]`).addClass('is-active').attr('aria-current', 'page');
  }

  function setActivePage(pageKey) {
    setLocalStorage(LS.ACTIVE_PAGE, pageKey);
    setActiveMenu(pageKey);

    if (pageKey === "library") {
      showLibrary();
      return;
    }

    clearMainKeepTopbar();
    
    const pageViews = {
      home: $("#view-home"),
      shop: $("#view-shop"),
      news: $("#view-news"),
      profile: $("#view-profile")
    };
    
    $.each(pageViews, function(key, $view) {
      if ($view.length) {
        $view.hide().removeClass('view--active');
      }
    });
    
    const $selectedView = pageViews[pageKey];
    if ($selectedView && $selectedView.length) {
      $selectedView.fadeIn(300).addClass('view--active');
      
      if (pageKey === 'home') {
        updateReadingStats();
      }
    }
  }

  $menuLinks.on('click', function(e) {
    e.preventDefault();
    const page = $(this).data('page') || "library";
    setActivePage(page);
  });

  $profileBtn.on('click', function() {
    setActivePage("profile");
  });

  $miniProfileBtn.on('click', function() {
    setActivePage("profile");
  });

  function setActiveTab(tabName) {
    $tabs.removeClass('is-active').attr('aria-selected', 'false');
    $tabs.filter(`[data-tab="${tabName}"]`).addClass('is-active').attr('aria-selected', 'true');

    $views.removeClass('view--active');
    $views.filter(`[data-view="${tabName}"]`).addClass('view--active');
    
    setLocalStorage(LS.ACTIVE_TAB, tabName);

    if (tabName === "all") {
      renderAllGrid(getAllBooksData());
    }

    applySearch($searchInput.val() || "");
  }

  $tabs.on('click', function() {
    setActiveTab($(this).data('tab'));
  });

  function applySearch(q) {
    const query = norm(q);
    setLocalStorage(LS.SEARCH, q || "");

    $(".shelves .book").each(function() {
      const $book = $(this);
      const title = norm($book.data('title') || '');
      const author = norm($book.data('author') || '');
      const ok = !query || title.includes(query) || author.includes(query);
      
      $book.toggleClass('is-hidden', !ok);
      
      if (ok) {
        $book.fadeIn(200);
      } else {
        $book.fadeOut(200);
      }
    });

    if ($allView.hasClass('view--active')) {
      filterAllGrid(query);
    }
    if (shelfPanelState.open) {
      filterPanelGrid(query);
    }
  }

  const savedSearch = getLocalStorage(LS.SEARCH, "");
  if ($searchInput.length) {
    $searchInput.val(savedSearch);
    $searchInput.on('input', function() {
      applySearch($(this).val());
    });
  }

  function getAllBooksData() {
    const books = [];
    $(".shelves .book").each(function() {
      const $book = $(this);
      books.push({
        id: $book.data('id'),
        title: $book.data('title') || "Book",
        author: $book.data('author') || "",
        isbn: $book.data('isbn') || "",
        shelf: $book.data('shelf') || $book.closest(".shelf").data('shelf') || "",
      });
    });
    return books;
  }

  function renderAllGrid(data) {
    if (!$allGrid.length) return;
    $allGrid.empty();

    $.each(data, function(index, item) {
      const $card = $('<div>').addClass('book-card')
        .attr('data-id', item.id)
        .attr('data-title', item.title)
        .attr('data-author', item.author)
        .css('animation-delay', `${index * 0.05}s`);

      const $cover = $('<div>').addClass('book-cover');
      if (item.isbn) {
        $cover.css({
          backgroundImage: `url("https://covers.openlibrary.org/b/isbn/${encodeURIComponent(item.isbn)}-L.jpg")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        });
      }

      const $name = $('<div>').addClass('book-name').text(item.title);
      const $author = $('<div>').addClass('book-author').text(item.author);

      $card.append($cover, $name, $author);
      $card.on('click', function() {
        openModal(item.id);
      });
      
      $allGrid.append($card);
    });

    const sortMode = $sortSelect.val() || "title-asc";
    sortAllGrid(sortMode);
    filterAllGrid($searchInput.val() || "");
  }

  function filterAllGrid(queryRaw) {
    const query = norm(queryRaw);
    let visible = 0;

    $(".book-card", $allGrid).each(function() {
      const $card = $(this);
      const title = norm($card.data('title') || '');
      const author = norm($card.data('author') || '');
      const ok = !query || title.includes(query) || author.includes(query);
      
      if (ok) {
        $card.fadeIn(200);
        visible++;
      } else {
        $card.fadeOut(200);
      }
    });

    $emptyState.toggle(visible === 0);
  }

  function sortAllGrid(mode) {
    if (!$allGrid.length) return;
    const [field, dir] = (mode || "title-asc").split("-");
    const mul = dir === "desc" ? -1 : 1;

    const $cards = $(".book-card", $allGrid);
    const cardsArray = $cards.toArray();
    
    cardsArray.sort((a, b) => {
      const $a = $(a);
      const $b = $(b);
      const av = norm($a.data(field) || '');
      const bv = norm($b.data(field) || '');
      if (av < bv) return -1 * mul;
      if (av > bv) return 1 * mul;
      return 0;
    });

    $.each(cardsArray, function() {
      $allGrid.append(this);
    });
  }

  if ($sortSelect.length) {
    const savedSort = getLocalStorage(LS.SORT, "title-asc");
    $sortSelect.val(savedSort);
    $sortSelect.on('change', function() {
      const value = $(this).val();
      setLocalStorage(LS.SORT, value);
      sortAllGrid(value);
      filterAllGrid($searchInput.val() || "");
    });
  }

  const shelfPanelState = { open: false, shelfKey: null };

  function ensureShelfPanel() {
    if ($("#shelfPanel").length) return;

    const $panel = $('<div>')
      .attr('id', 'shelfPanel')
      .addClass('shelf-panel')
      .hide()
      .html(`
        <div class="shelf-panel__head">
          <button class="shelf-panel__back" type="button" id="shelfPanelBack">← Back</button>
          <div class="shelf-panel__titles">
            <div class="shelf-panel__title" id="shelfPanelTitle">Shelf</div>
            <div class="shelf-panel__sub">All books from this shelf</div>
          </div>
        </div>
        <div class="shelf-panel__grid" id="shelfPanelGrid"></div>
        <div class="empty" id="shelfPanelEmpty" hidden>
          <div class="empty__title">No results</div>
          <div class="empty__text">Try another search.</div>
        </div>
      `);

    if ($mainTopbar.length) {
      $mainTopbar.after($panel);
    } else {
      $main.prepend($panel);
    }

    $("#shelfPanelBack").on('click', closeShelfPanel);
  }

  function shelfNameByKey(key) {
    const names = {
      current: "Currently reading",
      next: "Next up",
      finished: "Finished"
    };
    return names[key] || "Shelf";
  }

  function openShelfPanel(shelfKey) {
    ensureShelfPanel();
    shelfPanelState.open = true;
    shelfPanelState.shelfKey = shelfKey;

    const $panel = $("#shelfPanel");
    $("#shelfPanelTitle").text(shelfNameByKey(shelfKey));
    
    $panel.slideDown(300);
    buildShelfPanelGrid(shelfKey);
    filterPanelGrid($searchInput.val() || "");
  }

  function closeShelfPanel() {
    const $panel = $("#shelfPanel");
    if (!$panel.length) return;
    shelfPanelState.open = false;
    shelfPanelState.shelfKey = null;
    $panel.slideUp(300);
  }

  function buildShelfPanelGrid(shelfKey) {
    const $grid = $("#shelfPanelGrid");
    if (!$grid.length) return;
    $grid.empty();

    $(`.shelves .book[data-shelf="${shelfKey}"]`).each(function(index) {
      const $b = $(this);
      const $card = $('<button>')
        .attr('type', 'button')
        .addClass('panel-book')
        .attr('data-id', $b.data('id'))
        .attr('data-title', $b.data('title') || '')
        .attr('data-author', $b.data('author') || '')
        .css('animation-delay', `${index * 0.05}s`);

      const $img = $b.find(".book__img");
      if ($img.length && $img.attr('src')) {
        $card.css({
          backgroundImage: `url("${$img.attr('src')}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        });
      }

      $card.attr('title', `${$b.data('title') || "Book"} — ${$b.data('author') || ""}`);
      $card.on('click', function() {
        openModal($b.data('id'));
      });
      
      $grid.append($card);
    });
  }

  function filterPanelGrid(queryRaw) {
    const query = norm(queryRaw);
    const $grid = $("#shelfPanelGrid");
    const $empty = $("#shelfPanelEmpty");
    if (!$grid.length) return;

    let visible = 0;
    $(".panel-book", $grid).each(function() {
      const $card = $(this);
      const title = norm($card.data('title') || '');
      const author = norm($card.data('author') || '');
      const ok = !query || title.includes(query) || author.includes(query);
      
      if (ok) {
        $card.fadeIn(200);
        visible++;
      } else {
        $card.fadeOut(200);
      }
    });

    $empty.toggle(visible === 0);
  }

  $(".shelf__link").on('click', function(e) {
    e.preventDefault();
    const $link = $(this);
    const shelfKey = $link.data('shelf') || $link.closest(".shelf").data('shelf') || "next";
    setActivePage("library");
    openShelfPanel(shelfKey);
  });

  function openModal(bookId) {
    const $book = $(`.shelves .book[data-id="${bookId}"]`);
    if (!$book.length) return;

    const title = $book.data('title') || "Book";
    const author = $book.data('author') || "";
    const currentShelf = $book.data('shelf') || $book.closest(".shelf").data('shelf') || "current";

    $mTitle.text(title);
    $mMeta.text(author ? `by ${author}` : "Move this book to another shelf");
    $mShelf.val(currentShelf);
    $mToast.hide();

    $modal.fadeIn(300).addClass('is-open').attr('aria-hidden', 'false');

    $mSave.off('click').on('click', function() {
      const newShelf = $mShelf.val();
      moveBookToShelf($book[0], newShelf);

      if (shelfPanelState.open) {
        buildShelfPanelGrid(shelfPanelState.shelfKey);
        filterPanelGrid($searchInput.val() || "");
      }

      if ($allView.hasClass('view--active')) {
        renderAllGrid(getAllBooksData());
      }

      $mToast.fadeIn(200).delay(700).fadeOut(200);
    });
  }

  function closeModal() {
    $modal.fadeOut(300).removeClass('is-open').attr('aria-hidden', 'true');
  }

  $modal.find("[data-close='1']").on('click', closeModal);

  $(document).on('keydown', function(e) {
    if (e.key === "Escape") {
      closeModal();
      closeShelfPanel();
    }
  });

  $(".shelves .book").on('click', function() {
    openModal($(this).data('id'));
  });

  $('.filter-btn').on('click', function() {
    $('.filter-btn').removeClass('is-active');
    $(this).addClass('is-active');
    const filter = $(this).text().trim();
    setLocalStorage(LS.SHOP_FILTER, filter);
    filterShopBooks(filter);
  });

  function filterShopBooks(filter) {
    if (filter === 'All') {
      $('.shop-book').fadeIn(300);
      return;
    }
    
    $('.shop-book').each(function() {
      $(this).fadeIn(300);
    });
  }

  $('.shop-book__btn').on('click', function(e) {
    e.stopPropagation();
    const $btn = $(this);
    const $book = $btn.closest('.shop-book');
    const title = $book.find('.shop-book__title').text();
    
    $btn.text('Added!').prop('disabled', true);
    
    const favorites = getLocalStorage(LS.FAVORITES, []);
    if (!favorites.includes(title)) {
      favorites.push(title);
      setLocalStorage(LS.FAVORITES, favorites);
    }
    
    setTimeout(() => {
      $btn.text('Add to Library').prop('disabled', false);
    }, 2000);
  });

  // ===================== PROFILE SETTINGS =====================
  const profileSettings = getLocalStorage(LS.PROFILE_SETTINGS, {
    notifications: true,
    darkMode: false,
    readingReminders: true
  });

  $('.setting-toggle input').each(function() {
    const $toggle = $(this);
    const setting = $toggle.closest('.setting-item').find('.setting-item__label').text().toLowerCase().replace(/\s+/g, '');
    const key = setting === 'notifications' ? 'notifications' : 
                setting === 'darkmode' ? 'darkMode' : 'readingReminders';
    $toggle.prop('checked', profileSettings[key] || false);
  });

  $('.setting-toggle input').on('change', function() {
    const $toggle = $(this);
    const $item = $toggle.closest('.setting-item');
    const setting = $item.find('.setting-item__label').text().toLowerCase().replace(/\s+/g, '');
    const key = setting === 'notifications' ? 'notifications' : 
                setting === 'darkmode' ? 'darkMode' : 'readingReminders';
    
    profileSettings[key] = $toggle.is(':checked');
    setLocalStorage(LS.PROFILE_SETTINGS, profileSettings);
  });

  // ===================== READING STATS =====================
  function updateReadingStats() {
    const stats = getLocalStorage(LS.READING_STATS, {
      totalBooks: 15,
      readingNow: 3,
      finished: 6,
      dayStreak: 12
    });

    $('.stat-card').each(function() {
      const $card = $(this);
      const icon = $card.find('.stat-card__icon').text();
      let value = 0;
      
      if (icon.includes('📚')) value = stats.totalBooks;
      else if (icon.includes('📖')) value = stats.readingNow;
      else if (icon.includes('✅')) value = stats.finished;
      else if (icon.includes('🔥')) value = stats.dayStreak;
      
      $card.find('.stat-card__value').text(value);
    });
  }

  // ===================== INITIALIZATION =====================
  const initialPage = getLocalStorage(LS.ACTIVE_PAGE, "home");
  
  // Скрываем все views по умолчанию
  $views.hide().removeClass('view--active');
  
  setActivePage(initialPage);

  // XXX Сохранение всех данных в Local Storage при любых изменениях
  console.log('Local Storage initialized:', {
    activePage: getLocalStorage(LS.ACTIVE_PAGE),
    activeTab: getLocalStorage(LS.ACTIVE_TAB),
    search: getLocalStorage(LS.SEARCH),
    sort: getLocalStorage(LS.SORT),
    shelvesMap: getLocalStorage(LS.SHELVES_MAP),
    shopFilter: getLocalStorage(LS.SHOP_FILTER),
    profileSettings: getLocalStorage(LS.PROFILE_SETTINGS),
    readingStats: getLocalStorage(LS.READING_STATS),
    favorites: getLocalStorage(LS.FAVORITES)
  });

  // Initialize animations and parallax
  initAnimations();
  initParallax();

  initLogout();

  // Smooth scroll for anchor links
  $('a[href^="#"]').on('click', function(e) {
    const target = $(this.getAttribute('href'));
    if (target.length) {
      e.preventDefault();
      $('html, body').animate({
        scrollTop: target.offset().top - 20
      }, 600);
    }
  });

  // Loading animation for images
  $('img').on('load', function() {
    $(this).addClass('loaded');
  }).each(function() {
    if (this.complete) {
      $(this).addClass('loaded');
    }
  });

  // Add ripple effect to buttons
  $('.modal__btn, .shop-book__btn, .filter-btn, .tab, .setting-toggle').on('click', function(e) {
    const $btn = $(this);
    const ripple = $('<span>').addClass('ripple');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.css({
      width: size,
      height: size,
      left: x,
      top: y
    });
    
    $btn.append(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  });

  // Keyboard navigation improvements
  $('.menu__item, .tab, .filter-btn').on('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      $(this).click();
    }
  });

  // Focus visible for accessibility
  $('a, button, input, select').on('focus', function() {
    $(this).addClass('focus-visible');
  }).on('blur', function() {
    $(this).removeClass('focus-visible');
  });
  
    // ===================== LOGOUT FUNCTIONALITY =====================
  
  // Function to handle logout
  function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
      // Clear user session
      localStorage.removeItem('readowl.currentUser');
      
      // Optional: Clear other user-specific data
      // const keys = Object.keys(localStorage);
      // keys.forEach(key => {
      //   if (key.startsWith('readowl.user_')) {
      //     localStorage.removeItem(key);
      //   }
      // });
      
      // Redirect to login
      window.location.href = 'login.html';
    }
  }
  
  // Add logout button to profile header (if it doesn't exist)
  function setupLogoutButton() {
    // Check if we're on profile page
    if ($('#view-profile').is(':visible')) {
      // Add logout button to header
      if ($('.profile-header__logout').length === 0) {
        const $logoutBtn = $('<button class="profile-header__logout">Sign Out</button>');
        $('.profile-header__edit').after($logoutBtn);
        
        // Style the button
        $logoutBtn.css({
          'margin-top': '12px',
          'border': '1px solid rgba(239, 68, 68, 0.3)',
          'background': 'rgba(239, 68, 68, 0.1)',
          'color': '#ef4444',
          'border-radius': '12px',
          'padding': '10px 16px',
          'font-size': '13px',
          'font-weight': '600',
          'cursor': 'pointer',
          'transition': 'all .25s ease',
          'width': '100%'
        });
        
        // Add click handler
        $logoutBtn.on('click', handleLogout);
        
        // Add hover effect
        $logoutBtn.hover(
          function() {
            $(this).css({
              'background': 'rgba(239, 68, 68, 0.2)',
              'transform': 'translateY(-1px)'
            });
          },
          function() {
            $(this).css({
              'background': 'rgba(239, 68, 68, 0.1)',
              'transform': 'translateY(0)'
            });
          }
        );
      }
      
      // Also add logout to settings section
      if ($('.settings-list').length && $('.logout-btn').length === 0) {
        const $logoutItem = $(`
          <div class="setting-item">
            <span class="setting-item__label" style="color: #ef4444;">Sign Out</span>
            <button class="logout-btn" style="
              color: #ef4444;
              font-weight: 600;
              border: none;
              background: none;
              cursor: pointer;
              padding: 8px 16px;
              border-radius: 8px;
            ">Logout</button>
          </div>
        `);
        
        $('.settings-list').append($logoutItem);
        $logoutItem.find('.logout-btn').on('click', handleLogout);
        
        // Add hover effect
        $logoutItem.find('.logout-btn').hover(
          function() { $(this).css('background', 'rgba(239, 68, 68, 0.1)'); },
          function() { $(this).css('background', 'none'); }
        );
      }
    }
  }
  
  // Setup logout when profile page loads
  $(document).on('click', '.menu__item[data-page="profile"]', function() {
    setTimeout(setupLogoutButton, 350); // Wait for fadeIn animation
  });
  
  // Also setup if profile page is already active
  if ($('#view-profile').hasClass('view--active')) {
    setupLogoutButton();
  }
  
  // ===================== END LOGOUT FUNCTIONALITY =====================
});
