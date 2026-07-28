import CardCarousel from "./CardCarousel";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "#f8fafc",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <p style={{ fontSize: "12px", letterSpacing: "0.3em", textTransform: "uppercase", color: "#94a3b8" }}>
          Featured picks
        </p>
        <h1 style={{ marginTop: "8px", fontSize: "32px", fontWeight: 600 }}>Explore the collection</h1>
      </div>
      <CardCarousel />
    </main>
  );
}
