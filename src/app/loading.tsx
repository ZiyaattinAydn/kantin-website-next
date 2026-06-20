export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-live="polite"
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
        background: "#f6f0df",
        color: "#02194b",
        textAlign: "center",
      }}
    >
      <div>
        <p className="eyebrow">kantin.</p>
        <h1 style={{ margin: "0.5rem 0", fontSize: "clamp(2rem, 8vw, 5rem)" }}>
          İçerik hazırlanıyor<span style={{ color: "#0047bb" }}>.</span>
        </h1>
        <p style={{ margin: 0 }}>Şube ve menü verileri yükleniyor…</p>
      </div>
    </main>
  );
}
