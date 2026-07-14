import React, { useState } from 'react';
import { ArrowLeft, Printer, Calendar, FileDown, Brain, Loader } from 'lucide-react';
import { generatePts } from '../utils/geminiPtsGenerator';

export default function ReportModule({ patient, assessmentId, therapistSettings, onBack }) {
  const assessment = patient.history.find(h => h.id === assessmentId);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showPtsModal, setShowPtsModal] = useState(false);
  const [ptsData, setPtsData] = useState(null);
  const [ptsLoading, setPtsLoading] = useState(false);
  const [ptsError, setPtsError] = useState('');

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

  const handleExportPdf = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      
      let y = 20;
      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const ensurePdfSpace = (requiredHeight) => {
        if (y + requiredHeight > pageHeight - 25) {
          doc.addPage();
          y = 20;
        }
      };
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('Relatorio de Apoio Clinico', margin, y);
      y += 10;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('TeaFono - Registro estruturado e resumo descritivo', margin, y);
      y += 6;
      doc.text(`Data: ${new Date(date).toLocaleDateString('pt-BR')}`, margin, y);
      y += 12;
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Dados do Paciente', margin, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Nome: ${patient.name}`, margin, y); y += 6;
      doc.text(`Idade: ${patient.age} anos  |  Genero: ${patient.gender}`, margin, y); y += 6;
      if (patient.diagnosis) {
        doc.text(`Informacao clinica registrada pela profissional: ${patient.diagnosis}`, margin, y); y += 6;
      }
      doc.text('O TeaFono nao realiza diagnostico ou recomendacao automatica.', margin, y); y += 10;
      
      if (results.mchat) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('1. Rastreio M-CHAT-R/F', margin, y); y += 7;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Classificacao: ${results.mchat.risk}  |  Score: ${results.mchat.score}/20`, margin, y); y += 6;
        
        doc.text('Resultado do protocolo, sujeito a revisao profissional.', margin, y); y += 8;
      }
      
      if (results.pragmatics) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('2. Perfil Pragmatico (Fernandes)', margin, y); y += 7;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Atos: ${results.pragmatics.totalActs}  |  Frequencia: ${results.pragmatics.ratePerMinute}/min`, margin, y); y += 6;
        doc.text(`Meio Predominante: ${results.pragmatics.predominantMean}`, margin, y); y += 6;
        doc.text(`Verbal: ${results.pragmatics.means.verbal.percent}% | Vocal: ${results.pragmatics.means.vocal.percent}% | Gestual: ${results.pragmatics.means.gestual.percent}%`, margin, y); y += 10;
      }
      
      if (results.bambi) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('3. Seletividade Alimentar (BAMBI)', margin, y); y += 7;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Severidade: ${results.bambi.severity}  |  Score: ${results.bambi.score}/90`, margin, y); y += 15;
      }

      if (results.vocabulary) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('4. Vocabulario', margin, y); y += 7;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Total de respostas: ${results.vocabulary.summary?.total || 0}  |  Corretas: ${results.vocabulary.summary?.correct || 0}`, margin, y); y += 15;
      }

      if (results.fluency_verbal) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('5. Fluencia Semantica - Evocacao Lexical', margin, y); y += 7;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(
          `Registros: ${results.fluency_verbal.objectiveSummary?.recordedResponses ?? results.fluency_verbal.summary?.totalWords ?? 0}  |  Validas: ${results.fluency_verbal.objectiveSummary?.validResponses ?? results.fluency_verbal.summary?.uniqueWords ?? 0}`,
          margin,
          y
        ); y += 6;
        doc.text('Registro autoral de apoio clinico em teste de campo.', margin, y); y += 6;

        const criteria = results.fluency_verbal.clinicalCriteria || [];
        if (criteria.length > 0) {
          doc.text('Criterios registrados pela profissional:', margin, y); y += 5;
          criteria.forEach((criterion, index) => {
            const lines = doc.splitTextToSize(`${index + 1}. ${criterion.description} | Evidencia: ${criterion.supportingEvidence}`, pageWidth - margin * 2);
            ensurePdfSpace(lines.length * 5 + 7);
            doc.text(lines, margin, y);
            y += lines.length * 5 + 2;
          });
        }

        const actions = results.fluency_verbal.plannedActions || [];
        if (actions.length > 0) {
          doc.text('Acoes formuladas pela profissional:', margin, y); y += 5;
          actions.forEach((action, index) => {
            const lines = doc.splitTextToSize(`${index + 1}. ${action.objective}: ${action.description} | Justificativa: ${action.rationale}`, pageWidth - margin * 2);
            ensurePdfSpace(lines.length * 5 + 7);
            doc.text(lines, margin, y);
            y += lines.length * 5 + 2;
          });
        }
        y += 8;
      }

      if (results.fluency_speech) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('6. Fluencia da Fala', margin, y); y += 7;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Total de descontinuidades: ${results.fluency_speech.summary?.totalDisfluencies || 0}  |  Taxa: ${results.fluency_speech.summary?.ratePerMinute || 0}/min`, margin, y); y += 15;
      }

      if (results.phonology) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('7. Avaliacao Fonologica (PCC-R)', margin, y); y += 7;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`PCC-R: ${results.phonology.pccr?.percentage || 0}%  |  Classificacao: ${results.phonology.pccr?.classification || 'N/A'}`, margin, y); y += 15;
      }
      
      if (therapistSettings?.name || therapistSettings?.crfa) {
        if (y > pageHeight - 55) doc.addPage();
        y = pageHeight - 40;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('Fonoaudiologo(a) Responsavel', margin, y); y += 7;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        if (therapistSettings.name) {
          doc.text(therapistSettings.name, margin, y); y += 5;
        }
        if (therapistSettings.crfa) {
          doc.text(therapistSettings.crfa, margin, y); y += 5;
        }
        if (therapistSettings.clinicName) {
          doc.text(therapistSettings.clinicName, margin, y);
        }
      }
      
      doc.save(`registro_apoio_clinico_${patient.name.replace(/\s+/g, '_')}_${new Date(date).toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      alert('Erro ao gerar PDF. Tente novamente.');
    }
  };

  const handleConsentConfirm = async () => {
    setShowConsentModal(false);
    setShowPtsModal(true);
    setPtsLoading(true);
    setPtsError('');
    setPtsData(null);

    try {
      const data = await generatePts(patient, results, { useGemini: true });
      setPtsData(data);
    } catch (err) {
      console.error('Erro ao gerar apoio com IA:', err);
      setPtsError('Não foi possível gerar o rascunho de apoio.');
    } finally {
      setPtsLoading(false);
    }
  };

  const handleConsentCancel = () => {
    setShowConsentModal(false);
  };

  const getRiskColor = (risk) => {
    if (!risk) return 'var(--text-secondary)';
    if (risk.includes('Alto')) return 'var(--danger-color)';
    if (risk.includes('Médio')) return 'var(--warning-color)';
    return 'var(--success-color)';
  };

  return (
    <div className="assessment-container report-view" style={{ width: '100%' }}>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} /> Voltar ao Painel
        </button>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={handleExportPdf}>
            <FileDown size={16} /> Exportar PDF
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={16} /> Imprimir
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2.5rem', background: 'var(--panel-bg)' }}>
        
        <div style={{ borderBottom: '2px solid var(--secondary-color)', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)' }}>
              Relatório de Apoio Clínico
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Registro estruturado, resumo descritivo e conteúdo profissional • TeaFono
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end' }}>
              <Calendar size={14} /> Data: {new Date(date).toLocaleDateString('pt-BR')}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Finalidade: apoio ao registro e à formulação profissional
            </span>
          </div>
        </div>

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
          {patient.diagnosis && (
            <div style={{ gridColumn: 'span 2' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Informação clínica registrada pela profissional</span>
              <div style={{ fontWeight: 600, fontSize: '1.1rem', marginTop: '0.15rem' }}>{patient.diagnosis}</div>
            </div>
          )}
        </div>

        <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #10b981', borderRadius: '10px', color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
          O TeaFono organiza registros e cálculos descritivos. Não realiza diagnóstico, classificação normativa ou recomendação automática. Critérios, sínteses e ações são de autoria e responsabilidade da profissional identificada.
        </div>

        {patient.speechComplaint && (
          <div style={{ marginBottom: '2rem', padding: '1.25rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'rgba(255,255,255,0.01)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Queixa Fonoaudiológica</span>
            <div style={{ fontWeight: 500, fontSize: '1rem', marginTop: '0.25rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{patient.speechComplaint}</div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          {results.mchat && (
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-color)', marginBottom: '0.75rem' }}>
                1. Rastreio de Sinais Precoces (M-CHAT-R/F)
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginTop: '0.5rem' }}>
                <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Classificação de Risco</div>
                  <div style={{ fontWeight: 800, fontSize: '1.35rem', color: getRiskColor(results.mchat.risk), marginTop: '0.25rem' }}>
                    {results.mchat.risk}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Escore: <strong>{results.mchat.score} / 20 falhas</strong></div>
                  {results.mchat.followUpCompleted !== undefined && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                      Follow-Up: {results.mchat.followUpCompleted ? 'Aplicado' : 'Não aplicado'}
                    </div>
                  )}
                </div>
                <div>
                  <p><strong>Registro do protocolo:</strong></p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem', lineHeight: '1.5' }}>
                    O resultado exibido corresponde ao cálculo do protocolo registrado. A análise do conjunto de informações e qualquer ação decorrente dependem de revisão profissional.
                  </p>
                </div>
              </div>
            </div>
          )}

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
            </div>
          )}

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
                  <p><strong>Observações profissionais:</strong></p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem', lineHeight: '1.5' }}>
                    {results.bambi.observations || 'Nenhuma observação profissional registrada. O TeaFono não formula implicações ou ações automaticamente.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {results.vocabulary && (
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f59e0b', marginBottom: '0.75rem' }}>
                4. Avaliação de Vocabulário
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '0.5rem' }}>
                <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Desempenho</div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#f59e0b', marginTop: '0.25rem' }}>
                    {results.vocabulary.summary?.correct || 0}/{results.vocabulary.summary?.total || 0} corretas
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    Substituições: {results.vocabulary.summary?.substitutions || 0} | Sem resposta: {results.vocabulary.summary?.noResponse || 0}
                  </div>
                </div>
                <div>
                  <p><strong>Observações Clínicas:</strong></p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem', lineHeight: '1.5' }}>
                    {results.vocabulary.observations || 'Nenhuma observação registrada.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {results.fluency_verbal && (
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981', marginBottom: '0.75rem' }}>
                5. Fluência Semântica — Evocação Lexical
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '0.5rem' }}>
                <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Resultado descritivo</div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#10b981', marginTop: '0.25rem' }}>
                    {results.fluency_verbal.objectiveSummary?.validResponses ?? results.fluency_verbal.summary?.uniqueWords ?? 0} respostas válidas
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    Registros: {results.fluency_verbal.objectiveSummary?.recordedResponses ?? results.fluency_verbal.summary?.totalWords ?? 0}
                    {' | '}Repetições: {results.fluency_verbal.objectiveSummary?.byClassification?.repetition ?? results.fluency_verbal.counts?.repetitions ?? 0}
                  </div>
                </div>
                <div>
                  <p><strong>Observações:</strong></p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem', lineHeight: '1.5' }}>
                    {results.fluency_verbal.clinicalNotes || results.fluency_verbal.notes || 'Nenhuma observação registrada.'}
                  </p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.75rem', lineHeight: '1.5' }}>
                    <strong>Categoria:</strong> {results.fluency_verbal.context?.category || 'Não informada'}<br />
                    <strong>Instrução registrada:</strong> {results.fluency_verbal.context?.instruction || 'Não informada'}
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.75rem' }}>
                    Registro autoral de apoio clínico em teste de campo. O sistema não realizou interpretação normativa, diagnóstico ou recomendação automática.
                  </p>
                </div>
              </div>

              <div style={{ marginTop: '1.25rem', display: 'grid', gap: '1rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Critérios clínicos registrados pela profissional</h4>
                  {(results.fluency_verbal.clinicalCriteria || []).length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.4rem' }}>Nenhum critério registrado.</p>
                  ) : (
                    <ol style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', paddingLeft: '1.25rem', marginTop: '0.5rem', display: 'grid', gap: '0.6rem' }}>
                      {results.fluency_verbal.clinicalCriteria.map(criterion => (
                        <li key={criterion.id}>
                          <strong>{criterion.description}</strong><br />
                          Evidência: {criterion.supportingEvidence}
                          {criterion.source ? <><br />Fonte informada: {criterion.source}</> : null}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>

                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Síntese clínica da profissional</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.4rem', whiteSpace: 'pre-wrap' }}>
                    {results.fluency_verbal.clinicalSynthesis || 'Nenhuma síntese profissional registrada.'}
                  </p>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Ações formuladas pela profissional</h4>
                  {(results.fluency_verbal.plannedActions || []).length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.4rem' }}>Nenhuma ação profissional registrada.</p>
                  ) : (
                    <ol style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', paddingLeft: '1.25rem', marginTop: '0.5rem', display: 'grid', gap: '0.6rem' }}>
                      {results.fluency_verbal.plannedActions.map(action => (
                        <li key={action.id}>
                          <strong>{action.objective}</strong>: {action.description}<br />
                          Justificativa: {action.rationale}
                          {action.timeframe ? <><br />Prazo ou frequência: {action.timeframe}</> : null}
                          {action.followUpIndicator ? <><br />Indicador: {action.followUpIndicator}</> : null}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>

                {results.fluency_verbal.professionalReview?.responsibilityAccepted && (
                  <div style={{ padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    Revisado por <strong>{results.fluency_verbal.professionalReview.professionalName}</strong>
                    {' · '}{results.fluency_verbal.professionalReview.professionalRegistration}
                    {results.fluency_verbal.professionalReview.reviewedAt
                      ? ` · ${new Date(results.fluency_verbal.professionalReview.reviewedAt).toLocaleString('pt-BR')}`
                      : ''}
                  </div>
                )}
              </div>
            </div>
          )}

          {results.fluency_speech && (
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#14b8a6', marginBottom: '0.75rem' }}>
                6. Fluência da Fala
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '0.5rem' }}>
                <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Descontinuidades</div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#14b8a6', marginTop: '0.25rem' }}>
                    {results.fluency_speech.summary?.totalDisfluencies || 0} no total
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    Taxa: {results.fluency_speech.summary?.ratePerMinute || 0}/min
                  </div>
                </div>
                <div>
                  <p><strong>Observações:</strong></p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem', lineHeight: '1.5' }}>
                    {results.fluency_speech.notes || 'Nenhuma observação registrada.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {results.phonology && (
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ec4899', marginBottom: '0.75rem' }}>
                7. Avaliação Fonológica (PCC-R)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '0.5rem' }}>
                <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PCC-R</div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#ec4899', marginTop: '0.25rem' }}>
                    {results.phonology.pccr?.percentage || 0}%
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    {results.phonology.pccr?.classification || 'N/A'} ({results.phonology.pccr?.correct || 0}/{results.phonology.pccr?.total || 0} consoantes)
                  </div>
                </div>
                <div>
                  <p><strong>Observações:</strong></p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem', lineHeight: '1.5' }}>
                    {results.phonology.observations || 'Nenhuma observação registrada.'}
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        <div style={{ marginTop: '4rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ height: '50px' }} />
            <div style={{ width: '200px', borderTop: '1px solid var(--text-secondary)', margin: '0 auto', marginBottom: '0.25rem' }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Assinatura do Paciente / Responsável</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ height: '50px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
              {therapistSettings?.name && (
                <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{therapistSettings.name}</strong>
              )}
              {therapistSettings?.crfa && (
                <span style={{ fontSize: '0.80rem', color: 'var(--text-secondary)' }}>{therapistSettings.crfa}</span>
              )}
              {therapistSettings?.clinicName && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{therapistSettings.clinicName}</span>
              )}
            </div>
            <div style={{ width: '200px', borderTop: '1px solid var(--text-secondary)', margin: '0 auto', marginBottom: '0.25rem', marginTop: '0.5rem' }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Fonoaudiólogo(a) Responsável</span>
          </div>
        </div>

      </div>

      {showPtsModal && (
        <div className="no-print" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div className="glass-panel card" style={{ maxWidth: '650px', width: '100%', maxHeight: '80vh', overflowY: 'auto', padding: '2rem', gap: '1.25rem' }}>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Brain size={20} style={{ color: 'var(--warning-color)' }} /> Plano Terapêutico Singular (PTS)
            </h4>

            {ptsLoading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem', color: 'var(--text-secondary)' }}>
                <Loader size={32} className="animate-spin" style={{ color: 'var(--secondary-color)' }} />
                <p>Gerando plano personalizado com IA...</p>
              </div>
            )}

            {ptsError && (
              <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', color: 'var(--danger-color)', fontSize: '0.85rem' }}>
                {ptsError}
              </div>
            )}

            {ptsData && !ptsLoading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {ptsData.planoDeIntervencao && (
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Plano de Intervenção:</strong>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: '1.5' }}>{ptsData.planoDeIntervencao}</p>
                  </div>
                )}

                {ptsData.planType === 'offline' && ptsData.models && (
                  <>
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Plano de Fala / Comunicação:</strong>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{ptsData.models.speechPlan}</p>
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Plano Alimentar / Sensorial:</strong>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{ptsData.models.feedingPlan}</p>
                    </div>
                  </>
                )}

                {ptsData.objetivos && (
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Objetivos:</strong>
                    <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '1.25rem', marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {ptsData.objetivos.map((obj, i) => <li key={i}>{obj}</li>)}
                    </ul>
                  </div>
                )}

                {ptsData.frequencia && (
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Frequência:</strong>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{ptsData.frequencia}</p>
                  </div>
                )}

                {ptsData.tecnicas && (
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Técnicas:</strong>
                    <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '1.25rem', marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {ptsData.tecnicas.map((tec, i) => <li key={i}>{tec}</li>)}
                    </ul>
                  </div>
                )}

                {ptsData.steps && (
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Passos:</strong>
                    <ol style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '1.25rem', marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {ptsData.steps.map((step, i) => <li key={i}>{step}</li>)}
                    </ol>
                  </div>
                )}

                {ptsData.notes && (
                  <div style={{ padding: '0.75rem', background: 'rgba(251,191,36,0.08)', borderRadius: '8px', border: '1px solid rgba(251,191,36,0.15)', fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    {ptsData.notes}
                  </div>
                )}
              </div>
            )}

            <button className="btn btn-secondary" onClick={() => setShowPtsModal(false)} style={{ alignSelf: 'flex-end' }}>
              Fechar
            </button>
          </div>
        </div>
      )}

      {showConsentModal && (
        <div className="no-print" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div className="glass-panel card" style={{ maxWidth: '550px', width: '100%', padding: '2rem', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>
              Autorização para Uso de IA
            </h3>

            <div style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p>
                Para gerar o <strong>Plano Terapêutico Singular (PTS)</strong> com inteligência artificial, seus dados clínicos <strong>(anonimizados)</strong> serão compartilhados com a <strong>Google Gemini API</strong>.
              </p>

              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>✅ Dados Compartilhados (Anônimos):</strong>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', color: 'var(--text-secondary)' }}>
                  <li>Idade do paciente</li>
                  <li>Gênero</li>
                  <li>Queixa fonoaudiológica</li>
                  <li>Resultados de avaliações (M-CHAT, Pragmática, BAMBI)</li>
                </ul>
              </div>

              <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.05)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>
                <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--danger-color)' }}>❌ Dados NÃO Compartilhados:</strong>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', color: 'var(--text-secondary)' }}>
                  <li>Nome do paciente</li>
                  <li>Data de nascimento</li>
                  <li>Qualquer identificador pessoal</li>
                </ul>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <strong>Política de Retenção:</strong> Consulte a <a href="/PRIVACY.md" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>Política de Privacidade</a> para informações sobre como o Google processa e retém seus dados.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                onClick={handleConsentConfirm}
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  background: 'var(--primary-color)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                onMouseLeave={(e) => e.target.style.opacity = '1'}
              >
                ✓ Concordo e Continuar
              </button>
              <button
                onClick={handleConsentCancel}
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.opacity = '0.7'}
                onMouseLeave={(e) => e.target.style.opacity = '1'}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
