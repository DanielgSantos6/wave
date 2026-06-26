import { Waves, Info, BookOpen, Database, Code2, AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'

const Section = ({ icon: Icon, title, children }) => (
  <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
    <div className="flex items-center gap-2 mb-3">
      <Icon size={18} className="text-cyan-400" />
      <h2 className="text-base font-semibold text-white">{title}</h2>
    </div>
    <div className="text-slate-400 text-sm leading-relaxed space-y-2">{children}</div>
  </div>
)

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      {/* Hero */}
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="bg-cyan-600/20 border border-cyan-600/40 rounded-full p-4">
            <Waves size={36} className="text-cyan-400" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white">Wave Monitor BR</h1>
        <p className="text-slate-400 max-w-xl mx-auto">
          Monitoramento de ondas, marés e condições oceânicas no litoral brasileiro.
        </p>
      </div>

      {/* Aviso */}
      <div className="bg-amber-900/30 border border-amber-600/50 rounded-xl p-4 flex gap-3">
        <AlertTriangle className="text-amber-400 shrink-0 mt-0.5" size={18} />
        <p className="text-amber-300 text-sm">
          <strong>Projeto de estudo.</strong> Os dados exibidos têm finalidade exclusivamente educacional e informativa.
          Não utilize este sistema para tomada de decisões de segurança marítima. Consulte sempre a{' '}
          <a
            href="https://www.marinha.mil.br"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-white"
          >
            Marinha do Brasil
          </a>{' '}
          para informações oficiais.
        </p>
      </div>

      <Section icon={Info} title="Sobre o Projeto">
        <p>
          O Wave Monitor BR é um projeto acadêmico que demonstra um pipeline de engenharia de dados
          aplicado ao monitoramento oceânico costeiro. O objetivo é coletar, processar e visualizar
          dados de ondas e correntes de principais praias brasileiras, servindo como ferramenta de
          aprendizado de tecnologias como Python, PySpark e visualização de dados.
        </p>
        <p>
          O projeto foi desenvolvido para estudantes e entusiastas de engenharia de dados que desejam
          entender como construir pipelines de dados reais com fontes abertas.
        </p>
      </Section>

      <Section icon={Database} title="Fontes de Dados">
        <ul className="space-y-1 list-none">
          {[
            ['Open-Meteo Marine API', 'API gratuita com dados de ondas, correnteza e swells globais em tempo quase real.'],
            ['NOAA', 'National Oceanic and Atmospheric Administration — boias oceânicas e dados históricos.'],
            ['Marinha do Brasil', 'Dados oficiais de previsão de marés e avisos meteorológicos costeiros.'],
            ['Copernicus Marine Service', 'Dados de modelos oceânicos europeus de alta resolução.'],
          ].map(([src, desc]) => (
            <li key={src} className="flex gap-2">
              <span className="text-cyan-400 font-medium w-48 shrink-0">{src}</span>
              <span>{desc}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section icon={Code2} title="Tecnologias Utilizadas">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            ['Python', 'Coleta e orquestração'],
            ['PySpark', 'Processamento distribuído'],
            ['Pandas', 'Fallback e análise'],
            ['Open-Meteo API', 'Fonte de dados marinhos'],
            ['React + Vite', 'Frontend SPA'],
            ['Tailwind CSS', 'Estilização'],
            ['Recharts', 'Gráficos interativos'],
            ['CSV / Parquet', 'Data Lake local'],
          ].map(([tech, desc]) => (
            <div key={tech} className="bg-slate-700/50 rounded-lg p-3">
              <div className="text-cyan-400 font-medium text-xs">{tech}</div>
              <div className="text-slate-400 text-xs mt-0.5">{desc}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section icon={BookOpen} title="Pipeline de Dados">
        <div className="font-mono text-xs bg-slate-900 rounded-lg p-4 space-y-1 text-cyan-300">
          <div>Open-Meteo Marine API</div>
          <div className="text-slate-500">        ↓</div>
          <div>fetch_data.py <span className="text-slate-500">(coleta + CSV bruto)</span></div>
          <div className="text-slate-500">        ↓</div>
          <div>Data Lake <span className="text-slate-500">(CSV / Parquet local)</span></div>
          <div className="text-slate-500">        ↓</div>
          <div>spark_pipeline.py <span className="text-slate-500">(limpeza + agregações)</span></div>
          <div className="text-slate-500">        ↓</div>
          <div>JSON <span className="text-slate-500">(ranking, temporal, diário)</span></div>
          <div className="text-slate-500">        ↓</div>
          <div>React Dashboard <span className="text-slate-500">(mapa + gráficos)</span></div>
        </div>
      </Section>

      <div className="text-center">
        <Link
          to="/dashboard"
          className="inline-block bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Ver Dashboard →
        </Link>
      </div>
    </div>
  )
}
