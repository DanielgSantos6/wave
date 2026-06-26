// mockData.js
// Dados simulados que espelham exatamente o schema gerado pelo pipeline Python/PySpark.
// Substitua pelo carregamento real dos JSONs em backend/output/ via API ou import.

export const ranking = [
  { beach_name: "Fernando de Noronha", state: "PE", latitude: -3.85, longitude: -32.43, avg_wave_height: 2.8, max_wave_height: 4.1, avg_swell: 2.4, avg_current: 0.45, avg_period: 12.3, alert_hours: 8 },
  { beach_name: "Itacaré", state: "BA", latitude: -14.28, longitude: -38.99, avg_wave_height: 2.3, max_wave_height: 3.5, avg_swell: 2.0, avg_current: 0.38, avg_period: 10.8, alert_hours: 4 },
  { beach_name: "Garopaba", state: "SC", latitude: -28.03, longitude: -48.62, avg_wave_height: 2.1, max_wave_height: 3.2, avg_swell: 1.9, avg_current: 0.42, avg_period: 11.1, alert_hours: 3 },
  { beach_name: "Florianópolis", state: "SC", latitude: -27.60, longitude: -48.55, avg_wave_height: 1.9, max_wave_height: 2.8, avg_swell: 1.6, avg_current: 0.35, avg_period: 10.2, alert_hours: 2 },
  { beach_name: "Ubatuba", state: "SP", latitude: -23.43, longitude: -45.07, avg_wave_height: 1.7, max_wave_height: 2.6, avg_swell: 1.4, avg_current: 0.30, avg_period: 9.8, alert_hours: 1 },
  { beach_name: "Maresias", state: "SP", latitude: -23.77, longitude: -45.56, avg_wave_height: 1.6, max_wave_height: 2.5, avg_swell: 1.3, avg_current: 0.28, avg_period: 9.5, alert_hours: 1 },
  { beach_name: "Jericoacoara", state: "CE", latitude: -2.79, longitude: -40.51, avg_wave_height: 1.5, max_wave_height: 2.2, avg_swell: 1.2, avg_current: 0.55, avg_period: 8.9, alert_hours: 0 },
  { beach_name: "Cabo Frio", state: "RJ", latitude: -22.88, longitude: -42.02, avg_wave_height: 1.4, max_wave_height: 2.1, avg_swell: 1.1, avg_current: 0.25, avg_period: 9.1, alert_hours: 0 },
  { beach_name: "Búzios", state: "RJ", latitude: -22.75, longitude: -41.88, avg_wave_height: 1.3, max_wave_height: 2.0, avg_swell: 1.1, avg_current: 0.22, avg_period: 8.7, alert_hours: 0 },
  { beach_name: "Trancoso", state: "BA", latitude: -16.59, longitude: -39.09, avg_wave_height: 1.2, max_wave_height: 1.8, avg_swell: 1.0, avg_current: 0.20, avg_period: 8.5, alert_hours: 0 },
  { beach_name: "Porto de Galinhas", state: "PE", latitude: -8.70, longitude: -35.01, avg_wave_height: 1.1, max_wave_height: 1.7, avg_swell: 0.9, avg_current: 0.32, avg_period: 8.2, alert_hours: 0 },
  { beach_name: "Maragogi", state: "AL", latitude: -9.01, longitude: -35.22, avg_wave_height: 1.0, max_wave_height: 1.5, avg_swell: 0.8, avg_current: 0.28, avg_period: 8.0, alert_hours: 0 },
  { beach_name: "Torres", state: "RS", latitude: -29.33, longitude: -49.73, avg_wave_height: 1.8, max_wave_height: 2.9, avg_swell: 1.5, avg_current: 0.40, avg_period: 10.5, alert_hours: 2 },
  { beach_name: "Copacabana", state: "RJ", latitude: -22.97, longitude: -43.18, avg_wave_height: 1.2, max_wave_height: 1.9, avg_swell: 0.9, avg_current: 0.18, avg_period: 8.3, alert_hours: 0 },
  { beach_name: "Pipa", state: "RN", latitude: -6.23, longitude: -35.05, avg_wave_height: 1.3, max_wave_height: 2.0, avg_swell: 1.0, avg_current: 0.30, avg_period: 8.6, alert_hours: 0 },
  { beach_name: "Praia do Forte", state: "BA", latitude: -12.57, longitude: -37.99, avg_wave_height: 1.1, max_wave_height: 1.6, avg_swell: 0.9, avg_current: 0.25, avg_period: 8.1, alert_hours: 0 },
  { beach_name: "Camboriú", state: "SC", latitude: -26.99, longitude: -48.63, avg_wave_height: 1.4, max_wave_height: 2.2, avg_swell: 1.2, avg_current: 0.32, avg_period: 9.3, alert_hours: 0 },
  { beach_name: "Guarujá", state: "SP", latitude: -23.99, longitude: -46.26, avg_wave_height: 1.3, max_wave_height: 2.0, avg_swell: 1.1, avg_current: 0.26, avg_period: 9.0, alert_hours: 0 },
  { beach_name: "Ilhabela", state: "SP", latitude: -23.78, longitude: -45.36, avg_wave_height: 1.5, max_wave_height: 2.3, avg_swell: 1.3, avg_current: 0.29, avg_period: 9.6, alert_hours: 0 },
  { beach_name: "Salinópolis", state: "PA", latitude: -0.61, longitude: -47.35, avg_wave_height: 0.9, max_wave_height: 1.4, avg_swell: 0.7, avg_current: 0.60, avg_period: 7.5, alert_hours: 0 },
]

export const temporal = Array.from({ length: 72 }, (_, i) => {
  const d = new Date(Date.now() - (71 - i) * 3600 * 1000)
  const base = 1.5 + Math.sin(i / 8) * 0.6 + Math.random() * 0.3
  return {
    timestamp: d.toISOString(),
    avg_wave_height: +base.toFixed(2),
    max_wave_height: +(base + 0.8 + Math.random() * 0.5).toFixed(2),
    total_alerts: base > 2.5 ? Math.floor(Math.random() * 5) : 0,
  }
})

export const daily_stats = ranking.flatMap(b =>
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400 * 1000)
    const base = b.avg_wave_height * (0.8 + Math.random() * 0.4)
    return {
      beach_name: b.beach_name,
      state: b.state,
      latitude: b.latitude,
      longitude: b.longitude,
      date: d.toISOString().slice(0, 10),
      avg_wave_height: +base.toFixed(2),
      max_wave_height: +(base + 0.8).toFixed(2),
      min_wave_height: +(base - 0.4).toFixed(2),
      avg_swell: +(base * 0.85).toFixed(2),
      avg_current: b.avg_current,
      avg_period: b.avg_period,
      alert_hours: base > 2.5 ? Math.floor(Math.random() * 6) : 0,
    }
  })
)
