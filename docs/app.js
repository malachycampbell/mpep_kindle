(() => {
  "use strict";

  const STORAGE_KEY = "mpep-flashcards-progress-v1";
  const BOX_INTERVALS_DAYS = [0, 1, 3, 7]; // box 0..3, box 3 = mastered
  const MAX_BOX = BOX_INTERVALS_DAYS.length - 1;

  const SESSION_LABELS = {
    "2002-10-16": "Oct 16, 2002",
    "2003-04-15": "Apr 15, 2003",
    "2003-10-15": "Oct 15, 2003",
  };

  let bank = [];
  let progress = loadProgress();
  let deck = [];
  let deckIndex = 0;
  let sessionStats = { seen: 0, again: 0, good: 0 };

  const screens = {
    setup: document.getElementById("screen-setup"),
    study: document.getElementById("screen-study"),
    summary: document.getElementById("screen-summary"),
    stats: document.getElementById("screen-stats"),
  };

  function showScreen(name) {
    Object.values(screens).forEach((s) => (s.hidden = true));
    screens[name].hidden = false;
  }

  // ---------- progress storage ----------

  function loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      /* ignore quota/private-mode errors */
    }
  }

  function getRecord(id) {
    return progress[id] || null;
  }

  function isNew(id) {
    return !progress[id];
  }

  function isDue(id) {
    const r = progress[id];
    return !!r && r.dueAt <= Date.now();
  }

  function isMastered(id) {
    const r = progress[id];
    return !!r && r.box >= MAX_BOX;
  }

  function grade(id, result) {
    const prev = progress[id] || { box: 0, reps: 0 };
    let box;
    if (result === "again") {
      box = 0;
    } else {
      box = Math.min(prev.box + 1, MAX_BOX);
    }
    const days = BOX_INTERVALS_DAYS[box];
    progress[id] = {
      box,
      reps: (prev.reps || 0) + 1,
      lastResult: result,
      lastSeenAt: Date.now(),
      dueAt: Date.now() + days * 24 * 60 * 60 * 1000,
    };
    saveProgress();
  }

  // ---------- data load ----------

  fetch("data/bank.json")
    .then((r) => r.json())
    .then((data) => {
      bank = data;
      wireSetupScreen();
      updateDeckCount();
    })
    .catch((err) => {
      document.getElementById("deck-count").textContent =
        "Couldn't load flashcards/data/bank.json (" + err + ")";
    });

  // ---------- setup screen ----------

  function currentFilters() {
    const sessions = Array.from(document.querySelectorAll(".f-session:checked")).map((el) => el.value);
    const parts = Array.from(document.querySelectorAll(".f-part:checked")).map((el) => el.value);
    const statuses = Array.from(document.querySelectorAll(".f-status:checked")).map((el) => el.value);
    const progressMode = document.querySelector('input[name="f-progress"]:checked').value;
    const shuffle = document.getElementById("f-shuffle").checked;
    return { sessions, parts, statuses, progressMode, shuffle };
  }

  function filterCards(filters) {
    return bank.filter((c) => {
      if (!filters.sessions.includes(c.source.session_date)) return false;
      if (!filters.parts.includes(c.source.part)) return false;
      if (!filters.statuses.includes(c.current_law_status)) return false;
      if (filters.progressMode === "due" && !isDue(c.id)) return false;
      if (filters.progressMode === "new" && !isNew(c.id)) return false;
      return true;
    });
  }

  function updateDeckCount() {
    const filters = currentFilters();
    const matched = filterCards(filters);
    const label = document.getElementById("deck-count");
    label.textContent = matched.length === 1 ? "1 card matches" : matched.length + " cards match";
    document.getElementById("start-btn").disabled = matched.length === 0;
    return matched;
  }

  function wireSetupScreen() {
    document
      .querySelectorAll(".f-session, .f-part, .f-status, input[name='f-progress']")
      .forEach((el) => el.addEventListener("change", updateDeckCount));

    document.getElementById("start-btn").addEventListener("click", () => {
      const filters = currentFilters();
      let cards = filterCards(filters);
      if (filters.shuffle) shuffleInPlace(cards);
      startSession(cards);
    });
  }

  function shuffleInPlace(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  // ---------- study screen ----------

  function startSession(cards) {
    deck = cards;
    deckIndex = 0;
    sessionStats = { seen: 0, again: 0, good: 0 };
    showScreen("study");
    renderCard();
  }

  function sourceLabel(source) {
    const label = SESSION_LABELS[source.session_date] || source.session_date;
    return label + " · " + source.part.toUpperCase() + " · Q" + source.number;
  }

  function renderCard() {
    const card = deck[deckIndex];

    document.getElementById("progress-label").textContent = (deckIndex + 1) + " / " + deck.length;
    document.getElementById("progress-fill").style.width = ((deckIndex) / deck.length * 100) + "%";

    document.getElementById("card-source").textContent = sourceLabel(card.source);

    const badge = document.getElementById("card-badge");
    if (card.current_law_status === "STILL_VALID") {
      badge.textContent = "Still valid";
      badge.className = "badge valid";
    } else {
      badge.textContent = "Updated";
      badge.className = "badge updated";
    }

    document.getElementById("card-question").textContent = card.question;

    const choicesEl = document.getElementById("card-choices");
    choicesEl.innerHTML = "";
    Object.keys(card.choices)
      .sort()
      .forEach((letter) => {
        const row = document.createElement("div");
        row.className = "choice";
        row.dataset.letter = letter;
        row.innerHTML =
          '<span class="choice-letter">' + letter + "</span><span>" + escapeHtml(card.choices[letter]) + "</span>";
        choicesEl.appendChild(row);
      });

    document.getElementById("card-correct-letter").textContent = "(" + card.answer + ")";
    document.getElementById("card-explanation").textContent = card.explanation;

    const revisionsEl = document.getElementById("card-revisions");
    if (card.revisions && card.revisions.length) {
      revisionsEl.hidden = false;
      revisionsEl.innerHTML =
        "<strong>Updated from the original question:</strong><ul>" +
        card.revisions.map((r) => "<li>" + escapeHtml(r) + "</li>").join("") +
        "</ul>";
    } else {
      revisionsEl.hidden = true;
      revisionsEl.innerHTML = "";
    }

    document.getElementById("card-answer").hidden = true;
    document.getElementById("reveal-btn").hidden = false;
    document.getElementById("grade-actions").hidden = true;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function revealAnswer() {
    const card = deck[deckIndex];
    document.getElementById("card-answer").hidden = false;
    document.getElementById("reveal-btn").hidden = true;
    document.getElementById("grade-actions").hidden = false;

    document.querySelectorAll("#card-choices .choice").forEach((row) => {
      if (row.dataset.letter === card.answer) row.classList.add("correct");
    });
  }

  function gradeCurrentCard(result) {
    const card = deck[deckIndex];
    grade(card.id, result);
    sessionStats.seen += 1;
    sessionStats[result] += 1;

    if (deckIndex + 1 >= deck.length) {
      document.getElementById("progress-fill").style.width = "100%";
      finishSession();
    } else {
      deckIndex += 1;
      renderCard();
    }
  }

  function finishSession() {
    showScreen("summary");
    document.getElementById("summary-text").textContent =
      "Reviewed " + sessionStats.seen + " card" + (sessionStats.seen === 1 ? "" : "s") + " — " +
      sessionStats.good + " got it, " + sessionStats.again + " to review again.";
  }

  document.getElementById("reveal-btn").addEventListener("click", revealAnswer);
  document.querySelectorAll(".grade-btn").forEach((btn) => {
    btn.addEventListener("click", () => gradeCurrentCard(btn.dataset.grade));
  });
  document.getElementById("end-session-btn").addEventListener("click", () => {
    if (sessionStats.seen > 0) finishSession();
    else showScreen("setup");
  });
  document.getElementById("summary-again-btn").addEventListener("click", () => {
    updateDeckCount();
    showScreen("setup");
  });

  // ---------- stats screen ----------

  function renderStats() {
    const total = bank.length;
    let mastered = 0, learning = 0, brandNew = 0, due = 0;
    bank.forEach((c) => {
      if (isNew(c.id)) brandNew += 1;
      else if (isMastered(c.id)) mastered += 1;
      else learning += 1;
      if (!isNew(c.id) && isDue(c.id)) due += 1;
    });

    const rows = [
      ["Total cards", total],
      ["New", brandNew],
      ["In progress", learning],
      ["Mastered", mastered],
      ["Due for review now", due],
    ];

    document.getElementById("stats-body").innerHTML = rows
      .map(([label, val]) => '<div class="stat-row"><span>' + label + "</span><strong>" + val + "</strong></div>")
      .join("");
  }

  document.getElementById("stats-btn").addEventListener("click", () => {
    renderStats();
    showScreen("stats");
  });
  document.getElementById("stats-back-btn").addEventListener("click", () => {
    updateDeckCount();
    showScreen("setup");
  });
  document.getElementById("reset-progress-btn").addEventListener("click", () => {
    if (confirm("Reset all flashcard progress on this device? This can't be undone.")) {
      progress = {};
      saveProgress();
      renderStats();
      updateDeckCount();
    }
  });
})();
