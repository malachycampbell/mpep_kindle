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

  const LEVEL_LABELS = { 0: "Vocabulary", 1: "Concept", 2: "Practice" };

  let bank = [];
  let progress = loadProgress();
  let deck = [];
  let deckIndex = 0;
  let sessionStats = { seen: 0, again: 0, good: 0 };

  let quizStats = { correct: 0, incorrect: 0, skipped: 0 };
  let quizSelected = null;
  let quizAnswered = false;
  let quizTimerId = null;
  let quizEndAt = null;

  const screens = {
    setup: document.getElementById("screen-setup"),
    study: document.getElementById("screen-study"),
    quiz: document.getElementById("screen-quiz"),
    summary: document.getElementById("screen-summary"),
    stats: document.getElementById("screen-stats"),
  };

  function showScreen(name) {
    if (name !== "quiz") stopQuizTimer();
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

  Promise.all([
    fetch("data/bank.json").then((r) => r.json()),
    fetch("data/foundations.json").then((r) => r.json()),
  ])
    .then(([historical, foundation]) => {
      historical.forEach((c) => (c.deck = "historical"));
      bank = historical.concat(foundation);
      wireSetupScreen();
      updateDeckCount();
    })
    .catch((err) => {
      document.getElementById("deck-count").textContent =
        "Couldn't load flashcard data (" + err + ")";
    });

  // ---------- setup screen ----------

  function currentFilters() {
    const deckChoice = document.querySelector('input[name="f-deck"]:checked').value;
    const sessions = Array.from(document.querySelectorAll(".f-session:checked")).map((el) => el.value);
    const parts = Array.from(document.querySelectorAll(".f-part:checked")).map((el) => el.value);
    const statuses = Array.from(document.querySelectorAll(".f-status:checked")).map((el) => el.value);
    const topics = Array.from(document.querySelectorAll(".f-topic:checked")).map((el) => el.value);
    const levels = Array.from(document.querySelectorAll(".f-level:checked")).map((el) => parseInt(el.value, 10));
    const progressMode = document.querySelector('input[name="f-progress"]:checked').value;
    const shuffle = document.getElementById("f-shuffle").checked;
    const limit = parseLimit(document.getElementById("f-limit").value);
    const mode = document.querySelector('input[name="f-mode"]:checked').value;
    const timerMinutes = parseInt(document.getElementById("f-timer").value, 10) || 0;
    return { deckChoice, sessions, parts, statuses, topics, levels, progressMode, shuffle, limit, mode, timerMinutes };
  }

  function parseLimit(raw) {
    const n = parseInt(raw, 10);
    return Number.isInteger(n) && n > 0 ? n : null;
  }

  function filterCards(filters) {
    return bank.filter((c) => {
      if (c.deck !== filters.deckChoice) return false;
      if (c.deck === "historical") {
        if (!filters.sessions.includes(c.source.session_date)) return false;
        if (!filters.parts.includes(c.source.part)) return false;
        if (!filters.statuses.includes(c.current_law_status)) return false;
      } else {
        if (!filters.topics.includes(c.topic)) return false;
        if (!filters.levels.includes(c.level)) return false;
        if (filters.mode === "quiz" && c.card_type !== "mcq") return false;
      }
      if (filters.progressMode === "due" && !isDue(c.id)) return false;
      if (filters.progressMode === "new" && !isNew(c.id)) return false;
      return true;
    });
  }

  function updateDeckCount() {
    const filters = currentFilters();
    const matched = filterCards(filters);
    const studying = filters.limit ? Math.min(filters.limit, matched.length) : matched.length;
    const label = document.getElementById("deck-count");
    let text = matched.length === 1 ? "1 card matches" : matched.length + " cards match";
    if (filters.limit && studying < matched.length) {
      text += " (studying " + studying + ")";
    }
    label.textContent = text;
    document.getElementById("start-btn").disabled = matched.length === 0;
    return matched;
  }

  function buildFoundationFilterUI() {
    const foundationCards = bank.filter((c) => c.deck === "foundation");
    const topics = Array.from(new Set(foundationCards.map((c) => c.topic)));
    const topicList = document.getElementById("f-topic-list");
    topicList.innerHTML = topics
      .map(
        (t) =>
          '<label><input type="checkbox" class="f-topic" value="' +
          t +
          '" checked> ' +
          titleizeSlug(t) +
          "</label>"
      )
      .join("");
    document.querySelectorAll(".f-topic").forEach((el) => el.addEventListener("change", updateDeckCount));
  }

  function titleizeSlug(slug) {
    return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function wireSetupScreen() {
    buildFoundationFilterUI();

    document
      .querySelectorAll(".f-session, .f-part, .f-status, .f-level, input[name='f-progress']")
      .forEach((el) => el.addEventListener("change", updateDeckCount));
    document.getElementById("f-limit").addEventListener("input", updateDeckCount);

    document.querySelectorAll('input[name="f-deck"]').forEach((el) =>
      el.addEventListener("change", () => {
        const deckChoice = document.querySelector('input[name="f-deck"]:checked').value;
        document.getElementById("historical-filters").hidden = deckChoice !== "historical";
        document.getElementById("foundation-filters").hidden = deckChoice !== "foundation";
        updateDeckCount();
      })
    );

    document.querySelectorAll('input[name="f-mode"]').forEach((el) =>
      el.addEventListener("change", () => {
        const mode = document.querySelector('input[name="f-mode"]:checked').value;
        document.getElementById("quiz-options").hidden = mode !== "quiz";
        document.getElementById("start-btn").textContent = mode === "quiz" ? "Start quiz" : "Start studying";
        updateDeckCount();
      })
    );

    document.getElementById("start-btn").addEventListener("click", () => {
      const filters = currentFilters();
      let cards = filterCards(filters);
      if (filters.shuffle) shuffleInPlace(cards);
      if (filters.limit) cards = cards.slice(0, filters.limit);
      if (filters.mode === "quiz") {
        startQuizSession(cards, filters.timerMinutes);
      } else {
        startSession(cards);
      }
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

    document.getElementById("card-source").textContent = sourceMetaLabel(card);
    renderBadge(document.getElementById("card-badge"), card);

    document.getElementById("card-question").textContent = card.question;

    const isMcq = card.card_type !== "qa";
    document.getElementById("card-choices").hidden = !isMcq;
    document.getElementById("card-mcq-answer").hidden = !isMcq;
    document.getElementById("card-qa-answer").hidden = isMcq;

    if (isMcq) {
      renderChoices(document.getElementById("card-choices"), card, null);
      document.getElementById("card-correct-letter").textContent = "(" + card.answer + ")";
    } else {
      document.getElementById("card-answer-text").textContent = card.answer_text;
      const whyEl = document.getElementById("card-why-it-matters");
      if (card.why_it_matters) {
        whyEl.hidden = false;
        whyEl.textContent = "Why it matters: " + card.why_it_matters;
      } else {
        whyEl.hidden = true;
        whyEl.textContent = "";
      }
    }

    setExplanation(document.getElementById("card-explanation"), card.explanation);

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

    renderSources(document.getElementById("card-sources"), document.getElementById("card-sources-list"), card);

    document.getElementById("card-answer").hidden = true;
    document.getElementById("reveal-btn").hidden = false;
    document.getElementById("grade-actions").hidden = true;
  }

  function sourceMetaLabel(card) {
    if (card.deck === "historical") return sourceLabel(card.source);
    return titleizeSlug(card.topic) + " · " + (LEVEL_LABELS[card.level] || "Level " + card.level);
  }

  function renderBadge(badge, card) {
    if (card.deck !== "historical") {
      badge.hidden = true;
      return;
    }
    badge.hidden = false;
    if (card.current_law_status === "STILL_VALID") {
      badge.textContent = "Still valid";
      badge.className = "badge valid";
    } else {
      badge.textContent = "Updated";
      badge.className = "badge updated";
    }
  }

  function renderChoices(container, card, onSelect) {
    container.innerHTML = "";
    Object.keys(card.choices)
      .sort()
      .forEach((letter) => {
        const el = document.createElement(onSelect ? "button" : "div");
        if (onSelect) el.type = "button";
        el.className = "choice";
        el.dataset.letter = letter;
        el.innerHTML =
          '<span class="choice-letter">' + letter + "</span><span>" + escapeHtml(card.choices[letter]) + "</span>";
        if (onSelect) el.addEventListener("click", () => onSelect(letter));
        container.appendChild(el);
      });
  }

  function setExplanation(el, text) {
    if (text) {
      el.hidden = false;
      el.textContent = text;
    } else {
      el.hidden = true;
      el.textContent = "";
    }
  }

  function renderSources(detailsEl, listEl, card) {
    if (card.sources && card.sources.length) {
      detailsEl.hidden = false;
      listEl.innerHTML = card.sources
        .map(
          (s) =>
            "<li>" +
            escapeHtml(s.authority + " — " + s.citation + (s.as_of ? " (" + s.as_of + ")" : "")) +
            "</li>"
        )
        .join("");
    } else {
      detailsEl.hidden = true;
      listEl.innerHTML = "";
    }
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

  // ---------- quiz screen ----------

  function startQuizSession(cards, timerMinutes) {
    deck = cards;
    deckIndex = 0;
    quizStats = { correct: 0, incorrect: 0, skipped: 0 };
    quizSelected = null;
    quizAnswered = false;
    showScreen("quiz");
    renderQuizQuestion();
    startQuizTimer(timerMinutes);
  }

  function renderQuizQuestion() {
    const card = deck[deckIndex];
    quizSelected = null;
    quizAnswered = false;

    document.getElementById("quiz-progress-label").textContent = (deckIndex + 1) + " / " + deck.length;
    document.getElementById("quiz-progress-fill").style.width = (deckIndex / deck.length * 100) + "%";

    document.getElementById("quiz-source").textContent = sourceMetaLabel(card);
    renderBadge(document.getElementById("quiz-badge"), card);

    document.getElementById("quiz-question").textContent = card.question;

    renderChoices(document.getElementById("quiz-choices"), card, selectQuizChoice);

    document.getElementById("quiz-result-block").hidden = true;
    document.getElementById("quiz-submit-btn").hidden = false;
    document.getElementById("quiz-submit-btn").disabled = true;
    document.getElementById("quiz-next-btn").hidden = true;
  }

  function selectQuizChoice(letter) {
    if (quizAnswered) return;
    quizSelected = letter;
    document.querySelectorAll("#quiz-choices .choice").forEach((btn) => {
      btn.classList.toggle("selected", btn.dataset.letter === letter);
    });
    document.getElementById("quiz-submit-btn").disabled = false;
  }

  function submitQuizAnswer() {
    if (!quizSelected || quizAnswered) return;
    quizAnswered = true;

    const card = deck[deckIndex];
    const correct = quizSelected === card.answer;
    grade(card.id, correct ? "good" : "again");
    quizStats[correct ? "correct" : "incorrect"] += 1;

    document.querySelectorAll("#quiz-choices .choice").forEach((btn) => {
      btn.disabled = true;
      if (btn.dataset.letter === card.answer) btn.classList.add("correct");
      if (btn.dataset.letter === quizSelected && !correct) btn.classList.add("incorrect");
    });

    document.getElementById("quiz-result-line").innerHTML = correct
      ? "<strong>Correct!</strong>"
      : "<strong>Incorrect</strong> — correct answer: (" + card.answer + ")";
    setExplanation(document.getElementById("quiz-explanation"), card.explanation);

    const revisionsEl = document.getElementById("quiz-revisions");
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

    renderSources(document.getElementById("quiz-sources"), document.getElementById("quiz-sources-list"), card);

    document.getElementById("quiz-result-block").hidden = false;
    document.getElementById("quiz-submit-btn").hidden = true;
    const nextBtn = document.getElementById("quiz-next-btn");
    nextBtn.hidden = false;
    nextBtn.textContent = deckIndex + 1 >= deck.length ? "Finish quiz" : "Next question";
  }

  function nextQuizQuestion() {
    if (deckIndex + 1 >= deck.length) {
      document.getElementById("quiz-progress-fill").style.width = "100%";
      finishQuizSession();
    } else {
      deckIndex += 1;
      renderQuizQuestion();
    }
  }

  function finishQuizSession() {
    stopQuizTimer();
    const answered = quizStats.correct + quizStats.incorrect;
    quizStats.skipped = deck.length - answered;
    const percent = deck.length ? Math.round((quizStats.correct / deck.length) * 100) : 0;

    showScreen("summary");
    let text = "Quiz complete — " + quizStats.correct + " / " + deck.length + " correct (" + percent + "%).";
    if (quizStats.skipped > 0) {
      text += " " + quizStats.skipped + " question" + (quizStats.skipped === 1 ? "" : "s") + " unanswered when time ran out.";
    }
    document.getElementById("summary-text").textContent = text;
  }

  function formatClock(ms) {
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return m + ":" + String(s).padStart(2, "0");
  }

  function startQuizTimer(minutes) {
    const timerEl = document.getElementById("quiz-timer");
    if (!minutes || minutes <= 0) {
      timerEl.hidden = true;
      return;
    }
    quizEndAt = Date.now() + minutes * 60 * 1000;
    timerEl.hidden = false;
    timerEl.classList.remove("low");
    tickQuizTimer();
    quizTimerId = setInterval(tickQuizTimer, 1000);
  }

  function tickQuizTimer() {
    const timerEl = document.getElementById("quiz-timer");
    const remaining = quizEndAt - Date.now();
    timerEl.textContent = formatClock(remaining);
    timerEl.classList.toggle("low", remaining <= 60 * 1000);
    if (remaining <= 0) {
      stopQuizTimer();
      finishQuizSession();
    }
  }

  function stopQuizTimer() {
    if (quizTimerId) {
      clearInterval(quizTimerId);
      quizTimerId = null;
    }
    quizEndAt = null;
  }

  document.getElementById("quiz-submit-btn").addEventListener("click", submitQuizAnswer);
  document.getElementById("quiz-next-btn").addEventListener("click", nextQuizQuestion);
  document.getElementById("quiz-end-btn").addEventListener("click", () => {
    if (quizStats.correct + quizStats.incorrect > 0) finishQuizSession();
    else {
      stopQuizTimer();
      showScreen("setup");
    }
  });

  // ---------- stats screen ----------

  function statsFor(cards) {
    const total = cards.length;
    let mastered = 0, learning = 0, brandNew = 0, due = 0;
    cards.forEach((c) => {
      if (isNew(c.id)) brandNew += 1;
      else if (isMastered(c.id)) mastered += 1;
      else learning += 1;
      if (!isNew(c.id) && isDue(c.id)) due += 1;
    });
    return [
      ["Total cards", total],
      ["New", brandNew],
      ["In progress", learning],
      ["Mastered", mastered],
      ["Due for review now", due],
    ];
  }

  function statsHtml(rows) {
    return rows
      .map(([label, val]) => '<div class="stat-row"><span>' + label + "</span><strong>" + val + "</strong></div>")
      .join("");
  }

  function renderStats() {
    const foundationCards = bank.filter((c) => c.deck === "foundation");
    const historicalCards = bank.filter((c) => c.deck === "historical");
    document.getElementById("stats-body").innerHTML =
      "<h3>Foundations</h3>" +
      statsHtml(statsFor(foundationCards)) +
      "<h3>Historical Exam Bank</h3>" +
      statsHtml(statsFor(historicalCards));
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
