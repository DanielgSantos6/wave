# 🌊 Wave Monitor BR

Projeto de estudo — pipeline de dados marinhos (Python + PySpark) com dashboard React.

> **⚠️ Fins educacionais.** Não use para navegação ou segurança marítima.

---

## Estrutura

```
wave-monitor/
├── backend/
│   ├── fetch_data.py        # Coleta via Open-Meteo Marine API
│   ├── spark_pipeline.py    # Processamento PySpark (ou Pandas fallback)
│   ├── requirements.txt
│   ├── data/                # CSV bruto (gerado automaticamente)
│   └── output/              # JSON finais (gerados automaticamente)
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── AboutPage.jsx
│   │   │   └── DashboardPage.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── StatCard.jsx
│   │   │   └── BrazilHeatMap.jsx
│   │   └── data/
│   │       └── mockData.js   # Dados simulados (schema idêntico ao pipeline)
│   └── ...
└── run_pipeline.py          # Executor principal do pipeline
```

---

## Pré-requisitos

- Python 3.10+
- Node.js 18+
- Java 11+ (para PySpark — opcional; há fallback em Pandas)

---

## 1. Backend — Pipeline de Dados

```bash
cd wave-monitor

# Instalar dependências Python
pip install -r backend/requirements.txt

# Executar pipeline completo (coleta + processamento)
python run_pipeline.py
```

Os JSONs gerados ficam em `backend/output/`:
- `ranking.json` — praias ordenadas por altura de onda (24 h)
- `daily_stats.json` — agregação diária por praia
- `temporal.json` — evolução horária (média Brasil)

> **Sem PySpark instalado?** O pipeline detecta automaticamente e usa Pandas como fallback.

---

## 2. Frontend — React Dashboard

```bash
cd frontend
npm install
npm run dev
```

Acesse `http://localhost:5173`

### Páginas
| Rota | Descrição |
|------|-----------|
| `/` | Página de contexto (sobre o projeto) |
| `/dashboard` | Dashboard com mapa, gráficos e tabela |

### Conectar dados reais do pipeline
No dashboard, os dados vêm de `src/data/mockData.js` (simulados).
Para usar os JSONs reais do pipeline, edite `DashboardPage.jsx` e substitua os imports por:

```js
// Opção A: servir os JSONs com um servidor estático e fazer fetch
const res = await fetch('/output/ranking.json')
const ranking = await res.json()

// Opção B: copiar os JSONs gerados para frontend/public/output/
// e importar via fetch no useEffect
```

---

## Métricas cobertas

| Métrica | Fonte |
|---------|-------|
| Altura média das ondas | Open-Meteo `wave_height` |
| Altura máxima do dia | Agregação PySpark `max` |
| Direção/período das ondas | Open-Meteo `wave_direction`, `wave_period` |
| Swell (ondulação) | Open-Meteo `swell_wave_height` |
| Correntes oceânicas | Open-Meteo `ocean_current_velocity` |
| Alertas (≥ X metros) | Threshold configurável no dashboard |

---

## Fontes de dados

- [Open-Meteo Marine API](https://open-meteo.com/en/docs/marine-weather-api) — gratuita, sem chave
- [NOAA Buoy Data](https://www.ndbc.noaa.gov/) — histórico de boias
- [Marinha do Brasil](https://www.marinha.mil.br) — previsão oficial de marés
- [Copernicus Marine](https://marine.copernicus.eu/) — modelos oceânicos europeus

---

## Licença

MIT — Projeto acadêmico / estudo pessoal.
