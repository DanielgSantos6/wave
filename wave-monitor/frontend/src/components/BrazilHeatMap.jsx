// BrazilHeatMap.jsx
// Mapa de calor simplificado do Brasil usando SVG + círculos coloridos por intensidade de ondas.

const ALERT_THRESHOLD = 2.5

function waveColor(h) {
  if (h === null || h === undefined) return '#334155'
  if (h >= ALERT_THRESHOLD) return '#ef4444'
  if (h >= 2.0) return '#f97316'
  if (h >= 1.5) return '#eab308'
  if (h >= 1.0) return '#22d3ee'
  return '#38bdf8'
}

// Approximate Brazil coastline outline as SVG path (simplified polygon)
const BRAZIL_PATH = `
M 285 30 L 330 25 L 370 40 L 400 70 L 420 105 L 430 140
L 435 175 L 440 210 L 445 250 L 450 290 L 448 330
L 440 370 L 425 400 L 405 420 L 380 435 L 350 445
L 315 450 L 280 445 L 250 430 L 225 410 L 205 385
L 190 355 L 180 320 L 172 285 L 168 250 L 165 215
L 162 180 L 158 145 L 155 110 L 165 80 L 190 55
L 220 38 L 255 30 Z
`

// Convert lat/lon to approximate SVG coordinates for Brazil
// Brazil roughly: lat -5.27 to -33.75, lon -34.79 to -73.99
function latLonToSVG(lat, lon) {
  const latMin = -33.8, latMax = 5.0
  const lonMin = -74.0, lonMax = -34.0

  const x = 155 + ((lon - lonMin) / (lonMax - lonMin)) * 295
  const y = 30 + ((latMax - lat) / (latMax - latMin)) * 425

  return { x: Math.round(x), y: Math.round(y) }
}

export default function BrazilHeatMap({ data }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-slate-300 mb-3">
        Mapa de Calor — Altura Média das Ondas (24 h)
      </h3>

      <svg
        viewBox="0 0 600 490"
        className="w-full"
        style={{ maxHeight: 400 }}
        aria-label="Mapa de calor de ondas no Brasil"
      >
        {/* Ocean background */}
        <rect width="600" height="490" fill="#0f172a" rx="8" />

        {/* Brazil outline */}
        <path
          d={BRAZIL_PATH}
          fill="#1e3a5f"
          stroke="#334155"
          strokeWidth="1.5"
        />

        {/* Beach markers */}
        {data.map((b) => {
          const { x, y } = latLonToSVG(b.latitude, b.longitude)
          const r = 6 + (b.avg_wave_height || 0) * 3.5
          const color = waveColor(b.avg_wave_height)
          const isAlert = (b.avg_wave_height || 0) >= ALERT_THRESHOLD

          return (
            <g key={b.beach_name}>
              {/* Pulse ring for alerts */}
              {isAlert && (
                <circle
                  cx={x} cy={y}
                  r={r + 6}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  opacity="0.4"
                />
              )}
              <circle
                cx={x} cy={y}
                r={r}
                fill={color}
                fillOpacity="0.75"
                stroke={color}
                strokeWidth="1"
              />
              {/* Label */}
              <text
                x={x + r + 3}
                y={y + 4}
                fontSize="7"
                fill="#cbd5e1"
                fontFamily="sans-serif"
              >
                {b.beach_name.length > 12 ? b.beach_name.slice(0, 11) + '…' : b.beach_name}
              </text>
            </g>
          )
        })}

        {/* Legend */}
        <g transform="translate(10, 440)">
          {[
            { color: '#38bdf8', label: '< 1.0 m' },
            { color: '#22d3ee', label: '1.0–1.5 m' },
            { color: '#eab308', label: '1.5–2.0 m' },
            { color: '#f97316', label: '2.0–2.5 m' },
            { color: '#ef4444', label: '≥ 2.5 m ⚠' },
          ].map((l, i) => (
            <g key={l.label} transform={`translate(${i * 110}, 0)`}>
              <circle cx="6" cy="6" r="5" fill={l.color} fillOpacity="0.8" />
              <text x="14" y="10" fontSize="8" fill="#94a3b8" fontFamily="sans-serif">
                {l.label}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}
