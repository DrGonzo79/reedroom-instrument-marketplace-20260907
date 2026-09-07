"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDownToLine, ArrowUpRight, AudioLines, Bookmark, Check, CirclePlay, Disc3, Headphones, Library, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import catalog from "../data/instruments.json";

type Instrument = (typeof catalog)[number];
const families = ["All", "Keys", "Strings", "Percussion", "Winds"];
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const currency = (cents: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100);

function InstrumentArt({ instrument }: { instrument: Instrument }) {
  return <div className={`art ${instrument.color}`} aria-hidden="true">
    <span className="edition">RR / {instrument.edition}</span><span className="art-label">THE HUMAN COLLECTION</span>
    <svg viewBox="0 0 360 210" focusable="false">
      <ellipse cx="180" cy="183" rx="105" ry="12" fill="#000" opacity=".16" />
      {instrument.family === "Keys" ? <g transform="translate(70 30) rotate(-8 110 75)">
        <path d="M0 50 35 12 220 12 220 132 0 142Z" fill="#452b20" /><path d="M0 50 185 50 220 12 35 12Z" fill="#936447" />
        <path d="M13 64H204V117H13Z" fill="#eee0c5" />
        {Array.from({ length: 15 }, (_, index) => <path key={index} d={`M${20 + index * 12} 64V117`} stroke="#796b53" />)}
        {Array.from({ length: 10 }, (_, index) => <rect key={index} x={24 + index * 18} y="64" width="8" height="30" rx="1" fill="#211e1a" />)}
        <path d="M22 128H188M28 136H184" stroke="#ad7950" strokeWidth="3" />
      </g> : instrument.family === "Strings" ? <g transform="translate(135 8) rotate(18 45 90)">
        <path d="M35 66C-5 46-15 88 12 104C-25 132 2 173 45 172C88 173 115 132 78 104C105 88 95 46 55 66Z" fill="#9a562f" stroke="#452515" strokeWidth="4" />
        <rect x="38" y="4" width="14" height="123" rx="6" fill="#302623" /><path d="M41 13V153M46 13V153M51 13V153" stroke="#e5bd80" /><path d="M30 135H60M45 172V190" stroke="#2c201c" strokeWidth="5" />
      </g> : instrument.family === "Percussion" ? <g transform="translate(113 30) rotate(-12 70 75)">
        <rect width="140" height="151" rx="34" fill="#825036" stroke="#a66f48" strokeWidth="5" /><circle cx="70" cy="98" r="26" fill="#35271f" />
        {Array.from({ length: 9 }, (_, index) => <rect key={index} x={18 + index * 12} y="16" width="7" height={48 + (4 - Math.abs(4 - index)) * 13} rx="3" fill="#dacbb7" />)}
        <path d="M12 36H128" stroke="#40332b" strokeWidth="8" />
      </g> : <g transform="translate(55 92) rotate(-20 130 15)">
        <rect width="260" height="28" rx="14" fill="#bb9266" stroke="#dcc09a" strokeWidth="3" />
        {[50, 80, 110, 140, 170, 200].map(position => <circle key={position} cx={position} cy="14" r="5" fill="#4a392d" />)}
        <path d="M20 0V28M225 0V28" stroke="#614531" strokeWidth="5" />
      </g>}
    </svg>
    <span className="art-caption">{instrument.family === "Keys" ? "AIR, WOOD & IMPERFECTION" : instrument.character.toUpperCase()}</span>
  </div>;
}

export default function Home() {
  const [ready, setReady] = useState(false);
  const [instruments, setInstruments] = useState(catalog);
  const [family, setFamily] = useState("All");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("Discover");
  const [saved, setSaved] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [playing, setPlaying] = useState<string | null>(null);
  const [selected, setSelected] = useState<Instrument | null>(null);
  const [units, setUnits] = useState(100);
  const [share, setShare] = useState(60);
  const [estimate, setEstimate] = useState<{ grossCents: number; artistCents: number; platformCents: number } | null>(null);
  const [calculating, setCalculating] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  const playbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    setReady(true);
    try {
      const stored: unknown = JSON.parse(localStorage.getItem("reedroom-saved") || "[]");
      if (Array.isArray(stored)) setSaved(stored.filter((item): item is string => typeof item === "string" && catalog.some(instrument => instrument.id === item)));
    } catch { setNotice("Browser storage is unavailable. Your collection will last for this visit only."); }
    if (apiUrl) fetch(`${apiUrl}/instruments`).then(response => {
      if (!response.ok) throw new Error("API unavailable");
      return response.json();
    }).then(setInstruments).catch(() => setNotice("API unavailable — showing the bundled demo catalog."));
    return () => { if (playbackTimer.current) clearTimeout(playbackTimer.current); void audio.current?.close(); };
  }, []);

  useEffect(() => { if (selected) dialog.current?.showModal(); }, [selected]);

  function toggleSaved(instrument: Instrument) {
    const next = saved.includes(instrument.id) ? saved.filter(id => id !== instrument.id) : [...saved, instrument.id];
    setSaved(next);
    try { localStorage.setItem("reedroom-saved", JSON.stringify(next)); } catch { setNotice("Collection updated for this visit; browser storage is unavailable."); }
  }

  async function preview(instrument: Instrument) {
    try {
      if (playbackTimer.current) clearTimeout(playbackTimer.current);
      if (audio.current && audio.current.state !== "closed") await audio.current.close();
      audio.current = null;
      if (playing === instrument.id) { setPlaying(null); return; }
      const context = new AudioContext();
      audio.current = context;
      await context.resume();
      [1, 1.25, 1.5, 2].forEach((ratio, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const start = context.currentTime + index * 0.24;
        oscillator.type = instrument.family === "Keys" ? "triangle" : "sine";
        oscillator.frequency.value = instrument.frequency * ratio;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.09, start + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 1.1);
        oscillator.connect(gain); gain.connect(context.destination);
        oscillator.start(start); oscillator.stop(start + 1.2);
      });
      setPlaying(instrument.id);
      playbackTimer.current = setTimeout(() => { setPlaying(null); void context.close(); }, 2200);
    } catch { setPlaying(null); setNotice("Audio could not start in this browser. Try another browser or check audio permissions."); }
  }

  async function calculate() {
    setCalculating(true);
    setEstimate(null);
    const grossCents = 4900 * units;
    try {
      if (apiUrl) {
        const response = await fetch(`${apiUrl}/royalties/estimate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ price_cents: 4900, units, artist_percent: share }) });
        if (!response.ok) throw new Error("Calculation failed");
        setEstimate(await response.json());
      } else {
        const artistCents = Math.floor(grossCents * share / 100);
        setEstimate({ grossCents, artistCents, platformCents: grossCents - artistCents });
      }
    } catch { setNotice("The API could not calculate royalties. Please try again; no estimate was saved."); }
    finally { setCalculating(false); }
  }

  function exportCollection() {
    const blob = new Blob([JSON.stringify({ demo: true, instruments: instruments.filter(instrument => saved.includes(instrument.id)) }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.href = url; link.download = "reedroom-collection.json"; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("Demo collection exported. This is a catalog list, not audio or a license.");
  }

  const filtered = instruments.filter(instrument => (family === "All" || instrument.family === family) && `${instrument.name} ${instrument.artist} ${instrument.character}`.toLowerCase().includes(query.toLowerCase()) && (tab !== "My collection" || saved.includes(instrument.id)));

  return <div className="shell" inert={!ready} aria-busy={!ready}>
    <a className="skip" href="#main">Skip to content</a>
    <aside className="sidebar">
      <a href="#main" className="brand"><AudioLines size={29} /><span>reedroom<span className="brand-dot">.</span></span></a>
      <div className="workspace"><span className="avatar">R</span><div>Your listening room<small>Producer workspace</small></div><span className="workspace-dot" /></div>
      <span className="nav-label">YOUR WORKSPACE</span>
      <nav aria-label="Main navigation">
        {[{ name: "Discover", icon: Disc3 }, { name: "My collection", icon: Library }, { name: "Artist studio", icon: SlidersHorizontal }].map(item => <button key={item.name} className={tab === item.name ? "nav-item active" : "nav-item"} aria-current={tab === item.name ? "page" : undefined} onClick={() => { setTab(item.name); setQuery(""); setFamily("All"); }}><item.icon size={18} />{item.name}{item.name === "My collection" && <span className="count">{saved.length}</span>}</button>)}
      </nav>
      <div className="sidebar-note"><div className="note-icon"><Headphones size={22} /></div><h3>Made by humans.<br />Played by you.</h3><p>Rare instruments. Real character. A fairer deal for the people behind the sound.</p><button onClick={() => setTab("Artist studio")}>Explore the artist model <ArrowUpRight size={15} /></button></div>
      <div className="sidebar-footer"><span className="status-dot" /> Interactive concept · v0.1<small>Next.js + Python / FastAPI</small></div>
    </aside>
    <div className="main-wrap">
      <header className="topbar"><div className="breadcrumb">Your workspace <span>/</span> <strong>{tab}</strong></div><div className="top-actions"><span className="demo-pill">{apiUrl ? "API-connected demo" : "Demo workspace"}</span><span className="avatar profile" aria-label="Demo producer">JP</span></div></header>
      <main id="main">
        {notice && <div className="notice" role="status">{notice}<button aria-label="Dismiss notice" onClick={() => setNotice("")}><X size={16} /></button></div>}
        {tab !== "Artist studio" ? <>
          <section className="page-heading"><div><div className="eyebrow">THE INDEPENDENT SOUND LIBRARY</div><h1>{tab === "My collection" ? "Your next sound, saved." : "Find a little soul."}</h1><p>{tab === "My collection" ? "A personal shortlist for the music you haven’t made yet." : "Extraordinary instruments. Remarkable musicians. Sounds with a story."}</p></div><button className="outline-button" onClick={() => setTab("Artist studio")}>For artists <ArrowUpRight size={16} /></button></section>
          {tab === "Discover" && <section className="hero"><div className="hero-copy"><span className="capsule"><Sparkles size={13} /> COLLECTION NO. 001</span><h2>Perfectly<br /><em>imperfect.</em></h2><p>The creak of a pedal. The breath before a note.<br />Discover the character that presets forgot.</p><button className="cream-button" onClick={() => setSelected(instruments[0])}>Meet the harmonium <ArrowUpRight size={17} /></button><span className="hero-footnote">Concept collection · illustrated instruments</span></div><div className="hero-art"><InstrumentArt instrument={catalog[0]} /><span className="hero-stamp">SMALL BATCH<br /><strong>BIG FEELING</strong><br />EST. 2026</span></div></section>}
          <section className="library-section" aria-label="Instrument catalog"><div className="section-title"><h2>{tab === "My collection" ? "Your collection" : "Explore the collection"}<span>{filtered.length} instruments</span></h2>{tab === "My collection" ? <button className="text-button" onClick={exportCollection} disabled={!saved.length}><ArrowDownToLine size={15} /> Export list</button> : <span className="curated"><span className="status-dot" /> Thoughtfully curated</span>}</div>
            <div className="filters"><div className="family-tabs" role="group" aria-label="Instrument family">{families.map(item => <button key={item} aria-pressed={family === item} className={family === item ? "selected" : ""} onClick={() => setFamily(item)}>{item}</button>)}</div><label className="search"><Search size={16} /><input aria-label="Search instruments" placeholder="Find your sound…" value={query} onChange={event => setQuery(event.target.value)} /></label></div>
            <div className="cards">{filtered.map(instrument => <article className="instrument-card" key={instrument.id}><div className="card-art"><InstrumentArt instrument={instrument} /><button className={`save-button ${saved.includes(instrument.id) ? "saved" : ""}`} aria-label={`${saved.includes(instrument.id) ? "Unsave" : "Save"} ${instrument.name}`} aria-pressed={saved.includes(instrument.id)} onClick={() => toggleSaved(instrument)}>{saved.includes(instrument.id) ? <Check size={17} /> : <Bookmark size={17} />}</button></div><div className="card-info"><span className="instrument-family">{instrument.family} <span>·</span> SAMPLE LIBRARY CONCEPT</span><button className="title-button" onClick={() => setSelected(instrument)}><h3>{instrument.name}</h3></button><p className="artist">with {instrument.artist} <span>DEMO ARTIST</span></p><p className="character">{instrument.character}</p><div className="card-bottom"><button className={playing === instrument.id ? "preview playing" : "preview"} aria-label={`${playing === instrument.id ? "Stop" : "Preview"} ${instrument.name}`} onClick={() => void preview(instrument)}><CirclePlay size={25} /><span className="waveform" aria-hidden="true">{Array.from({ length: 24 }, (_, index) => <i key={index} style={{ height: `${5 + ((index * 17 + 7) % 23)}px`, animationDelay: `${index * 0.05}s` }} />)}</span></button><span className="price">{currency(instrument.priceCents)}<small>concept price</small></span></div></div></article>)}</div>
            {!filtered.length && <div className="empty"><Search size={28} /><h3>{tab === "My collection" ? "Your next favorite is out there." : "No sounds found."}</h3><p>{tab === "My collection" ? "Save an instrument in Discover to start your collection." : "Try another family or a broader search."}</p><button className="outline-button" onClick={() => { setTab("Discover"); setFamily("All"); setQuery(""); }}>Explore all instruments</button></div>}
          </section><div className="principles"><span><AudioLines size={18} /> Character over perfection</span><span><Headphones size={18} /> Built for curious producers</span><span><Sparkles size={18} /> Artists share in every sale</span></div>
        </> : <section className="studio"><div className="eyebrow">THE MUSICIAN-FIRST MODEL</div><h1>Good sound.<br /><em>Fair share.</em></h1><p className="studio-intro">Explore the economics of your first sample library. These are illustrative gross-revenue scenarios, not earnings promises.</p><div className="studio-grid"><div className="calculator"><h2>Royalty sandbox</h2><p>One $49 library. A transparent split.</p><label htmlFor="units">Copies sold <strong>{units}</strong></label><input id="units" type="range" min="0" max="1000" step="10" value={units} onChange={event => { setUnits(Number(event.target.value)); setEstimate(null); }} /><label htmlFor="share">Artist share <strong>{share}%</strong></label><input id="share" type="range" min="0" max="100" value={share} onChange={event => { setShare(Number(event.target.value)); setEstimate(null); }} /><button className="dark-button" disabled={calculating} onClick={() => void calculate()}>{calculating ? "Calculating…" : "Calculate split"}<ArrowUpRight size={17} /></button><div className="results" aria-live="polite">{estimate ? <><div><span>Artist receives</span><strong>{currency(estimate.artistCents)}</strong></div><div><span>Platform share</span><strong>{currency(estimate.platformCents)}</strong></div><small>{currency(estimate.grossCents)} gross · before fees, tax, refunds and production costs</small></> : <p>Adjust the sliders, then calculate your scenario.</p>}</div></div><div className="studio-story"><span className="capsule">FROM INSTRUMENT TO INCOME</span><h2>Your instrument has a story.<br />Let someone play it.</h2>{["Capture every note, with care.", "Build a small, beautifully playable library.", "License it clearly. Share the upside."].map((text, index) => <div className="story-step" key={text}><span>0{index + 1}</span><p>{text}</p></div>)}<p className="disclaimer">This prototype does not record, distribute, sell or license audio. Real artist agreements, recording sessions, plugin packaging and payments are future work.</p></div></div></section>}
        <footer className="footer"><strong>reedroom.</strong><p>Demo artists, prices and library specifications are fictional. Audio previews are synthesized tones, not instrument recordings. No purchases or licenses are issued.</p><a href="https://github.com/DrGonzo79/reedroom-instrument-marketplace-20260907" target="_blank" rel="noreferrer">View the build <ArrowUpRight size={14} /></a></footer>
      </main>
    </div>
    <dialog ref={dialog} onClose={() => setSelected(null)} className="detail-dialog">{selected && <><button className="dialog-close" aria-label="Close instrument details" onClick={() => dialog.current?.close()}><X size={20} /></button><InstrumentArt instrument={selected} /><div className="detail-content"><div className="eyebrow">ILLUSTRATIVE LIBRARY · {selected.family.toUpperCase()}</div><h2>{selected.name}</h2><p>Performed by {selected.artist} (fictional demo musician).</p><p>{selected.character}. An example of a small, expressive instrument library built around a distinctive player and instrument.</p><div className="specs"><span>{selected.samples} samples<small>proposed</small></span><span>{selected.size}<small>estimated</small></span><span>{currency(selected.priceCents)}<small>concept price</small></span></div><button className="dark-button" onClick={() => toggleSaved(selected)}>{saved.includes(selected.id) ? "Remove from collection" : "Save to collection"}<Bookmark size={16} /></button><p className="disclaimer">No downloadable audio, plugin binary or license is included. The preview synthesizes a short reference melody in your browser.</p></div></>}</dialog>
  </div>;
}
