"""
fetch_data.py
Coleta dados marinhos da Open-Meteo Marine API para praias brasileiras.
Os dados são salvos como CSV no data lake local.
"""

import requests
import pandas as pd
import json
from datetime import datetime, timedelta
import os

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Principais praias/regiões costeiras do Brasil
BEACHES = [
    {"name": "Fernando de Noronha", "state": "PE", "lat": -3.85, "lon": -32.43},
    {"name": "Jericoacoara", "state": "CE", "lat": -2.79, "lon": -40.51},
    {"name": "Pipa", "state": "RN", "lat": -6.23, "lon": -35.05},
    {"name": "Porto de Galinhas", "state": "PE", "lat": -8.70, "lon": -35.01},
    {"name": "Maragogi", "state": "AL", "lat": -9.01, "lon": -35.22},
    {"name": "Praia do Forte", "state": "BA", "lat": -12.57, "lon": -37.99},
    {"name": "Itacaré", "state": "BA", "lat": -14.28, "lon": -38.99},
    {"name": "Arraial d'Ajuda", "state": "BA", "lat": -16.45, "lon": -39.07},
    {"name": "Trancoso", "state": "BA", "lat": -16.59, "lon": -39.09},
    {"name": "Guarapari", "state": "ES", "lat": -20.67, "lon": -40.50},
    {"name": "Cabo Frio", "state": "RJ", "lat": -22.88, "lon": -42.02},
    {"name": "Búzios", "state": "RJ", "lat": -22.75, "lon": -41.88},
    {"name": "Copacabana", "state": "RJ", "lat": -22.97, "lon": -43.18},
    {"name": "Barra da Tijuca", "state": "RJ", "lat": -23.01, "lon": -43.37},
    {"name": "Ubatuba", "state": "SP", "lat": -23.43, "lon": -45.07},
    {"name": "Maresias", "state": "SP", "lat": -23.77, "lon": -45.56},
    {"name": "Ilhabela", "state": "SP", "lat": -23.78, "lon": -45.36},
    {"name": "Guarujá", "state": "SP", "lat": -23.99, "lon": -46.26},
    {"name": "Camboriú", "state": "SC", "lat": -26.99, "lon": -48.63},
    {"name": "Florianópolis", "state": "SC", "lat": -27.60, "lon": -48.55},
    {"name": "Garopaba", "state": "SC", "lat": -28.03, "lon": -48.62},
    {"name": "Torres", "state": "RS", "lat": -29.33, "lon": -49.73},
    {"name": "Tramandaí", "state": "RS", "lat": -30.00, "lon": -50.13},
    {"name": "Alter do Chão", "state": "PA", "lat": -2.52, "lon": -55.00},
    {"name": "Salinópolis", "state": "PA", "lat": -0.61, "lon": -47.35},
]

BASE_URL = "https://marine-api.open-meteo.com/v1/marine"

PARAMS = [
    "wave_height",
    "wave_direction",
    "wave_period",
    "wind_wave_height",
    "swell_wave_height",
    "swell_wave_direction",
    "swell_wave_period",
    "ocean_current_velocity",
    "ocean_current_direction",
]


def fetch_beach_data(beach: dict, days_back: int = 7) -> pd.DataFrame | None:
    end_date = datetime.utcnow().date()
    start_date = end_date - timedelta(days=days_back)

    params = {
        "latitude": beach["lat"],
        "longitude": beach["lon"],
        "hourly": ",".join(PARAMS),
        "start_date": str(start_date),
        "end_date": str(end_date),
        "timezone": "America/Sao_Paulo",
    }

    try:
        resp = requests.get(BASE_URL, params=params, timeout=15)
        resp.raise_for_status()
        raw = resp.json()
    except Exception as e:
        print(f"  [ERRO] {beach['name']}: {e}")
        return None

    hourly = raw.get("hourly", {})
    times = hourly.get("time", [])
    if not times:
        return None

    df = pd.DataFrame({"timestamp": pd.to_datetime(times)})
    for col in PARAMS:
        df[col] = hourly.get(col, [None] * len(times))

    df["beach_name"] = beach["name"]
    df["state"] = beach["state"]
    df["latitude"] = beach["lat"]
    df["longitude"] = beach["lon"]
    df["fetched_at"] = datetime.utcnow().isoformat()

    return df


def fetch_noaa_water_temp(beach: dict) -> float | None:
    """
    Tenta buscar temperatura da água via Open-Meteo (marine SST não disponível
    no endpoint gratuito; retorna None para ser preenchido no pipeline).
    """
    return None


def run():
    print("=" * 60)
    print("Iniciando coleta de dados marinhos — Open-Meteo Marine API")
    print("=" * 60)

    all_frames = []
    for beach in BEACHES:
        print(f"  Coletando: {beach['name']} ({beach['state']})")
        df = fetch_beach_data(beach)
        if df is not None:
            all_frames.append(df)

    if not all_frames:
        print("[AVISO] Nenhum dado coletado.")
        return

    combined = pd.concat(all_frames, ignore_index=True)

    # Salva CSV bruto
    raw_path = os.path.join(OUTPUT_DIR, "raw_marine_data.csv")
    combined.to_csv(raw_path, index=False)
    print(f"\n[OK] Dados brutos salvos em: {raw_path}")
    print(f"     Total de registros: {len(combined):,}")

    # Resumo por praia (últimas 24 h)
    last_24h = combined[combined["timestamp"] >= pd.Timestamp.now() - pd.Timedelta(hours=24)]
    summary = (
        last_24h.groupby(["beach_name", "state", "latitude", "longitude"])
        .agg(
            avg_wave_height=("wave_height", "mean"),
            max_wave_height=("wave_height", "max"),
            avg_swell_height=("swell_wave_height", "mean"),
            avg_current_velocity=("ocean_current_velocity", "mean"),
        )
        .reset_index()
        .round(2)
    )
    summary_path = os.path.join(OUTPUT_DIR, "beach_summary_24h.csv")
    summary.to_csv(summary_path, index=False)
    print(f"[OK] Resumo 24 h salvo em: {summary_path}")

    # Metadata
    meta = {
        "source": "Open-Meteo Marine API",
        "beaches_count": len(BEACHES),
        "records_total": len(combined),
        "fetched_at": datetime.utcnow().isoformat(),
        "date_range": {
            "start": str(combined["timestamp"].min()),
            "end": str(combined["timestamp"].max()),
        },
    }
    with open(os.path.join(OUTPUT_DIR, "metadata.json"), "w") as f:
        json.dump(meta, f, indent=2)

    print("[OK] Coleta concluída com sucesso!")


if __name__ == "__main__":
    run()
