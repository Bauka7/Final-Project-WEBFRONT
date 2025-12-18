document.addEventListener("DOMContentLoaded", () => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const norm = (s) => (s || "").toLowerCase().trim();

  const LS = {
    SHELVES_MAP: "readowl.shelvesMap",
    ACTIVE_TAB: "readowl.activeTab",   // shelves | all
    SEARCH: "readowl.search",
    SORT: "readowl.sort",
    ACTIVE_PAGE: "readowl.activePage", // home | library | shop | news | profile
  };

  // ---------------------------
  // Elements
  // ---------------------------
  const main = $(".main");
  const mainTopbar = $(".main > .topbar");

  const tabsWrap = $(".tabs");
  const tabs = $$(".tab");
  const views = $$(".view");

  const searchInput = $("#searchInput");
  const searchWrap = $(".search");

  const allView = $("#view-all");
  const allGrid = $("#allGrid");
  const sortSelect = $("#sortSelect");
  const emptyState = $("#emptyState");

  const modal = $("#bookModal");
  const mTitle = $("#mTitle");
  const mMeta = $("#mMeta");
  const mShelf = $("#mShelf");
  const mSave = $("#mSave");
  const mToast = $("#mToast");

  // Sidebar / profile buttons
  const menuLinks = $$(".menu__item");
  const profileBtn = $(".profile");
  const miniProfileBtn = $(".mini-profile");

  // ---------------------------
  // Make menu items identifiable (NO HTML change needed)
  // Order in HTML: Home, My library, Shop, News
  // ---------------------------
  if (menuLinks[0]) menuLinks[0].dataset.page = "home";
  if (menuLinks[1]) menuLinks[1].dataset.page = "library";
  if (menuLinks[2]) menuLinks[2].dataset.page = "shop";
  if (menuLinks[3]) menuLinks[3].dataset.page = "news";

  // ---------------------------
  // Shelves containers
  // ---------------------------
  const shelfContainers = {
    current: $("#shelf-current .books"),
    next: $("#shelf-next .books"),
    finished: $("#shelf-finished .books"),
  };

  // ---------------------------
  // LocalStorage restore (shelf map)
  // ---------------------------
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

  function moveBookToShelf(bookEl, shelfKey) {
    const target = shelfContainers[shelfKey];
    if (!target) return;

    target.appendChild(bookEl);
    bookEl.dataset.shelf = shelfKey;
    savedMap[bookEl.dataset.id] = shelfKey;
    saveShelfMap();
  }

  // Restore moved books
  Object.entries(savedMap).forEach(([bookId, shelfKey]) => {
    const book = $(`.book[data-id="${CSS.escape(bookId)}"]`);
    if (book && shelfContainers[shelfKey]) {
      shelfContainers[shelfKey].appendChild(book);
      book.dataset.shelf = shelfKey;
    }
  });

  // Ensure each book knows current shelf
  $$(".shelf").forEach((shelf) => {
    const shelfKey = shelf.dataset.shelf;
    $$(".book", shelf).forEach((b) => {
      if (!b.dataset.shelf) b.dataset.shelf = shelfKey;
    });
  });

  // ---------------------------
  // "Empty main" pages (Home/Shop/News/Profile)
  // ---------------------------
  const libraryNodes = []; // store nodes that belong to library (views + shelf panel)
  views.forEach((v) => libraryNodes.push(v));

  function clearMainKeepTopbar() {
    // remove shelf panel if exists
    const panel = $("#shelfPanel");
    if (panel) panel.remove();

    // hide library UI parts
    if (tabsWrap) tabsWrap.style.display = "none";
    if (searchWrap) searchWrap.style.display = "none";
    views.forEach((v) => (v.style.display = "none"));
  }

  function showLibrary() {
    // show library UI parts
    if (tabsWrap) tabsWrap.style.display = "";
    if (searchWrap) searchWrap.style.display = "";
    views.forEach((v) => (v.style.display = ""));

    // restore tab state
    const tab = localStorage.getItem(LS.ACTIVE_TAB) || "shelves";
    setActiveTab(tab);

    applySearch(searchInput?.value || "");
  }

  // ---------------------------
  // Sidebar active state
  // ---------------------------
  function setActiveMenu(pageKey) {
    menuLinks.forEach((a) => {
      const isActive = a.dataset.page === pageKey;
      a.classList.toggle("is-active", isActive);
      if (isActive) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  function setActivePage(pageKey) {
    localStorage.setItem(LS.ACTIVE_PAGE, pageKey);
    setActiveMenu(pageKey);

    if (pageKey === "library") {
      showLibrary();
      return;
    }

    // for Home/Shop/News/Profile => just clear main content (library hidden)
    clearMainKeepTopbar();
  }

  // Attach menu clicks
  menuLinks.forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const page = a.dataset.page || "library";
      setActivePage(page);
    });
  });

  // Profile click -> profile page (empty main)
  if (profileBtn) {
    profileBtn.addEventListener("click", () => setActivePage("profile"));
    profileBtn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") setActivePage("profile");
    });
  }
  if (miniProfileBtn) miniProfileBtn.addEventListener("click", () => setActivePage("profile"));

  // ---------------------------
  // Tabs / Views (library)
  // ---------------------------
  function setActiveTab(tabName) {
    tabs.forEach((t) => {
      const active = t.dataset.tab === tabName;
      t.classList.toggle("is-active", active);
      t.setAttribute("aria-selected", active ? "true" : "false");
    });

    views.forEach((v) => v.classList.toggle("view--active", v.dataset.view === tabName));
    localStorage.setItem(LS.ACTIVE_TAB, tabName);

    if (tabName === "all") renderAllGrid(getAllBooksData());

    applySearch(searchInput?.value || "");
  }

  tabs.forEach((t) => t.addEventListener("click", () => setActiveTab(t.dataset.tab)));

  // ---------------------------
  // Search
  // ---------------------------
  function applySearch(q) {
    const query = norm(q);
    localStorage.setItem(LS.SEARCH, q || "");

    $$(".shelves .book").forEach((b) => {
      const ok =
        !query ||
        norm(b.dataset.title).includes(query) ||
        norm(b.dataset.author).includes(query);
      b.classList.toggle("is-hidden", !ok);
    });

    if (allView?.classList.contains("view--active")) filterAllGrid(query);
    if (shelfPanelState.open) filterPanelGrid(query);
  }

  if (searchInput) {
    const savedSearch = localStorage.getItem(LS.SEARCH) || "";
    searchInput.value = savedSearch;
    searchInput.addEventListener("input", (e) => applySearch(e.target.value));
  }

  // ---------------------------
  // All Books grid
  // ---------------------------
  function getAllBooksData() {
    return $$(".shelves .book").map((b) => ({
      id: b.dataset.id,
      title: b.dataset.title || "Book",
      author: b.dataset.author || "",
      isbn: b.dataset.isbn || "",
      shelf: b.dataset.shelf || b.closest(".shelf")?.dataset.shelf || "",
    }));
  }

  function renderAllGrid(data) {
    if (!allGrid) return;
    allGrid.innerHTML = "";

    data.forEach((item) => {
      const card = document.createElement("div");
      card.className = "book-card";
      card.dataset.id = item.id;
      card.dataset.title = item.title;
      card.dataset.author = item.author;

      const cover = document.createElement("div");
      cover.className = "book-cover";
      if (item.isbn) {
        cover.style.backgroundImage = `url("https://covers.openlibrary.org/b/isbn/${encodeURIComponent(item.isbn)}-L.jpg")`;
        cover.style.backgroundSize = "cover";
        cover.style.backgroundPosition = "center";
      }

      const name = document.createElement("div");
      name.className = "book-name";
      name.textContent = item.title;

      const author = document.createElement("div");
      author.className = "book-author";
      author.textContent = item.author;

      card.append(cover, name, author);
      card.addEventListener("click", () => openModal(item.id));
      allGrid.appendChild(card);
    });

    sortAllGrid(sortSelect?.value || "title-asc");
    filterAllGrid(searchInput?.value || "");
  }

  function filterAllGrid(queryRaw) {
    const query = norm(queryRaw);
    const cards = $$(".book-card", allGrid);
    let visible = 0;

    cards.forEach((c) => {
      const ok =
        !query ||
        norm(c.dataset.title).includes(query) ||
        norm(c.dataset.author).includes(query);
      c.hidden = !ok;
      if (ok) visible++;
    });

    if (emptyState) emptyState.hidden = visible !== 0;
  }

  function sortAllGrid(mode) {
    if (!allGrid) return;
    const [field, dir] = (mode || "title-asc").split("-");
    const mul = dir === "desc" ? -1 : 1;

    const cards = $$(".book-card", allGrid);
    cards.sort((a, b) => {
      const av = norm(a.dataset[field]);
      const bv = norm(b.dataset[field]);
      if (av < bv) return -1 * mul;
      if (av > bv) return 1 * mul;
      return 0;
    });

    cards.forEach((c) => allGrid.appendChild(c));
  }

  if (sortSelect) {
    const savedSort = localStorage.getItem(LS.SORT) || "title-asc";
    sortSelect.value = savedSort;

    sortSelect.addEventListener("change", (e) => {
      localStorage.setItem(LS.SORT, e.target.value);
      sortAllGrid(e.target.value);
      filterAllGrid(searchInput?.value || "");
    });
  }

  // ---------------------------
  // Full shelf top panel
  // ---------------------------
  const shelfPanelState = { open: false, shelfKey: null };

  function ensureShelfPanel() {
    if ($("#shelfPanel")) return;

    const panel = document.createElement("div");
    panel.id = "shelfPanel";
    panel.className = "shelf-panel";
    panel.hidden = true;

    panel.innerHTML = `
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
    `;

    if (mainTopbar) mainTopbar.insertAdjacentElement("afterend", panel);
    else main.insertAdjacentElement("afterbegin", panel);

    $("#shelfPanelBack").addEventListener("click", closeShelfPanel);
  }

  function shelfNameByKey(key) {
    if (key === "current") return "Currently reading";
    if (key === "next") return "Next up";
    if (key === "finished") return "Finished";
    return "Shelf";
  }

  function openShelfPanel(shelfKey) {
    ensureShelfPanel();
    shelfPanelState.open = true;
    shelfPanelState.shelfKey = shelfKey;

    const panel = $("#shelfPanel");
    panel.hidden = false;

    $("#shelfPanelTitle").textContent = shelfNameByKey(shelfKey);

    buildShelfPanelGrid(shelfKey);
    filterPanelGrid(searchInput?.value || "");
  }

  function closeShelfPanel() {
    const panel = $("#shelfPanel");
    if (!panel) return;
    shelfPanelState.open = false;
    shelfPanelState.shelfKey = null;
    panel.hidden = true;
  }

  function buildShelfPanelGrid(shelfKey) {
    const grid = $("#shelfPanelGrid");
    if (!grid) return;
    grid.innerHTML = "";

    const books = $$(`.shelves .book[data-shelf="${CSS.escape(shelfKey)}"]`);

    books.forEach((b) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "panel-book";
      card.dataset.id = b.dataset.id;
      card.dataset.title = b.dataset.title || "";
      card.dataset.author = b.dataset.author || "";

      const img = $(".book__img", b);
      if (img?.src) {
        card.style.backgroundImage = `url("${img.src}")`;
        card.style.backgroundSize = "cover";
        card.style.backgroundPosition = "center";
      }

      card.title = `${b.dataset.title || "Book"} — ${b.dataset.author || ""}`;
      card.addEventListener("click", () => openModal(b.dataset.id));
      grid.appendChild(card);
    });
  }

  function filterPanelGrid(queryRaw) {
    const query = norm(queryRaw);
    const grid = $("#shelfPanelGrid");
    const empty = $("#shelfPanelEmpty");
    if (!grid) return;

    const cards = $$(".panel-book", grid);
    let visible = 0;

    cards.forEach((c) => {
      const ok =
        !query ||
        norm(c.dataset.title).includes(query) ||
        norm(c.dataset.author).includes(query);
      c.hidden = !ok;
      if (ok) visible++;
    });

    if (empty) empty.hidden = visible !== 0;
  }

  $$(".shelf__link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const parentShelf = link.closest(".shelf");
      const shelfKey = link.dataset.shelf || parentShelf?.dataset.shelf || "next";
      setActivePage("library");
      openShelfPanel(shelfKey);
    });
  });

  // ---------------------------
  // Modal
  // ---------------------------
  function openModal(bookId) {
    const book = $(`.shelves .book[data-id="${CSS.escape(bookId)}"]`);
    if (!book) return;

    const title = book.dataset.title || "Book";
    const author = book.dataset.author || "";
    const currentShelf = book.dataset.shelf || book.closest(".shelf")?.dataset.shelf || "current";

    mTitle.textContent = title;
    mMeta.textContent = author ? `by ${author}` : "Move this book to another shelf";
    mShelf.value = currentShelf;

    mToast.style.display = "none";
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");

    mSave.onclick = () => {
      const newShelf = mShelf.value;
      moveBookToShelf(book, newShelf);

      if (shelfPanelState.open) {
        buildShelfPanelGrid(shelfPanelState.shelfKey);
        filterPanelGrid(searchInput?.value || "");
      }

      if (allView?.classList.contains("view--active")) {
        renderAllGrid(getAllBooksData());
      }

      mToast.style.display = "block";
      setTimeout(() => (mToast.style.display = "none"), 900);
    };
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  }

  $$("[data-close='1']", modal).forEach((x) => x.addEventListener("click", closeModal));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
      closeShelfPanel();
    }
  });

  $$(".shelves .book").forEach((b) => b.addEventListener("click", () => openModal(b.dataset.id)));

  // ---------------------------
  // Init
  // ---------------------------
  const savedSearch = localStorage.getItem(LS.SEARCH) || "";
  if (searchInput) searchInput.value = savedSearch;

  const initialPage = localStorage.getItem(LS.ACTIVE_PAGE) || "library";
  setActivePage(initialPage);

  const initialTab = localStorage.getItem(LS.ACTIVE_TAB) || "shelves";
  if (initialPage === "library" && initialTab === "all") {
    renderAllGrid(getAllBooksData());
  }

  if (initialPage === "library") applySearch(savedSearch);
});
