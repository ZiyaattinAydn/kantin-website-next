import { firebaseConfig, isFirebaseConfigured } from "./firebase-config.js";

const FIREBASE_VERSION = "12.14.0";
const DEMO_KEY = "kantin_demo_events_v1";

const branchLabels = {
  alsancak: "Alsancak",
  atakent: "Atakent",
  both: "İki şube"
};

const branchAddresses = {
  alsancak: "1464. Sokak No:71/A, Alsancak, Konak / İzmir",
  atakent: "2035 Sokak No:6, Atakent, Karşıyaka / İzmir",
  both: "Alsancak + Atakent"
};

function normaliseDate(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  if (value.seconds) return new Date(value.seconds * 1000);
  return new Date(value);
}

function normaliseEvent(item) {
  return {
    ...item,
    startAt: normaliseDate(item.startAt),
    endAt: normaliseDate(item.endAt)
  };
}

function futureEvents(items) {
  const now = new Date();
  return items
    .map(normaliseEvent)
    .filter((item) => {
      if (item.status !== "published" || !item.startAt) return false;
      const visibleUntil = item.endAt || item.startAt;
      return visibleUntil >= now;
    })
    .sort((a, b) => a.startAt - b.startAt);
}

async function loadFromFirebase() {
  const [{ initializeApp }, firestore] = await Promise.all([
    import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app.js`),
    import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-firestore.js`)
  ]);

  const app = initializeApp(firebaseConfig);
  const db = firestore.getFirestore(app);
  const q = firestore.query(
    firestore.collection(db, "events"),
    firestore.where("status", "==", "published")
  );
  const snapshot = await firestore.getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function loadEvents() {
  if (isFirebaseConfigured) {
    try {
      return futureEvents(await loadFromFirebase());
    } catch (error) {
      console.error("Firebase etkinlikleri yüklenemedi:", error);
    }
  }

  try {
    const demo = JSON.parse(localStorage.getItem(DEMO_KEY) || "[]");
    if (demo.length) return futureEvents(demo);
  } catch (error) {
    console.warn("Demo etkinlikleri okunamadı:", error);
  }

  try {
    const response = await fetch("/data/events.json", { cache: "no-store" });
    if (!response.ok) throw new Error("events.json okunamadı");
    return futureEvents(await response.json());
  } catch (error) {
    console.warn("Yerel etkinlik verisi okunamadı:", error);
    return [];
  }
}

function formatDay(date) {
  return new Intl.DateTimeFormat("tr-TR", { day: "2-digit" }).format(date);
}

function formatMonth(date) {
  return new Intl.DateTimeFormat("tr-TR", { month: "short" })
    .format(date)
    .replace(".", "")
    .toLocaleUpperCase("tr-TR");
}

function formatFullDate(date) {
  return new Intl.DateTimeFormat("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long"
  }).format(date);
}

function formatTime(date) {
  return new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function safeUrl(url) {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : "";
  } catch {
    return "";
  }
}

function createEventImage(event, className) {
  const source = safeUrl(event.imageUrl);
  if (!source) return null;

  const figure = document.createElement("figure");
  figure.className = className;

  const image = document.createElement("img");
  image.src = source;
  image.alt = `${event.title || "Kantin etkinliği"} etkinlik görseli`;
  image.loading = "lazy";
  image.decoding = "async";
  figure.append(image);
  return figure;
}

function createHomeCard(event) {
  const article = document.createElement("article");
  article.className = "event-card";

  const date = document.createElement("div");
  date.className = "event-date";
  date.innerHTML = `<strong>${formatDay(event.startAt)}</strong><span>${formatMonth(event.startAt)}</span>`;

  const content = document.createElement("div");
  content.className = "event-content";

  const tags = document.createElement("div");
  tags.className = "event-tags";
  tags.innerHTML = `<span>${branchLabels[event.branch] || "Kantin."}</span><span>${formatTime(event.startAt)}</span>`;

  const title = document.createElement("h3");
  title.textContent = event.title;

  const description = document.createElement("p");
  description.textContent = event.description;

  const link = document.createElement("a");
  const external = safeUrl(event.link);
  link.href = external || "/events";
  link.textContent = external ? "Kayıt / detay ↗" : "Detaya git ↗";
  if (external) {
    link.target = "_blank";
    link.rel = "noopener";
  }

  content.append(tags, title, description, link);
  const image = createEventImage(event, "event-card-image");
  if (image) article.append(image);
  article.append(date, content);
  return article;
}

function createListCard(event) {
  const article = document.createElement("article");
  article.className = "event-list-card";
  article.dataset.branch = event.branch;
  article.dataset.dynamicEvent = "true";

  const dateBox = document.createElement("div");
  dateBox.className = "event-list-date";
  dateBox.innerHTML = `
    <span>${formatMonth(event.startAt)}</span>
    <strong>${formatDay(event.startAt)}</strong>
    <small>${formatFullDate(event.startAt).split(" ")[0]}</small>
  `;

  const body = document.createElement("div");
  body.className = "event-list-body";

  const tags = document.createElement("div");
  tags.className = "event-tags";
  tags.innerHTML = `
    <span>${branchLabels[event.branch] || "Kantin."}</span>
    <span>${formatTime(event.startAt)}</span>
    <span>${event.location || branchAddresses[event.branch] || "İzmir"}</span>
  `;

  const title = document.createElement("h2");
  title.textContent = event.title;

  const description = document.createElement("p");
  description.textContent = event.description;

  const footer = document.createElement("div");
  footer.className = "event-list-footer";

  const dateText = document.createElement("span");
  dateText.textContent = `${formatFullDate(event.startAt)} · ${formatTime(event.startAt)}${event.endAt ? `–${formatTime(event.endAt)}` : ""}`;

  const external = safeUrl(event.link);
  if (external) {
    const action = document.createElement("a");
    action.className = "calendar-button";
    action.href = external;
    action.target = "_blank";
    action.rel = "noopener";
    action.textContent = "Kayıt / detay ↗";
    footer.append(dateText, action);
  } else {
    footer.append(dateText);
  }

  body.append(tags, title, description, footer);
  const image = createEventImage(event, "event-list-image");
  article.append(dateBox);
  if (image) article.append(image);
  article.append(body);
  return article;
}

function wireFilters() {
  const buttons = [...document.querySelectorAll("[data-event-filter]")];
  const empty = document.querySelector("[data-event-empty]");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.eventFilter;
      const cards = [...document.querySelectorAll("[data-dynamic-event]")];
      let visible = 0;

      buttons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-pressed", String(active));
      });

      cards.forEach((card) => {
        const show =
          filter === "all" ||
          card.dataset.branch === filter ||
          card.dataset.branch === "both";
        card.hidden = !show;
        if (show) visible += 1;
      });

      if (empty) empty.hidden = visible > 0;
    });
  });
}

async function render() {
  const events = await loadEvents();

  const home = document.querySelector("[data-events-home]");
  if (home && events.length) {
    home.replaceChildren(...events.slice(0, 3).map(createHomeCard));
  }

  const list = document.querySelector("[data-events-list]");
  if (list && events.length) {
    list.replaceChildren(...events.map(createListCard));
    wireFilters();
  }
}

render();
