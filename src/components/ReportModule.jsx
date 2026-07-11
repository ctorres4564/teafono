import React from 'react';
import { ArrowLeft, Printer, Calendar, User, FileText, CheckSquare, Sparkles } from 'lucide-react';

export default function ReportModule({ patient, assessmentId, onBack }) {
  const assessment = patient.history.find(h => h.id === assessmentId);

  if (!assessment) {
    return (
      <div className="glass-panel card" style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Exame não encontrado no histórico clínico do paciente.</p>
        <button className="btn btn-primary" onClick={onBack} style={{ marginTop: '1rem' }}>Voltar</button>
      </div>
    );
  }

  const { results, date } = assessment;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="assessment-container report-view" style={{ width: '100%' }}>
      {/* Header Buttons */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} /> Voltar ao Painel
        </button>
        <button className="btn btn-primary" onClick={handlePrint}>
          <Printer size={16} /> Imprimir Laudo de TEA
        </button>
      </div>

      {/* Report Sheet */}
      <div className="glass-panel" style={{ padding: '2.5rem', background: 'var(--panel-bg)' }}>
        
        {/* Header */}
        <div style={{ borderBottom: '2px solid var(--secondary-color)', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)' }}>
              Laudo Fonoaudiológico de TEA
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Avaliação de Linguagem, Pragmática e Processamento Alimentar • TeaFono
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end' }}>
              <Calendar size={14} /> Data: {new Date(date).toLocaleDateString('pt-BR')}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Método: Protocolos Integrados TEA
            </span>
          </div>
        </div>

        {/* Patient Meta Data */}
        <div style={{ margin: '2rem 0 1rem 0', padding: '1.25rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'rgba(255,255,255,0.01)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Nome da Criança</span>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '0.15rem' }}>{patient.name}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Data de Nascimento</span>
            <div style={{ fontWeight: 600, fontSize: '1.1rem', marginTop: '0.15rem' }}>
              {patient.birthDate ? new Date(patient.birthDate + 'T00:00:00').toLocaleDateString('pt-BR') : 'Não informada'}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Idade</span>
            <div style={{ fontWeight: 600, fontSize: '1.1rem', marginTop: '0.15rem' }}>{patient.age} anos</div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Gênero</span>
            <div style={{ fontWeight: 600, fontSize: '1.1rem', marginTop: '0.15rem' }}>{patient.gender}</div>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Hipótese Diagnóstica</span>
            <div style={{ fontWeight: 600, fontSize: '1.1rem', marginTop: '0.15rem' }}>{patient.diagnosis || "TEA / Atraso de Linguagem"}</div>
          </div>
        </div>

        {patient.speechComplaint && (
          <div style={{ marginBottom: '2rem', padding: '1.25rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'rgba(255,255,255,0.01)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Queixa Fonoaudiológica</span>
            <div style={{ fontWeight: 500, fontSize: '1rem', marginTop: '0.25rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{patient.speechComplaint}</div>
          </div>
        )}

        {/* Results Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          {/* 1. M-CHAT Rastreio */}
          {results.mchat && (
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-color)', marginBottom: '0.75rem' }}>
                1. Rastreio de Sinais Precoces (M-CHAT-R/F)
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginTop: '0.5rem' }}>
                <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Classificação de Risco</div>
                  <div style={{ fontWeight: 800, fontSize: '1.35rem', color: results.mchat.score >= 8 ? 'var(--danger-color)' : results.mchat.score >= 3 ? 'var(--warning-color)' : 'var(--success-color)', marginTop: '0.25rem' }}>
                    {results.mchat.risk}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Escore: <strong>{results.mchat.score} / 20 falhas</strong></div>
                </div>
                <div>
                  <p><strong>Direcionamento Clínico e Recomendação:</strong></p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem', lineHeight: '1.5' }}>
                    {results.mchat.recommendation}
                  </p>
                </div>
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.75rem', fontStyle: 'italic' }}>
                Referência Científica: Robins, D. L., Fein, D., & Barton, M. L. (2009). Modified Checklist for Autism in Toddlers, Revised (M-CHAT-R/F). Direitos autorais reservados aos autores. Tradução oficial autorizada para o português.
              </div>
            </div>
          )}

          {/* 2. Pragmática e Comunicação */}
          {results.pragmatics && (
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--secondary-color)', marginBottom: '0.75rem' }}>
                2. Perfil Funcional da Comunicação e Pragmática (Fernandes)
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', alignItems: 'center' }}>
                <div>
                  <p><strong>Descrição de Atos e Frequência de Comunicação:</strong></p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem', lineHeight: '1.5' }}>
                    O paciente apresentou um total de <strong>{results.pragmatics.totalActs} atos comunicativos</strong> direcionados ao terapeuta em um período de <strong>{results.pragmatics.durationMin} minutos</strong> de observação livre.
                    A frequência calculada foi de <strong>{results.pragmatics.ratePerMinute} atos por minuto</strong>.
                  </p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                    Meio de comunicação dominante: <strong>{results.pragmatics.predominantMean}</strong>.
                  </p>
                </div>

                <div className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.01)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>DISTRIBUIÇÃO DOS MEIOS</span>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                        <span>Meio Verbal (Palavras)</span>
                        <strong>{results.pragmatics.means.verbal.percent}%</strong>
                      </div>
                      <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${results.pragmatics.means.verbal.percent}%`, background: 'var(--success-color)', height: '100%' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                        <span>Meio Vocal (Sons/Balbucios)</span>
                        <strong>{results.pragmatics.means.vocal.percent}%</strong>
                      </div>
                      <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${results.pragmatics.means.vocal.percent}%`, background: 'var(--warning-color)', height: '100%' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                        <span>Meio Gestual (Não-Verbal)</span>
                        <strong>{results.pragmatics.means.gestual.percent}%</strong>
                      </div>
                      <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${results.pragmatics.means.gestual.percent}%`, background: 'var(--primary-color)', height: '100%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.75rem', fontStyle: 'italic' }}>
                Referência Científica: Fernandes, F. D. M. (2004). Perfil Funcional da Comunicação e Pragmática no Transtorno do Espectro Autista. Instrumento de análise qualitativa e quantitativa dos meios e atos de comunicação.
              </div>
            </div>
          )}

          {/* 3. Seletividade Alimentar BAMBI */}
          {results.bambi && (
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-color)', marginBottom: '0.75rem' }}>
                3. Seletividade Alimentar e Comportamento Sensorial (BAMBI)
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginTop: '0.5rem' }}>
                <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status de Seletividade</div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--warning-color)', marginTop: '0.25rem' }}>
                    {results.bambi.severity}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Escore: <strong>{results.bambi.score} / 90 pontos</strong></div>
                </div>
                <div>
                  <p><strong>Implicações Fonoaudiológicas Orofaciais:</strong></p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem', lineHeight: '1.5' }}>
                    Comportamentos de recusa ou rigidez alimentar no autismo frequentemente decorrem de hipersensibilidades a texturas, cheiros ou marcas. Indica-se intervenção integrando dessensibilização sistemática intraoral com Terapia Ocupacional e Nutrição, fortalecendo paralelamente a musculatura mastigatória (masseter/temporal) muitas vezes hipotônica devido à restrição a alimentos pastosos/macios.
                  </p>
                </div>
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.75rem', fontStyle: 'italic' }}>
                Referência Científica: Lukens, C. T., & Linscheid, T. R. (2005). Brief Autism Mealtime Behavior Inventory (BAMBI). Inventário clínico de mapeamento de recusa e seletividade alimentar sensorial no autismo.
              </div>
            </div>
          )}

          {/* 4. Diretrizes para Escola e Família */}
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} className="text-primary" /> Orientações e Condutas Recomendadas
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '0.5rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <strong style={{ fontSize: '0.9rem', color: 'var(--primary-color)' }}>Estratégias para Sala de Aula:</strong>
                <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '1.25rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <li>Uso de rotinas visuais e quadros de atividades em imagens claras (PECS).</li>
                  <li>Evitar comandos verbais longos. Dividir tarefas em passos únicos.</li>
                  <li>Oferecer abafadores de ouvido caso a criança apresente reações a ruídos.</li>
                  <li>Permitir o uso de prancha de Comunicação Alternativa (CAA) digital.</li>
                </ul>
              </div>
              
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <strong style={{ fontSize: '0.9rem', color: 'var(--secondary-color)' }}>Estratégias para Estimulação Domiciliar:</strong>
                <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '1.25rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <li>Narrar em voz alta ações simples do dia a dia da criança, fornecendo modelos.</li>
                  <li>Posicionar-se sempre na altura dos olhos da criança ao dar comandos verbais.</li>
                  <li>Na seletividade, expor alimentos novos sem pressionar a criança a comê-los inicialmente (estimulação tátil e olfativa livre).</li>
                  <li>Dedicar 15 minutos diários de brincadeira guiada pela criança (modelo Denver).</li>
                </ul>
              </div>
            </div>
          </div>

        </div>

        {/* Signatures */}
        <div style={{ marginTop: '4rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ height: '50px' }} />
            <div style={{ width: '200px', borderTop: '1px solid var(--text-secondary)', margin: '0 auto', marginBottom: '0.25rem' }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Assinatura do Paciente / Responsável</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ height: '50px' }} />
            <div style={{ width: '200px', borderTop: '1px solid var(--text-secondary)', margin: '0 auto', marginBottom: '0.25rem' }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Fonoaudiólogo(a) Responsável</span>
          </div>
        </div>

      </div>
    </div>
  );
}
