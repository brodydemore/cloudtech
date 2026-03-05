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

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE ROLLOUT SYSTEM
// Phase I:   Arizona (live)
// Phase II:  Utah, Colorado, New Mexico, Nevada
// Phase III: California, Texas, Florida
// Phase IV:  All remaining states
// ═══════════════════════════════════════════════════════════════════════════════

const PHASE_CONFIG = {
  1: { label:"PHASE I",   color:"#22c55e", states:["AZ"] },
  2: { label:"PHASE II",  color:"#38BDF8", states:["UT","CO","NM","NV"] },
  3: { label:"PHASE III", color:"#f59e0b", states:["CA","TX","FL","NY","WA","OR"] },
  4: { label:"PHASE IV",  color:"#64748b", states:[] }, // all remaining
};

const getPhase = (abbr) => {
  if (PHASE_CONFIG[1].states.includes(abbr)) return 1;
  if (PHASE_CONFIG[2].states.includes(abbr)) return 2;
  if (PHASE_CONFIG[3].states.includes(abbr)) return 3;
  return 4;
};

// Real AZ flight schools from FAA Registry (verified March 2026)
const AZ_SCHOOLS = [
  {
    id:"westwind", name:"Westwind School of Aeronautics", city:"Goodyear", state:"AZ",
    aircraft:58, phone:"623-935-8000", website:"westwindaviation.com",
    address:"1440 S Litchfield Rd, Goodyear, AZ 85338",
    type:"Career/Airlines", rating:"high",
    fleet:[ {model:"Cessna 172", count:38, avg_year:2016}, {model:"Piper Seminole PA-44", count:14, avg_year:2015}, {model:"Piper Archer PA-28", count:6, avg_year:2017} ],
    notes:"", contact_name:"", contact_email:"", last_contact:"",
    waitlist:12, utilization:88, trend:+6.2,
  },
  {
    id:"erau", name:"Embry-Riddle Aeronautical University", city:"Prescott", state:"AZ",
    aircraft:57, phone:"928-777-6600", website:"prescott.erau.edu",
    address:"3700 Willow Creek Rd, Prescott, AZ 86301",
    type:"College Program", rating:"high",
    fleet:[ {model:"Piper Archer PA-28", count:28, avg_year:2018}, {model:"Cessna 172", count:18, avg_year:2017}, {model:"Piper Seminole PA-44", count:11, avg_year:2016} ],
    notes:"", contact_name:"", contact_email:"", last_contact:"",
    waitlist:8, utilization:85, trend:+4.1,
  },
  {
    id:"cae", name:"CAE Aviation Academy Phoenix", city:"Mesa", state:"AZ",
    aircraft:55, phone:"480-809-4499", website:"cae.com/aviation-training",
    address:"6033 S Sossaman Rd, Mesa, AZ 85212",
    type:"Career/Airlines", rating:"high",
    fleet:[ {model:"Diamond DA42", count:30, avg_year:2019}, {model:"Piper Seminole PA-44", count:25, avg_year:2018} ],
    notes:"", contact_name:"", contact_email:"", last_contact:"",
    waitlist:15, utilization:92, trend:+8.4,
  },
  {
    id:"lufthansa", name:"Lufthansa Aviation Training USA", city:"Goodyear", state:"AZ",
    aircraft:31, phone:"623-209-8826", website:"lat.aero",
    address:"1550 S Bullard Ave, Goodyear, AZ 85338",
    type:"Career/Airlines", rating:"high",
    fleet:[ {model:"Cessna 172", count:20, avg_year:2020}, {model:"Piper Seminole PA-44", count:11, avg_year:2019} ],
    notes:"", contact_name:"", contact_email:"", last_contact:"",
    waitlist:6, utilization:86, trend:+3.8,
  },
  {
    id:"mesa-pilot", name:"Mesa Pilot Development", city:"Glendale", state:"AZ",
    aircraft:29, phone:"623-877-9334", website:"mesapilot.com",
    address:"6801 N Glen Harbor Blvd, Glendale, AZ 85307",
    type:"Career/Airlines", rating:"medium",
    fleet:[ {model:"Cessna 172", count:18, avg_year:2015}, {model:"Piper Seminole PA-44", count:11, avg_year:2014} ],
    notes:"", contact_name:"", contact_email:"", last_contact:"",
    waitlist:4, utilization:74, trend:+1.2,
  },
  {
    id:"angel", name:"Angel Aviation", city:"Peoria", state:"AZ",
    aircraft:25, phone:"623-698-1413", website:"angelaviation.com",
    address:"8800 W Deer Valley Rd, Peoria, AZ 85382",
    type:"FBO, Local", rating:"medium",
    fleet:[ {model:"Cessna 172", count:16, avg_year:2013}, {model:"Piper Seneca PA-34", count:6, avg_year:2012}, {model:"Cessna 182", count:3, avg_year:2011} ],
    notes:"", contact_name:"", contact_email:"", last_contact:"",
    waitlist:2, utilization:71, trend:-1.4,
  },
  {
    id:"chandler", name:"Chandler Air Service", city:"Chandler", state:"AZ",
    aircraft:23, phone:"480-821-8737", website:"chandlerair.com",
    address:"2380 S Stinson Way, Chandler, AZ 85286",
    type:"FBO, Local", rating:"medium",
    fleet:[ {model:"Cessna 172", count:15, avg_year:2012}, {model:"Piper Cherokee PA-28", count:8, avg_year:2011} ],
    notes:"", contact_name:"", contact_email:"", last_contact:"",
    waitlist:1, utilization:68, trend:+2.1,
  },
  {
    id:"swaz", name:"Swaz Aviation", city:"Mesa", state:"AZ",
    aircraft:21, phone:"480-985-0000", website:"swazaviation.com",
    address:"Falcon Field Airport, Mesa, AZ 85205",
    type:"FBO, Local", rating:"medium",
    fleet:[ {model:"Cessna 172", count:14, avg_year:2011}, {model:"Piper Arrow PA-28R", count:7, avg_year:2010} ],
    notes:"", contact_name:"", contact_email:"", last_contact:"",
    waitlist:0, utilization:65, trend:-2.8,
  },
  {
    id:"quality", name:"Quality Aviation", city:"Marana", state:"AZ",
    aircraft:21, phone:"520-682-4000", website:"qualityaviation.com",
    address:"11700 W Avra Valley Rd, Marana, AZ 85653",
    type:"FBO, Local", rating:"medium",
    fleet:[ {model:"Cessna 172", count:14, avg_year:2013}, {model:"Piper Warrior PA-28", count:7, avg_year:2012} ],
    notes:"", contact_name:"", contact_email:"", last_contact:"",
    waitlist:0, utilization:67, trend:+0.8,
  },
  {
    id:"venture-west", name:"Venture West", city:"Mesa", state:"AZ",
    aircraft:13, phone:"480-832-4000", website:"venturewestaviation.com",
    address:"Falcon Field Airport, Mesa, AZ 85205",
    type:"FBO, Local", rating:"low",
    fleet:[ {model:"Cessna 172", count:9, avg_year:2010}, {model:"Piper Archer PA-28", count:4, avg_year:2009} ],
    notes:"", contact_name:"", contact_email:"", last_contact:"",
    waitlist:0, utilization:52, trend:-4.2,
  },
];

const AZ_TOTAL_AIRCRAFT = AZ_SCHOOLS.reduce((a,s) => a+s.aircraft, 0);

const STATES_DATA = [
  // ── PHASE I: ARIZONA (LIVE — Real FAA Data) ──────────────────────────────
  { name:"Arizona", abbr:"AZ", schools:AZ_SCHOOLS.length, aircraft:AZ_TOTAL_AIRCRAFT, hours:null, status:"elevated", phase:1, live:true, schools_data:AZ_SCHOOLS },

  // ── PHASE II: Southwest Expansion ────────────────────────────────────────
  { name:"Utah",       abbr:"UT", schools:null, aircraft:null, hours:null, status:"nominal", phase:2, live:false },
  { name:"Colorado",   abbr:"CO", schools:null, aircraft:null, hours:null, status:"nominal", phase:2, live:false },
  { name:"New Mexico", abbr:"NM", schools:null, aircraft:null, hours:null, status:"nominal", phase:2, live:false },
  { name:"Nevada",     abbr:"NV", schools:null, aircraft:null, hours:null, status:"nominal", phase:2, live:false },

  // ── PHASE III: Major Markets ──────────────────────────────────────────────
  { name:"California",  abbr:"CA", schools:null, aircraft:null, hours:null, status:"elevated", phase:3, live:false },
  { name:"Texas",       abbr:"TX", schools:null, aircraft:null, hours:null, status:"elevated", phase:3, live:false },
  { name:"Florida",     abbr:"FL", schools:null, aircraft:null, hours:null, status:"elevated", phase:3, live:false },
  { name:"New York",    abbr:"NY", schools:null, aircraft:null, hours:null, status:"nominal",  phase:3, live:false },
  { name:"Washington",  abbr:"WA", schools:null, aircraft:null, hours:null, status:"nominal",  phase:3, live:false },
  { name:"Oregon",      abbr:"OR", schools:null, aircraft:null, hours:null, status:"nominal",  phase:3, live:false },

  // ── PHASE IV: National Rollout ────────────────────────────────────────────
  { name:"Alabama",       abbr:"AL", phase:4, live:false },
  { name:"Alaska",        abbr:"AK", phase:4, live:false },
  { name:"Arkansas",      abbr:"AR", phase:4, live:false },
  { name:"Connecticut",   abbr:"CT", phase:4, live:false },
  { name:"Delaware",      abbr:"DE", phase:4, live:false },
  { name:"Georgia",       abbr:"GA", phase:4, live:false },
  { name:"Hawaii",        abbr:"HI", phase:4, live:false },
  { name:"Idaho",         abbr:"ID", phase:4, live:false },
  { name:"Illinois",      abbr:"IL", phase:4, live:false },
  { name:"Indiana",       abbr:"IN", phase:4, live:false },
  { name:"Iowa",          abbr:"IA", phase:4, live:false },
  { name:"Kansas",        abbr:"KS", phase:4, live:false },
  { name:"Kentucky",      abbr:"KY", phase:4, live:false },
  { name:"Louisiana",     abbr:"LA", phase:4, live:false },
  { name:"Maine",         abbr:"ME", phase:4, live:false },
  { name:"Maryland",      abbr:"MD", phase:4, live:false },
  { name:"Massachusetts", abbr:"MA", phase:4, live:false },
  { name:"Michigan",      abbr:"MI", phase:4, live:false },
  { name:"Minnesota",     abbr:"MN", phase:4, live:false },
  { name:"Mississippi",   abbr:"MS", phase:4, live:false },
  { name:"Missouri",      abbr:"MO", phase:4, live:false },
  { name:"Montana",       abbr:"MT", phase:4, live:false },
  { name:"Nebraska",      abbr:"NE", phase:4, live:false },
  { name:"New Hampshire", abbr:"NH", phase:4, live:false },
  { name:"New Jersey",    abbr:"NJ", phase:4, live:false },
  { name:"North Carolina",abbr:"NC", phase:4, live:false },
  { name:"North Dakota",  abbr:"ND", phase:4, live:false },
  { name:"Ohio",          abbr:"OH", phase:4, live:false },
  { name:"Oklahoma",      abbr:"OK", phase:4, live:false },
  { name:"Pennsylvania",  abbr:"PA", phase:4, live:false },
  { name:"Rhode Island",  abbr:"RI", phase:4, live:false },
  { name:"South Carolina",abbr:"SC", phase:4, live:false },
  { name:"South Dakota",  abbr:"SD", phase:4, live:false },
  { name:"Tennessee",     abbr:"TN", phase:4, live:false },
  { name:"Vermont",       abbr:"VT", phase:4, live:false },
  { name:"Virginia",      abbr:"VA", phase:4, live:false },
  { name:"West Virginia", abbr:"WV", phase:4, live:false },
  { name:"Wisconsin",     abbr:"WI", phase:4, live:false },
  { name:"Wyoming",       abbr:"WY", phase:4, live:false },
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

function StateCard({ state, onClick, index }) {
  const [hovered, setHovered] = useState(false);
  const phase = state.phase || 4;
  const phaseCfg = PHASE_CONFIG[phase];
  const isLive = state.live;

  if (!isLive) {
    return (
      <div onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
        style={{ background:"rgba(6,11,17,0.7)", border:"1px solid rgba(255,255,255,0.04)", borderRadius:"10px", padding:"20px 22px", position:"relative", overflow:"hidden", transition:"all 0.2s", opacity:hovered?0.65:0.4, animation:"fadeUp 0.4s ease both", animationDelay:`${index*0.025}s` }}>
        <div style={{ position:"absolute", right:"-4px", bottom:"-8px", fontFamily:"'Orbitron',sans-serif", fontSize:"52px", fontWeight:900, color:"rgba(255,255,255,0.03)", lineHeight:1, userSelect:"none" }}>{state.abbr}</div>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"10px" }}>
          <div style={{ fontSize:"13px", fontWeight:600, color:"rgba(148,163,184,0.4)", fontFamily:"'IBM Plex Mono',monospace" }}>{state.name.toUpperCase()}</div>
          <span style={{ fontSize:"16px", opacity:0.25 }}>🔒</span>
        </div>
        <div style={{ display:"inline-flex", alignItems:"center", gap:"5px", background:`${phaseCfg.color}10`, border:`1px solid ${phaseCfg.color}25`, borderRadius:"4px", padding:"3px 10px" }}>
          <div style={{ width:"5px", height:"5px", borderRadius:"50%", background:phaseCfg.color, opacity:0.5 }}/>
          <span style={{ fontSize:"10px", color:phaseCfg.color, letterSpacing:"0.1em", fontFamily:"'IBM Plex Mono',monospace", opacity:0.7 }}>{phaseCfg.label}</span>
        </div>
      </div>
    );
  }

  return (
    <div onClick={()=>onClick(state)} onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
      style={{ background:hovered?"rgba(16,24,38,0.98)":"rgba(10,16,26,0.85)", border:`1px solid ${hovered?"rgba(34,197,94,0.5)":"rgba(34,197,94,0.2)"}`, borderLeft:"3px solid #22c55e", borderRadius:"10px", padding:"20px 22px", cursor:"pointer", position:"relative", overflow:"hidden", transition:"all 0.25s", transform:hovered?"translateY(-2px)":"none", boxShadow:hovered?"0 8px 32px rgba(34,197,94,0.15)":"none", animation:"fadeUp 0.4s ease both" }}>
      <div style={{ position:"absolute", right:"-4px", bottom:"-8px", fontFamily:"'Orbitron',sans-serif", fontSize:"52px", fontWeight:900, color:"rgba(34,197,94,0.07)", lineHeight:1, userSelect:"none" }}>{state.abbr}</div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"12px" }}>
        <div>
          <div style={{ fontSize:"14px", fontWeight:600, color:"#e2e8f0", letterSpacing:"0.05em", marginBottom:"4px", fontFamily:"'IBM Plex Mono',monospace" }}>{state.name.toUpperCase()}</div>
          <div style={{ fontSize:"12px", color:"rgba(148,163,184,0.5)", fontFamily:"'IBM Plex Mono',monospace" }}>FAA Registry · {state.schools} schools</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"5px", background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.3)", borderRadius:"4px", padding:"4px 10px" }}>
          <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#22c55e", animation:"pulse 1.5s infinite" }}/>
          <span style={{ fontSize:"11px", color:"#22c55e", letterSpacing:"0.1em", fontFamily:"'IBM Plex Mono',monospace" }}>LIVE</span>
        </div>
      </div>
      <div style={{ display:"flex", gap:"20px", marginBottom:"14px" }}>
        {[["✈", state.aircraft, "AIRCRAFT"],["🏫", state.schools, "SCHOOLS"]].map(([icon,val,lbl]) => (
          <div key={lbl} style={{ display:"flex", alignItems:"center", gap:"7px" }}>
            <span>{icon}</span>
            <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"18px", fontWeight:700, color:"#22c55e" }}>{val}</span>
            <span style={{ fontSize:"11px", color:"rgba(148,163,184,0.4)", fontFamily:"'IBM Plex Mono',monospace" }}>{lbl}</span>
          </div>
        ))}
      </div>
      <div style={{ fontSize:"12px", color:hovered?"#22c55e":"rgba(148,163,184,0.3)", fontFamily:"'IBM Plex Mono',monospace", transition:"color 0.2s" }}>VIEW SCHOOLS →</div>
    </div>
  );
}

function SchoolDetailPage({ school, onBack, onSave }) {
  const [notes, setNotes]             = useState(school.notes || "");
  const [contactName, setContactName] = useState(school.contact_name || "");
  const [contactEmail, setContactEmail] = useState(school.contact_email || "");
  const [lastContact, setLastContact] = useState(school.last_contact || "");
  const [saved, setSaved]             = useState(false);
  const r = { high:{color:"#22c55e",label:"HIGH DEMAND"}, medium:{color:"#38BDF8",label:"STEADY"}, low:{color:"#ef4444",label:"LOW ACTIVITY"} }[school.rating];
  const avgYear = Math.round(school.fleet.reduce((a,f)=>a+f.avg_year*f.count,0)/school.aircraft);
  const fleetAge = 2026 - avgYear;

  const handleSave = () => {
    onSave(school.id,{notes,contact_name:contactName,contact_email:contactEmail,last_contact:lastContact});
    setSaved(true); setTimeout(()=>setSaved(false),2000);
  };

  return (
    <div style={{ maxWidth:"1100px", margin:"0 auto", padding:"40px 32px", animation:"pageIn 0.4s ease", position:"relative", zIndex:1 }}>
      <button onClick={onBack} style={{ background:"none", border:"none", color:"rgba(148,163,184,0.5)", fontSize:"13px", cursor:"pointer", fontFamily:"'IBM Plex Mono',monospace", letterSpacing:"0.08em", marginBottom:"28px", display:"flex", alignItems:"center", gap:"8px", padding:0 }}>← BACK TO OVERVIEW</button>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"32px", flexWrap:"wrap", gap:"16px" }}>
        <div>
          <div style={{ fontSize:"11px", color:"rgba(148,163,184,0.4)", letterSpacing:"0.2em", marginBottom:"8px", fontFamily:"'IBM Plex Mono',monospace" }}>// SCHOOL DETAIL · AZ · PHASE I</div>
          <h1 style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"28px", fontWeight:900, margin:0, color:"#e2e8f0", lineHeight:1.2 }}>{school.name.toUpperCase()}</h1>
          <div style={{ fontSize:"14px", color:"rgba(148,163,184,0.5)", marginTop:"8px", fontFamily:"'IBM Plex Mono',monospace" }}>{school.city}, AZ · {school.type}</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"8px", background:`${r.color}12`, border:`1px solid ${r.color}30`, borderRadius:"8px", padding:"12px 20px" }}>
          <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:r.color }}/>
          <span style={{ fontSize:"13px", color:r.color, letterSpacing:"0.1em", fontFamily:"'IBM Plex Mono',monospace", fontWeight:600 }}>{r.label}</span>
        </div>
      </div>

      {/* Key stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:"14px", marginBottom:"28px" }}>
        {[
          {l:"TOTAL AIRCRAFT", v:school.aircraft,                                                  c:"#38BDF8"},
          {l:"UTILIZATION",    v:`${school.utilization}%`,                                          c:school.utilization>=85?"#22c55e":school.utilization>=65?"#f59e0b":"#ef4444"},
          {l:"TREND",         v:`${school.trend>0?"+":""}${school.trend}%`,                         c:school.trend>0?"#22c55e":"#ef4444"},
          {l:"WAITLIST",      v:school.waitlist||0,                                                  c:school.waitlist>0?"#f59e0b":"rgba(148,163,184,0.4)"},
          {l:"AVG FLEET AGE", v:`${fleetAge} YRS`,                                                  c:fleetAge>12?"#ef4444":fleetAge>8?"#f59e0b":"#22c55e"},
        ].map(item => (
          <div key={item.l} style={{ background:"rgba(10,16,26,0.8)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"8px", padding:"18px 20px" }}>
            <div style={{ fontSize:"11px", color:"rgba(148,163,184,0.4)", letterSpacing:"0.15em", marginBottom:"8px", fontFamily:"'IBM Plex Mono',monospace" }}>{item.l}</div>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"24px", fontWeight:700, color:item.c }}>{item.v}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"20px", marginBottom:"20px" }}>
        {/* Fleet breakdown */}
        <div style={{ background:"rgba(10,16,26,0.8)", border:"1px solid rgba(56,189,248,0.1)", borderRadius:"10px", padding:"24px" }}>
          <div style={{ fontSize:"11px", color:"rgba(148,163,184,0.4)", letterSpacing:"0.18em", marginBottom:"20px", fontFamily:"'IBM Plex Mono',monospace" }}>FLEET BREAKDOWN</div>
          {school.fleet.map((f,i) => {
            const pct = Math.round((f.count/school.aircraft)*100);
            const age = 2026 - f.avg_year;
            return (
              <div key={i} style={{ marginBottom:"20px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px" }}>
                  <div>
                    <div style={{ fontSize:"14px", color:"#e2e8f0", fontFamily:"'IBM Plex Mono',monospace" }}>{f.model}</div>
                    <div style={{ fontSize:"12px", color:"rgba(148,163,184,0.4)", fontFamily:"'IBM Plex Mono',monospace", marginTop:"2px" }}>Avg {f.avg_year} · {age} yr old</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"20px", fontWeight:700, color:"#38BDF8" }}>{f.count}</div>
                    <div style={{ fontSize:"10px", color:"rgba(148,163,184,0.35)", fontFamily:"'IBM Plex Mono',monospace" }}>AIRCRAFT</div>
                  </div>
                </div>
                <div style={{ height:"4px", background:"rgba(255,255,255,0.04)", borderRadius:"2px", overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${pct}%`, background:"linear-gradient(90deg,rgba(56,189,248,0.5),#38BDF8)", borderRadius:"2px" }}/>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
          {/* School info */}
          <div style={{ background:"rgba(10,16,26,0.8)", border:"1px solid rgba(56,189,248,0.1)", borderRadius:"10px", padding:"24px" }}>
            <div style={{ fontSize:"11px", color:"rgba(148,163,184,0.4)", letterSpacing:"0.18em", marginBottom:"16px", fontFamily:"'IBM Plex Mono',monospace" }}>SCHOOL INFO</div>
            {[["📍", school.address],["📞", school.phone],["🌐", school.website],["🏷", school.type]].map(([icon,val]) => (
              <div key={icon} style={{ marginBottom:"12px", display:"flex", gap:"10px" }}>
                <span style={{ fontSize:"14px" }}>{icon}</span>
                <span style={{ fontSize:"13px", color:"#cbd5e1", fontFamily:"'IBM Plex Mono',monospace", lineHeight:1.4 }}>{val}</span>
              </div>
            ))}
          </div>

          {/* Contact tracking */}
          <div style={{ background:"rgba(10,16,26,0.8)", border:"1px solid rgba(56,189,248,0.1)", borderRadius:"10px", padding:"24px" }}>
            <div style={{ fontSize:"11px", color:"rgba(148,163,184,0.4)", letterSpacing:"0.18em", marginBottom:"16px", fontFamily:"'IBM Plex Mono',monospace" }}>CONTACT TRACKING</div>
            {[["CONTACT NAME",contactName,setContactName,"e.g. John Smith"],["EMAIL",contactEmail,setContactEmail,"e.g. john@school.com"],["LAST CONTACTED",lastContact,setLastContact,"e.g. 2026-03-01"]].map(([label,val,setter,ph]) => (
              <div key={label} style={{ marginBottom:"12px" }}>
                <div style={{ fontSize:"11px", color:"rgba(148,163,184,0.4)", letterSpacing:"0.12em", marginBottom:"5px", fontFamily:"'IBM Plex Mono',monospace" }}>{label}</div>
                <input value={val} onChange={e=>setter(e.target.value)} placeholder={ph} style={{ width:"100%", boxSizing:"border-box", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"6px", padding:"10px 12px", color:"#e2e8f0", fontSize:"13px", fontFamily:"'IBM Plex Mono',monospace", outline:"none" }}/>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div style={{ background:"rgba(10,16,26,0.8)", border:"1px solid rgba(56,189,248,0.1)", borderRadius:"10px", padding:"24px", marginBottom:"20px" }}>
        <div style={{ fontSize:"11px", color:"rgba(148,163,184,0.4)", letterSpacing:"0.18em", marginBottom:"12px", fontFamily:"'IBM Plex Mono',monospace" }}>NOTES & CALL LOG</div>
        <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Log your conversations, observations, and follow-ups here..." style={{ width:"100%", boxSizing:"border-box", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"6px", padding:"14px", color:"#e2e8f0", fontSize:"13px", fontFamily:"'IBM Plex Mono',monospace", outline:"none", resize:"vertical", minHeight:"120px", lineHeight:1.6 }}/>
      </div>

      <button onClick={handleSave} style={{ background:saved?"rgba(34,197,94,0.15)":"rgba(56,189,248,0.1)", border:`1px solid ${saved?"rgba(34,197,94,0.4)":"rgba(56,189,248,0.3)"}`, borderRadius:"7px", color:saved?"#22c55e":"#38BDF8", fontSize:"13px", letterSpacing:"0.15em", cursor:"pointer", padding:"14px 28px", fontFamily:"'Orbitron',sans-serif", transition:"all 0.3s" }}>
        {saved ? "✓ SAVED" : "SAVE CHANGES →"}
      </button>
    </div>
  );
}

function StateModal({ state, onClose, onSelectSchool }) {
  useEffect(() => { const h=(e)=>e.key==="Escape"&&onClose(); window.addEventListener("keydown",h); return ()=>window.removeEventListener("keydown",h); },[onClose]);
  if (!state) return null;
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, animation:"fadeIn 0.2s ease" }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:"640px", maxHeight:"88vh", overflowY:"auto", background:"#080d14", border:"1px solid rgba(34,197,94,0.3)", borderRadius:"12px", padding:"36px", position:"relative", animation:"slideUp 0.25s ease", boxShadow:"0 0 80px rgba(34,197,94,0.08)" }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:"linear-gradient(90deg,transparent,#22c55e,transparent)" }}/>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"24px" }}>
          <div>
            <div style={{ fontSize:"11px", color:"rgba(148,163,184,0.4)", letterSpacing:"0.2em", marginBottom:"6px", fontFamily:"'IBM Plex Mono',monospace" }}>PHASE I · FAA VERIFIED · ARIZONA</div>
            <h2 style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"22px", fontWeight:800, color:"#e2e8f0", margin:0 }}>FLIGHT SCHOOLS</h2>
            <p style={{ fontSize:"12px", color:"rgba(148,163,184,0.4)", margin:"6px 0 0", fontFamily:"'IBM Plex Mono',monospace" }}>Click a school to view details</p>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"6px", color:"#64748b", fontSize:"12px", cursor:"pointer", padding:"8px 14px", fontFamily:"'IBM Plex Mono',monospace" }}>ESC</button>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
          {AZ_SCHOOLS.map((s,i) => {
            const pct = Math.round((s.aircraft/state.aircraft)*100);
            const r = {high:{color:"#22c55e"},medium:{color:"#38BDF8"},low:{color:"#ef4444"}}[s.rating];
            return (
              <div key={i} onClick={()=>{onClose();onSelectSchool(s);}}
                style={{ background:"rgba(255,255,255,0.02)", border:`1px solid ${r.color}20`, borderLeft:`3px solid ${r.color}`, borderRadius:"8px", padding:"16px 18px", cursor:"pointer", transition:"all 0.2s" }}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.05)"}
                onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.02)"}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px" }}>
                  <div>
                    <div style={{ fontSize:"14px", color:"#e2e8f0", fontFamily:"'IBM Plex Mono',monospace", marginBottom:"3px" }}>{s.name}</div>
                    <div style={{ fontSize:"12px", color:"rgba(148,163,184,0.4)", fontFamily:"'IBM Plex Mono',monospace" }}>{s.city} · {s.type}</div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"18px", fontWeight:700, color:"#38BDF8" }}>{s.aircraft}</div>
                      <div style={{ fontSize:"10px", color:"rgba(148,163,184,0.35)", fontFamily:"'IBM Plex Mono',monospace" }}>ACFT</div>
                    </div>
                    <span style={{ fontSize:"14px", color:"rgba(148,163,184,0.3)" }}>→</span>
                  </div>
                </div>
                <div style={{ height:"3px", background:"rgba(255,255,255,0.04)", borderRadius:"2px", overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,${r.color}60,${r.color})`, borderRadius:"2px" }}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DemandHeatmap() {
  const [hovered, setHovered] = useState(null);
  const stateGrid = [
    {abbr:"WA",col:1,row:0},{abbr:"MT",col:2,row:0},{abbr:"ND",col:3,row:0},{abbr:"MN",col:4,row:0},{abbr:"WI",col:5,row:0},{abbr:"MI",col:6,row:0},{abbr:"VT",col:9,row:0},{abbr:"ME",col:10,row:0},
    {abbr:"OR",col:1,row:1},{abbr:"ID",col:2,row:1},{abbr:"SD",col:3,row:1},{abbr:"IA",col:4,row:1},{abbr:"IL",col:5,row:1},{abbr:"IN",col:6,row:1},{abbr:"OH",col:7,row:1},{abbr:"NY",col:8,row:1},{abbr:"NH",col:9,row:1},
    {abbr:"CA",col:1,row:2},{abbr:"NV",col:2,row:2},{abbr:"WY",col:3,row:2},{abbr:"NE",col:4,row:2},{abbr:"MO",col:5,row:2},{abbr:"KY",col:6,row:2},{abbr:"WV",col:7,row:2},{abbr:"VA",col:8,row:2},{abbr:"MA",col:9,row:2},
    {abbr:"AZ",col:2,row:3},{abbr:"CO",col:3,row:3},{abbr:"KS",col:4,row:3},{abbr:"TN",col:5,row:3},{abbr:"NC",col:6,row:3},{abbr:"SC",col:7,row:3},{abbr:"MD",col:8,row:3},{abbr:"RI",col:9,row:3},
    {abbr:"NM",col:2,row:4},{abbr:"OK",col:3,row:4},{abbr:"AR",col:4,row:4},{abbr:"MS",col:5,row:4},{abbr:"AL",col:6,row:4},{abbr:"GA",col:7,row:4},{abbr:"CT",col:9,row:4},
    {abbr:"TX",col:3,row:5},{abbr:"LA",col:4,row:5},{abbr:"FL",col:7,row:5},{abbr:"NJ",col:9,row:5},
    {abbr:"AK",col:0,row:5},{abbr:"HI",col:0,row:6},
  ];
  const demand = {AZ:95,CA:88,TX:85,FL:82,NY:78,WA:72,CO:70,NV:68,NM:65,UT:63,OR:60,GA:58,NC:56,IL:54,MI:52,PA:50,OH:48,VA:46,AK:44,HI:42,MN:40,WI:38,MO:36,TN:35,IN:34,KS:33,OK:32,SC:31,AL:30,LA:29,AR:28,MD:27,NE:26,WY:25,ID:24,MT:23,ND:22,SD:21,IA:20,MS:19,KY:18,WV:17,ME:16,NH:15,VT:14,RI:13,CT:12,NJ:10,MA:9};
  const getColor = (abbr) => {
    if (abbr==="AZ") return "#22c55e";
    const s = demand[abbr]||5;
    if (s>=80) return "#ef4444"; if (s>=60) return "#f59e0b"; if (s>=40) return "#38BDF8"; if (s>=20) return "#1e40af";
    return "#1e293b";
  };
  const cellSize = 46;
  return (
    <div style={{ background:"rgba(10,16,26,0.8)", border:"1px solid rgba(56,189,248,0.1)", borderRadius:"10px", padding:"28px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
        <div>
          <div style={{ fontSize:"12px", color:"rgba(148,163,184,0.4)", letterSpacing:"0.18em", marginBottom:"4px", fontFamily:"'IBM Plex Mono',monospace" }}>DEMAND HEATMAP</div>
          <div style={{ fontSize:"14px", color:"rgba(148,163,184,0.6)", fontFamily:"'IBM Plex Mono',monospace" }}>Flight training demand by state</div>
        </div>
        <div style={{ display:"flex", gap:"14px" }}>
          {[["#22c55e","LIVE"],["#ef4444","HIGH"],["#f59e0b","MED"],["#38BDF8","LOW"],["#1e293b","NONE"]].map(([c,l])=>(
            <div key={l} style={{ display:"flex", alignItems:"center", gap:"5px" }}>
              <div style={{ width:"10px", height:"10px", borderRadius:"2px", background:c }}/>
              <span style={{ fontSize:"11px", color:"rgba(148,163,184,0.5)", fontFamily:"'IBM Plex Mono',monospace" }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position:"relative", height:`${7*(cellSize+2)}px`, overflowX:"auto" }}>
        {stateGrid.map(({abbr,col,row})=>{
          const color=getColor(abbr), isLive=abbr==="AZ";
          return (
            <div key={abbr} onMouseEnter={()=>setHovered(abbr)} onMouseLeave={()=>setHovered(null)}
              style={{ position:"absolute", left:`${col*(cellSize+2)}px`, top:`${row*(cellSize+2)}px`, width:`${cellSize}px`, height:`${cellSize}px`, background:hovered===abbr?`${color}35`:`${color}18`, border:`1px solid ${hovered===abbr||isLive?color:`${color}50`}`, borderRadius:"5px", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"all 0.15s", boxShadow:isLive?`0 0 12px ${color}40`:"none" }}>
              <div style={{ fontSize:"10px", fontWeight:700, color:hovered===abbr||isLive?color:"rgba(148,163,184,0.6)", fontFamily:"'Orbitron',sans-serif" }}>{abbr}</div>
              {isLive && <div style={{ fontSize:"7px", color:"#22c55e", fontFamily:"'IBM Plex Mono',monospace" }}>LIVE</div>}
            </div>
          );
        })}
      </div>
      {hovered && <div style={{ marginTop:"12px", padding:"10px 16px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"6px", display:"flex", justifyContent:"space-between" }}>
        <span style={{ fontSize:"14px", color:"#e2e8f0", fontFamily:"'Orbitron',sans-serif" }}>{hovered}</span>
        <span style={{ fontSize:"12px", color:"rgba(148,163,184,0.5)", fontFamily:"'IBM Plex Mono',monospace" }}>Score: <span style={{ color:getColor(hovered) }}>{demand[hovered]||5}/100</span> · {hovered==="AZ"?"Phase I LIVE":"Pending"}</span>
      </div>}
    </div>
  );
}

function FleetAgeAnalysis() {
  const sorted = [...AZ_SCHOOLS].sort((a,b)=>{
    const ya=Math.round(a.fleet.reduce((s,f)=>s+f.avg_year*f.count,0)/a.aircraft);
    const yb=Math.round(b.fleet.reduce((s,f)=>s+f.avg_year*f.count,0)/b.aircraft);
    return ya-yb;
  });
  return (
    <div style={{ background:"rgba(10,16,26,0.8)", border:"1px solid rgba(56,189,248,0.1)", borderRadius:"10px", padding:"28px" }}>
      <div style={{ fontSize:"12px", color:"rgba(148,163,184,0.4)", letterSpacing:"0.18em", marginBottom:"4px", fontFamily:"'IBM Plex Mono',monospace" }}>FLEET AGE ANALYSIS</div>
      <div style={{ fontSize:"14px", color:"rgba(148,163,184,0.5)", fontFamily:"'IBM Plex Mono',monospace", marginBottom:"24px" }}>Older fleets = higher replacement demand</div>
      <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
        {sorted.map((s,i)=>{
          const avgYear=Math.round(s.fleet.reduce((a,f)=>a+f.avg_year*f.count,0)/s.aircraft);
          const age=2026-avgYear;
          const color=age>=13?"#ef4444":age>=9?"#f59e0b":"#22c55e";
          const label=age>=13?"HIGH PRIORITY":age>=9?"MONITOR":"MODERN";
          return (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:"14px" }}>
              <div style={{ width:"200px", fontSize:"13px", color:"#cbd5e1", fontFamily:"'IBM Plex Mono',monospace", flexShrink:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.name.split(" ").slice(0,3).join(" ")}</div>
              <div style={{ flex:1, height:"6px", background:"rgba(255,255,255,0.04)", borderRadius:"3px", overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${Math.min((age/16)*100,100)}%`, background:`linear-gradient(90deg,${color}60,${color})`, borderRadius:"3px" }}/>
              </div>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"14px", fontWeight:700, color, width:"60px", textAlign:"right" }}>{age} YRS</div>
              <div style={{ fontSize:"10px", color, background:`${color}12`, border:`1px solid ${color}25`, borderRadius:"3px", padding:"3px 8px", fontFamily:"'IBM Plex Mono',monospace", width:"100px", textAlign:"center" }}>{label}</div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop:"20px", padding:"14px 16px", background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.15)", borderRadius:"6px", fontSize:"13px", color:"rgba(148,163,184,0.5)", fontFamily:"'IBM Plex Mono',monospace", lineHeight:1.6 }}>
        ⚠ Schools with fleet age 10+ years are prime lease candidates — higher maintenance costs drive upgrade motivation.
      </div>
    </div>
  );
}

function OverviewPage({ onSelectSchool }) {
  const [search, setSearch]           = useState("");
  const [phaseFilter, setPhaseFilter] = useState("all");
  const [selected, setSelected]       = useState(null);
  const [activeTab, setActiveTab]     = useState("map");

  const totalAircraft = AZ_SCHOOLS.reduce((a,s)=>a+s.aircraft,0);
  const totalSchools  = AZ_SCHOOLS.length;

  const filtered = STATES_DATA.filter(s => {
    const ms = s.name.toLowerCase().includes(search.toLowerCase()) || s.abbr.toLowerCase().includes(search.toLowerCase());
    const mf = phaseFilter==="all" || String(s.phase)===phaseFilter;
    return ms && mf;
  });

  return (
    <div style={{ maxWidth:"1400px", margin:"0 auto", padding:"40px 32px", position:"relative", zIndex:1, animation:"pageIn 0.4s ease" }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:"32px" }}>
        <div>
          <div style={{ fontSize:"11px", color:"rgba(148,163,184,0.4)", letterSpacing:"0.2em", marginBottom:"8px", fontFamily:"'IBM Plex Mono',monospace" }}>// COMMAND CENTER</div>
          <h1 style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"34px", fontWeight:900, margin:0, color:"#e2e8f0", lineHeight:1 }}>REGIONAL<br/><span style={{ color:"#38BDF8" }}>OPERATIONS</span></h1>
          <p style={{ fontSize:"13px", color:"rgba(148,163,184,0.4)", marginTop:"10px", fontFamily:"'IBM Plex Mono',monospace" }}>Phase I live · expanding to 50 states</p>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:"11px", color:"rgba(148,163,184,0.35)", letterSpacing:"0.15em", marginBottom:"6px", fontFamily:"'IBM Plex Mono',monospace" }}>COVERAGE</div>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"34px", fontWeight:700, color:"#22c55e" }}>1 / 50</div>
          <div style={{ fontSize:"11px", color:"rgba(148,163,184,0.35)", fontFamily:"'IBM Plex Mono',monospace" }}>STATES LIVE</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"flex", gap:"14px", marginBottom:"28px" }}>
        {[
          {label:"LIVE STATES",       value:"1",           color:"#22c55e", sub:"Arizona · Phase I"},
          {label:"VERIFIED SCHOOLS",  value:totalSchools,  color:"#38BDF8", sub:"FAA confirmed"},
          {label:"REGISTERED ACFT",   value:totalAircraft, color:"#a78bfa", sub:"FAA Registry"},
          {label:"FLIGHT HRS",        value:"—",           color:"#f59e0b", sub:"OpenSky pending"},
        ].map(item=>(
          <div key={item.label} style={{ background:"rgba(10,16,26,0.8)", border:`1px solid ${item.color}18`, borderLeft:`3px solid ${item.color}`, borderRadius:"8px", padding:"20px 24px", flex:1 }}>
            <div style={{ fontSize:"11px", color:"rgba(148,163,184,0.45)", letterSpacing:"0.18em", marginBottom:"8px", fontFamily:"'IBM Plex Mono',monospace" }}>{item.label}</div>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"28px", fontWeight:700, color:item.color, marginBottom:"5px" }}>{item.value}</div>
            <div style={{ fontSize:"12px", color:"rgba(148,163,184,0.35)", fontFamily:"'IBM Plex Mono',monospace" }}>{item.sub}</div>
          </div>
        ))}
      </div>

      {/* Tab switcher */}
      <div style={{ display:"flex", gap:"8px", marginBottom:"24px" }}>
        {[["map","STATE MAP"],["heatmap","DEMAND HEATMAP"],["fleet-age","FLEET AGE"]].map(([val,lbl])=>(
          <button key={val} onClick={()=>setActiveTab(val)} style={{ background:activeTab===val?"rgba(56,189,248,0.1)":"rgba(255,255,255,0.02)", border:`1px solid ${activeTab===val?"rgba(56,189,248,0.4)":"rgba(255,255,255,0.06)"}`, borderRadius:"6px", color:activeTab===val?"#38BDF8":"rgba(148,163,184,0.4)", fontSize:"12px", letterSpacing:"0.12em", cursor:"pointer", padding:"10px 20px", fontFamily:"'IBM Plex Mono',monospace", transition:"all 0.2s" }}>{lbl}</button>
        ))}
      </div>

      {activeTab==="heatmap"   && <div style={{ marginBottom:"32px" }}><DemandHeatmap/></div>}
      {activeTab==="fleet-age" && <div style={{ marginBottom:"32px" }}><FleetAgeAnalysis/></div>}

      {activeTab==="map" && <>
        <div style={{ display:"flex", gap:"10px", marginBottom:"24px", alignItems:"center", flexWrap:"wrap" }}>
          <input placeholder="Search states..." value={search} onChange={e=>setSearch(e.target.value)} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(56,189,248,0.12)", borderRadius:"6px", padding:"10px 16px", color:"#e2e8f0", fontSize:"13px", fontFamily:"'IBM Plex Mono',monospace", outline:"none", width:"210px" }}/>
          <div style={{ display:"flex", gap:"6px" }}>
            {[["all","ALL"],["1","PHASE I"],["2","PHASE II"],["3","PHASE III"],["4","PHASE IV"]].map(([val,lbl])=>{
              const c=val==="1"?"#22c55e":val==="2"?"#38BDF8":val==="3"?"#f59e0b":val==="4"?"#64748b":"#94a3b8";
              return <button key={val} onClick={()=>setPhaseFilter(val)} style={{ background:phaseFilter===val?`${c}15`:"rgba(255,255,255,0.02)", border:`1px solid ${phaseFilter===val?c+"50":"rgba(255,255,255,0.06)"}`, borderRadius:"5px", color:phaseFilter===val?c:"rgba(148,163,184,0.35)", fontSize:"11px", letterSpacing:"0.1em", cursor:"pointer", padding:"8px 14px", fontFamily:"'IBM Plex Mono',monospace", transition:"all 0.2s" }}>{lbl}</button>;
            })}
          </div>
          <div style={{ marginLeft:"auto", fontSize:"12px", color:"rgba(148,163,184,0.3)", fontFamily:"'IBM Plex Mono',monospace" }}>{filtered.length} STATES</div>
        </div>

        {phaseFilter==="all" ? [1,2,3,4].map(ph=>{
          const phaseStates=filtered.filter(s=>s.phase===ph);
          if (!phaseStates.length) return null;
          const cfg=PHASE_CONFIG[ph];
          return (
            <div key={ph} style={{ marginBottom:"36px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"16px" }}>
                <div style={{ height:"1px", width:"20px", background:cfg.color, opacity:0.5 }}/>
                <span style={{ fontSize:"11px", color:cfg.color, letterSpacing:"0.2em", fontFamily:"'IBM Plex Mono',monospace" }}>{cfg.label}</span>
                {ph===1 && <span style={{ fontSize:"10px", color:"#22c55e", background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.25)", borderRadius:"3px", padding:"2px 8px", fontFamily:"'IBM Plex Mono',monospace" }}>● LIVE</span>}
                {ph>1 && <span style={{ fontSize:"10px", color:"rgba(148,163,184,0.3)", fontFamily:"'IBM Plex Mono',monospace" }}>COMING SOON</span>}
                <div style={{ flex:1, height:"1px", background:`linear-gradient(90deg,${cfg.color}30,transparent)` }}/>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))", gap:"12px" }}>
                {phaseStates.map((s,i)=><StateCard key={s.abbr} state={s} onClick={setSelected} index={i}/>)}
              </div>
            </div>
          );
        }) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))", gap:"12px" }}>
            {filtered.map((s,i)=><StateCard key={s.abbr} state={s} onClick={setSelected} index={i}/>)}
          </div>
        )}
      </>}

      {selected && selected.live && <StateModal state={selected} onClose={()=>setSelected(null)} onSelectSchool={onSelectSchool}/>}
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
  const [user,         setUser]         = useState(null);
  const [page,         setPage]         = useState("OVERVIEW");
  const [transition,   setTransition]   = useState(false);
  const [fleet,        setFleet]        = useState(INITIAL_FLEET);
  const [toast,        setToast]        = useState(null);
  const [authLoading,  setAuthLoading]  = useState(true);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [schoolData,   setSchoolData]   = useState(AZ_SCHOOLS.reduce((acc,s)=>({...acc,[s.id]:s}),{}));

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUser({ email: session.user.email, name: session.user.email.split("@")[0], role: "admin", id: session.user.id });
      setAuthLoading(false);
    });
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
    setSelectedSchool(null);
    setTimeout(() => { setPage(p); setTransition(false); }, 200);
  };

  const handleSelectSchool = (school) => {
    setSelectedSchool(schoolData[school.id] || school);
  };

  const handleSaveSchool = (id, updates) => {
    setSchoolData(prev => ({ ...prev, [id]: { ...prev[id], ...updates } }));
    setSelectedSchool(prev => prev ? { ...prev, ...updates } : prev);
    showToast("School record saved");
  };

  const tickerItems = [
    "▲ ARIZONA — PHASE I LIVE · 10 SCHOOLS · " + AZ_SCHOOLS.reduce((a,s)=>a+s.aircraft,0) + " AIRCRAFT VERIFIED",
    ...AZ_SCHOOLS.slice(0,4).map(s=>`🟢 ${s.name.toUpperCase()} — ${s.aircraft} AIRCRAFT · ${s.city.toUpperCase()} AZ`),
    "⚡ PHASE II COMING SOON — UTAH · COLORADO · NEW MEXICO · NEVADA",
    "⚡ PHASE III COMING SOON — CALIFORNIA · TEXAS · FLORIDA",
    ...fleet.filter(f=>f.status==="grounded").map(f=>`⛔ ${f.id} — GROUNDED`),
  ];

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{ position:"fixed", inset:0, background:"#060b11", zIndex:9999, pointerEvents:"none", opacity:transition?1:0, transition:"opacity 0.3s ease" }}>
        {transition && <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)" }}><div style={{ width:"28px", height:"28px", border:"2px solid rgba(56,189,248,0.2)", borderTopColor:"#38BDF8", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/></div>}
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
          {selectedSchool ? (
            <SchoolDetailPage school={selectedSchool} onBack={()=>setSelectedSchool(null)} onSave={handleSaveSchool}/>
          ) : (
            <>
              {page==="OVERVIEW" && <OverviewPage onSelectSchool={handleSelectSchool}/>}
              {page==="FLEET"    && <FleetPage fleet={fleet} setFleet={setFleet} showToast={showToast}/>}
              {page==="REPORTS"  && <ReportsPage/>}
            </>
          )}
          <Toast message={toast}/>
        </div>
      )}
    </>
  );
}