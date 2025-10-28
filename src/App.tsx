import { Routes, Route, Link } from "react-router-dom";
import CountriesList from "./pages/CountriesList";
import CountryDetail from "./pages/CountryInfo";

export default function App() {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
      <header role="banner" style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <Link to="/" style={{ textDecoration: "none", fontWeight: 700, fontSize: 20 }}>
          Reseapp
        </Link>
        <nav aria-label="Huvudnavigation">
          <Link to="/" style={{ color: "#2563eb" }}>Start</Link>
        </nav>
      </header>

      <main role="main" style={{ marginTop: 16 }}>
        <Routes>
          <Route path="/" element={<CountriesList />} />
          <Route path="/country/:code" element={<CountryDetail />} />
        </Routes>
      </main>
    </div>
  );
}
