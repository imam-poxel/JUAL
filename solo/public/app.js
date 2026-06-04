const $app = document.getElementById("app");
const $toast = document.getElementById("toast");

const i18n = {
  en: {
    appName: "Lingua Studio",
    tagline: "An immersive study desk for leveled language learning.",
    nav: {
      home: "Home",
      catalog: "Catalog",
      practice: "Practice Lab",
      dashboard: "Dashboard",
      community: "Community",
      settings: "Settings",
      login: "Login",
      register: "Register",
      logout: "Logout",
    },
    actions: {
      continue: "Continue learning",
      enroll: "Enroll",
      open: "Open",
      start: "Start",
      save: "Save",
      post: "Post",
      react: "React",
      unreact: "Unreact",
      claim: "Claim",
      refresh: "Refresh",
    },
    labels: {
      uiLanguage: "UI language",
      targetLanguage: "Target language",
      targetLanguages: "Learning targets",
      email: "Email",
      password: "Password",
      displayName: "Display name",
      title: "Title",
      body: "Body",
      answer: "Answer",
    },
    sections: {
      recommendations: "Daily recommendations",
      yourCourses: "Your courses",
      reviewQueue: "Review queue",
      achievements: "Achievements",
      newPost: "New post",
    },
    hints: {
      loginToEnroll: "Login to enroll and track progress.",
      noData: "No data yet. Make a few attempts to unlock insights.",
    },
  },
  ja: {
    appName: "Lingua Studio",
    tagline: "没入型の学習机で、レベル別に言語を学ぶ。",
    nav: {
      home: "ホーム",
      catalog: "コース一覧",
      practice: "練習ラボ",
      dashboard: "ダッシュボード",
      community: "コミュニティ",
      settings: "設定",
      login: "ログイン",
      register: "新規登録",
      logout: "ログアウト",
    },
    actions: {
      continue: "続きから",
      enroll: "受講する",
      open: "開く",
      start: "開始",
      save: "保存",
      post: "投稿",
      react: "リアクション",
      unreact: "取り消す",
      claim: "受け取る",
      refresh: "更新",
    },
    labels: {
      uiLanguage: "表示言語",
      targetLanguage: "学習言語",
      targetLanguages: "学習ターゲット",
      email: "メール",
      password: "パスワード",
      displayName: "表示名",
      title: "タイトル",
      body: "本文",
      answer: "答え",
    },
    sections: {
      recommendations: "今日のおすすめ",
      yourCourses: "受講中のコース",
      reviewQueue: "復習キュー",
      achievements: "実績",
      newPost: "新規投稿",
    },
    hints: {
      loginToEnroll: "ログインすると受講・進捗管理ができます。",
      noData: "まだデータがありません。練習を数回行うと表示されます。",
    },
  },
  ko: {
    appName: "Lingua Studio",
    tagline: "레벨 기반 몰입형 언어 학습 스튜디오.",
    nav: {
      home: "홈",
      catalog: "코스",
      practice: "연습",
      dashboard: "대시보드",
      community: "커뮤니티",
      settings: "설정",
      login: "로그인",
      register: "회원가입",
      logout: "로그아웃",
    },
    actions: {
      continue: "계속 학습",
      enroll: "등록",
      open: "열기",
      start: "시작",
      save: "저장",
      post: "게시",
      react: "반응",
      unreact: "취소",
      claim: "받기",
      refresh: "새로고침",
    },
    labels: {
      uiLanguage: "UI 언어",
      targetLanguage: "학습 언어",
      targetLanguages: "학습 목표",
      email: "이메일",
      password: "비밀번호",
      displayName: "이름",
      title: "제목",
      body: "내용",
      answer: "답",
    },
    sections: {
      recommendations: "오늘의 추천",
      yourCourses: "내 코스",
      reviewQueue: "복습 큐",
      achievements: "업적",
      newPost: "새 글",
    },
    hints: {
      loginToEnroll: "로그인하면 등록과 진행 상황 저장이 가능합니다.",
      noData: "아직 데이터가 없습니다. 연습을 몇 번 진행해 보세요.",
    },
  },
};

const store = {
  user: null,
  uiLanguage: localStorage.getItem("uiLanguage") || "en",
  targetLanguage: localStorage.getItem("targetLanguage") || "en",
};

function t(key) {
  const lang = i18n[store.uiLanguage] ? store.uiLanguage : "en";
  const dict = i18n[lang];
  const parts = key.split(".");
  let cur = dict;
  for (const p of parts) {
    cur = cur?.[p];
  }
  return cur || key;
}

function toast(message) {
  if (!$toast) return;
  $toast.textContent = message;
  $toast.style.display = "block";
  window.clearTimeout(toast._t);
  toast._t = window.setTimeout(() => {
    $toast.style.display = "none";
  }, 2600);
}

async function api(path, opts = {}) {
  const res = await fetch(path, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
    credentials: "include",
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.message || "Request failed";
    throw new Error(msg);
  }
  return data;
}

function navItems() {
  const signedIn = !!store.user;
  const base = [
    { href: "#/", label: t("nav.home") },
    { href: "#/catalog", label: t("nav.catalog") },
    { href: "#/practice", label: t("nav.practice") },
    { href: "#/dashboard", label: t("nav.dashboard") },
    { href: "#/community", label: t("nav.community") },
    { href: "#/settings", label: t("nav.settings") },
  ];
  const auth = signedIn
    ? [{ href: "#/logout", label: t("nav.logout"), pill: store.user.displayName }]
    : [
        { href: "#/auth/login", label: t("nav.login") },
        { href: "#/auth/register", label: t("nav.register") },
      ];
  return [...base, ...auth];
}

function layout({ title, subtitle, content }) {
  const items = navItems()
    .map(
      (it) => `
        <a class="item" href="${it.href}">
          <span>${it.label}</span>
          ${it.pill ? `<span class="pill">${escapeHtml(it.pill)}</span>` : ""}
        </a>
      `,
    )
    .join("");

  return `
    <div class="app">
      <aside class="nav">
        <div class="brand">
          <h1>${escapeHtml(t("appName"))}</h1>
          <div class="tag">${escapeHtml(store.uiLanguage.toUpperCase())}</div>
        </div>
        <div class="section">Studio</div>
        ${items}
      </aside>
      <main class="main">
        <div class="topbar">
          <div class="title">
            <h2>${escapeHtml(title)}</h2>
            ${subtitle ? `<div class="sub">${subtitle}</div>` : ""}
          </div>
          <div class="row">
            <button class="btn" data-action="refresh">${escapeHtml(t("actions.refresh"))}</button>
          </div>
        </div>
        ${content}
      </main>
    </div>
  `;
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function route() {
  const h = location.hash.replace(/^#/, "") || "/";
  const [path, query] = h.split("?");
  const params = Object.fromEntries(new URLSearchParams(query || "").entries());
  return { path, params };
}

async function loadMe() {
  try {
    const data = await api("/api/me", { method: "GET" });
    store.user = data.user;
    if (store.user?.uiLanguage && store.user.uiLanguage !== store.uiLanguage) {
      store.uiLanguage = store.user.uiLanguage;
      localStorage.setItem("uiLanguage", store.uiLanguage);
    }
  } catch {
    store.user = null;
  }
}

function bindCommon() {
  document.querySelectorAll('[data-action="refresh"]').forEach((el) => {
    el.addEventListener("click", () => render());
  });
}

async function pageHome() {
  let recs = [];
  if (store.user) {
    try {
      const data = await api("/api/recommendations/daily", { method: "GET" });
      recs = data.recommendations || [];
    } catch {
      recs = [];
    }
  }

  const recHtml =
    store.user && recs.length
      ? `
        <div class="card pad col-12">
          <div class="label">${escapeHtml(t("sections.recommendations"))}</div>
          <div style="height:10px"></div>
          <div class="row">
            ${recs
              .map((r) => {
                const href =
                  r.kind === "lesson"
                    ? `#/lesson/${r.targetId}`
                    : r.kind === "review"
                      ? `#/practice?review=${r.targetId}`
                      : "#/practice";
                const accent = r.kind === "lesson" ? "primary" : "good";
                return `
                  <a class="btn ${accent}" href="${href}">
                    ${escapeHtml(r.kind.toUpperCase())}: ${escapeHtml(r.reason)}
                  </a>
                `;
              })
              .join("")}
          </div>
        </div>
      `
      : `
        <div class="card pad col-12">
          <div class="sub">${escapeHtml(t("tagline"))}</div>
          <div style="height:10px"></div>
          <div class="row">
            <a class="btn primary" href="#/catalog">${escapeHtml(t("nav.catalog"))}</a>
            ${store.user ? "" : `<a class="btn" href="#/auth/register">${escapeHtml(t("nav.register"))}</a>`}
          </div>
        </div>
      `;

  const content = `
    <div class="grid">
      ${recHtml}
      <div class="card pad col-6">
        <div class="label">Modules</div>
        <div style="height:10px"></div>
        <div class="sub">Vocabulary recall • Grammar drills • Listening training • Shadowing studio</div>
        <div style="height:10px"></div>
        <div class="row">
          <a class="btn" href="#/practice?v=vocab">Vocab</a>
          <a class="btn" href="#/practice?v=grammar">Grammar</a>
          <a class="btn" href="#/practice?v=listening">Listening</a>
          <a class="btn" href="#/practice?v=shadowing">Shadowing</a>
        </div>
      </div>
      <div class="card pad col-6">
        <div class="label">Immersion</div>
        <div style="height:10px"></div>
        <div class="sub">
          Split reading view, audio-first controls, and a community that turns progress into momentum.
        </div>
      </div>
    </div>
  `;

  return layout({ title: t("nav.home"), subtitle: t("tagline"), content });
}

async function pageAuth(mode) {
  const isRegister = mode === "register";
  const content = `
    <div class="grid">
      <div class="card pad col-6">
        <div class="label">${escapeHtml(isRegister ? t("nav.register") : t("nav.login"))}</div>
        <div style="height:10px"></div>
        ${isRegister ? `<div class="field"><div class="label">${escapeHtml(t("labels.displayName"))}</div><input class="input" id="displayName" /></div>` : ""}
        <div class="field">
          <div class="label">${escapeHtml(t("labels.email"))}</div>
          <input class="input" id="email" type="email" />
        </div>
        <div class="field">
          <div class="label">${escapeHtml(t("labels.password"))}</div>
          <input class="input" id="password" type="password" />
        </div>
        <div class="row">
          <button class="btn primary" id="submit">${escapeHtml(isRegister ? t("nav.register") : t("nav.login"))}</button>
          <a class="btn" href="#/auth/${isRegister ? "login" : "register"}">
            ${escapeHtml(isRegister ? t("nav.login") : t("nav.register"))}
          </a>
        </div>
      </div>
      <div class="card pad col-6">
        <div class="label">${escapeHtml(t("labels.uiLanguage"))}</div>
        <div style="height:10px"></div>
        <select class="select" id="uiLanguage">
          <option value="en">English</option>
          <option value="ja">日本語</option>
          <option value="ko">한국어</option>
        </select>
        <div style="height:14px"></div>
        <div class="sub">${escapeHtml(t("hints.loginToEnroll"))}</div>
      </div>
    </div>
  `;

  return layout({
    title: isRegister ? t("nav.register") : t("nav.login"),
    subtitle: "Secure sign-in, progress tracking, achievements.",
    content,
  });
}

async function bindAuth(mode) {
  const isRegister = mode === "register";
  const $ui = document.getElementById("uiLanguage");
  if ($ui) $ui.value = store.uiLanguage;

  document.getElementById("submit")?.addEventListener("click", async () => {
    try {
      const uiLanguage = document.getElementById("uiLanguage")?.value || "en";
      store.uiLanguage = uiLanguage;
      localStorage.setItem("uiLanguage", store.uiLanguage);

      const email = document.getElementById("email")?.value || "";
      const password = document.getElementById("password")?.value || "";
      if (isRegister) {
        const displayName = document.getElementById("displayName")?.value || "";
        const data = await api("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({ email, password, displayName, uiLanguage, targetLanguages: [store.targetLanguage] }),
        });
        store.user = data.user;
      } else {
        const data = await api("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        store.user = data.user;
      }
      toast("Welcome.");
      location.hash = "#/";
    } catch (e) {
      toast(e.message);
    }
  });
}

async function pageCatalog() {
  let courses = [];
  try {
    const data = await api(`/api/courses?targetLanguage=${encodeURIComponent(store.targetLanguage)}`, { method: "GET" });
    courses = data.courses || [];
  } catch (e) {
    toast(e.message);
  }

  const cards = courses
    .map(
      (c) => `
        <div class="card pad col-4">
          <div class="row" style="justify-content:space-between;align-items:center">
            <div class="pill">${escapeHtml(c.targetLanguage.toUpperCase())} • ${escapeHtml(c.level)}</div>
            <div class="pill">${escapeHtml(String(c.lessonCount))} lessons</div>
          </div>
          <div style="height:10px"></div>
          <div style="font-family:Fraunces,serif;font-weight:700;font-size:18px">${escapeHtml(c.title)}</div>
          <div style="height:8px"></div>
          <div class="sub">${escapeHtml(c.description)}</div>
          <div style="height:12px"></div>
          <div class="row">
            <a class="btn" href="#/course/${c.id}">${escapeHtml(t("actions.open"))}</a>
            <button class="btn primary" data-enroll="${c.id}">${escapeHtml(t("actions.enroll"))}</button>
          </div>
        </div>
      `,
    )
    .join("");

  const content = `
    <div class="grid">
      <div class="card pad col-12">
        <div class="split">
          <div>
            <div class="label">${escapeHtml(t("labels.targetLanguage"))}</div>
            <div style="height:10px"></div>
            <select class="select" id="targetLanguage">
              <option value="en">English</option>
              <option value="ja">日本語</option>
              <option value="ko">한국어</option>
            </select>
            <div style="height:12px"></div>
            <div class="sub">${escapeHtml(store.user ? "Enroll to start tracking progress and recommendations." : t("hints.loginToEnroll"))}</div>
          </div>
          <div>
            <div class="label">${escapeHtml(t("labels.uiLanguage"))}</div>
            <div style="height:10px"></div>
            <select class="select" id="uiLanguage">
              <option value="en">English</option>
              <option value="ja">日本語</option>
              <option value="ko">한국어</option>
            </select>
          </div>
        </div>
      </div>
      ${cards || `<div class="card pad col-12">${escapeHtml(t("hints.noData"))}</div>`}
    </div>
  `;

  return layout({ title: t("nav.catalog"), subtitle: "Leveled courses designed for momentum.", content });
}

async function bindCatalog() {
  const $ui = document.getElementById("uiLanguage");
  const $tl = document.getElementById("targetLanguage");
  if ($ui) $ui.value = store.uiLanguage;
  if ($tl) $tl.value = store.targetLanguage;

  $ui?.addEventListener("change", () => {
    store.uiLanguage = $ui.value;
    localStorage.setItem("uiLanguage", store.uiLanguage);
    render();
  });

  $tl?.addEventListener("change", () => {
    store.targetLanguage = $tl.value;
    localStorage.setItem("targetLanguage", store.targetLanguage);
    render();
  });

  document.querySelectorAll("[data-enroll]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const courseId = btn.getAttribute("data-enroll");
      if (!store.user) {
        toast(t("hints.loginToEnroll"));
        location.hash = "#/auth/login";
        return;
      }
      try {
        await api(`/api/courses/${courseId}/enroll`, { method: "POST", body: "{}" });
        toast("Enrolled.");
      } catch (e) {
        toast(e.message);
      }
    });
  });
}

async function pageCourse(courseId) {
  let course = null;
  let lessons = [];
  try {
    const data = await api(`/api/courses/${courseId}`, { method: "GET" });
    course = data.course;
    lessons = data.lessons || [];
  } catch (e) {
    toast(e.message);
  }

  const content = `
    <div class="grid">
      <div class="card pad col-12">
        <div class="row" style="justify-content:space-between;align-items:center">
          <div>
            <div class="pill">${escapeHtml(course?.targetLanguage?.toUpperCase() || "")} • ${escapeHtml(course?.level || "")}</div>
            <div style="height:10px"></div>
            <div style="font-family:Fraunces,serif;font-weight:700;font-size:22px">${escapeHtml(course?.title || "")}</div>
            <div style="height:8px"></div>
            <div class="sub">${escapeHtml(course?.description || "")}</div>
          </div>
          <div class="row">
            <button class="btn primary" data-enroll="${escapeHtml(courseId)}">${escapeHtml(t("actions.enroll"))}</button>
          </div>
        </div>
      </div>
      <div class="card pad col-12">
        <div class="label">Lessons</div>
        <div style="height:10px"></div>
        <div class="row">
          ${lessons
            .map(
              (l) => `
                <a class="btn" href="#/lesson/${l.id}">
                  ${escapeHtml(String(l.order).padStart(2, "0"))} • ${escapeHtml(l.title)}
                </a>
              `,
            )
            .join("")}
        </div>
      </div>
    </div>
  `;

  return layout({ title: course?.title || "Course", subtitle: "Learn → Practice → Track → Repeat.", content });
}

async function bindCourse(courseId) {
  document.querySelectorAll("[data-enroll]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!store.user) {
        toast(t("hints.loginToEnroll"));
        location.hash = "#/auth/login";
        return;
      }
      try {
        await api(`/api/courses/${courseId}/enroll`, { method: "POST", body: "{}" });
        toast("Enrolled.");
      } catch (e) {
        toast(e.message);
      }
    });
  });
}

async function pageLesson(lessonId) {
  let lesson = null;
  let exercises = [];
  try {
    const data = await api(`/api/lessons/${lessonId}`, { method: "GET" });
    lesson = data.lesson;
    const ex = await api(`/api/lessons/${lessonId}/exercises`, { method: "GET" });
    exercises = ex.exercises || [];
  } catch (e) {
    toast(e.message);
  }

  const byType = (type) => exercises.filter((x) => x.type === type);
  const c1 = byType("vocab").length;
  const c2 = byType("grammar").length;
  const c3 = byType("listening").length;
  const c4 = byType("shadowing").length;

  const content = `
    <div class="grid">
      <div class="card pad col-12">
        <div class="row" style="justify-content:space-between;align-items:center">
          <div>
            <div class="pill">Lesson ${escapeHtml(String(lesson?.order ?? ""))}</div>
            <div style="height:10px"></div>
            <div style="font-family:Fraunces,serif;font-weight:700;font-size:22px">${escapeHtml(lesson?.title || "")}</div>
          </div>
          <div class="row">
            <a class="btn primary" href="#/practice?lesson=${lessonId}&v=vocab">Vocab (${c1})</a>
            <a class="btn" href="#/practice?lesson=${lessonId}&v=grammar">Grammar (${c2})</a>
            <a class="btn" href="#/practice?lesson=${lessonId}&v=listening">Listening (${c3})</a>
            <a class="btn" href="#/practice?lesson=${lessonId}&v=shadowing">Shadowing (${c4})</a>
          </div>
        </div>
      </div>
      <div class="card pad col-12">
        <div class="label">Lesson text</div>
        <div style="height:10px"></div>
        <div class="mono">${escapeHtml(lesson?.content || "")}</div>
      </div>
    </div>
  `;

  return layout({ title: lesson?.title || "Lesson", subtitle: "Read with intent. Practice with pressure.", content });
}

function evaluateExercise(ex, input) {
  const type = ex.type;
  if (type === "vocab") {
    const answer = ex.data?.answer || "";
    const variants = ex.data?.variants || [];
    const normalized = String(input || "").trim().toLowerCase();
    const ok =
      normalized === String(answer).trim().toLowerCase() ||
      variants.some((v) => normalized === String(v).trim().toLowerCase());
    return { ok, feedback: ok ? "Good recall." : `Expected: ${answer}` };
  }
  if (type === "grammar") {
    const answer = ex.data?.answer || "";
    const normalized = String(input || "").trim().toLowerCase();
    const ok = normalized.length > 0;
    return { ok, feedback: ok ? `Sample answer: ${answer}` : "Type something, then compare to the sample." };
  }
  if (type === "listening") {
    const idx = Number(input);
    const correct = Number(ex.data?.correctIndex ?? -1);
    const ok = idx === correct;
    return { ok, feedback: ok ? "Correct." : "Try again." };
  }
  if (type === "shadowing") {
    return { ok: true, feedback: "Shadowing logged. Repeat 3 times for mastery." };
  }
  return { ok: false, feedback: "Unsupported exercise." };
}

async function pagePractice(params) {
  const variant = params.v || "vocab";
  const lessonId = params.lesson || null;
  const reviewId = params.review || null;

  let exercises = [];
  try {
    if (lessonId) {
      const ex = await api(`/api/lessons/${lessonId}/exercises`, { method: "GET" });
      exercises = ex.exercises || [];
    } else {
      const list = await api(`/api/courses?targetLanguage=${encodeURIComponent(store.targetLanguage)}`, { method: "GET" });
      const first = list.courses?.[0]?.id;
      if (first) {
        const course = await api(`/api/courses/${first}`, { method: "GET" });
        const l0 = course.lessons?.[0]?.id;
        if (l0) {
          const ex = await api(`/api/lessons/${l0}/exercises`, { method: "GET" });
          exercises = ex.exercises || [];
        }
      }
    }
  } catch (e) {
    toast(e.message);
  }

  const byType = (type) => exercises.filter((x) => x.type === type);
  let list = byType(variant);
  if (reviewId) {
    const match = exercises.find((e) => e.id === reviewId);
    if (match) list = [match];
  }

  const ex = list[0] || null;
  const has = !!ex;

  const content = `
    <div class="grid">
      <div class="card pad col-12">
        <div class="row">
          <a class="btn ${variant === "vocab" ? "primary" : ""}" href="#/practice?lesson=${lessonId || ""}&v=vocab">Vocab</a>
          <a class="btn ${variant === "grammar" ? "primary" : ""}" href="#/practice?lesson=${lessonId || ""}&v=grammar">Grammar</a>
          <a class="btn ${variant === "listening" ? "primary" : ""}" href="#/practice?lesson=${lessonId || ""}&v=listening">Listening</a>
          <a class="btn ${variant === "shadowing" ? "primary" : ""}" href="#/practice?lesson=${lessonId || ""}&v=shadowing">Shadowing</a>
        </div>
      </div>
      <div class="card pad col-12">
        <div class="label">Exercise</div>
        <div style="height:10px"></div>
        ${
          has
            ? `
              <div style="font-family:Fraunces,serif;font-weight:700;font-size:18px">${escapeHtml(ex.prompt)}</div>
              <div style="height:10px"></div>
              <div id="exerciseArea"></div>
              <div style="height:12px"></div>
              <div class="row">
                <button class="btn good" id="submitAttempt">${escapeHtml(t("actions.start"))}</button>
                <div class="pill" id="feedback" style="display:none"></div>
              </div>
            `
            : `<div class="sub">${escapeHtml(t("hints.noData"))}</div>`
        }
      </div>
    </div>
  `;

  return layout({ title: t("nav.practice"), subtitle: "High-frequency drills with immediate feedback.", content });
}

async function bindPractice(params) {
  const variant = params.v || "vocab";
  const lessonId = params.lesson || null;
  const reviewId = params.review || null;

  let exercises = [];
  try {
    if (lessonId) {
      const ex = await api(`/api/lessons/${lessonId}/exercises`, { method: "GET" });
      exercises = ex.exercises || [];
    } else {
      const list = await api(`/api/courses?targetLanguage=${encodeURIComponent(store.targetLanguage)}`, { method: "GET" });
      const first = list.courses?.[0]?.id;
      if (first) {
        const course = await api(`/api/courses/${first}`, { method: "GET" });
        const l0 = course.lessons?.[0]?.id;
        if (l0) {
          const ex = await api(`/api/lessons/${l0}/exercises`, { method: "GET" });
          exercises = ex.exercises || [];
        }
      }
    }
  } catch {
    exercises = [];
  }

  const byType = (type) => exercises.filter((x) => x.type === type);
  let list = byType(variant);
  if (reviewId) {
    const match = exercises.find((e) => e.id === reviewId);
    if (match) list = [match];
  }
  const ex = list[0] || null;
  if (!ex) return;

  const $area = document.getElementById("exerciseArea");
  if (!$area) return;

  if (ex.type === "listening") {
    const choices = ex.data?.choices || [];
    $area.innerHTML = `
      <div class="sub">Listening is simulated in this environment. Choose the best answer:</div>
      <div style="height:10px"></div>
      <div class="row">
        ${choices.map((c, idx) => `<label class="btn"><input type="radio" name="c" value="${idx}" /> ${escapeHtml(c)}</label>`).join("")}
      </div>
    `;
  } else if (ex.type === "shadowing") {
    const text = ex.data?.text || "";
    $area.innerHTML = `
      <div class="sub">Shadow aloud and hit Log. If your browser supports recording, you can record too.</div>
      <div style="height:10px"></div>
      <div class="card pad" style="background:rgba(11,15,20,0.35);border:1px solid rgba(246,241,231,0.14)">
        <div class="mono">${escapeHtml(text)}</div>
      </div>
      <div style="height:12px"></div>
      <div class="row">
        <button class="btn" id="startRec">Record</button>
        <button class="btn" id="stopRec" disabled>Stop</button>
        <audio id="playRec" controls style="width:260px;display:none"></audio>
      </div>
    `;
    const $start = document.getElementById("startRec");
    const $stop = document.getElementById("stopRec");
    const $audio = document.getElementById("playRec");
    let rec = null;
    let chunks = [];
    $start?.addEventListener("click", async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        rec = new MediaRecorder(stream);
        chunks = [];
        rec.ondataavailable = (e) => chunks.push(e.data);
        rec.onstop = () => {
          const blob = new Blob(chunks, { type: "audio/webm" });
          $audio.src = URL.createObjectURL(blob);
          $audio.style.display = "block";
        };
        rec.start();
        $start.disabled = true;
        $stop.disabled = false;
      } catch (e) {
        toast("Recording not available.");
      }
    });
    $stop?.addEventListener("click", () => {
      if (!rec) return;
      rec.stop();
      $start.disabled = false;
      $stop.disabled = true;
    });
  } else {
    $area.innerHTML = `
      <div class="field">
        <div class="label">${escapeHtml(t("labels.answer"))}</div>
        <input class="input" id="answer" />
      </div>
    `;
  }

  document.getElementById("submitAttempt")?.addEventListener("click", async () => {
    if (!store.user) {
      toast(t("hints.loginToEnroll"));
      location.hash = "#/auth/login";
      return;
    }
    try {
      let input = "";
      if (ex.type === "listening") {
        input = document.querySelector('input[name="c"]:checked')?.value ?? "";
      } else if (ex.type === "shadowing") {
        input = "logged";
      } else {
        input = document.getElementById("answer")?.value || "";
      }
      const r = evaluateExercise(ex, input);
      await api("/api/attempts", {
        method: "POST",
        body: JSON.stringify({ exerciseId: ex.id, isCorrect: r.ok, score: r.ok ? 1 : 0 }),
      });
      const claimed = await api("/api/achievements/claim", { method: "POST", body: "{}" });
      const $fb = document.getElementById("feedback");
      if ($fb) {
        $fb.textContent = r.feedback;
        $fb.style.display = "inline-flex";
        $fb.style.borderColor = r.ok ? "rgba(43,182,115,0.45)" : "rgba(233,75,60,0.45)";
      }
      if (claimed.earned?.length) {
        toast(`Achievement: ${claimed.earned.join(", ")}`);
      } else {
        toast(r.ok ? "Logged." : "Logged. Review recommended.");
      }
    } catch (e) {
      toast(e.message);
    }
  });
}

async function pageDashboard() {
  if (!store.user) {
    return layout({
      title: t("nav.dashboard"),
      subtitle: "Track progress, mastery, and achievements.",
      content: `<div class="card pad">${escapeHtml(t("hints.loginToEnroll"))} <a class="btn" href="#/auth/login">${escapeHtml(t("nav.login"))}</a></div>`,
    });
  }

  let summary = null;
  let queue = [];
  let achievements = [];
  try {
    summary = (await api("/api/progress/summary", { method: "GET" })).summary;
    queue = (await api("/api/progress/review-queue", { method: "GET" })).queue || [];
    achievements = (await api("/api/achievements", { method: "GET" })).achievements || [];
  } catch (e) {
    toast(e.message);
  }

  const content = `
    <div class="grid">
      <div class="card pad col-4">
        <div class="label">Attempts</div>
        <div style="height:8px"></div>
        <div style="font-family:Fraunces,serif;font-weight:700;font-size:32px">${escapeHtml(String(summary?.attemptCount ?? 0))}</div>
        <div class="sub">Total practice attempts logged.</div>
      </div>
      <div class="card pad col-4">
        <div class="label">Accuracy</div>
        <div style="height:8px"></div>
        <div style="font-family:Fraunces,serif;font-weight:700;font-size:32px">${escapeHtml(String(summary?.accuracyPct ?? 0))}%</div>
        <div class="sub">A rough mastery signal (v1).</div>
      </div>
      <div class="card pad col-4">
        <div class="label">${escapeHtml(t("sections.yourCourses"))}</div>
        <div style="height:8px"></div>
        <div class="sub">${escapeHtml((summary?.enrolledCourses || []).map((c) => c.title).join(" • ") || "—")}</div>
      </div>

      <div class="card pad col-6">
        <div class="label">${escapeHtml(t("sections.reviewQueue"))}</div>
        <div style="height:10px"></div>
        <div class="row">
          ${
            queue.length
              ? queue.map((q) => `<a class="btn" href="#/practice?review=${q.exerciseId}">${escapeHtml(q.type)} • ${escapeHtml(q.reason)}</a>`).join("")
              : `<div class="sub">${escapeHtml(t("hints.noData"))}</div>`
          }
        </div>
      </div>

      <div class="card pad col-6">
        <div class="label">${escapeHtml(t("sections.achievements"))}</div>
        <div style="height:10px"></div>
        <div class="row">
          ${achievements
            .map(
              (a) => `
                <div class="pill" style="border-color:${a.earned ? "rgba(43,182,115,0.45)" : "rgba(246,241,231,0.16)"}">
                  ${escapeHtml(a.name)}${a.earned ? " ✓" : ""}
                </div>
              `,
            )
            .join("")}
        </div>
      </div>
    </div>
  `;

  return layout({ title: t("nav.dashboard"), subtitle: "Progress is a loop: observe → adjust → repeat.", content });
}

async function pageCommunity() {
  let posts = [];
  try {
    posts = (await api("/api/community/posts", { method: "GET" })).posts || [];
  } catch (e) {
    toast(e.message);
  }

  const content = `
    <div class="grid">
      <div class="card pad col-5">
        <div class="label">${escapeHtml(t("sections.newPost"))}</div>
        <div style="height:10px"></div>
        <div class="field">
          <div class="label">${escapeHtml(t("labels.title"))}</div>
          <input class="input" id="postTitle" />
        </div>
        <div class="field">
          <div class="label">${escapeHtml(t("labels.body"))}</div>
          <textarea class="textarea" id="postBody"></textarea>
        </div>
        <div class="row">
          <button class="btn primary" id="createPost">${escapeHtml(t("actions.post"))}</button>
          ${store.user ? "" : `<a class="btn" href="#/auth/login">${escapeHtml(t("nav.login"))}</a>`}
        </div>
      </div>

      <div class="card pad col-7">
        <div class="label">Feed</div>
        <div style="height:10px"></div>
        <div style="display:grid;gap:10px">
          ${posts
            .map(
              (p) => `
                <div class="card pad" style="background:rgba(11,15,20,0.35);border:1px solid rgba(246,241,231,0.14)">
                  <div class="row" style="justify-content:space-between;align-items:center">
                    <div class="pill">${escapeHtml(p.targetLanguage.toUpperCase())}</div>
                    <div class="pill">${escapeHtml(p.user?.displayName || "—")}</div>
                  </div>
                  <div style="height:8px"></div>
                  <div style="font-family:Fraunces,serif;font-weight:700;font-size:18px">${escapeHtml(p.title)}</div>
                  <div style="height:6px"></div>
                  <div class="sub">${escapeHtml(p.body)}</div>
                  <div style="height:10px"></div>
                  <div class="row">
                    <a class="btn" href="#/community/post/${p.id}">Open</a>
                    <button class="btn" data-react="${p.id}">${escapeHtml(t("actions.react"))} (${escapeHtml(String(p.reactionCount))})</button>
                  </div>
                </div>
              `,
            )
            .join("")}
        </div>
      </div>
    </div>
  `;

  return layout({ title: t("nav.community"), subtitle: "Share momentum. Ask. Answer. Earn.", content });
}

async function bindCommunity() {
  document.getElementById("createPost")?.addEventListener("click", async () => {
    if (!store.user) {
      toast(t("hints.loginToEnroll"));
      location.hash = "#/auth/login";
      return;
    }
    const title = document.getElementById("postTitle")?.value || "";
    const body = document.getElementById("postBody")?.value || "";
    try {
      await api("/api/community/posts", { method: "POST", body: JSON.stringify({ title, body, targetLanguage: store.targetLanguage }) });
      toast("Posted.");
      render();
    } catch (e) {
      toast(e.message);
    }
  });

  document.querySelectorAll("[data-react]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!store.user) {
        toast(t("hints.loginToEnroll"));
        location.hash = "#/auth/login";
        return;
      }
      const id = btn.getAttribute("data-react");
      try {
        const res = await api(`/api/community/posts/${id}/reactions`, { method: "POST", body: "{}" });
        btn.textContent = `${t("actions.react")} (${res.reactionCount})`;
      } catch (e) {
        toast(e.message);
      }
    });
  });
}

async function pageCommunityPost(postId) {
  let post = null;
  let comments = [];
  try {
    const data = await api(`/api/community/posts/${postId}`, { method: "GET" });
    post = data.post;
    comments = data.comments || [];
  } catch (e) {
    toast(e.message);
  }

  const content = `
    <div class="grid">
      <div class="card pad col-12">
        <div class="row" style="justify-content:space-between;align-items:center">
          <div class="pill">${escapeHtml(post?.targetLanguage?.toUpperCase() || "")}</div>
          <div class="pill">${escapeHtml(post?.user?.displayName || "—")}</div>
        </div>
        <div style="height:10px"></div>
        <div style="font-family:Fraunces,serif;font-weight:700;font-size:22px">${escapeHtml(post?.title || "")}</div>
        <div style="height:8px"></div>
        <div class="sub">${escapeHtml(post?.body || "")}</div>
        <div style="height:12px"></div>
        <div class="row">
          <button class="btn" id="reactPost">${escapeHtml(t("actions.react"))} (${escapeHtml(String(post?.reactionCount ?? 0))})</button>
          <a class="btn" href="#/community">Back</a>
        </div>
      </div>
      <div class="card pad col-7">
        <div class="label">Comments</div>
        <div style="height:10px"></div>
        <div style="display:grid;gap:10px">
          ${comments
            .map(
              (c) => `
                <div class="card pad" style="background:rgba(11,15,20,0.35);border:1px solid rgba(246,241,231,0.14)">
                  <div class="row" style="justify-content:space-between;align-items:center">
                    <div class="pill">${escapeHtml(c.user?.displayName || "—")}</div>
                    <div class="pill">${escapeHtml(new Date(c.createdAt).toLocaleString())}</div>
                  </div>
                  <div style="height:8px"></div>
                  <div class="sub">${escapeHtml(c.body)}</div>
                </div>
              `,
            )
            .join("")}
        </div>
      </div>
      <div class="card pad col-5">
        <div class="label">Reply</div>
        <div style="height:10px"></div>
        <div class="field">
          <div class="label">${escapeHtml(t("labels.body"))}</div>
          <textarea class="textarea" id="commentBody"></textarea>
        </div>
        <div class="row">
          <button class="btn primary" id="sendComment">Send</button>
          ${store.user ? "" : `<a class="btn" href="#/auth/login">${escapeHtml(t("nav.login"))}</a>`}
        </div>
      </div>
    </div>
  `;

  return layout({ title: "Post", subtitle: "Community is a multiplier.", content });
}

async function bindCommunityPost(postId) {
  document.getElementById("sendComment")?.addEventListener("click", async () => {
    if (!store.user) {
      toast(t("hints.loginToEnroll"));
      location.hash = "#/auth/login";
      return;
    }
    const body = document.getElementById("commentBody")?.value || "";
    try {
      await api(`/api/community/posts/${postId}/comments`, { method: "POST", body: JSON.stringify({ body }) });
      toast("Sent.");
      render();
    } catch (e) {
      toast(e.message);
    }
  });

  document.getElementById("reactPost")?.addEventListener("click", async () => {
    if (!store.user) {
      toast(t("hints.loginToEnroll"));
      location.hash = "#/auth/login";
      return;
    }
    try {
      const res = await api(`/api/community/posts/${postId}/reactions`, { method: "POST", body: "{}" });
      document.getElementById("reactPost").textContent = `${t("actions.react")} (${res.reactionCount})`;
    } catch (e) {
      toast(e.message);
    }
  });
}

async function pageSettings() {
  const content = `
    <div class="grid">
      <div class="card pad col-6">
        <div class="label">${escapeHtml(t("labels.uiLanguage"))}</div>
        <div style="height:10px"></div>
        <select class="select" id="uiLanguage">
          <option value="en">English</option>
          <option value="ja">日本語</option>
          <option value="ko">한국어</option>
        </select>
        <div style="height:14px"></div>
        <div class="sub">UI text changes immediately. Course content remains in its target language.</div>
      </div>
      <div class="card pad col-6">
        <div class="label">${escapeHtml(t("labels.targetLanguage"))}</div>
        <div style="height:10px"></div>
        <select class="select" id="targetLanguage">
          <option value="en">English</option>
          <option value="ja">日本語</option>
          <option value="ko">한국어</option>
        </select>
        <div style="height:14px"></div>
        <div class="sub">Used for catalog filtering and recommendations (v1).</div>
      </div>
    </div>
  `;
  return layout({ title: t("nav.settings"), subtitle: "Tune the studio to your learning rhythm.", content });
}

async function bindSettings() {
  const $ui = document.getElementById("uiLanguage");
  const $tl = document.getElementById("targetLanguage");
  if ($ui) $ui.value = store.uiLanguage;
  if ($tl) $tl.value = store.targetLanguage;

  $ui?.addEventListener("change", () => {
    store.uiLanguage = $ui.value;
    localStorage.setItem("uiLanguage", store.uiLanguage);
    render();
  });
  $tl?.addEventListener("change", () => {
    store.targetLanguage = $tl.value;
    localStorage.setItem("targetLanguage", store.targetLanguage);
    render();
  });
}

async function doLogout() {
  try {
    await api("/api/auth/logout", { method: "POST", body: "{}" });
  } catch {
  } finally {
    store.user = null;
    toast("Logged out.");
    location.hash = "#/";
  }
}

async function render() {
  const r = route();
  await loadMe();

  let html = "";
  let binder = null;

  if (r.path === "/" || r.path === "") {
    html = await pageHome();
  } else if (r.path === "/auth/login") {
    html = await pageAuth("login");
    binder = () => bindAuth("login");
  } else if (r.path === "/auth/register") {
    html = await pageAuth("register");
    binder = () => bindAuth("register");
  } else if (r.path === "/catalog") {
    html = await pageCatalog();
    binder = bindCatalog;
  } else if (r.path.startsWith("/course/")) {
    const id = r.path.split("/")[2];
    html = await pageCourse(id);
    binder = () => bindCourse(id);
  } else if (r.path.startsWith("/lesson/")) {
    const id = r.path.split("/")[2];
    html = await pageLesson(id);
  } else if (r.path === "/practice") {
    html = await pagePractice(r.params);
    binder = () => bindPractice(r.params);
  } else if (r.path === "/dashboard") {
    html = await pageDashboard();
  } else if (r.path === "/community") {
    html = await pageCommunity();
    binder = bindCommunity;
  } else if (r.path.startsWith("/community/post/")) {
    const id = r.path.split("/")[3];
    html = await pageCommunityPost(id);
    binder = () => bindCommunityPost(id);
  } else if (r.path === "/settings") {
    html = await pageSettings();
    binder = bindSettings;
  } else if (r.path === "/logout") {
    await doLogout();
    return;
  } else {
    html = await pageHome();
  }

  $app.innerHTML = html;
  bindCommon();
  if (binder) await binder();
}

window.addEventListener("hashchange", () => render());
render();
