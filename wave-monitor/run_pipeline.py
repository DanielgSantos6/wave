"""
run_pipeline.py
Executa o pipeline completo: coleta → processamento → exportação JSON.
"""

import subprocess
import sys
import os

def main():
    base = os.path.dirname(__file__)

    print("\n[1/2] Coletando dados da API Open-Meteo Marine...")
    result = subprocess.run(
        [sys.executable, os.path.join(base, "backend", "fetch_data.py")],
        capture_output=False,
    )
    if result.returncode != 0:
        print("[ERRO] Falha na coleta. Verifique sua conexão com a internet.")
        sys.exit(1)

    print("\n[2/2] Processando com PySpark / Pandas...")
    result = subprocess.run(
        [sys.executable, os.path.join(base, "backend", "spark_pipeline.py")],
        capture_output=False,
    )
    if result.returncode != 0:
        print("[ERRO] Falha no pipeline.")
        sys.exit(1)

    print("\n✅  Pipeline concluído! Dados em backend/output/")
    print("   → ranking.json")
    print("   → daily_stats.json")
    print("   → temporal.json")
    print("\nAgora rode o frontend React:")
    print("   cd frontend && npm install && npm run dev")


if __name__ == "__main__":
    main()
