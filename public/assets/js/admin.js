import { firebaseConfig, isFirebaseConfigured } from "./firebase-config.js";

const FIREBASE_VERSION = "12.14.0";
const DEMO_KEY = "kantin_demo_events_v1";

const setup = document.querySelector("[data-admin-setup]");
const login = document.querySelector("[data-admin-login]");
const dashboard = document.querySelector("[data-admin-dashboard]");
const modeBadge = document.querySelector("[data-admin-mode]");
const signoutButton = document.querySelector("[data-admin-signout]");
const demoButton = document.querySelector("[data-demo-start]");
const loginForm = document.querySelector("[data-login-form]");
const loginMessage = document.querySelector("[data-login-message]");
const eventForm = document.querySelector("[data-event-form]");
const formMessage = document.querySelector("[data-form-message]");
const listNode = document.querySelector("[data-admin-event-list]");
const countNode = document.querySelector("[data-event-count]");
const formTitle = document.querySelector("[data-form-title]");
const deleteButton = document.querySelector("[data-delete-event]");
const newButton = document.querySelector("[data-new-event]");
const resetButton = document.querySelector("[data-form-reset]");

let mode = "demo";
let events = [];
let firebaseServices = null;

const branchLabels = {
  alsancak: "Alsancak",
  atakent: "Atakent",
  both: "İki şube"
};

function showOnly(target) {
  [setup, login, dashboard].forEach((node) => {
    if (node) node.hidden = node !== target;
  });
}

function message(node, text, type = "") {
  if (!node) return;
  node.textContent = text;
  node.className = `form-message ${type}`.trim();
}

function dateToInput(value) {
  if (!value) return "";
  const date = value?.toDate ? value.toDate() : new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function inputToIso(value) {
  return value ? new Date(value).toISOString() : "";
}

function normalise(item) {
  return {
    ...item,
    startAt: item.startAt?.toDate ? item.startAt.toDate().toISOString() : item.startAt,
    endAt: item.endAt?.toDate ? item.endAt.toDate().toISOString() : item.endAt
  };
}

function sortEvents(items) {
  return [...items].sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
}

function clearForm() {
  eventForm.reset();
  eventForm.elements.id.value = "";
  eventForm.elements.branch.value = "alsancak";
  eventForm.elements.status.value = "draft";
  formTitle.textContent = "Yeni etkinlik";
  deleteButton.hidden = true;
  message(formMessage, "");
}

function fillForm(event) {
  eventForm.elements.id.value = event.id || "";
  eventForm.elements.title.value = event.title || "";
  eventForm.elements.description.value = event.description || "";
  eventForm.elements.startAt.value = dateToInput(event.startAt);
  eventForm.elements.endAt.value = dateToInput(event.endAt);
  eventForm.elements.branch.value = event.branch || "alsancak";
  eventForm.elements.status.value = event.status || "draft";
  eventForm.elements.location.value = event.location || "";
  eventForm.elements.link.value = event.link || "";
  eventForm.elements.imageUrl.value = event.imageUrl || "";
  formTitle.textContent = "Etkinliği düzenle";
  deleteButton.hidden = !event.id;
  message(formMessage, "");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderList() {
  listNode.replaceChildren();
  countNode.textContent = `${events.length} kayıt`;

  if (!events.length) {
    const empty = document.createElement("p");
    empty.className = "admin-list-empty";
    empty.textContent = "Henüz etkinlik eklenmedi.";
    listNode.append(empty);
    return;
  }

  sortEvents(events).forEach((event) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "admin-event-row";
    button.innerHTML = `
      <span class="admin-event-status ${event.status}">${event.status === "published" ? "Yayında" : "Taslak"}</span>
      <strong></strong>
      <small>${branchLabels[event.branch] || "Kantin."} · ${new Intl.DateTimeFormat("tr-TR", {
        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
      }).format(new Date(event.startAt))}</small>
    `;
    button.querySelector("strong").textContent = event.title;
    button.addEventListener("click", () => fillForm(event));
    listNode.append(button);
  });
}

function readDemo() {
  try {
    return JSON.parse(localStorage.getItem(DEMO_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveDemo(items) {
  localStorage.setItem(DEMO_KEY, JSON.stringify(items));
}

async function initFirebase() {
  const [{ initializeApp }, authModule, firestoreModule] = await Promise.all([
    import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app.js`),
    import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-auth.js`),
    import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-firestore.js`)
  ]);

  const app = initializeApp(firebaseConfig);
  const auth = authModule.getAuth(app);
  const db = firestoreModule.getFirestore(app);

  firebaseServices = { authModule, firestoreModule, auth, db };

  authModule.onAuthStateChanged(auth, async (user) => {
    if (!user) {
      modeBadge.textContent = "Firebase · çıkış yapıldı";
      signoutButton.hidden = true;
      showOnly(login);
      return;
    }

    const adminRef = firestoreModule.doc(db, "admins", user.uid);
    const adminSnap = await firestoreModule.getDoc(adminRef);

    if (!adminSnap.exists()) {
      message(loginMessage, "Bu kullanıcı yönetici olarak yetkilendirilmemiş.", "error");
      await authModule.signOut(auth);
      return;
    }

    mode = "firebase";
    modeBadge.textContent = "Firebase · canlı";
    signoutButton.hidden = false;
    await loadFirebaseEvents();
    showOnly(dashboard);
  });
}

async function loadFirebaseEvents() {
  const { firestoreModule, db } = firebaseServices;
  const snapshot = await firestoreModule.getDocs(firestoreModule.collection(db, "events"));
  events = snapshot.docs.map((doc) => normalise({ id: doc.id, ...doc.data() }));
  renderList();
}

async function saveFirebaseEvent(data, id) {
  const { firestoreModule, db } = firebaseServices;
  const payload = {
    ...data,
    startAt: firestoreModule.Timestamp.fromDate(new Date(data.startAt)),
    endAt: firestoreModule.Timestamp.fromDate(new Date(data.endAt)),
    updatedAt: firestoreModule.serverTimestamp()
  };

  if (id) {
    await firestoreModule.updateDoc(firestoreModule.doc(db, "events", id), payload);
  } else {
    await firestoreModule.addDoc(firestoreModule.collection(db, "events"), {
      ...payload,
      createdAt: firestoreModule.serverTimestamp()
    });
  }
  await loadFirebaseEvents();
}

async function deleteFirebaseEvent(id) {
  const { firestoreModule, db } = firebaseServices;
  await firestoreModule.deleteDoc(firestoreModule.doc(db, "events", id));
  await loadFirebaseEvents();
}

function eventDataFromForm() {
  const data = new FormData(eventForm);
  return {
    title: String(data.get("title") || "").trim(),
    description: String(data.get("description") || "").trim(),
    startAt: inputToIso(String(data.get("startAt") || "")),
    endAt: inputToIso(String(data.get("endAt") || "")),
    branch: String(data.get("branch") || "alsancak"),
    status: String(data.get("status") || "draft"),
    location: String(data.get("location") || "").trim(),
    link: String(data.get("link") || "").trim(),
    imageUrl: String(data.get("imageUrl") || "").trim()
  };
}

demoButton?.addEventListener("click", () => {
  mode = "demo";
  modeBadge.textContent = "Demo · yalnızca bu tarayıcı";
  signoutButton.hidden = true;
  events = readDemo();
  renderList();
  clearForm();
  showOnly(dashboard);
});

loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(loginForm);
  message(loginMessage, "Giriş yapılıyor…");
  try {
    await firebaseServices.authModule.signInWithEmailAndPassword(
      firebaseServices.auth,
      String(data.get("email")),
      String(data.get("password"))
    );
    message(loginMessage, "");
  } catch (error) {
    console.error(error);
    message(loginMessage, "Giriş başarısız. E-posta, şifre ve Firebase ayarlarını kontrol et.", "error");
  }
});

signoutButton?.addEventListener("click", async () => {
  if (mode === "firebase") await firebaseServices.authModule.signOut(firebaseServices.auth);
});

eventForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = eventForm.elements.id.value;
  const data = eventDataFromForm();

  if (new Date(data.endAt) <= new Date(data.startAt)) {
    message(formMessage, "Bitiş zamanı başlangıçtan sonra olmalı.", "error");
    return;
  }

  message(formMessage, "Kaydediliyor…");
  try {
    if (mode === "firebase") {
      await saveFirebaseEvent(data, id);
    } else {
      if (id) {
        events = events.map((item) => item.id === id ? { ...item, ...data } : item);
      } else {
        events.push({ id: crypto.randomUUID(), ...data, createdAt: new Date().toISOString() });
      }
      saveDemo(events);
      renderList();
    }
    clearForm();
    message(formMessage, "Etkinlik kaydedildi.", "success");
  } catch (error) {
    console.error(error);
    message(formMessage, "Kayıt sırasında hata oluştu. Yetki ve bağlantıyı kontrol et.", "error");
  }
});

deleteButton?.addEventListener("click", async () => {
  const id = eventForm.elements.id.value;
  if (!id || !confirm("Bu etkinlik silinsin mi?")) return;

  try {
    if (mode === "firebase") {
      await deleteFirebaseEvent(id);
    } else {
      events = events.filter((item) => item.id !== id);
      saveDemo(events);
      renderList();
    }
    clearForm();
  } catch (error) {
    console.error(error);
    message(formMessage, "Etkinlik silinemedi.", "error");
  }
});

newButton?.addEventListener("click", clearForm);
resetButton?.addEventListener("click", clearForm);

if (isFirebaseConfigured) {
  modeBadge.textContent = "Firebase · bağlantı kuruluyor";
  showOnly(login);
  initFirebase().catch((error) => {
    console.error(error);
    modeBadge.textContent = "Firebase bağlantı hatası";
    showOnly(setup);
  });
} else {
  modeBadge.textContent = "Kurulum gerekli";
  showOnly(setup);
}
