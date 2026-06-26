"""
spark_pipeline.py
Pipeline PySpark para processar os dados marinhos coletados.
Realiza limpeza, agregações e geração dos arquivos finais (Parquet + JSON).
"""

import os
import json
from datetime import datetime

try:
    from pyspark.sql import SparkSession
    from pyspark.sql import functions as F
    from pyspark.sql.types import (
        StructType, StructField, StringType, DoubleType, TimestampType
    )
    from pyspark.sql.window import Window
    PYSPARK_AVAILABLE = True
except ImportError:
    PYSPARK_AVAILABLE = False
    print("[AVISO] PySpark não encontrado. Executando pipeline em modo pandas (fallback).")
    import pandas as pd

BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, "data")
OUTPUT_DIR = os.path.join(BASE_DIR, "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)

ALERT_THRESHOLD_M = 2.5  # metros


# ─────────────────────────────────────────────
#  PIPELINE PYSPARK
# ─────────────────────────────────────────────
def run_spark():
    spark = (
        SparkSession.builder
        .appName("WaveMonitor-BR")
        .config("spark.sql.session.timeZone", "America/Sao_Paulo")
        .config("spark.driver.memory", "2g")
        .getOrCreate()
    )
    spark.sparkContext.setLogLevel("WARN")
    print("[Spark] Sessão iniciada.")

    raw_path = os.path.join(DATA_DIR, "raw_marine_data.csv")
    df = spark.read.csv(raw_path, header=True, inferSchema=True)
    print(f"[Spark] Registros lidos: {df.count():,}")

    # ── Limpeza ──────────────────────────────
    df = df.withColumn("timestamp", F.to_timestamp("timestamp"))
    numeric_cols = [
        "wave_height", "wave_direction", "wave_period",
        "wind_wave_height", "swell_wave_height", "swell_wave_direction",
        "swell_wave_period", "ocean_current_velocity", "ocean_current_direction"
    ]
    for col in numeric_cols:
        df = df.withColumn(col, F.col(col).cast(DoubleType()))

    df = df.dropna(subset=["wave_height", "timestamp", "beach_name"])
    df = df.filter(F.col("wave_height") >= 0)

    # ── Campos derivados ──────────────────────
    df = df.withColumn("date", F.to_date("timestamp"))
    df = df.withColumn("hour", F.hour("timestamp"))
    df = df.withColumn("alert", F.when(F.col("wave_height") >= ALERT_THRESHOLD_M, True).otherwise(False))

    # ── Agregação diária por praia ─────────────
    daily = (
        df.groupBy("beach_name", "state", "latitude", "longitude", "date")
        .agg(
            F.round(F.avg("wave_height"), 2).alias("avg_wave_height"),
            F.round(F.max("wave_height"), 2).alias("max_wave_height"),
            F.round(F.min("wave_height"), 2).alias("min_wave_height"),
            F.round(F.avg("swell_wave_height"), 2).alias("avg_swell"),
            F.round(F.avg("ocean_current_velocity"), 2).alias("avg_current"),
            F.round(F.avg("wave_period"), 2).alias("avg_period"),
            F.sum(F.col("alert").cast("int")).alias("alert_hours"),
        )
        .orderBy("date", "beach_name")
    )

    # ── Ranking por ondas (últimas 24 h) ──────
    last_24h = df.filter(F.col("timestamp") >= F.date_sub(F.current_date(), 1))
    ranking = (
        last_24h.groupBy("beach_name", "state", "latitude", "longitude")
        .agg(
            F.round(F.avg("wave_height"), 2).alias("avg_wave_height"),
            F.round(F.max("wave_height"), 2).alias("max_wave_height"),
            F.round(F.avg("swell_wave_height"), 2).alias("avg_swell"),
            F.round(F.avg("ocean_current_velocity"), 2).alias("avg_current"),
            F.round(F.avg("wave_period"), 2).alias("avg_period"),
            F.sum(F.col("alert").cast("int")).alias("alert_hours"),
        )
        .orderBy(F.desc("avg_wave_height"))
    )

    # ── Evolução temporal (média BR a cada hora) ─
    temporal = (
        df.groupBy("timestamp")
        .agg(
            F.round(F.avg("wave_height"), 2).alias("avg_wave_height"),
            F.round(F.max("wave_height"), 2).alias("max_wave_height"),
            F.sum(F.col("alert").cast("int")).alias("total_alerts"),
        )
        .orderBy("timestamp")
    )

    # ── Salva Parquet ──────────────────────────
    daily.write.mode("overwrite").parquet(os.path.join(OUTPUT_DIR, "daily_stats.parquet"))
    ranking.write.mode("overwrite").parquet(os.path.join(OUTPUT_DIR, "ranking.parquet"))
    temporal.write.mode("overwrite").parquet(os.path.join(OUTPUT_DIR, "temporal.parquet"))
    print("[Spark] Parquet gerado.")

    # ── Salva JSON para o frontend ─────────────
    _save_json(ranking.toPandas(), "ranking.json")
    _save_json(daily.toPandas(), "daily_stats.json")
    _save_json(temporal.toPandas(), "temporal.json")

    spark.stop()
    print("[Spark] Pipeline concluído.")


# ─────────────────────────────────────────────
#  FALLBACK PANDAS (sem PySpark instalado)
# ─────────────────────────────────────────────
def run_pandas():
    import pandas as pd

    raw_path = os.path.join(DATA_DIR, "raw_marine_data.csv")
    df = pd.read_csv(raw_path, parse_dates=["timestamp"])

    numeric_cols = [
        "wave_height", "wave_direction", "wave_period",
        "wind_wave_height", "swell_wave_height", "swell_wave_direction",
        "swell_wave_period", "ocean_current_velocity", "ocean_current_direction"
    ]
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    df = df.dropna(subset=["wave_height", "timestamp", "beach_name"])
    df = df[df["wave_height"] >= 0]
    df["date"] = df["timestamp"].dt.date
    df["alert"] = df["wave_height"] >= ALERT_THRESHOLD_M

    daily = (
        df.groupby(["beach_name", "state", "latitude", "longitude", "date"])
        .agg(
            avg_wave_height=("wave_height", "mean"),
            max_wave_height=("wave_height", "max"),
            min_wave_height=("wave_height", "min"),
            avg_swell=("swell_wave_height", "mean"),
            avg_current=("ocean_current_velocity", "mean"),
            avg_period=("wave_period", "mean"),
            alert_hours=("alert", "sum"),
        )
        .round(2)
        .reset_index()
    )
    daily["date"] = daily["date"].astype(str)

    last_24h = df[df["timestamp"] >= pd.Timestamp.now() - pd.Timedelta(hours=24)]
    ranking = (
        last_24h.groupby(["beach_name", "state", "latitude", "longitude"])
        .agg(
            avg_wave_height=("wave_height", "mean"),
            max_wave_height=("wave_height", "max"),
            avg_swell=("swell_wave_height", "mean"),
            avg_current=("ocean_current_velocity", "mean"),
            avg_period=("wave_period", "mean"),
            alert_hours=("alert", "sum"),
        )
        .round(2)
        .reset_index()
        .sort_values("avg_wave_height", ascending=False)
    )

    temporal = (
        df.groupby("timestamp")
        .agg(
            avg_wave_height=("wave_height", "mean"),
            max_wave_height=("wave_height", "max"),
            total_alerts=("alert", "sum"),
        )
        .round(2)
        .reset_index()
        .sort_values("timestamp")
    )
    temporal["timestamp"] = temporal["timestamp"].astype(str)

    _save_json(ranking, "ranking.json")
    _save_json(daily, "daily_stats.json")
    _save_json(temporal, "temporal.json")
    print("[Pandas] Pipeline concluído (modo fallback).")


def _save_json(df, filename):
    import pandas as pd
    path = os.path.join(OUTPUT_DIR, filename)
    if hasattr(df, "to_dict"):  # pandas DataFrame
        records = df.where(pd.notnull(df), None).to_dict(orient="records")
    else:
        records = df
    with open(path, "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, default=str)
    print(f"[OK] {filename} → {path} ({len(records)} registros)")


def run():
    print("=" * 60)
    print("Pipeline PySpark — Wave Monitor BR")
    print("=" * 60)
    if PYSPARK_AVAILABLE:
        run_spark()
    else:
        run_pandas()


if __name__ == "__main__":
    run()
