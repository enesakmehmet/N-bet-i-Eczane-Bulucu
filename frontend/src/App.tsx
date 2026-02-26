import React, { useState } from "react";
import axios from "axios";
import {
  Pill, Search, MapPin, Map, Phone, Navigation,
  AlertCircle, Loader2, Activity, Clock, Building2
} from "lucide-react";
import "./App.css";
import { cities } from "./cities";

interface Pharmacy {
  name: string;
  dist: string;
  address: string;
  phone: string;
  loc: string;
}

function App() {
  const apiKey = import.meta.env.VITE_COLLECT_API_KEY;
  const [city, setCity] = useState("Ankara");
  const [district, setDistrict] = useState("");
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchedCity, setSearchedCity] = useState("");

  const handleSearch = async () => {
    if (!apiKey) { setError("Lütfen .env dosyasına API anahtarını ekleyin."); return; }
    setLoading(true); setError(""); setPharmacies([]);
    try {
      const res = await axios.get("https://api.collectapi.com/health/dutyPharmacy", {
        params: { il: city, ilce: district },
        headers: { authorization: `apikey ${apiKey}`, "content-type": "application/json" },
      });
      if (res.data?.success) {
        setPharmacies(res.data.result);
        setSearchedCity(city);
        if (res.data.result.length === 0) setError("Bu kriterlere uygun nöbetçi eczane bulunamadı.");
      } else {
        setError(res.data?.message || "Eczane bilgileri alınırken bir hata oluştu.");
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || "Bilinmeyen bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => { if (e.key === "Enter") handleSearch(); };

  const now = new Date();
  const timeStr = now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "long" });

  return (
    <>
      {/* Animated background */}
      <div className="canvas-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>
      <div className="grid-overlay" />

      <div className="app-container">
        {/* HEADER */}
        <header className="header">
          <div className="header-badge">
            <span className="badge-dot" />
            Canlı Veri · Türkiye Geneli
          </div>

          <h1 className="header-title">
            <span className="title-line-1">Nöbetçi Eczane</span>
            <span className="title-line-2">Bulucu</span>
          </h1>

          <p className="header-subtitle">
            Türkiye'deki tüm nöbetçi eczaneleri <strong>anında</strong> bulun —
            adres, telefon ve harita yönlendirmesi bir arada.
          </p>

          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-value">81</span>
              <span className="stat-label">İl</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-value">7/24</span>
              <span className="stat-label">Canlı Veri</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-value">{timeStr}</span>
              <span className="stat-label">{dateStr}</span>
            </div>
          </div>
        </header>

        {/* SEARCH */}
        <section className="glass-panel">
          <div className="panel-label">
            <Search size={12} />
            Eczane Arama
          </div>
          <div className="top-bar">
            <div className="input-group">
              <label htmlFor="city"><Map size={13} /> İl Seçiniz</label>
              <select
                id="city"
                className="input-field"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="district"><MapPin size={13} /> İlçe <span style={{ color: "var(--txt-3)", fontWeight: 400 }}>(Opsiyonel)</span></label>
              <input
                id="district"
                type="text"
                className="input-field"
                placeholder="Örn: Çankaya"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                onKeyDown={handleKey}
              />
            </div>

            <button className="btn-search" onClick={handleSearch} disabled={loading}>
              {loading
                ? <><Loader2 className="spinner" size={18} /> Aranıyor...</>
                : <><Search size={18} /> Eczane Bul</>
              }
            </button>
          </div>
        </section>

        {/* RESULTS */}
        <main>
          {pharmacies.length > 0 && (
            <div className="results-header">
              <h2>
                <Building2 size={16} style={{ display: "inline", marginRight: "0.4rem", verticalAlign: "middle" }} />
                {searchedCity} — Nöbetçi Eczaneler
              </h2>
              <span className="results-count">
                <Activity size={12} />
                {pharmacies.length} eczane aktif
              </span>
            </div>
          )}

          <div className="pharmacy-grid">
            {loading && (
              <div className="loading-box">
                <div className="spinner-ring" />
                <p>Nöbetçi eczaneler aranıyor...</p>
              </div>
            )}

            {!loading && error && (
              <div className="error-box">
                <AlertCircle size={48} />
                <p>{error}</p>
              </div>
            )}

            {!loading && !error && pharmacies.length === 0 && (
              <div className="empty-box">
                <Pill size={56} />
                <p>İl seçerek nöbetçi eczane aramasını başlatın.</p>
              </div>
            )}

            {!loading && pharmacies.map((p, i) => (
              <div
                key={i}
                className="pharmacy-card"
                style={{ animationDelay: `${i * 0.045}s` }}
              >
                <span className="card-number">{i + 1}</span>

                <div className="card-header">
                  <h3>{p.name}</h3>
                  {p.dist && <span className="badge">{p.dist}</span>}
                </div>

                <div className="card-divider" />

                <div className="card-body">
                  {p.address && (
                    <div className="info-row">
                      <MapPin size={15} className="info-icon" />
                      <span>{p.address}</span>
                    </div>
                  )}
                  {p.phone && (
                    <div className="info-row">
                      <Phone size={15} className="info-icon" />
                      <span>{p.phone}</span>
                    </div>
                  )}
                </div>

                <div className="card-actions">
                  {p.phone && (
                    <a href={`tel:${p.phone}`} className="action-btn call">
                      <Phone size={14} /> Ara
                    </a>
                  )}
                  {p.loc && (
                    <a
                      href={`https://maps.google.com/?q=${p.loc}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-btn directions"
                    >
                      <Navigation size={14} /> Yol Tarifi
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* FOOTER */}
        <footer className="footer">
          <Clock size={12} />
          Veriler CollectAPI üzerinden anlık çekilmektedir
          <span className="footer-dot" />
          © {now.getFullYear()} Nöbetçi Eczane Bulucu
        </footer>
      </div>
    </>
  );
}

export default App;
