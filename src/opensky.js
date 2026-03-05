// ═══════════════════════════════════════════════════════════════════════════════
// OPENSKY NETWORK API SERVICE
// Uses OAuth2 Client Credentials flow
// Docs: https://openskynetwork.github.io/opensky-api/
// ═══════════════════════════════════════════════════════════════════════════════

const OPENSKY_TOKEN_URL = "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token";
const OPENSKY_API_URL   = "https://opensky-network.org/api";

let cachedToken     = null;
let tokenExpiry     = 0;

// ── Get OAuth2 access token ───────────────────────────────────────────────────
async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiry - 30000) return cachedToken;

  const clientId     = import.meta.env.VITE_OPENSKY_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_OPENSKY_CLIENT_SECRET;

  const res = await fetch(OPENSKY_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type:    "client_credentials",
      client_id:     clientId,
      client_secret: clientSecret,
    }),
  });

  if (!res.ok) throw new Error(`Token fetch failed: ${res.status}`);
  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000;
  return cachedToken;
}

// ── Fetch live state for a single ICAO24 hex code ────────────────────────────
// Note: FAA tail numbers (N-numbers) need to be converted to ICAO24 hex
// We query by callsign which matches the tail number for US aircraft
export async function fetchAircraftState(icao24) {
  try {
    const token = await getAccessToken();
    const res = await fetch(`${OPENSKY_API_URL}/states/all?icao24=${icao24.toLowerCase()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.states || data.states.length === 0) return null;
    const s = data.states[0];
    return {
      icao24:       s[0],
      callsign:     s[1]?.trim(),
      origin:       s[2],
      lastSeen:     s[3],
      lastContact:  s[4],
      longitude:    s[5],
      latitude:     s[6],
      altitude:     s[7],
      onGround:     s[8],
      velocity:     s[9],
      heading:      s[10],
      verticalRate: s[11],
      squawk:       s[14],
      category:     s[17],
    };
  } catch (e) {
    console.error("OpenSky state fetch error:", e);
    return null;
  }
}

// ── Fetch flight history for an aircraft (last 7 days) ───────────────────────
export async function fetchFlightHistory(icao24, days = 7) {
  try {
    const token = await getAccessToken();
    const end   = Math.floor(Date.now() / 1000);
    const begin = end - days * 86400;
    const res   = await fetch(
      `${OPENSKY_API_URL}/flights/aircraft?icao24=${icao24.toLowerCase()}&begin=${begin}&end=${end}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) return null;
    const flights = await res.json();
    if (!flights || flights.length === 0) return { totalFlights: 0, totalHours: 0, flights: [] };

    const processed = flights.map(f => ({
      icao24:       f.icao24,
      callsign:     f.callsign?.trim(),
      departure:    f.estDepartureAirport || "—",
      arrival:      f.estArrivalAirport   || "—",
      departTime:   f.firstSeen,
      arrivalTime:  f.lastSeen,
      durationMins: Math.round((f.lastSeen - f.firstSeen) / 60),
    })).filter(f => f.durationMins > 5); // filter out ground movements

    const totalHours = processed.reduce((a, f) => a + f.durationMins, 0) / 60;

    return {
      totalFlights: processed.length,
      totalHours:   Math.round(totalHours * 10) / 10,
      avgDuration:  processed.length > 0 ? Math.round(processed.reduce((a,f)=>a+f.durationMins,0)/processed.length) : 0,
      flights:      processed.slice(0, 20), // last 20 flights
    };
  } catch (e) {
    console.error("OpenSky history fetch error:", e);
    return null;
  }
}

// ── Convert N-number to ICAO24 hex (US aircraft) ─────────────────────────────
// FAA uses a specific encoding: https://www.faa.gov/licenses_certificates/aircraft_certification/aircraft_registry/relaisfix
export function nNumberToIcao24(nNumber) {
  const n = nNumber.toUpperCase().replace(/^N/, "");
  // Simplified lookup — for full conversion we'd use FAA registry
  // For now return null to trigger fallback to callsign search
  return null;
}

// ── Fetch all currently airborne aircraft in Arizona bounding box ─────────────
export async function fetchArizonaLiveTraffic() {
  try {
    const token = await getAccessToken();
    // Arizona bounding box: lat 31.3-37.0, lon -114.8 to -109.0
    const res = await fetch(
      `${OPENSKY_API_URL}/states/all?lamin=31.3&lomin=-114.8&lamax=37.0&lomax=-109.0`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.states) return [];

    return data.states
      .filter(s => !s[8]) // filter out ground vehicles
      .map(s => ({
        icao24:    s[0],
        callsign:  s[1]?.trim() || "—",
        longitude: s[5],
        latitude:  s[6],
        altitude:  s[7],
        velocity:  s[9],
        heading:   s[10],
        onGround:  s[8],
      }));
  } catch (e) {
    console.error("OpenSky AZ traffic error:", e);
    return [];
  }
}

// ── Fetch flight stats for a list of tail numbers (school fleet) ──────────────
export async function fetchSchoolFleetStats(tailNumbers, days = 30) {
  const results = {};
  // Process in batches of 5 to avoid rate limits
  const batches = [];
  for (let i = 0; i < tailNumbers.length; i += 5) {
    batches.push(tailNumbers.slice(i, i + 5));
  }
  for (const batch of batches) {
    await Promise.all(batch.map(async (tail) => {
      // OpenSky uses ICAO24 hex, but we can search by callsign
      // For US N-numbers, the callsign is usually the N-number without the N prefix
      results[tail] = await fetchFlightHistory(tail.replace(/^N/i, ""), days);
    }));
    // Small delay between batches to respect rate limits
    await new Promise(r => setTimeout(r, 500));
  }
  return results;
}