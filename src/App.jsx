import { useState, useEffect } from "react";
import { supabase } from './supabase';

// ═══════════════════════════════════════════════════════════════════════════════
// GLOBAL STYLES
// ═══════════════════════════════════════════════════════════════════════════════

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Orbitron:wght@400;600;700;800;900&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  @keyframes radarPing    { 0%{transform:scale(0.3);opacity:0.6} 100%{transform:scale(1);opacity:0} }
  @keyframes fadeUp       { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn       { from{opacity:0} to{opacity:1} }
  @keyframes slideUp      { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes scanline     { 0%{top:-2px} 100%{top:100%} }
  @keyframes blink        { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes spin         { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes pulse        { 0%,100%{opacity:1} 50%{opacity:0.4} }
  @keyframes scrollTicker { from{transform:translateX(100%)} to{transform:translateX(-200%)} }
  @keyframes toastIn      { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pageIn       { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:rgba(56,189,248,0.2);border-radius:2px}
  ::placeholder{color:rgba(148,163,184,0.3)}
`;

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED DATA
// ═══════════════════════════════════════════════════════════════════════════════

// Auth handled by Supabase

const STATES_DATA = [
  { name:"Alabama",       abbr:"AL", schools:4,  aircraft:22,  hours:1840,  status:"nominal"  },
  { name:"Alaska",        abbr:"AK", schools:7,  aircraft:41,  hours:3210,  status:"elevated" },
  { name:"Arizona",       abbr:"AZ", schools:9,  aircraft:58,  hours:4920,  status:"nominal"  },
  { name:"Arkansas",      abbr:"AR", schools:3,  aircraft:17,  hours:1120,  status:"nominal"  },
  { name:"California",    abbr:"CA", schools:28, aircraft:184, hours:16740, status:"elevated" },
  { name:"Colorado",      abbr:"CO", schools:11, aircraft:67,  hours:5830,  status:"nominal"  },
  { name:"Connecticut",   abbr:"CT", schools:5,  aircraft:31,  hours:2640,  status:"nominal"  },
  { name:"Delaware",      abbr:"DE", schools:2,  aircraft:9,   hours:710,   status:"low"      },
  { name:"Florida",       abbr:"FL", schools:22, aircraft:148, hours:13200, status:"elevated" },
  { name:"Georgia",       abbr:"GA", schools:12, aircraft:74,  hours:6480,  status:"nominal"  },
  { name:"Hawaii",        abbr:"HI", schools:5,  aircraft:29,  hours:2910,  status:"nominal"  },
  { name:"Idaho",         abbr:"ID", schools:4,  aircraft:21,  hours:1760,  status:"nominal"  },
  { name:"Illinois",      abbr:"IL", schools:14, aircraft:89,  hours:7640,  status:"nominal"  },
  { name:"Indiana",       abbr:"IN", schools:8,  aircraft:46,  hours:3920,  status:"nominal"  },
  { name:"Iowa",          abbr:"IA", schools:6,  aircraft:34,  hours:2870,  status:"low"      },
  { name:"Kansas",        abbr:"KS", schools:7,  aircraft:43,  hours:3610,  status:"nominal"  },
  { name:"Kentucky",      abbr:"KY", schools:6,  aircraft:38,  hours:3140,  status:"nominal"  },
  { name:"Louisiana",     abbr:"LA", schools:7,  aircraft:42,  hours:3480,  status:"nominal"  },
  { name:"Maine",         abbr:"ME", schools:3,  aircraft:18,  hours:1420,  status:"low"      },
  { name:"Maryland",      abbr:"MD", schools:8,  aircraft:49,  hours:4210,  status:"nominal"  },
  { name:"Massachusetts", abbr:"MA", schools:10, aircraft:62,  hours:5340,  status:"nominal"  },
  { name:"Michigan",      abbr:"MI", schools:13, aircraft:81,  hours:6920,  status:"nominal"  },
  { name:"Minnesota",     abbr:"MN", schools:9,  aircraft:55,  hours:4680,  status:"nominal"  },
  { name:"Mississippi",   abbr:"MS", schools:4,  aircraft:23,  hours:1890,  status:"low"      },
  { name:"Missouri",      abbr:"MO", schools:10, aircraft:61,  hours:5190,  status:"nominal"  },
  { name:"Montana",       abbr:"MT", schools:5,  aircraft:32,  hours:2740,  status:"nominal"  },
  { name:"Nebraska",      abbr:"NE", schools:5,  aircraft:28,  hours:2310,  status:"nominal"  },
  { name:"Nevada",        abbr:"NV", schools:8,  aircraft:52,  hours:4870,  status:"nominal"  },
  { name:"New Hampshire", abbr:"NH", schools:3,  aircraft:16,  hours:1280,  status:"low"      },
  { name:"New Jersey",    abbr:"NJ", schools:9,  aircraft:56,  hours:4940,  status:"nominal"  },
  { name:"New Mexico",    abbr:"NM", schools:6,  aircraft:37,  hours:3120,  status:"nominal"  },
  { name:"New York",      abbr:"NY", schools:18, aircraft:112, hours:9840,  status:"elevated" },
  { name:"North Carolina",abbr:"NC", schools:13, aircraft:82,  hours:7010,  status:"nominal"  },
  { name:"North Dakota",  abbr:"ND", schools:4,  aircraft:24,  hours:1980,  status:"nominal"  },
  { name:"Ohio",          abbr:"OH", schools:14, aircraft:88,  hours:7520,  status:"nominal"  },
  { name:"Oklahoma",      abbr:"OK", schools:8,  aircraft:49,  hours:4130,  status:"nominal"  },
  { name:"Oregon",        abbr:"OR", schools:9,  aircraft:54,  hours:4610,  status:"nominal"  },
  { name:"Pennsylvania",  abbr:"PA", schools:15, aircraft:94,  hours:8040,  status:"nominal"  },
  { name:"Rhode Island",  abbr:"RI", schools:2,  aircraft:11,  hours:890,   status:"low"      },
  { name:"South Carolina",abbr:"SC", schools:7,  aircraft:43,  hours:3670,  status:"nominal"  },
  { name:"South Dakota",  abbr:"SD", schools:3,  aircraft:18,  hours:1490,  status:"nominal"  },
  { name:"Tennessee",     abbr:"TN", schools:10, aircraft:63,  hours:5380,  status:"nominal"  },
  { name:"Texas",         abbr:"TX", schools:31, aircraft:198, hours:18240, status:"elevated" },
  { name:"Utah",          abbr:"UT", schools:7,  aircraft:44,  hours:3790,  status:"nominal"  },
  { name:"Vermont",       abbr:"VT", schools:2,  aircraft:10,  hours:820,   status:"low"      },
  { name:"Virginia",      abbr:"VA", schools:11, aircraft:69,  hours:5920,  status:"nominal"  },
  { name:"Washington",    abbr:"WA", schools:13, aircraft:80,  hours:6840,  status:"nominal"  },
  { name:"West Virginia", abbr:"WV", schools:3,  aircraft:17,  hours:1360,  status:"low"      },
  { name:"Wisconsin",     abbr:"WI", schools:9,  aircraft:55,  hours:4710,  status:"nominal"  },
  { name:"Wyoming",       abbr:"WY", schools:3,  aircraft:19,  hours:1580,  status:"nominal"  },
];

const INITIAL_FLEET = [
  { id:"N182CT", model:"Cessna 172 Skyhawk",        type:"trainer",    state:"TX", school:"Lone Star Aviation",       hours:4820,  maxHours:6000,  status:"airworthy",   lastInspection:"2026-01-14", nextInspection:"2026-07-14", engine:"Lycoming O-320",     seats:4,  year:2018, cycles:3201 },
  { id:"N208CA", model:"Cessna 208 Caravan",         type:"commercial", state:"CA", school:"Bay Area Flight Center",   hours:9240,  maxHours:12000, status:"airworthy",   lastInspection:"2026-02-01", nextInspection:"2026-08-01", engine:"PT6A-114A",          seats:9,  year:2015, cycles:6104 },
  { id:"N152TX", model:"Cessna 152",                 type:"trainer",    state:"TX", school:"Lone Star Aviation",       hours:3110,  maxHours:5000,  status:"airworthy",   lastInspection:"2025-12-20", nextInspection:"2026-06-20", engine:"Lycoming O-235",     seats:2,  year:2016, cycles:2840 },
  { id:"N172FL", model:"Cessna 172 Skyhawk",         type:"trainer",    state:"FL", school:"SunCoast Aero Academy",    hours:5490,  maxHours:6000,  status:"maintenance", lastInspection:"2026-01-05", nextInspection:"2026-04-05", engine:"Lycoming O-320",     seats:4,  year:2017, cycles:3900 },
  { id:"N44PA",  model:"Piper PA-44 Seminole",       type:"multi",      state:"PA", school:"Keystone Flight School",   hours:2870,  maxHours:8000,  status:"airworthy",   lastInspection:"2026-02-10", nextInspection:"2026-08-10", engine:"Lycoming O-360",     seats:4,  year:2020, cycles:1920 },
  { id:"N28NY",  model:"Piper PA-28 Cherokee",       type:"trainer",    state:"NY", school:"Hudson Valley Aviation",   hours:4100,  maxHours:5500,  status:"airworthy",   lastInspection:"2026-01-28", nextInspection:"2026-07-28", engine:"Lycoming O-320",     seats:4,  year:2019, cycles:2980 },
  { id:"N310AZ", model:"Cessna 310",                 type:"multi",      state:"AZ", school:"Desert Sky Flight Club",   hours:6720,  maxHours:9000,  status:"grounded",    lastInspection:"2025-11-15", nextInspection:"2026-02-15", engine:"Continental IO-470", seats:6,  year:2014, cycles:4810 },
  { id:"N172CO", model:"Cessna 172SP",               type:"trainer",    state:"CO", school:"Rocky Mountain Aero",      hours:3850,  maxHours:6000,  status:"airworthy",   lastInspection:"2026-02-05", nextInspection:"2026-08-05", engine:"Lycoming IO-360",    seats:4,  year:2021, cycles:2540 },
  { id:"N400WA", model:"Diamond DA40",               type:"trainer",    state:"WA", school:"Cascade Aviation",         hours:2200,  maxHours:6000,  status:"airworthy",   lastInspection:"2026-01-20", nextInspection:"2026-07-20", engine:"Lycoming IO-360",    seats:4,  year:2022, cycles:1480 },
  { id:"N172GA", model:"Cessna 172 Skyhawk",         type:"trainer",    state:"GA", school:"Peach State Aero",         hours:4560,  maxHours:6000,  status:"airworthy",   lastInspection:"2026-02-14", nextInspection:"2026-08-14", engine:"Lycoming O-320",     seats:4,  year:2018, cycles:3100 },
  { id:"N44IL",  model:"Piper PA-44 Seminole",       type:"multi",      state:"IL", school:"Midwest Flight Center",    hours:3340,  maxHours:8000,  status:"maintenance", lastInspection:"2026-01-10", nextInspection:"2026-04-10", engine:"Lycoming O-360",     seats:4,  year:2019, cycles:2210 },
  { id:"N208FL", model:"Cessna 208B Grand Caravan",  type:"commercial", state:"FL", school:"SunCoast Aero Academy",    hours:10800, maxHours:12000, status:"airworthy",   lastInspection:"2026-02-08", nextInspection:"2026-08-08", engine:"PT6A-114A",          seats:14, year:2013, cycles:7320 },
  { id:"N172NC", model:"Cessna 172 Skyhawk",         type:"trainer",    state:"NC", school:"Carolina Sky Academy",     hours:3920,  maxHours:6000,  status:"airworthy",   lastInspection:"2026-01-30", nextInspection:"2026-07-30", engine:"Lycoming O-320",     seats:4,  year:2020, cycles:2680 },
  { id:"N28OH",  model:"Piper PA-28 Arrow",          type:"trainer",    state:"OH", school:"Buckeye Aviation",         hours:4780,  maxHours:5500,  status:"grounded",    lastInspection:"2025-10-12", nextInspection:"2026-01-12", engine:"Lycoming IO-360",    seats:4,  year:2016, cycles:3420 },
  { id:"N172MI", model:"Cessna 172 Skyhawk",         type:"trainer",    state:"MI", school:"Great Lakes Aero",         hours:2990,  maxHours:6000,  status:"airworthy",   lastInspection:"2026-02-12", nextInspection:"2026-08-12", engine:"Lycoming O-320",     seats:4,  year:2021, cycles:1990 },
  { id:"N44VA",  model:"Piper PA-44 Seminole",       type:"multi",      state:"VA", school:"Blue Ridge Flight School", hours:1840,  maxHours:8000,  status:"airworthy",   lastInspection:"2026-02-18", nextInspection:"2026-08-18", engine:"Lycoming O-360",     seats:4,  year:2023, cycles:1220 },
];

const SCHOOLS_DATA = [
  { id:1,  name:"Lone Star Aviation",       state:"TX", aircraft:6,  avgMonthlyHours:312, lastMonthHours:341, trend:+9.3,  utilization:91, waitlist:3, requestedMore:true,  rating:"high",   notes:"Consistently above 90% utilization. Requested 2 additional trainers." },
  { id:2,  name:"SunCoast Aero Academy",    state:"FL", aircraft:8,  avgMonthlyHours:298, lastMonthHours:276, trend:-7.4,  utilization:78, waitlist:0, requestedMore:false, rating:"medium", notes:"Slight dip due to weather. Still strong overall." },
  { id:3,  name:"Bay Area Flight Center",   state:"CA", aircraft:11, avgMonthlyHours:421, lastMonthHours:489, trend:+16.2, utilization:94, waitlist:7, requestedMore:true,  rating:"high",   notes:"Fastest growing school in fleet. 7 students on waitlist." },
  { id:4,  name:"Rocky Mountain Aero",      state:"CO", aircraft:5,  avgMonthlyHours:187, lastMonthHours:201, trend:+7.5,  utilization:68, waitlist:1, requestedMore:false, rating:"medium", notes:"Growing steadily. May need additional aircraft in Q3." },
  { id:5,  name:"Hudson Valley Aviation",   state:"NY", aircraft:4,  avgMonthlyHours:156, lastMonthHours:162, trend:+3.8,  utilization:71, waitlist:0, requestedMore:false, rating:"medium", notes:"Stable operation, modest growth." },
  { id:6,  name:"Desert Sky Flight Club",   state:"AZ", aircraft:7,  avgMonthlyHours:244, lastMonthHours:198, trend:-18.9, utilization:48, waitlist:0, requestedMore:false, rating:"low",    notes:"One aircraft grounded. Utilization dropped significantly." },
  { id:7,  name:"Keystone Flight School",   state:"PA", aircraft:3,  avgMonthlyHours:134, lastMonthHours:148, trend:+10.4, utilization:84, waitlist:2, requestedMore:true,  rating:"high",   notes:"Small fleet but highly utilized. Actively seeking more aircraft." },
  { id:8,  name:"Cascade Aviation",         state:"WA", aircraft:4,  avgMonthlyHours:178, lastMonthHours:183, trend:+2.8,  utilization:74, waitlist:0, requestedMore:false, rating:"medium", notes:"Consistent performer." },
  { id:9,  name:"Midwest Flight Center",    state:"IL", aircraft:6,  avgMonthlyHours:201, lastMonthHours:177, trend:-11.9, utilization:59, waitlist:0, requestedMore:false, rating:"low",    notes:"One aircraft in extended maintenance. Monitor closely." },
  { id:10, name:"Peach State Aero",         state:"GA", aircraft:5,  avgMonthlyHours:219, lastMonthHours:241, trend:+10.0, utilization:82, waitlist:1, requestedMore:false, rating:"medium", notes:"Trending up. Could be ready for expansion soon." },
  { id:11, name:"Carolina Sky Academy",     state:"NC", aircraft:5,  avgMonthlyHours:198, lastMonthHours:207, trend:+4.5,  utilization:76, waitlist:0, requestedMore:false, rating:"medium", notes:"Steady growth trajectory." },
  { id:12, name:"Blue Ridge Flight School", state:"VA", aircraft:2,  avgMonthlyHours:98,  lastMonthHours:112, trend:+14.3, utilization:88, waitlist:2, requestedMore:true,  rating:"high",   notes:"Small but very high utilization. Strong lease candidate." },
  { id:13, name:"Buckeye Aviation",         state:"OH", aircraft:4,  avgMonthlyHours:142, lastMonthHours:119, trend:-16.2, utilization:44, waitlist:0, requestedMore:false, rating:"low",    notes:"Aircraft grounded. Revenue impact significant." },
  { id:14, name:"Great Lakes Aero",         state:"MI", aircraft:4,  avgMonthlyHours:167, lastMonthHours:174, trend:+4.2,  utilization:72, waitlist:0, requestedMore:false, rating:"medium", notes:"Performing within expected range." },
];

const MONTHLY_DATA = [
  { month:"Sep", hours:2810 }, { month:"Oct", hours:3040 }, { month:"Nov", hours:2920 },
  { month:"Dec", hours:2650 }, { month:"Jan", hours:2880 }, { month:"Feb", hours:3130 },
  { month:"Mar", hours:3287 },
];

const MOCK_FAA = {
  "N12345": { model:"Cessna 172 Skyhawk",   engine:"Lycoming O-320-H2AD", seats:4, year:2019, maxHours:6000,  type:"trainer"    },
  "N98765": { model:"Piper PA-28 Cherokee", engine:"Lycoming O-320-E3D",  seats:4, year:2017, maxHours:5500,  type:"trainer"    },
  "N55555": { model:"Beechcraft Bonanza",   engine:"Continental IO-550",  seats:6, year:2021, maxHours:8000,  type:"multi"      },
  "N77777": { model:"Cessna 208 Caravan",   engine:"PT6A-114A",           seats:9, year:2016, maxHours:12000, type:"commercial" },
  "N33333": { model:"Diamond DA42",         engine:"Austro AE300",        seats:4, year:2022, maxHours:7000,  type:"multi"      },
  "N44444": { model:"Cirrus SR22",          engine:"Continental IO-550",  seats:4, year:2023, maxHours:6500,  type:"trainer"    },
};

const MOCK_OPENSKY = {
  "N12345": { currentlyFlying:false, lastSeen:"2026-03-02 14:22 UTC", totalFlights:412, recentHours:124, avgFlightTime:"0h 58m", lastDeparture:"KAUS", lastArrival:"KSAT" },
  "N98765": { currentlyFlying:true,  lastSeen:"NOW",                  totalFlights:287, recentHours:89,  avgFlightTime:"1h 12m", lastDeparture:"KJFK", lastArrival:"In Flight" },
  "N55555": { currentlyFlying:false, lastSeen:"2026-03-01 09:45 UTC", totalFlights:198, recentHours:67,  avgFlightTime:"1h 34m", lastDeparture:"KDEN", lastArrival:"KCOS" },
  "N77777": { currentlyFlying:false, lastSeen:"2026-03-03 07:10 UTC", totalFlights:631, recentHours:201, avgFlightTime:"2h 05m", lastDeparture:"KMIA", lastArrival:"KEYW" },
  "N33333": { currentlyFlying:true,  lastSeen:"NOW",                  totalFlights:156, recentHours:44,  avgFlightTime:"0h 52m", lastDeparture:"KSEA", lastArrival:"In Flight" },
  "N44444": { currentlyFlying:false, lastSeen:"2026-02-28 16:30 UTC", totalFlights:94,  recentHours:31,  avgFlightTime:"1h 08m", lastDeparture:"KBOS", lastArrival:"KORH" },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED CONFIG
// ═══════════════════════════════════════════════════════════════════════════════

const STATE_STATUS = {
  elevated: { color:"#f59e0b", label:"ELEVATED", glow:"rgba(245,158,11,0.3)"  },
  nominal:  { color:"#38BDF8", label:"NOMINAL",  glow:"rgba(56,189,248,0.2)"  },
  low:      { color:"#64748b", label:"LOW ACT.", glow:"rgba(100,116,139,0.15)"},
};

const FLEET_STATUS = {
  airworthy:   { color:"#22c55e", label:"AIRWORTHY",  glow:"rgba(34,197,94,0.25)"  },
  maintenance: { color:"#f59e0b", label:"IN MAINT.",  glow:"rgba(245,158,11,0.25)" },
  grounded:    { color:"#ef4444", label:"GROUNDED",   glow:"rgba(239,68,68,0.25)"  },
};

const FLEET_TYPE = {
  trainer:    { color:"#38BDF8", label:"TRAINER"    },
  multi:      { color:"#a78bfa", label:"MULTI-ENG"  },
  commercial: { color:"#f59e0b", label:"COMMERCIAL" },
};

const SCHOOL_RATING = {
  high:   { color:"#22c55e", label:"HIGH DEMAND",  glow:"rgba(34,197,94,0.2)",  bg:"rgba(34,197,94,0.08)"  },
  medium: { color:"#38BDF8", label:"STEADY",       glow:"rgba(56,189,248,0.2)", bg:"rgba(56,189,248,0.08)" },
  low:    { color:"#ef4444", label:"LOW ACTIVITY", glow:"rgba(239,68,68,0.2)",  bg:"rgba(239,68,68,0.08)"  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED UI COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

const Logo = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path d="M4 20C4 20 6 14 12 14C14 14 15 15 16 15C17 15 18 12 22 12C27 12 28 17 28 17" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 24L24 24" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round"/>
    <path d="M16 8L20 14H12L16 8Z" fill="#38BDF8" opacity="0.7"/>
  </svg>
);

const GridBg = () => (
  <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, backgroundImage:`linear-gradient(rgba(56,189,248,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(56,189,248,0.025) 1px,transparent 1px)`, backgroundSize:"50px 50px" }}/>
);

function Ticker({ items }) {
  const timeStr = new Date().toLocaleTimeString("en-US",{hour12:false,hour:"2-digit",minute:"2-digit",second:"2-digit"});
  return (
    <div style={{ background:"rgba(56,189,248,0.06)", borderBottom:"1px solid rgba(56,189,248,0.1)", padding:"0 24px", height:"28px", display:"flex", alignItems:"center", overflow:"hidden", position:"relative", zIndex:100 }}>
      <div style={{ fontSize:"9px", color:"#38BDF8", letterSpacing:"0.15em", flexShrink:0, marginRight:"24px", fontFamily:"'IBM Plex Mono',monospace" }}>LIVE</div>
      <div style={{ overflow:"hidden", flex:1 }}>
        <div style={{ animation:"scrollTicker 50s linear infinite", whiteSpace:"nowrap", fontSize:"9px", color:"rgba(148,163,184,0.45)", letterSpacing:"0.08em", fontFamily:"'IBM Plex Mono',monospace" }}>
          {items.join("   ·   ")}
        </div>
      </div>
      <div style={{ fontSize:"9px", color:"rgba(148,163,184,0.4)", letterSpacing:"0.1em", flexShrink:0, marginLeft:"24px", fontFamily:"'IBM Plex Mono',monospace" }}>{timeStr} UTC</div>
    </div>
  );
}

function Nav({ user, page, setPage, onLogout }) {
  const roleColor = { admin:"#38BDF8", regional:"#f59e0b", school:"#22c55e" }[user.role] || "#38BDF8";
  const pages = ["OVERVIEW","FLEET","REPORTS"];

  return (
    <nav style={{ borderBottom:"1px solid rgba(56,189,248,0.08)", padding:"0 32px", display:"flex", alignItems:"center", justifyContent:"space-between", height:"60px", background:"rgba(6,11,17,0.96)", backdropFilter:"blur(12px)", position:"sticky", top:0, zIndex:200 }}>
      <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
        <Logo/>
        <div>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"12px", fontWeight:700, color:"#38BDF8", letterSpacing:"0.15em" }}>CLOUDTECH</div>
          <div style={{ fontSize:"8px", color:"rgba(148,163,184,0.4)", letterSpacing:"0.18em", fontFamily:"'IBM Plex Mono',monospace" }}>AVIATION INTELLIGENCE</div>
        </div>
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:"4px" }}>
        {pages.map(p => (
          <button key={p} onClick={() => setPage(p)} style={{ background: page===p ? "rgba(56,189,248,0.08)" : "transparent", border: page===p ? "1px solid rgba(56,189,248,0.2)" : "1px solid transparent", borderRadius:"5px", color: page===p ? "#38BDF8" : "rgba(148,163,184,0.4)", fontSize:"10px", letterSpacing:"0.12em", cursor:"pointer", padding:"7px 16px", fontFamily:"'IBM Plex Mono',monospace", transition:"all 0.2s" }}>{p}</button>
        ))}
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
        <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#22c55e", boxShadow:"0 0 8px #22c55e", animation:"pulse 2s infinite" }}/>
        <span style={{ fontSize:"10px", color:"rgba(148,163,184,0.5)", letterSpacing:"0.1em", fontFamily:"'IBM Plex Mono',monospace" }}>{user.name}</span>
        <div style={{ fontSize:"9px", color:roleColor, background:`${roleColor}18`, border:`1px solid ${roleColor}30`, borderRadius:"3px", padding:"2px 8px", letterSpacing:"0.1em", fontFamily:"'IBM Plex Mono',monospace" }}>{user.role.toUpperCase()}</div>
        <button onClick={onLogout} style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:"4px", color:"#f87171", fontSize:"9px", cursor:"pointer", padding:"4px 10px", fontFamily:"'IBM Plex Mono',monospace", letterSpacing:"0.1em", marginLeft:"4px" }}>LOGOUT</button>
      </div>
    </nav>
  );
}

function Toast({ message }) {
  if (!message) return null;
  return (
    <div style={{ position:"fixed", bottom:"32px", right:"32px", background:"rgba(34,197,94,0.12)", border:"1px solid rgba(34,197,94,0.3)", borderRadius:"8px", padding:"14px 20px", display:"flex", alignItems:"center", gap:"10px", zIndex:2000, animation:"toastIn 0.3s ease", boxShadow:"0 8px 32px rgba(0,0,0,0.4)" }}>
      <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:"#22c55e", boxShadow:"0 0 8px #22c55e" }}/>
      <span style={{ fontSize:"11px", color:"#22c55e", letterSpacing:"0.06em", fontFamily:"'IBM Plex Mono',monospace" }}>{message}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

function LoginPage({ onLogin }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole]         = useState("admin");
  const [loading, setLoading]   = useState(false);
  const [focused, setFocused]   = useState(null);
  const [mounted, setMounted]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  const handleLogin = async () => {
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setError(""); setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      onLogin({ email, role, name: email.split("@")[0], id: data.user.id });
    } catch (err) {
      setError("Invalid email or password.");
    }
    setLoading(false);
  };

  const inp = (name) => ({
    width:"100%", boxSizing:"border-box",
    background: focused===name ? "rgba(56,189,248,0.06)" : "rgba(255,255,255,0.03)",
    border:`1px solid ${focused===name ? "rgba(56,189,248,0.5)" : "rgba(255,255,255,0.08)"}`,
    borderRadius:"6px", padding:"13px 16px", color:"#e2e8f0", fontSize:"14px",
    fontFamily:"'IBM Plex Mono',monospace", outline:"none", transition:"all 0.2s", letterSpacing:"0.02em",
  });

  return (
    <div style={{ minHeight:"100vh", background:"#080d14", display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
      <GridBg/>
      <div style={{ position:"absolute", top:"-80px", right:"-80px", width:"400px", height:"400px", opacity:0.5, pointerEvents:"none" }}>
        {[1,2,3].map(i => <div key={i} style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", borderRadius:"50%", border:"1px solid rgba(56,189,248,0.15)", animation:`radarPing ${2+i*0.7}s ease-out infinite`, animationDelay:`${i*0.5}s`, width:`${i*180}px`, height:`${i*180}px` }}/>)}
      </div>
      <div style={{ position:"absolute", bottom:"-100px", left:"-60px", width:"400px", height:"400px", background:"radial-gradient(circle, rgba(56,189,248,0.07) 0%, transparent 70%)", borderRadius:"50%", pointerEvents:"none" }}/>

      <div style={{ width:"440px", background:"rgba(10,16,26,0.95)", border:"1px solid rgba(56,189,248,0.12)", borderRadius:"12px", padding:"48px 44px", position:"relative", overflow:"hidden", opacity:mounted?1:0, transform:mounted?"translateY(0)":"translateY(20px)", transition:"opacity 0.6s ease, transform 0.6s ease", boxShadow:"0 0 60px rgba(56,189,248,0.04), 0 24px 48px rgba(0,0,0,0.5)", zIndex:1 }}>
        <div style={{ position:"absolute", left:0, right:0, height:"1px", background:"linear-gradient(90deg,transparent,rgba(56,189,248,0.15),transparent)", animation:"scanline 4s linear infinite", pointerEvents:"none" }}/>
        {[0,1,2,3].map(i => <div key={i} style={{ position:"absolute", width:"16px", height:"16px", top:i<2?"8px":"auto", bottom:i>=2?"8px":"auto", left:i%2===0?"8px":"auto", right:i%2===1?"8px":"auto", borderTop:i<2?"1px solid rgba(56,189,248,0.4)":"none", borderBottom:i>=2?"1px solid rgba(56,189,248,0.4)":"none", borderLeft:i%2===0?"1px solid rgba(56,189,248,0.4)":"none", borderRight:i%2===1?"1px solid rgba(56,189,248,0.4)":"none" }}/>)}

        <div style={{ marginBottom:"36px", animation:"fadeUp 0.5s ease both", animationDelay:"0.1s" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"20px" }}>
            <Logo size={32}/>
            <div>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"13px", fontWeight:700, color:"#38BDF8", letterSpacing:"0.15em" }}>CLOUDTECH</div>
              <div style={{ fontSize:"9px", color:"rgba(148,163,184,0.5)", letterSpacing:"0.2em", marginTop:"1px", fontFamily:"'IBM Plex Mono',monospace" }}>AVIATION INTELLIGENCE</div>
            </div>
          </div>
          <div style={{ borderTop:"1px solid rgba(56,189,248,0.08)", paddingTop:"20px" }}>
            <h1 style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"20px", fontWeight:700, color:"#e2e8f0", margin:0, letterSpacing:"0.05em" }}>SYSTEM ACCESS</h1>
            <p style={{ fontSize:"11px", color:"rgba(148,163,184,0.5)", margin:"6px 0 0", letterSpacing:"0.08em", fontFamily:"'IBM Plex Mono',monospace" }}>
              <span style={{ color:"#38BDF8", animation:"blink 1.2s step-end infinite" }}>▋</span> AUTHENTICATE TO CONTINUE
            </p>
          </div>
        </div>

        <div style={{ marginBottom:"20px", animation:"fadeUp 0.5s ease both", animationDelay:"0.2s" }}>
          <label style={{ display:"block", fontSize:"10px", color:"rgba(148,163,184,0.5)", letterSpacing:"0.15em", marginBottom:"8px", fontFamily:"'IBM Plex Mono',monospace" }}>ACCESS LEVEL</label>
          <div style={{ display:"flex", gap:"8px" }}>
            {["admin","regional","school"].map(r => (
              <button key={r} onClick={()=>setRole(r)} style={{ flex:1, padding:"9px 4px", background:role===r?"rgba(56,189,248,0.12)":"rgba(255,255,255,0.02)", border:`1px solid ${role===r?"rgba(56,189,248,0.5)":"rgba(255,255,255,0.06)"}`, borderRadius:"5px", color:role===r?"#38BDF8":"rgba(148,163,184,0.4)", fontSize:"9px", letterSpacing:"0.1em", cursor:"pointer", fontFamily:"'IBM Plex Mono',monospace", transition:"all 0.2s", textTransform:"uppercase", fontWeight:role===r?600:400 }}>
                {r==="admin"?"Admin":r==="regional"?"Regional":"School"}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom:"16px", animation:"fadeUp 0.5s ease both", animationDelay:"0.3s" }}>
          <label style={{ display:"block", fontSize:"10px", color:"rgba(148,163,184,0.5)", letterSpacing:"0.15em", marginBottom:"8px", fontFamily:"'IBM Plex Mono',monospace" }}>IDENTIFIER</label>
          <input type="email" placeholder="operator@cloudtech.aero" value={email} onChange={e=>setEmail(e.target.value)} onFocus={()=>setFocused("email")} onBlur={()=>setFocused(null)} style={inp("email")}/>
        </div>

        <div style={{ marginBottom:"16px", animation:"fadeUp 0.5s ease both", animationDelay:"0.35s" }}>
          <label style={{ display:"block", fontSize:"10px", color:"rgba(148,163,184,0.5)", letterSpacing:"0.15em", marginBottom:"8px", fontFamily:"'IBM Plex Mono',monospace" }}>AUTH KEY</label>
          <div style={{ position:"relative" }}>
            <input type={showPass?"text":"password"} placeholder="••••••••••••" value={password} onChange={e=>setPassword(e.target.value)} onFocus={()=>setFocused("password")} onBlur={()=>setFocused(null)} style={{...inp("password"),paddingRight:"44px"}}/>
            <button onClick={()=>setShowPass(!showPass)} style={{ position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"rgba(148,163,184,0.4)", fontSize:"11px", padding:"4px", fontFamily:"'IBM Plex Mono',monospace", letterSpacing:"0.05em" }}>{showPass?"HIDE":"SHOW"}</button>
          </div>
        </div>

        <div style={{ marginBottom:"16px", padding:"10px 14px", background:"rgba(56,189,248,0.04)", border:"1px solid rgba(56,189,248,0.1)", borderRadius:"5px", fontSize:"10px", color:"rgba(148,163,184,0.4)", letterSpacing:"0.04em", lineHeight:1.7, fontFamily:"'IBM Plex Mono',monospace" }}>
          DEMO: any email + password, or try<br/>
          <span style={{ color:"rgba(56,189,248,0.7)" }}>admin@cloudtech.aero</span> / <span style={{ color:"rgba(56,189,248,0.7)" }}>admin123</span>
        </div>

        {error && <div style={{ marginBottom:"16px", padding:"10px 14px", background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:"5px", fontSize:"11px", color:"#f87171", letterSpacing:"0.05em", fontFamily:"'IBM Plex Mono',monospace" }}>{error}</div>}

        <button onClick={handleLogin} style={{ width:"100%", padding:"14px", background:loading?"rgba(56,189,248,0.05)":"rgba(56,189,248,0.1)", border:"1px solid rgba(56,189,248,0.35)", borderRadius:"6px", color:loading?"rgba(56,189,248,0.5)":"#38BDF8", fontSize:"12px", letterSpacing:"0.2em", fontWeight:600, cursor:loading?"default":"pointer", fontFamily:"'Orbitron',sans-serif", transition:"all 0.2s", display:"flex", alignItems:"center", justifyContent:"center", gap:"10px", animation:"fadeUp 0.5s ease both", animationDelay:"0.4s" }}>
          {loading ? <><div style={{ width:"14px", height:"14px", border:"1px solid rgba(56,189,248,0.3)", borderTopColor:"#38BDF8", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/> AUTHENTICATING</> : "INITIATE ACCESS →"}
        </button>

        <div style={{ marginTop:"24px", display:"flex", justifyContent:"space-between" }}>
          <button style={{ background:"none", border:"none", color:"rgba(148,163,184,0.35)", fontSize:"10px", cursor:"pointer", fontFamily:"'IBM Plex Mono',monospace", letterSpacing:"0.08em", padding:0 }}>RESET AUTH KEY</button>
          <span style={{ fontSize:"10px", color:"rgba(148,163,184,0.2)", letterSpacing:"0.05em", fontFamily:"'IBM Plex Mono',monospace" }}>v2.4.1 // SECURE</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// OVERVIEW PAGE
// ═══════════════════════════════════════════════════════════════════════════════

function StatCounter({ label, value, delay, color }) {
  const [disp, setDisp] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      let n = 0; const step = Math.ceil(value/60);
      const iv = setInterval(() => { n = Math.min(n+step,value); setDisp(n); if(n>=value) clearInterval(iv); }, 16);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return (
    <div style={{ background:"rgba(10,16,26,0.8)", border:`1px solid rgba(56,189,248,0.1)`, borderTop:`2px solid ${color}`, borderRadius:"8px", padding:"20px 24px", flex:1, position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:"60px", background:`linear-gradient(180deg,${color}08,transparent)` }}/>
      <div style={{ fontSize:"10px", color:"rgba(148,163,184,0.5)", letterSpacing:"0.18em", marginBottom:"10px", fontFamily:"'IBM Plex Mono',monospace" }}>{label}</div>
      <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"28px", fontWeight:700, color }}>{disp.toLocaleString()}</div>
    </div>
  );
}

function StateCard({ state, onClick, index }) {
  const [hovered, setHovered] = useState(false);
  const cfg = STATE_STATUS[state.status];
  const pct = Math.round((state.hours/18240)*100);
  return (
    <div onClick={()=>onClick(state)} onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
      style={{ background:hovered?"rgba(16,24,38,0.98)":"rgba(10,16,26,0.85)", border:`1px solid ${hovered?cfg.color+"60":"rgba(56,189,248,0.08)"}`, borderRadius:"8px", padding:"18px 20px", cursor:"pointer", position:"relative", overflow:"hidden", transition:"all 0.25s ease", transform:hovered?"translateY(-2px)":"translateY(0)", boxShadow:hovered?`0 8px 32px ${cfg.glow}, 0 0 0 1px ${cfg.color}20`:"none", animation:"fadeUp 0.4s ease both", animationDelay:`${index*0.025}s` }}>
      <div style={{ position:"absolute", right:"-4px", bottom:"-8px", fontFamily:"'Orbitron',sans-serif", fontSize:"48px", fontWeight:900, color:hovered?cfg.color+"18":"rgba(56,189,248,0.06)", lineHeight:1, userSelect:"none", pointerEvents:"none", transition:"color 0.25s" }}>{state.abbr}</div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"14px" }}>
        <div>
          <div style={{ fontSize:"11px", fontWeight:600, color:"#e2e8f0", letterSpacing:"0.08em", marginBottom:"4px", fontFamily:"'IBM Plex Mono',monospace" }}>{state.name.toUpperCase()}</div>
          <div style={{ display:"flex", alignItems:"center", gap:"5px" }}>
            <div style={{ width:"5px", height:"5px", borderRadius:"50%", background:cfg.color, boxShadow:`0 0 6px ${cfg.color}` }}/>
            <span style={{ fontSize:"9px", color:cfg.color, letterSpacing:"0.12em", fontFamily:"'IBM Plex Mono',monospace" }}>{cfg.label}</span>
          </div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"13px", fontWeight:700, color:hovered?cfg.color:"#94a3b8" }}>{state.hours.toLocaleString()}</div>
          <div style={{ fontSize:"9px", color:"rgba(148,163,184,0.35)", letterSpacing:"0.1em", fontFamily:"'IBM Plex Mono',monospace" }}>HRS FLOWN</div>
        </div>
      </div>
      <div style={{ height:"2px", background:"rgba(255,255,255,0.04)", borderRadius:"2px", marginBottom:"12px", overflow:"hidden" }}>
        <div style={{ height:"100%", width:hovered?`${pct}%`:"0%", background:`linear-gradient(90deg,${cfg.color}80,${cfg.color})`, borderRadius:"2px", transition:"width 0.6s ease" }}/>
      </div>
      <div style={{ display:"flex", gap:"16px" }}>
        {[["✈",state.aircraft,"ACFT"],["🏫",state.schools,"SCHLS"]].map(([icon,val,lbl]) => (
          <div key={lbl} style={{ display:"flex", alignItems:"center", gap:"6px" }}>
            <span style={{ fontSize:"10px" }}>{icon}</span>
            <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"11px", fontWeight:600, color:"#94a3b8" }}>{val}</span>
            <span style={{ fontSize:"9px", color:"rgba(148,163,184,0.3)", letterSpacing:"0.1em", fontFamily:"'IBM Plex Mono',monospace" }}>{lbl}</span>
          </div>
        ))}
        <div style={{ marginLeft:"auto", fontSize:"9px", color:"rgba(148,163,184,0.25)", fontFamily:"'IBM Plex Mono',monospace" }}>VIEW →</div>
      </div>
    </div>
  );
}

function StateModal({ state, onClose }) {
  useEffect(() => { const h=(e)=>e.key==="Escape"&&onClose(); window.addEventListener("keydown",h); return ()=>window.removeEventListener("keydown",h); },[onClose]);
  if (!state) return null;
  const cfg = STATE_STATUS[state.status];
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, animation:"fadeIn 0.2s ease" }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:"480px", background:"#080d14", border:`1px solid ${cfg.color}40`, borderRadius:"12px", padding:"36px", position:"relative", animation:"slideUp 0.25s ease", boxShadow:`0 0 60px ${cfg.glow}` }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:`linear-gradient(90deg,transparent,${cfg.color},transparent)` }}/>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"28px" }}>
          <div>
            <div style={{ fontSize:"9px", color:"rgba(148,163,184,0.4)", letterSpacing:"0.2em", marginBottom:"6px", fontFamily:"'IBM Plex Mono',monospace" }}>REGIONAL DETAIL // {state.abbr}</div>
            <h2 style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"22px", fontWeight:800, color:"#e2e8f0", margin:0 }}>{state.name.toUpperCase()}</h2>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"6px", color:"#64748b", fontSize:"12px", cursor:"pointer", padding:"6px 12px", fontFamily:"'IBM Plex Mono',monospace" }}>ESC</button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"12px", marginBottom:"24px" }}>
          {[{l:"FLIGHT HRS",v:state.hours.toLocaleString(),c:cfg.color},{l:"AIRCRAFT",v:state.aircraft,c:"#e2e8f0"},{l:"SCHOOLS",v:state.schools,c:"#e2e8f0"}].map(item => (
            <div key={item.l} style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"8px", padding:"16px", textAlign:"center" }}>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"20px", fontWeight:700, color:item.c, marginBottom:"6px" }}>{item.v}</div>
              <div style={{ fontSize:"9px", color:"rgba(148,163,184,0.4)", letterSpacing:"0.15em", fontFamily:"'IBM Plex Mono',monospace" }}>{item.l}</div>
            </div>
          ))}
        </div>
        <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)", borderRadius:"8px", padding:"16px" }}>
          <div style={{ fontSize:"10px", color:"rgba(148,163,184,0.4)", letterSpacing:"0.15em", marginBottom:"10px", fontFamily:"'IBM Plex Mono',monospace" }}>UTILIZATION INDEX</div>
          <div style={{ height:"6px", background:"rgba(255,255,255,0.04)", borderRadius:"3px", overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${Math.round((state.hours/18240)*100)}%`, background:`linear-gradient(90deg,${cfg.color}60,${cfg.color})`, borderRadius:"3px" }}/>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:"6px" }}>
            <span style={{ fontSize:"9px", color:"rgba(148,163,184,0.3)", fontFamily:"'IBM Plex Mono',monospace" }}>0 HRS</span>
            <span style={{ fontSize:"9px", color:cfg.color, fontFamily:"'IBM Plex Mono',monospace" }}>{Math.round((state.hours/18240)*100)}% CAPACITY</span>
            <span style={{ fontSize:"9px", color:"rgba(148,163,184,0.3)", fontFamily:"'IBM Plex Mono',monospace" }}>18,240 HRS</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function OverviewPage() {
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState("all");
  const [selected, setSelected] = useState(null);
  const totalHours    = STATES_DATA.reduce((a,s)=>a+s.hours,0);
  const totalAircraft = STATES_DATA.reduce((a,s)=>a+s.aircraft,0);
  const totalSchools  = STATES_DATA.reduce((a,s)=>a+s.schools,0);
  const filtered = STATES_DATA.filter(s => {
    const ms = s.name.toLowerCase().includes(search.toLowerCase()) || s.abbr.toLowerCase().includes(search.toLowerCase());
    const mf = filter==="all" || s.status===filter;
    return ms && mf;
  });
  return (
    <div style={{ maxWidth:"1400px", margin:"0 auto", padding:"40px 32px", position:"relative", zIndex:1, animation:"pageIn 0.4s ease" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:"32px" }}>
        <div>
          <div style={{ fontSize:"10px", color:"rgba(148,163,184,0.4)", letterSpacing:"0.2em", marginBottom:"8px", fontFamily:"'IBM Plex Mono',monospace" }}>// COMMAND CENTER</div>
          <h1 style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"32px", fontWeight:900, margin:0, color:"#e2e8f0", letterSpacing:"0.04em", lineHeight:1 }}>REGIONAL<br/><span style={{ color:"#38BDF8" }}>OPERATIONS</span></h1>
          <p style={{ fontSize:"11px", color:"rgba(148,163,184,0.4)", marginTop:"10px", letterSpacing:"0.06em", fontFamily:"'IBM Plex Mono',monospace" }}>Select a region to view flight school activity and fleet status</p>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:"9px", color:"rgba(148,163,184,0.3)", letterSpacing:"0.15em", marginBottom:"4px", fontFamily:"'IBM Plex Mono',monospace" }}>SYSTEM STATUS</div>
          <div style={{ display:"flex", alignItems:"center", gap:"8px", justifyContent:"flex-end" }}>
            <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#22c55e", boxShadow:"0 0 8px #22c55e" }}/>
            <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"11px", color:"#22c55e", letterSpacing:"0.1em" }}>ALL SYSTEMS GO</span>
          </div>
        </div>
      </div>
      <div style={{ display:"flex", gap:"16px", marginBottom:"32px" }}>
        <StatCounter label="TOTAL FLIGHT HOURS" value={totalHours}    delay={200} color="#38BDF8"/>
        <StatCounter label="ACTIVE AIRCRAFT"    value={totalAircraft} delay={300} color="#f59e0b"/>
        <StatCounter label="FLIGHT SCHOOLS"     value={totalSchools}  delay={400} color="#22c55e"/>
        <StatCounter label="STATES COVERED"     value={50}            delay={500} color="#a78bfa"/>
      </div>
      <div style={{ display:"flex", gap:"12px", marginBottom:"28px", alignItems:"center", flexWrap:"wrap" }}>
        <input placeholder="Search region or state code..." value={search} onChange={e=>setSearch(e.target.value)} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(56,189,248,0.12)", borderRadius:"6px", padding:"10px 16px", color:"#e2e8f0", fontSize:"12px", fontFamily:"'IBM Plex Mono',monospace", outline:"none", width:"280px", letterSpacing:"0.04em" }}/>
        <div style={{ display:"flex", gap:"6px" }}>
          {[["all","ALL REGIONS","#38BDF8"],["elevated","ELEVATED","#f59e0b"],["nominal","NOMINAL","#38BDF8"],["low","LOW ACTIVITY","#64748b"]].map(([val,label,color]) => (
            <button key={val} onClick={()=>setFilter(val)} style={{ background:filter===val?`${color}15`:"rgba(255,255,255,0.02)", border:`1px solid ${filter===val?color+"50":"rgba(255,255,255,0.06)"}`, borderRadius:"5px", color:filter===val?color:"rgba(148,163,184,0.35)", fontSize:"9px", letterSpacing:"0.12em", cursor:"pointer", padding:"8px 14px", fontFamily:"'IBM Plex Mono',monospace", transition:"all 0.2s" }}>{label}</button>
          ))}
        </div>
        <div style={{ marginLeft:"auto", fontSize:"10px", color:"rgba(148,163,184,0.3)", letterSpacing:"0.08em", fontFamily:"'IBM Plex Mono',monospace" }}>{filtered.length} REGIONS</div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:"12px" }}>
        {filtered.map((s,i) => <StateCard key={s.abbr} state={s} onClick={setSelected} index={i}/>)}
      </div>
      {filtered.length===0 && <div style={{ textAlign:"center", padding:"80px 0", color:"rgba(148,163,184,0.25)", fontSize:"12px", letterSpacing:"0.1em", fontFamily:"'IBM Plex Mono',monospace" }}>NO REGIONS MATCH YOUR FILTER</div>}
      {selected && <StateModal state={selected} onClose={()=>setSelected(null)}/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FLEET PAGE
// ═══════════════════════════════════════════════════════════════════════════════

function AddAircraftModal({ onClose, onAdd }) {
  const [tailInput, setTailInput]     = useState("");
  const [step, setStep]               = useState("idle");
  const [faaData, setFaaData]         = useState(null);
  const [openskyData, setOpenskyData] = useState(null);
  const [school, setSchool]           = useState("");
  const [stateVal, setStateVal]       = useState("");
  const [error, setError]             = useState("");
  const [focused, setFocused]         = useState(null);
  const [fleet, setFleet]             = useState(INITIAL_FLEET);

  useEffect(() => { const h=(e)=>e.key==="Escape"&&onClose(); window.addEventListener("keydown",h); return ()=>window.removeEventListener("keydown",h); },[onClose]);

  const handleLookup = () => {
    const tail = tailInput.trim().toUpperCase();
    if (!tail) { setError("Enter a tail number first."); return; }
    setError(""); setStep("faa_loading");
    setTimeout(() => {
      const faa = MOCK_FAA[tail] || { model:`Unknown (${tail})`, engine:"Unknown", seats:4, year:2020, maxHours:6000, type:"trainer" };
      setFaaData(faa); setStep("faa_done");
      setTimeout(() => {
        setStep("opensky_loading");
        setTimeout(() => {
          const osky = MOCK_OPENSKY[tail] || { currentlyFlying:false, lastSeen:"No data", totalFlights:0, recentHours:0, avgFlightTime:"N/A", lastDeparture:"—", lastArrival:"—" };
          setOpenskyData(osky); setStep("opensky_done");
          setTimeout(() => setStep("complete"), 400);
        }, 1200);
      }, 600);
    }, 1400);
  };

  const handleAdd = () => {
    if (!school || !stateVal) { setError("Please fill in school and state."); return; }
    const tail = tailInput.trim().toUpperCase();
    onAdd({ id:tail, model:faaData.model, type:faaData.type, state:stateVal, school, hours:openskyData.recentHours, maxHours:faaData.maxHours, status:"airworthy", lastInspection:new Date().toISOString().split("T")[0], nextInspection:new Date(Date.now()+180*24*60*60*1000).toISOString().split("T")[0], engine:faaData.engine, seats:faaData.seats, year:faaData.year, cycles:openskyData.totalFlights });
    onClose();
  };

  const inp = (name) => ({ width:"100%", boxSizing:"border-box", background:focused===name?"rgba(56,189,248,0.06)":"rgba(255,255,255,0.03)", border:`1px solid ${focused===name?"rgba(56,189,248,0.5)":"rgba(255,255,255,0.08)"}`, borderRadius:"6px", padding:"11px 14px", color:"#e2e8f0", fontSize:"13px", fontFamily:"'IBM Plex Mono',monospace", outline:"none", transition:"all 0.2s", letterSpacing:"0.04em" });
  const isLoading = step==="faa_loading"||step==="opensky_loading";

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, animation:"fadeIn 0.2s ease" }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:"540px", maxHeight:"88vh", overflowY:"auto", background:"#080d14", border:"1px solid rgba(56,189,248,0.2)", borderRadius:"12px", padding:"36px", position:"relative", animation:"slideUp 0.25s ease", boxShadow:"0 0 80px rgba(56,189,248,0.08)" }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:"linear-gradient(90deg,transparent,#38BDF8,transparent)" }}/>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"28px" }}>
          <div>
            <div style={{ fontSize:"9px", color:"rgba(148,163,184,0.4)", letterSpacing:"0.2em", marginBottom:"6px", fontFamily:"'IBM Plex Mono',monospace" }}>// ADD NEW AIRCRAFT</div>
            <h2 style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"20px", fontWeight:800, color:"#e2e8f0", margin:0 }}>REGISTER AIRCRAFT</h2>
            <p style={{ fontSize:"10px", color:"rgba(148,163,184,0.4)", margin:"6px 0 0", fontFamily:"'IBM Plex Mono',monospace" }}>Auto-fetch from FAA Registry + OpenSky Network</p>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"6px", color:"#64748b", fontSize:"12px", cursor:"pointer", padding:"6px 12px", fontFamily:"'IBM Plex Mono',monospace" }}>ESC</button>
        </div>

        <div style={{ marginBottom:"8px" }}>
          <label style={{ display:"block", fontSize:"10px", color:"rgba(148,163,184,0.5)", letterSpacing:"0.15em", marginBottom:"8px", fontFamily:"'IBM Plex Mono',monospace" }}>TAIL NUMBER</label>
          <div style={{ display:"flex", gap:"10px" }}>
            <input placeholder="e.g. N12345" value={tailInput} onChange={e=>{setTailInput(e.target.value.toUpperCase());setStep("idle");setFaaData(null);setOpenskyData(null);}} onFocus={()=>setFocused("tail")} onBlur={()=>setFocused(null)} style={{...inp("tail"),flex:1}} disabled={isLoading}/>
            <button onClick={handleLookup} disabled={isLoading||!tailInput} style={{ padding:"11px 20px", background:isLoading?"rgba(56,189,248,0.04)":"rgba(56,189,248,0.12)", border:"1px solid rgba(56,189,248,0.3)", borderRadius:"6px", color:isLoading?"rgba(56,189,248,0.4)":"#38BDF8", fontSize:"10px", letterSpacing:"0.15em", cursor:isLoading?"default":"pointer", fontFamily:"'Orbitron',sans-serif", display:"flex", alignItems:"center", gap:"8px" }}>
              {isLoading?<><div style={{ width:"12px", height:"12px", border:"1px solid rgba(56,189,248,0.3)", borderTopColor:"#38BDF8", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/> FETCHING</>:"LOOKUP →"}
            </button>
          </div>
          <div style={{ fontSize:"9px", color:"rgba(148,163,184,0.3)", marginTop:"6px", fontFamily:"'IBM Plex Mono',monospace" }}>Try: N12345 · N98765 · N55555 · N77777 · N33333 · N44444</div>
        </div>

        {error && <div style={{ margin:"12px 0", padding:"10px 14px", background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:"5px", fontSize:"11px", color:"#f87171", fontFamily:"'IBM Plex Mono',monospace" }}>{error}</div>}

        {step!=="idle" && (
          <div style={{ margin:"16px 0", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)", borderRadius:"8px", padding:"16px" }}>
            <div style={{ fontSize:"9px", color:"rgba(148,163,184,0.4)", letterSpacing:"0.18em", marginBottom:"12px", fontFamily:"'IBM Plex Mono',monospace" }}>DATA SOURCES</div>
            {[
              { key:"faa", num:1, label:"FAA Aircraft Registry", done:["faa_done","opensky_loading","opensky_done","complete"].includes(step), loading:step==="faa_loading", detail: faaData?`Found: ${faaData.model}`:"Querying registry..." },
              { key:"osky", num:2, label:"OpenSky Network", done:["opensky_done","complete"].includes(step), loading:step==="opensky_loading", detail: openskyData?`${openskyData.totalFlights} flights · ${openskyData.recentHours} hrs`:"Waiting..." },
            ].map(item => (
              <div key={item.key} style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"10px" }}>
                <div style={{ width:"20px", height:"20px", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, background:item.loading?"rgba(56,189,248,0.1)":item.done?"rgba(34,197,94,0.15)":"rgba(255,255,255,0.04)", border:`1px solid ${item.loading?"#38BDF8":item.done?"#22c55e":"rgba(255,255,255,0.08)"}` }}>
                  {item.loading?<div style={{ width:"8px", height:"8px", border:"1px solid rgba(56,189,248,0.3)", borderTopColor:"#38BDF8", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>:item.done?<span style={{ fontSize:"9px", color:"#22c55e" }}>✓</span>:<span style={{ fontSize:"8px", color:"rgba(148,163,184,0.3)" }}>{item.num}</span>}
                </div>
                <div>
                  <div style={{ fontSize:"11px", color:item.loading?"#38BDF8":item.done?"#22c55e":"rgba(148,163,184,0.4)", fontFamily:"'IBM Plex Mono',monospace" }}>{item.label}</div>
                  <div style={{ fontSize:"9px", color:"rgba(148,163,184,0.3)", marginTop:"2px", fontFamily:"'IBM Plex Mono',monospace" }}>{item.loading?"Loading...":item.done?item.detail:"Pending"}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {step==="complete" && faaData && openskyData && (
          <div style={{ animation:"fadeUp 0.3s ease both" }}>
            {[{title:"FAA REGISTRY DATA", color:"#22c55e", data:[["MODEL",faaData.model],["ENGINE",faaData.engine],["YEAR",faaData.year],["SEATS",faaData.seats],["TYPE",FLEET_TYPE[faaData.type]?.label],["MAX HRS",faaData.maxHours]]},
              {title:"OPENSKY NETWORK DATA", color:"#38BDF8", extra:openskyData.currentlyFlying, data:[["TOTAL FLIGHTS",openskyData.totalFlights],["RECENT HRS",openskyData.recentHours],["AVG FLIGHT",openskyData.avgFlightTime],["LAST SEEN",openskyData.lastSeen],["LAST DEP.",openskyData.lastDeparture],["LAST ARR.",openskyData.lastArrival]]}
            ].map(card => (
              <div key={card.title} style={{ background:`${card.color}04`, border:`1px solid ${card.color}20`, borderRadius:"8px", padding:"16px", marginBottom:"12px" }}>
                <div style={{ fontSize:"9px", color:card.color, letterSpacing:"0.18em", marginBottom:"12px", display:"flex", alignItems:"center", gap:"6px", fontFamily:"'IBM Plex Mono',monospace" }}>
                  ✓ {card.title}
                  {card.extra && <span style={{ marginLeft:"auto", background:"rgba(34,197,94,0.15)", border:"1px solid rgba(34,197,94,0.3)", borderRadius:"3px", padding:"2px 8px", color:"#22c55e", fontSize:"8px", animation:"pulse 1.5s infinite" }}>● IN FLIGHT NOW</span>}
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"10px" }}>
                  {card.data.map(([l,v]) => (
                    <div key={l}><div style={{ fontSize:"8px", color:"rgba(148,163,184,0.35)", letterSpacing:"0.15em", marginBottom:"3px", fontFamily:"'IBM Plex Mono',monospace" }}>{l}</div><div style={{ fontSize:"11px", color:"#cbd5e1", fontFamily:"'IBM Plex Mono',monospace" }}>{v}</div></div>
                  ))}
                </div>
              </div>
            ))}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"16px" }}>
              {[["ASSIGN TO SCHOOL","school","e.g. Lone Star Aviation",school,setSchool,false],["BASE STATE","state","e.g. TX",stateVal,setStateVal,true]].map(([label,name,ph,val,setter,upper]) => (
                <div key={name}>
                  <label style={{ display:"block", fontSize:"10px", color:"rgba(148,163,184,0.5)", letterSpacing:"0.15em", marginBottom:"8px", fontFamily:"'IBM Plex Mono',monospace" }}>{label}</label>
                  <input placeholder={ph} value={val} maxLength={upper?2:undefined} onChange={e=>setter(upper?e.target.value.toUpperCase():e.target.value)} onFocus={()=>setFocused(name)} onBlur={()=>setFocused(null)} style={inp(name)}/>
                </div>
              ))}
            </div>
            <button onClick={handleAdd} style={{ width:"100%", padding:"14px", background:"rgba(34,197,94,0.12)", border:"1px solid rgba(34,197,94,0.35)", borderRadius:"6px", color:"#22c55e", fontSize:"12px", letterSpacing:"0.18em", fontWeight:600, cursor:"pointer", fontFamily:"'Orbitron',sans-serif" }}>ADD TO FLEET REGISTRY →</button>
          </div>
        )}
      </div>
    </div>
  );
}

function FleetRow({ aircraft, index, onClick }) {
  const [hovered, setHovered] = useState(false);
  const st=FLEET_STATUS[aircraft.status], ty=FLEET_TYPE[aircraft.type];
  const pct=Math.round((aircraft.hours/aircraft.maxHours)*100);
  return (
    <div onClick={()=>onClick(aircraft)} onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
      style={{ display:"grid", gridTemplateColumns:"120px 1fr 110px 160px 100px 80px 40px", alignItems:"center", gap:"16px", padding:"14px 20px", background:hovered?"rgba(16,24,38,0.95)":"rgba(10,16,26,0.6)", border:`1px solid ${hovered?st.color+"40":"rgba(56,189,248,0.06)"}`, borderRadius:"8px", cursor:"pointer", transition:"all 0.2s", transform:hovered?"translateX(4px)":"translateX(0)", boxShadow:hovered?`0 4px 24px ${st.glow}`:"none", animation:"fadeUp 0.4s ease both", animationDelay:`${index*0.035}s` }}>
      <div>
        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"13px", fontWeight:700, color:hovered?st.color:"#e2e8f0", letterSpacing:"0.05em", transition:"color 0.2s" }}>{aircraft.id}</div>
        <div style={{ fontSize:"9px", color:ty.color, letterSpacing:"0.1em", marginTop:"3px", background:`${ty.color}12`, display:"inline-block", padding:"2px 6px", borderRadius:"3px", fontFamily:"'IBM Plex Mono',monospace" }}>{ty.label}</div>
      </div>
      <div>
        <div style={{ fontSize:"12px", color:"#cbd5e1", letterSpacing:"0.03em", marginBottom:"3px", fontFamily:"'IBM Plex Mono',monospace" }}>{aircraft.model}</div>
        <div style={{ fontSize:"10px", color:"rgba(148,163,184,0.4)", fontFamily:"'IBM Plex Mono',monospace" }}>{aircraft.school} · {aircraft.state}</div>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
        <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:st.color, boxShadow:`0 0 6px ${st.color}`, flexShrink:0 }}/>
        <span style={{ fontSize:"9px", color:st.color, letterSpacing:"0.1em", fontFamily:"'IBM Plex Mono',monospace" }}>{st.label}</span>
      </div>
      <div>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"5px" }}>
          <span style={{ fontSize:"10px", color:"rgba(148,163,184,0.5)", fontFamily:"'IBM Plex Mono',monospace" }}>{aircraft.hours.toLocaleString()} hrs</span>
          <span style={{ fontSize:"9px", color:pct>85?"#ef4444":pct>65?"#f59e0b":"rgba(148,163,184,0.35)", fontFamily:"'IBM Plex Mono',monospace" }}>{pct}%</span>
        </div>
        <div style={{ height:"3px", background:"rgba(255,255,255,0.04)", borderRadius:"2px", overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${pct}%`, background:pct>85?"linear-gradient(90deg,#ef444460,#ef4444)":pct>65?"linear-gradient(90deg,#f59e0b60,#f59e0b)":`linear-gradient(90deg,${st.color}60,${st.color})`, borderRadius:"2px" }}/>
        </div>
        <div style={{ fontSize:"9px", color:"rgba(148,163,184,0.3)", marginTop:"4px", fontFamily:"'IBM Plex Mono',monospace" }}>{(aircraft.maxHours-aircraft.hours).toLocaleString()} hrs left</div>
      </div>
      <div><div style={{ fontSize:"10px", color:"rgba(148,163,184,0.5)", fontFamily:"'IBM Plex Mono',monospace" }}>{aircraft.nextInspection}</div><div style={{ fontSize:"9px", color:"rgba(148,163,184,0.3)", marginTop:"2px", fontFamily:"'IBM Plex Mono',monospace" }}>Next insp.</div></div>
      <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"12px", color:"rgba(148,163,184,0.4)", textAlign:"center" }}>{aircraft.year}</div>
      <div style={{ textAlign:"right", fontSize:"12px", color:hovered?st.color:"rgba(148,163,184,0.2)", transition:"color 0.2s" }}>→</div>
    </div>
  );
}

function FleetDetailModal({ aircraft, onClose }) {
  useEffect(() => { const h=(e)=>e.key==="Escape"&&onClose(); window.addEventListener("keydown",h); return ()=>window.removeEventListener("keydown",h); },[onClose]);
  if (!aircraft) return null;
  const st=FLEET_STATUS[aircraft.status], ty=FLEET_TYPE[aircraft.type];
  const pct=Math.round((aircraft.hours/aircraft.maxHours)*100);
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, animation:"fadeIn 0.2s ease" }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:"540px", maxHeight:"85vh", overflowY:"auto", background:"#080d14", border:`1px solid ${st.color}40`, borderRadius:"12px", padding:"36px", position:"relative", animation:"slideUp 0.25s ease", boxShadow:`0 0 80px ${st.glow}` }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:`linear-gradient(90deg,transparent,${st.color},transparent)` }}/>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"24px" }}>
          <div>
            <div style={{ fontSize:"9px", color:"rgba(148,163,184,0.4)", letterSpacing:"0.2em", marginBottom:"4px", fontFamily:"'IBM Plex Mono',monospace" }}>AIRCRAFT RECORD</div>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"24px", fontWeight:800, color:"#e2e8f0" }}>{aircraft.id}</div>
            <div style={{ fontSize:"11px", color:"rgba(148,163,184,0.5)", marginTop:"3px", fontFamily:"'IBM Plex Mono',monospace" }}>{aircraft.model}</div>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"6px", color:"#64748b", fontSize:"12px", cursor:"pointer", padding:"6px 12px", fontFamily:"'IBM Plex Mono',monospace" }}>ESC</button>
        </div>
        <div style={{ display:"flex", gap:"10px", marginBottom:"20px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"6px", background:`${st.color}12`, border:`1px solid ${st.color}30`, borderRadius:"5px", padding:"6px 12px" }}>
            <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:st.color, boxShadow:`0 0 6px ${st.color}` }}/>
            <span style={{ fontSize:"10px", color:st.color, letterSpacing:"0.12em", fontFamily:"'IBM Plex Mono',monospace" }}>{st.label}</span>
          </div>
          <div style={{ background:`${ty.color}12`, border:`1px solid ${ty.color}30`, borderRadius:"5px", padding:"6px 12px" }}>
            <span style={{ fontSize:"10px", color:ty.color, letterSpacing:"0.12em", fontFamily:"'IBM Plex Mono',monospace" }}>{ty.label}</span>
          </div>
        </div>
        <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)", borderRadius:"8px", padding:"18px", marginBottom:"16px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"10px" }}>
            <span style={{ fontSize:"10px", color:"rgba(148,163,184,0.4)", letterSpacing:"0.15em", fontFamily:"'IBM Plex Mono',monospace" }}>AIRFRAME HOURS</span>
            <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"13px", color:pct>85?"#ef4444":pct>65?"#f59e0b":st.color, fontWeight:700 }}>{pct}% USED</span>
          </div>
          <div style={{ height:"8px", background:"rgba(255,255,255,0.04)", borderRadius:"4px", overflow:"hidden", marginBottom:"10px" }}>
            <div style={{ height:"100%", width:`${pct}%`, background:pct>85?"linear-gradient(90deg,#ef444460,#ef4444)":pct>65?"linear-gradient(90deg,#f59e0b60,#f59e0b)":`linear-gradient(90deg,${st.color}60,${st.color})`, borderRadius:"4px" }}/>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between" }}>
            {[["LOGGED",aircraft.hours.toLocaleString()],["REMAINING",(aircraft.maxHours-aircraft.hours).toLocaleString()],["MAX",aircraft.maxHours.toLocaleString()]].map(([l,v]) => (
              <div key={l} style={{ textAlign:"center" }}>
                <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"16px", fontWeight:700, color:"#e2e8f0" }}>{v}</div>
                <div style={{ fontSize:"9px", color:"rgba(148,163,184,0.35)", letterSpacing:"0.1em", fontFamily:"'IBM Plex Mono',monospace" }}>{l} HRS</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px", marginBottom:"16px" }}>
          {[["ENGINE",aircraft.engine],["YEAR",aircraft.year],["SEATS",aircraft.seats],["CYCLES",aircraft.cycles?.toLocaleString()],["FLIGHT SCHOOL",aircraft.school],["BASE STATE",aircraft.state],["LAST INSP.",aircraft.lastInspection],["NEXT INSP.",aircraft.nextInspection]].map(([l,v]) => (
            <div key={l} style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.04)", borderRadius:"6px", padding:"12px 14px" }}>
              <div style={{ fontSize:"9px", color:"rgba(148,163,184,0.35)", letterSpacing:"0.15em", marginBottom:"5px", fontFamily:"'IBM Plex Mono',monospace" }}>{l}</div>
              <div style={{ fontSize:"12px", color:"#cbd5e1", fontFamily:"'IBM Plex Mono',monospace" }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", gap:"10px" }}>
          {["LOG FLIGHT HOURS","SCHEDULE MAINT.","VIEW HISTORY"].map((btn,i) => (
            <button key={btn} style={{ flex:1, padding:"10px 6px", background:i===0?"rgba(56,189,248,0.1)":"rgba(255,255,255,0.02)", border:`1px solid ${i===0?"rgba(56,189,248,0.3)":"rgba(255,255,255,0.06)"}`, borderRadius:"6px", color:i===0?"#38BDF8":"rgba(148,163,184,0.4)", fontSize:"8px", letterSpacing:"0.1em", cursor:"pointer", fontFamily:"'IBM Plex Mono',monospace" }}>{btn}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function FleetPage({ fleet, setFleet, showToast }) {
  const [search, setSearch]       = useState("");
  const [filter, setFilter]       = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selected, setSelected]   = useState(null);
  const [showAdd, setShowAdd]     = useState(false);
  const [sortBy, setSortBy]       = useState("id");

  const handleAdd = (aircraft) => {
    setFleet(prev => [...prev, aircraft]);
    showToast(`${aircraft.id} added to fleet registry`);
  };

  const filtered = fleet.filter(f => {
    const ms = f.id.toLowerCase().includes(search.toLowerCase())||f.model.toLowerCase().includes(search.toLowerCase())||f.school.toLowerCase().includes(search.toLowerCase())||f.state.toLowerCase().includes(search.toLowerCase());
    return ms && (filter==="all"||f.status===filter) && (typeFilter==="all"||f.type===typeFilter);
  }).sort((a,b) => {
    if(sortBy==="hours") return b.hours-a.hours;
    if(sortBy==="pct")   return (b.hours/b.maxHours)-(a.hours/a.maxHours);
    if(sortBy==="next")  return a.nextInspection.localeCompare(b.nextInspection);
    return a.id.localeCompare(b.id);
  });

  return (
    <div style={{ maxWidth:"1400px", margin:"0 auto", padding:"40px 32px", position:"relative", zIndex:1, animation:"pageIn 0.4s ease" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:"32px" }}>
        <div>
          <div style={{ fontSize:"10px", color:"rgba(148,163,184,0.4)", letterSpacing:"0.2em", marginBottom:"8px", fontFamily:"'IBM Plex Mono',monospace" }}>// ASSET MANAGEMENT</div>
          <h1 style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"32px", fontWeight:900, margin:0, color:"#e2e8f0", lineHeight:1 }}>FLEET<br/><span style={{ color:"#38BDF8" }}>REGISTRY</span></h1>
          <p style={{ fontSize:"11px", color:"rgba(148,163,184,0.4)", marginTop:"10px", fontFamily:"'IBM Plex Mono',monospace" }}>Airframe hours, maintenance status, and inspection schedules</p>
        </div>
        <button onClick={()=>setShowAdd(true)} style={{ background:"rgba(56,189,248,0.08)", border:"1px solid rgba(56,189,248,0.25)", borderRadius:"7px", color:"#38BDF8", fontSize:"10px", letterSpacing:"0.15em", cursor:"pointer", padding:"12px 20px", fontFamily:"'Orbitron',sans-serif" }}>+ ADD AIRCRAFT</button>
      </div>

      <div style={{ display:"flex", gap:"14px", marginBottom:"32px" }}>
        {[["TOTAL AIRCRAFT",fleet.length,"#38BDF8"],["AIRWORTHY",fleet.filter(f=>f.status==="airworthy").length,"#22c55e"],["IN MAINTENANCE",fleet.filter(f=>f.status==="maintenance").length,"#f59e0b"],["GROUNDED",fleet.filter(f=>f.status==="grounded").length,"#ef4444"],["TOTAL HRS",fleet.reduce((a,f)=>a+f.hours,0).toLocaleString(),"#a78bfa"]].map(([label,value,color]) => (
          <div key={label} style={{ background:"rgba(10,16,26,0.8)", border:`1px solid ${color}18`, borderLeft:`3px solid ${color}`, borderRadius:"6px", padding:"14px 18px", flex:1 }}>
            <div style={{ fontSize:"9px", color:"rgba(148,163,184,0.45)", letterSpacing:"0.18em", marginBottom:"6px", fontFamily:"'IBM Plex Mono',monospace" }}>{label}</div>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"22px", fontWeight:700, color }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", gap:"10px", marginBottom:"20px", alignItems:"center", flexWrap:"wrap" }}>
        <input placeholder="Search tail #, model, school, state..." value={search} onChange={e=>setSearch(e.target.value)} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(56,189,248,0.12)", borderRadius:"6px", padding:"10px 16px", color:"#e2e8f0", fontSize:"12px", fontFamily:"'IBM Plex Mono',monospace", outline:"none", width:"280px", letterSpacing:"0.04em" }}/>
        <div style={{ display:"flex", gap:"6px" }}>
          {[["all","ALL"],["airworthy","AIRWORTHY"],["maintenance","MAINT."],["grounded","GROUNDED"]].map(([val,lbl]) => {
            const c=val==="airworthy"?"#22c55e":val==="maintenance"?"#f59e0b":val==="grounded"?"#ef4444":"#38BDF8";
            return <button key={val} onClick={()=>setFilter(val)} style={{ background:filter===val?`${c}15`:"rgba(255,255,255,0.02)", border:`1px solid ${filter===val?c+"50":"rgba(255,255,255,0.06)"}`, borderRadius:"5px", color:filter===val?c:"rgba(148,163,184,0.35)", fontSize:"9px", letterSpacing:"0.1em", cursor:"pointer", padding:"7px 12px", fontFamily:"'IBM Plex Mono',monospace", transition:"all 0.2s" }}>{lbl}</button>;
          })}
        </div>
        <div style={{ display:"flex", gap:"6px" }}>
          {[["all","ALL TYPES"],["trainer","TRAINER"],["multi","MULTI"],["commercial","COMMERCIAL"]].map(([val,lbl]) => {
            const c=val==="trainer"?"#38BDF8":val==="multi"?"#a78bfa":val==="commercial"?"#f59e0b":"#64748b";
            return <button key={val} onClick={()=>setTypeFilter(val)} style={{ background:typeFilter===val?`${c}15`:"rgba(255,255,255,0.02)", border:`1px solid ${typeFilter===val?c+"50":"rgba(255,255,255,0.06)"}`, borderRadius:"5px", color:typeFilter===val?c:"rgba(148,163,184,0.35)", fontSize:"9px", letterSpacing:"0.1em", cursor:"pointer", padding:"7px 12px", fontFamily:"'IBM Plex Mono',monospace", transition:"all 0.2s" }}>{lbl}</button>;
          })}
        </div>
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:"6px" }}>
          <span style={{ fontSize:"9px", color:"rgba(148,163,184,0.35)", fontFamily:"'IBM Plex Mono',monospace" }}>SORT:</span>
          {[["id","TAIL #"],["hours","HOURS"],["pct","UTIL."],["next","NEXT INSP."]].map(([val,lbl]) => (
            <button key={val} onClick={()=>setSortBy(val)} style={{ background:sortBy===val?"rgba(56,189,248,0.1)":"transparent", border:`1px solid ${sortBy===val?"rgba(56,189,248,0.3)":"rgba(255,255,255,0.05)"}`, borderRadius:"4px", color:sortBy===val?"#38BDF8":"rgba(148,163,184,0.3)", fontSize:"8px", letterSpacing:"0.08em", cursor:"pointer", padding:"5px 10px", fontFamily:"'IBM Plex Mono',monospace", transition:"all 0.2s" }}>{lbl}</button>
          ))}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"120px 1fr 110px 160px 100px 80px 40px", gap:"16px", padding:"8px 20px", marginBottom:"8px" }}>
        {["TAIL / TYPE","MODEL & SCHOOL","STATUS","AIRFRAME HRS","NEXT INSP.","YEAR",""].map((h,i) => <div key={i} style={{ fontSize:"9px", color:"rgba(148,163,184,0.3)", letterSpacing:"0.15em", fontFamily:"'IBM Plex Mono',monospace" }}>{h}</div>)}
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
        {filtered.map((a,i) => <FleetRow key={a.id} aircraft={a} index={i} onClick={setSelected}/>)}
      </div>
      {filtered.length===0 && <div style={{ textAlign:"center", padding:"80px 0", color:"rgba(148,163,184,0.25)", fontSize:"12px", fontFamily:"'IBM Plex Mono',monospace" }}>NO AIRCRAFT MATCH YOUR FILTERS</div>}

      {showAdd   && <AddAircraftModal onClose={()=>setShowAdd(false)} onAdd={handleAdd}/>}
      {selected  && <FleetDetailModal aircraft={selected} onClose={()=>setSelected(null)}/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// REPORTS PAGE
// ═══════════════════════════════════════════════════════════════════════════════

function BarChart({ data }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { setTimeout(()=>setAnimated(true),300); }, []);
  const max = Math.max(...data.map(d=>d.hours));
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:"8px", height:"80px", padding:"0 4px" }}>
      {data.map((d,i) => {
        const pct=(d.hours/max)*100, isLast=i===data.length-1;
        return (
          <div key={d.month} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:"6px" }}>
            <div style={{ fontSize:"9px", color:isLast?"#38BDF8":"rgba(148,163,184,0.3)", fontFamily:"'Orbitron',sans-serif" }}>{d.hours>=1000?`${(d.hours/1000).toFixed(1)}k`:d.hours}</div>
            <div style={{ width:"100%", display:"flex", alignItems:"flex-end", height:"48px" }}>
              <div style={{ width:"100%", height:animated?`${pct}%`:"0%", background:isLast?"linear-gradient(180deg,#38BDF8,rgba(56,189,248,0.4))":"linear-gradient(180deg,rgba(148,163,184,0.3),rgba(148,163,184,0.1))", borderRadius:"3px 3px 0 0", transition:`height ${0.4+i*0.06}s ease`, boxShadow:isLast?"0 0 8px rgba(56,189,248,0.3)":"none" }}/>
            </div>
            <div style={{ fontSize:"8px", color:"rgba(148,163,184,0.4)", fontFamily:"'IBM Plex Mono',monospace" }}>{d.month}</div>
          </div>
        );
      })}
    </div>
  );
}

function DemandCard({ school, index, onClick }) {
  const [hovered, setHovered] = useState(false);
  const r = SCHOOL_RATING[school.rating];
  return (
    <div onClick={()=>onClick(school)} onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
      style={{ background:hovered?"rgba(16,24,38,0.98)":"rgba(10,16,26,0.7)", border:`1px solid ${hovered?r.color+"50":"rgba(56,189,248,0.07)"}`, borderLeft:`3px solid ${r.color}`, borderRadius:"8px", padding:"18px 20px", cursor:"pointer", position:"relative", overflow:"hidden", transition:"all 0.22s ease", transform:hovered?"translateX(4px)":"translateX(0)", boxShadow:hovered?`0 6px 28px ${r.glow}`:"none", animation:"fadeUp 0.4s ease both", animationDelay:`${index*0.04}s` }}>
      {school.requestedMore && <div style={{ position:"absolute", top:"12px", right:"12px", background:"rgba(34,197,94,0.12)", border:"1px solid rgba(34,197,94,0.3)", borderRadius:"4px", padding:"3px 8px", fontSize:"8px", color:"#22c55e", letterSpacing:"0.1em", fontFamily:"'IBM Plex Mono',monospace", animation:"pulse 2s infinite" }}>REQUESTED MORE</div>}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 80px 80px 80px 80px", gap:"16px", alignItems:"center" }}>
        <div>
          <div style={{ fontSize:"13px", color:"#e2e8f0", marginBottom:"4px", fontFamily:"'IBM Plex Mono',monospace", fontWeight:500 }}>{school.name}</div>
          <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
            <span style={{ fontSize:"9px", color:"rgba(148,163,184,0.4)", fontFamily:"'IBM Plex Mono',monospace" }}>{school.state} · {school.aircraft} aircraft</span>
            <div style={{ display:"flex", alignItems:"center", gap:"4px", background:r.bg, border:`1px solid ${r.color}25`, borderRadius:"3px", padding:"2px 7px" }}>
              <div style={{ width:"4px", height:"4px", borderRadius:"50%", background:r.color }}/>
              <span style={{ fontSize:"8px", color:r.color, letterSpacing:"0.1em", fontFamily:"'IBM Plex Mono',monospace" }}>{r.label}</span>
            </div>
          </div>
        </div>
        {[["AVG HRS/MO",school.avgMonthlyHours,"#e2e8f0"],["LAST 30D",school.lastMonthHours,hovered?r.color:"#e2e8f0"],["TREND",`${school.trend>0?"+":""}${school.trend}%`,school.trend>0?"#22c55e":"#ef4444"],["UTIL.",`${school.utilization}%`,school.utilization>=85?"#22c55e":school.utilization>=65?"#f59e0b":"#ef4444"]].map(([lbl,val,color]) => (
          <div key={lbl} style={{ textAlign:"center" }}>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"14px", fontWeight:700, color }}>{val}</div>
            <div style={{ fontSize:"8px", color:"rgba(148,163,184,0.35)", letterSpacing:"0.1em", marginTop:"3px", fontFamily:"'IBM Plex Mono',monospace" }}>{lbl}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop:"12px", height:"2px", background:"rgba(255,255,255,0.04)", borderRadius:"2px", overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${school.utilization}%`, background:`linear-gradient(90deg,${r.color}60,${r.color})`, borderRadius:"2px" }}/>
      </div>
    </div>
  );
}

function SchoolModal({ school, onClose }) {
  useEffect(() => { const h=(e)=>e.key==="Escape"&&onClose(); window.addEventListener("keydown",h); return ()=>window.removeEventListener("keydown",h); },[onClose]);
  if (!school) return null;
  const r = SCHOOL_RATING[school.rating];
  const monthlyData = [
    {month:"Sep",hours:Math.round(school.avgMonthlyHours*0.88)},{month:"Oct",hours:Math.round(school.avgMonthlyHours*0.95)},
    {month:"Nov",hours:Math.round(school.avgMonthlyHours*0.91)},{month:"Dec",hours:Math.round(school.avgMonthlyHours*0.82)},
    {month:"Jan",hours:Math.round(school.avgMonthlyHours*0.97)},{month:"Feb",hours:school.avgMonthlyHours},{month:"Mar",hours:school.lastMonthHours},
  ];
  const leaseRec = school.utilization>=85?"STRONG LEASE CANDIDATE":school.utilization>=70?"MONITOR FOR GROWTH":"HOLD — REVIEW PERFORMANCE";
  const leaseColor = school.utilization>=85?"#22c55e":school.utilization>=70?"#f59e0b":"#ef4444";
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, animation:"fadeIn 0.2s ease" }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:"580px", maxHeight:"88vh", overflowY:"auto", background:"#080d14", border:`1px solid ${r.color}40`, borderRadius:"12px", padding:"36px", position:"relative", animation:"slideUp 0.25s ease", boxShadow:`0 0 80px ${r.glow}` }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:`linear-gradient(90deg,transparent,${r.color},transparent)` }}/>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"24px" }}>
          <div>
            <div style={{ fontSize:"9px", color:"rgba(148,163,184,0.4)", letterSpacing:"0.2em", marginBottom:"6px", fontFamily:"'IBM Plex Mono',monospace" }}>SCHOOL INTELLIGENCE REPORT</div>
            <h2 style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"18px", fontWeight:800, color:"#e2e8f0", margin:0 }}>{school.name.toUpperCase()}</h2>
            <div style={{ fontSize:"11px", color:"rgba(148,163,184,0.4)", marginTop:"4px", fontFamily:"'IBM Plex Mono',monospace" }}>{school.state} · {school.aircraft} aircraft in fleet</div>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"6px", color:"#64748b", fontSize:"12px", cursor:"pointer", padding:"6px 12px", fontFamily:"'IBM Plex Mono',monospace" }}>ESC</button>
        </div>
        <div style={{ background:`${leaseColor}10`, border:`1px solid ${leaseColor}30`, borderRadius:"8px", padding:"14px 18px", marginBottom:"20px", display:"flex", alignItems:"center", gap:"12px" }}>
          <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:leaseColor, boxShadow:`0 0 8px ${leaseColor}`, flexShrink:0 }}/>
          <div>
            <div style={{ fontSize:"11px", color:leaseColor, letterSpacing:"0.12em", fontWeight:600, fontFamily:"'Orbitron',sans-serif" }}>LEASE RECOMMENDATION: {leaseRec}</div>
            <div style={{ fontSize:"10px", color:"rgba(148,163,184,0.5)", marginTop:"3px", fontFamily:"'IBM Plex Mono',monospace" }}>{school.notes}</div>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:"10px", marginBottom:"20px" }}>
          {[{l:"AVG HRS/MO",v:school.avgMonthlyHours,c:"#e2e8f0"},{l:"LAST 30 DAYS",v:school.lastMonthHours,c:r.color},{l:"UTILIZATION",v:`${school.utilization}%`,c:school.utilization>=85?"#22c55e":school.utilization>=65?"#f59e0b":"#ef4444"},{l:"MO/MO TREND",v:`${school.trend>0?"+":""}${school.trend}%`,c:school.trend>0?"#22c55e":"#ef4444"}].map(item => (
            <div key={item.l} style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)", borderRadius:"7px", padding:"14px", textAlign:"center" }}>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"18px", fontWeight:700, color:item.c, marginBottom:"5px" }}>{item.v}</div>
              <div style={{ fontSize:"8px", color:"rgba(148,163,184,0.35)", letterSpacing:"0.14em", fontFamily:"'IBM Plex Mono',monospace" }}>{item.l}</div>
            </div>
          ))}
        </div>
        <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)", borderRadius:"8px", padding:"18px", marginBottom:"16px" }}>
          <div style={{ fontSize:"9px", color:"rgba(148,163,184,0.4)", letterSpacing:"0.18em", marginBottom:"14px", fontFamily:"'IBM Plex Mono',monospace" }}>7-MONTH FLIGHT HOURS</div>
          <BarChart data={monthlyData}/>
        </div>
        <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)", borderRadius:"8px", padding:"18px", marginBottom:"20px" }}>
          <div style={{ fontSize:"9px", color:"rgba(148,163,184,0.4)", letterSpacing:"0.18em", marginBottom:"14px", fontFamily:"'IBM Plex Mono',monospace" }}>DEMAND SIGNALS</div>
          {[["Requested additional aircraft",school.requestedMore?"YES":"NO",school.requestedMore?"#22c55e":"rgba(148,163,184,0.4)"],["Student waitlist",school.waitlist>0?`${school.waitlist} students`:"None",school.waitlist>0?"#f59e0b":"rgba(148,163,184,0.4)"],["Fleet utilization",`${school.utilization}%`,school.utilization>=85?"#22c55e":school.utilization>=65?"#f59e0b":"#ef4444"],["Month-over-month trend",`${school.trend>0?"+":""}${school.trend}%`,school.trend>0?"#22c55e":"#ef4444"]].map(([label,value,color]) => (
            <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingBottom:"10px", borderBottom:"1px solid rgba(255,255,255,0.04)", marginBottom:"10px" }}>
              <span style={{ fontSize:"11px", color:"rgba(148,163,184,0.5)", fontFamily:"'IBM Plex Mono',monospace" }}>{label}</span>
              <span style={{ fontSize:"12px", color, fontFamily:"'Orbitron',sans-serif", fontWeight:600 }}>{value}</span>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", gap:"10px" }}>
          {["CONTACT SCHOOL","PROPOSE LEASE","EXPORT REPORT"].map((btn,i) => (
            <button key={btn} style={{ flex:1, padding:"11px 6px", background:i===0?`${r.color}12`:"rgba(255,255,255,0.02)", border:`1px solid ${i===0?r.color+"40":"rgba(255,255,255,0.06)"}`, borderRadius:"6px", color:i===0?r.color:"rgba(148,163,184,0.4)", fontSize:"8px", letterSpacing:"0.12em", cursor:"pointer", fontFamily:"'IBM Plex Mono',monospace" }}>{btn}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReportsPage() {
  const [filter, setFilter]     = useState("all");
  const [sortBy, setSortBy]     = useState("utilization");
  const [selected, setSelected] = useState(null);

  const highDemand    = SCHOOLS_DATA.filter(s=>s.rating==="high").length;
  const requested     = SCHOOLS_DATA.filter(s=>s.requestedMore).length;
  const totalWaitlist = SCHOOLS_DATA.reduce((a,s)=>a+s.waitlist,0);
  const avgUtil       = Math.round(SCHOOLS_DATA.reduce((a,s)=>a+s.utilization,0)/SCHOOLS_DATA.length);

  const filtered = SCHOOLS_DATA.filter(s=>filter==="all"||s.rating===filter).sort((a,b)=>{
    if(sortBy==="utilization") return b.utilization-a.utilization;
    if(sortBy==="hours")       return b.lastMonthHours-a.lastMonthHours;
    if(sortBy==="trend")       return b.trend-a.trend;
    return a.name.localeCompare(b.name);
  });

  return (
    <div style={{ maxWidth:"1300px", margin:"0 auto", padding:"40px 32px", position:"relative", zIndex:1, animation:"pageIn 0.4s ease" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:"32px" }}>
        <div>
          <div style={{ fontSize:"10px", color:"rgba(148,163,184,0.4)", letterSpacing:"0.2em", marginBottom:"8px", fontFamily:"'IBM Plex Mono',monospace" }}>// LEASING INTELLIGENCE</div>
          <h1 style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"32px", fontWeight:900, margin:0, color:"#e2e8f0", lineHeight:1 }}>DEMAND<br/><span style={{ color:"#38BDF8" }}>SIGNALS</span></h1>
          <p style={{ fontSize:"11px", color:"rgba(148,163,184,0.4)", marginTop:"10px", fontFamily:"'IBM Plex Mono',monospace" }}>Identify which schools are ready for additional aircraft leases</p>
        </div>
        <div style={{ display:"flex", gap:"10px" }}>
          <button style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"7px", color:"rgba(148,163,184,0.5)", fontSize:"10px", letterSpacing:"0.12em", cursor:"pointer", padding:"11px 18px", fontFamily:"'IBM Plex Mono',monospace" }}>EXPORT CSV</button>
          <button style={{ background:"rgba(56,189,248,0.08)", border:"1px solid rgba(56,189,248,0.25)", borderRadius:"7px", color:"#38BDF8", fontSize:"10px", letterSpacing:"0.12em", cursor:"pointer", padding:"11px 18px", fontFamily:"'IBM Plex Mono',monospace" }}>EXPORT PDF</button>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"14px", marginBottom:"32px" }}>
        {[["HIGH DEMAND SCHOOLS",highDemand,"#22c55e",`of ${SCHOOLS_DATA.length} total`],["REQUESTED MORE PLANES",requested,"#38BDF8","active lease requests"],["STUDENTS ON WAITLIST",totalWaitlist,"#f59e0b","across all schools"],["AVG FLEET UTILIZATION",`${avgUtil}%`,"#a78bfa","network-wide average"]].map(([label,value,color,sub]) => (
          <div key={label} style={{ background:"rgba(10,16,26,0.8)", border:`1px solid ${color}18`, borderTop:`2px solid ${color}`, borderRadius:"8px", padding:"20px 22px", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:"50px", background:`linear-gradient(180deg,${color}08,transparent)` }}/>
            <div style={{ fontSize:"9px", color:"rgba(148,163,184,0.45)", letterSpacing:"0.16em", marginBottom:"10px", fontFamily:"'IBM Plex Mono',monospace" }}>{label}</div>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"28px", fontWeight:700, color, lineHeight:1, marginBottom:"6px" }}>{value}</div>
            <div style={{ fontSize:"9px", color:"rgba(148,163,184,0.3)", fontFamily:"'IBM Plex Mono',monospace" }}>{sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:"16px", marginBottom:"28px" }}>
        <div style={{ background:"rgba(10,16,26,0.8)", border:"1px solid rgba(56,189,248,0.08)", borderRadius:"8px", padding:"24px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
            <div>
              <div style={{ fontSize:"9px", color:"rgba(148,163,184,0.4)", letterSpacing:"0.18em", marginBottom:"6px", fontFamily:"'IBM Plex Mono',monospace" }}>NETWORK FLIGHT HOURS</div>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"18px", fontWeight:700, color:"#38BDF8" }}>3,287 <span style={{ fontSize:"11px", color:"rgba(148,163,184,0.4)", fontFamily:"'IBM Plex Mono',monospace" }}>hrs this month</span></div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:"9px", color:"rgba(148,163,184,0.3)", fontFamily:"'IBM Plex Mono',monospace", marginBottom:"4px" }}>VS LAST MONTH</div>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"14px", color:"#22c55e" }}>+5.0%</div>
            </div>
          </div>
          <BarChart data={MONTHLY_DATA}/>
        </div>
        <div style={{ background:"rgba(10,16,26,0.8)", border:"1px solid rgba(34,197,94,0.12)", borderRadius:"8px", padding:"24px" }}>
          <div style={{ fontSize:"9px", color:"rgba(148,163,184,0.4)", letterSpacing:"0.18em", marginBottom:"16px", fontFamily:"'IBM Plex Mono',monospace" }}>TOP LEASE CANDIDATES</div>
          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            {SCHOOLS_DATA.filter(s=>s.rating==="high").map((s,i) => (
              <div key={s.id} onClick={()=>setSelected(s)} style={{ display:"flex", alignItems:"center", gap:"12px", padding:"10px 12px", background:"rgba(34,197,94,0.06)", border:"1px solid rgba(34,197,94,0.15)", borderRadius:"6px", cursor:"pointer", transition:"all 0.2s" }}>
                <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"16px", fontWeight:700, color:"rgba(34,197,94,0.4)", width:"20px" }}>{i+1}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:"11px", color:"#e2e8f0", marginBottom:"2px", fontFamily:"'IBM Plex Mono',monospace" }}>{s.name}</div>
                  <div style={{ fontSize:"9px", color:"rgba(148,163,184,0.4)", fontFamily:"'IBM Plex Mono',monospace" }}>{s.state} · {s.utilization}% util.</div>
                </div>
                {s.requestedMore && <div style={{ fontSize:"8px", color:"#22c55e", background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.2)", borderRadius:"3px", padding:"2px 6px", fontFamily:"'IBM Plex Mono',monospace", whiteSpace:"nowrap" }}>WANTS MORE</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display:"flex", gap:"10px", marginBottom:"16px", alignItems:"center", flexWrap:"wrap" }}>
        <div style={{ display:"flex", gap:"6px" }}>
          {[["all","ALL SCHOOLS"],["high","HIGH DEMAND"],["medium","STEADY"],["low","LOW ACTIVITY"]].map(([val,lbl]) => {
            const c=val==="high"?"#22c55e":val==="medium"?"#38BDF8":val==="low"?"#ef4444":"#64748b";
            return <button key={val} onClick={()=>setFilter(val)} style={{ background:filter===val?`${c}15`:"rgba(255,255,255,0.02)", border:`1px solid ${filter===val?c+"50":"rgba(255,255,255,0.06)"}`, borderRadius:"5px", color:filter===val?c:"rgba(148,163,184,0.35)", fontSize:"9px", letterSpacing:"0.1em", cursor:"pointer", padding:"7px 14px", fontFamily:"'IBM Plex Mono',monospace", transition:"all 0.2s" }}>{lbl}</button>;
          })}
        </div>
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:"6px" }}>
          <span style={{ fontSize:"9px", color:"rgba(148,163,184,0.35)", fontFamily:"'IBM Plex Mono',monospace" }}>SORT:</span>
          {[["utilization","UTIL."],["hours","HOURS"],["trend","TREND"],["name","NAME"]].map(([val,lbl]) => (
            <button key={val} onClick={()=>setSortBy(val)} style={{ background:sortBy===val?"rgba(56,189,248,0.1)":"transparent", border:`1px solid ${sortBy===val?"rgba(56,189,248,0.3)":"rgba(255,255,255,0.05)"}`, borderRadius:"4px", color:sortBy===val?"#38BDF8":"rgba(148,163,184,0.3)", fontSize:"8px", letterSpacing:"0.08em", cursor:"pointer", padding:"5px 10px", fontFamily:"'IBM Plex Mono',monospace", transition:"all 0.2s" }}>{lbl}</button>
          ))}
        </div>
        <div style={{ fontSize:"10px", color:"rgba(148,163,184,0.3)", fontFamily:"'IBM Plex Mono',monospace" }}>{filtered.length} SCHOOLS</div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 80px 80px 80px 80px", gap:"16px", padding:"8px 20px", marginBottom:"8px" }}>
        {["SCHOOL","AVG HRS/MO","LAST 30D","TREND","UTIL."].map((h,i) => <div key={h} style={{ fontSize:"9px", color:"rgba(148,163,184,0.3)", letterSpacing:"0.15em", textAlign:i===0?"left":"center", fontFamily:"'IBM Plex Mono',monospace" }}>{h}</div>)}
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
        {filtered.map((s,i) => <DemandCard key={s.id} school={s} index={i} onClick={setSelected}/>)}
      </div>

      {selected && <SchoolModal school={selected} onClose={()=>setSelected(null)}/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// APP ROOT
// ═══════════════════════════════════════════════════════════════════════════════

export default function App() {
  const [user,       setUser]       = useState(null);
  const [page,       setPage]       = useState("OVERVIEW");
  const [transition, setTransition] = useState(false);
  const [fleet,      setFleet]      = useState(INITIAL_FLEET);
  const [toast,      setToast]      = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUser({ email: session.user.email, name: session.user.email.split("@")[0], role: "admin", id: session.user.id });
      setAuthLoading(false);
    });
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setUser({ email: session.user.email, name: session.user.email.split("@")[0], role: "admin", id: session.user.id });
      else setUser(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(null), 3500); };

  const handleLogin = (userData) => {
    setTransition(true);
    setTimeout(() => { setUser(userData); setTransition(false); }, 500);
  };

  const handleLogout = async () => {
    setTransition(true);
    await supabase.auth.signOut();
    setTimeout(() => { setUser(null); setPage("OVERVIEW"); setTransition(false); }, 500);
  };

  const handleSetPage = (p) => {
    setTransition(true);
    setTimeout(() => { setPage(p); setTransition(false); }, 200);
  };

  const tickerItems = [
    ...STATES_DATA.filter(s=>s.status==="elevated").map(s=>`▲ ${s.name.toUpperCase()} — ${s.hours.toLocaleString()} HRS LOGGED`),
    ...SCHOOLS_DATA.filter(s=>s.requestedMore).map(s=>`🟢 ${s.name.toUpperCase()} — REQUESTED ADDITIONAL AIRCRAFT`),
    ...fleet.filter(f=>f.status==="grounded").map(f=>`⛔ ${f.id} — GROUNDED`),
    ...SCHOOLS_DATA.filter(s=>s.waitlist>0).map(s=>`⚠ ${s.name.toUpperCase()} — ${s.waitlist} STUDENTS ON WAITLIST`),
  ];

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      {/* Transition overlay */}
      <div style={{ position:"fixed", inset:0, background:"#060b11", zIndex:9999, pointerEvents:"none", opacity:transition?1:0, transition:"opacity 0.3s ease" }}>
        {transition && (
          <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", display:"flex", flexDirection:"column", alignItems:"center", gap:"16px" }}>
            <div style={{ width:"28px", height:"28px", border:"2px solid rgba(56,189,248,0.2)", borderTopColor:"#38BDF8", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
          </div>
        )}
      </div>

      {authLoading ? (
        <div style={{ minHeight:"100vh", background:"#060b11", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ width:"28px", height:"28px", border:"2px solid rgba(56,189,248,0.2)", borderTopColor:"#38BDF8", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
        </div>
      ) : !user ? (
        <LoginPage onLogin={handleLogin}/>
      ) : (
        <div style={{ minHeight:"100vh", background:"#060b11", color:"#e2e8f0" }}>
          <GridBg/>
          <div style={{ position:"fixed", top:0, left:"20%", right:"20%", height:"1px", background:"linear-gradient(90deg,transparent,rgba(56,189,248,0.4),transparent)", pointerEvents:"none", zIndex:200 }}/>
          <Ticker items={tickerItems}/>
          <Nav user={user} page={page} setPage={handleSetPage} onLogout={handleLogout}/>
          {page==="OVERVIEW" && <OverviewPage/>}
          {page==="FLEET"    && <FleetPage fleet={fleet} setFleet={setFleet} showToast={showToast}/>}
          {page==="REPORTS"  && <ReportsPage/>}
          <Toast message={toast}/>
        </div>
      )}
    </>
  );
}