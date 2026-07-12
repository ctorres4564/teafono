import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import AssessmentHeader from './shared/AssessmentHeader';

const sections = [
  { id: 'identification', label: 'Identificação' },
  { id: 'mainComplaint', label: 'Queixa Principal' },
  { id: 'swallowing', label: 'Histórico de Deglutição e Alimentação' },
  { id: 'auditory', label: 'Histórico Auditivo e Otorrinolaringológico' },
  { id: 'medical', label: 'História Médica e Neurológica' },
  { id: 'global', label: 'Desenvolvimento Global e Comportamental' },
  { id: 'observation', label: 'Observação Fonoaudiológica Rápida' },
  { id: 'instruments', label: 'Avaliações/Instrumentos já Utilizados' },
  { id: 'diagnosis', label: 'Diagnóstico Fonoaudiológico / Impressão Clínica' },
];

const initialForm = {
  identification: {
    name: '',
    birthDate: '',
    age: '',
    sex: '',
    responsible: '',
    phone: '',
    schooling: '',
  },
  mainComplaint: {
    firstWordsAge: '',
    firstSentencesAge: '',
    babbling: null,
    estimatedWordsComprehended: '',
    estimatedWordsSpoken: '',
    comprehension: null,
    production: null,
    phonologicalChanges: '',
    stuttering: null,
    stutteringFrequency: '',
    stutteringSeverity: null,
    voice: null,
    rhythm: null,
  },
  swallowing: {
    breastfed: null,
    breastfeedingDuration: '',
    liquid: false,
    pasty: false,
    choppedSolid: false,
    choking: null,
    chokingFrequency: '',
    chewingDifficulty: null,
    suctionOralBreathing: null,
    enteral: null,
  },
  auditory: {
    hearingComplaints: null,
    recurrentOtitis: null,
    otitisEpisodes: '',
    priorAssessment: null,
    priorAssessmentDate: '',
    priorAssessmentResult: '',
    referredToORL: null,
  },
  medical: {
    prematurity: null,
    chronicNeurological: '',
    surgeriesHospitalizations: '',
    currentMedications: '',
  },
  global: {
    motorMilestones: null,
    motorDetails: '',
    socialInteraction: null,
    attentionHyperactivityRepetitive: '',
    sleep: null,
    sleepDescription: '',
  },
  observation: {
    breathing: null,
    orofacialPosture: null,
    tongueMobility: null,
    tongueDetails: '',
    lipTone: null,
    suctionSwallowing: null,
    refluxOralOdor: null,
    feedingObserved: null,
    feedingConsistency: '',
    feedingBehavior: '',
  },
  instruments: {
    formalTests: '',
    parentalScales: '',
    schoolReports: null,
  },
  diagnosis: {
    mainDiagnosis: '',
    differential1: '',
    differential2: '',
    affectedAreas: {
      speech: false,
      receptiveLanguage: false,
      expressiveLanguage: false,
      voice: false,
      fluency: false,
      swallowing: false,
      socialCommunication: false,
      auditoryProcessing: false,
    },
    severity: null,
    etiology: null,
  },
};

export default function AnamneseModule({ patient, onBack, onSaveAssessment }) {
  const [form, setForm] = useState(initialForm);
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (id) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const updateField = (section, field, value) => {
    setForm(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const updateNestedField = (section, field, nestedField, value) => {
    setForm(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: { ...prev[section][field], [nestedField]: value },
      },
    }));
  };

  const handleSave = () => {
    onSaveAssessment('anamnese', form);
  };

  const allIdentificationFilled = form.identification.name && form.identification.birthDate;

  const renderField = (label, value, onChange, type = 'text', placeholder = '', opts = null) => (
    <div className="form-group">
      <label>{label}</label>
      {opts ? (
        <select value={value || ''} onChange={e => onChange(e.target.value === '' ? null : e.target.value)}>
          <option value="">-- Selecione --</option>
          {opts.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.9rem', resize: 'vertical' }}
        />
      ) : (
        <input
          type={type}
          value={value || ''}
          onChange={e => onChange(type === 'number' ? e.target.value : e.target.value)}
          placeholder={placeholder}
          style={{ width: '100%' }}
        />
      )}
    </div>
  );

  const renderYesNo = (value, onChange) => (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      {['sim', 'não'].map(opt => (
        <button
          key={opt}
          type="button"
          className={`score-btn ${value === opt ? 'active-0' : ''}`}
          style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', textTransform: 'uppercase' }}
          onClick={() => onChange(value === opt ? null : opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );

  const renderSection = (section) => {
    const isOpen = openSections[section.id];
    const s = form[section.id];

    const renderContent = () => {
      switch (section.id) {
        case 'identification':
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {renderField('Nome da Criança', s.name, v => updateField('identification', 'name', v))}
                {renderField('Data de Nascimento', s.birthDate, v => {
                  updateField('identification', 'birthDate', v);
                  if (v) {
                    const today = new Date();
                    const birth = new Date(v + 'T00:00:00');
                    let age = today.getFullYear() - birth.getFullYear();
                    const m = today.getMonth() - birth.getMonth();
                    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
                    updateField('identification', 'age', String(Math.max(0, age)));
                  }
                }, 'date')}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {renderField('Idade (anos)', s.age, v => updateField('identification', 'age', v), 'number', '', [], true)}
                {renderField('Sexo', s.sex, v => updateField('identification', 'sex', v), 'text', '', ['Masculino', 'Feminino', 'Outro'])}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {renderField('Responsável', s.responsible, v => updateField('identification', 'responsible', v))}
                {renderField('Telefone', s.phone, v => updateField('identification', 'phone', v))}
              </div>
              {renderField('Escolaridade / Creche / Série', s.schooling, v => updateField('identification', 'schooling', v))}
            </div>
          );

        case 'mainComplaint':
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {renderField('Primeiras palavras (meses)', s.firstWordsAge, v => updateField('mainComplaint', 'firstWordsAge', v), 'number')}
                {renderField('Primeiras frases (meses)', s.firstSentencesAge, v => updateField('mainComplaint', 'firstSentencesAge', v), 'number')}
              </div>
              <div>
                <label>Balbucio</label>
                {renderYesNo(s.babbling, v => updateField('mainComplaint', 'babbling', v))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {renderField('Vocabulário compreendido (estimado)', s.estimatedWordsComprehended, v => updateField('mainComplaint', 'estimatedWordsComprehended', v), 'number')}
                {renderField('Vocabulário falado (estimado)', s.estimatedWordsSpoken, v => updateField('mainComplaint', 'estimatedWordsSpoken', v), 'number')}
              </div>
              <div>
                <label>Compreensão</label>
                {renderYesNo(s.comprehension === 'adequate' ? 'sim' : s.comprehension === 'minimal' ? 'não' : null, v => updateField('mainComplaint', 'comprehension', v === 'sim' ? 'adequate' : v === 'não' ? 'minimal' : null))}
                {s.comprehension === 'adequate' && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>Adequada para a idade</span>}
                {s.comprehension === 'minimal' && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>Mínima</span>}
              </div>
              <div>
                <label>Produção</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['Clara', 'Parcialmente inteligível', 'Pouco inteligível'].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      className={`score-btn ${s.production === opt ? 'active-0' : ''}`}
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                      onClick={() => updateField('mainComplaint', 'production', s.production === opt ? null : opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              {renderField('Trocas fonológicas / omissões / simplificações', s.phonologicalChanges, v => updateField('mainComplaint', 'phonologicalChanges', v), 'text', 'Ex: troca /k/ por /t/, omissão de consoante final...')}
              <div>
                <label>Fluência (gagueira)</label>
                {renderYesNo(s.stuttering, v => updateField('mainComplaint', 'stuttering', v))}
                {s.stuttering === 'sim' && (
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    {renderField('Frequência', s.stutteringFrequency, v => updateField('mainComplaint', 'stutteringFrequency', v), 'text', 'Ex: ocasional, frequente')}
                    <div>
                      <label>Gravidade</label>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                        {['leve', 'moderada', 'grave'].map(opt => (
                          <button
                            key={opt}
                            type="button"
                            className={`score-btn ${s.stutteringSeverity === opt ? 'active-0' : ''}`}
                            style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', textTransform: 'capitalize' }}
                            onClick={() => updateField('mainComplaint', 'stutteringSeverity', s.stutteringSeverity === opt ? null : opt)}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label>Voz</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {['Normal', 'Rouquidão', 'Soprosa', 'Esforço'].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      className={`score-btn ${s.voice === opt ? 'active-0' : ''}`}
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                      onClick={() => updateField('mainComplaint', 'voice', s.voice === opt ? null : opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label>Ritmo e Prósódia</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['Adequados', 'Alterados'].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      className={`score-btn ${s.rhythm === opt ? 'active-0' : ''}`}
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                      onClick={() => updateField('mainComplaint', 'rhythm', s.rhythm === opt ? null : opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );

        case 'swallowing':
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label>Amamentou ao seio</label>
                {renderYesNo(s.breastfed, v => updateField('swallowing', 'breastfed', v))}
                {s.breastfed === 'sim' && renderField('Tempo de amamentação', s.breastfeedingDuration, v => updateField('swallowing', 'breastfeedingDuration', v), 'text', 'Ex: 6 meses')}
              </div>
              <div>
                <label>Consistências aceitas</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                  {[
                    { id: 'liquid', label: 'Líquida' },
                    { id: 'pasty', label: 'Pastosa' },
                    { id: 'choppedSolid', label: 'Picada/Sólida' },
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      className={`score-btn ${s[item.id] ? 'active-0' : ''}`}
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                      onClick={() => updateField('swallowing', item.id, !s[item.id])}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label>Engasgos/Aspiração</label>
                {renderYesNo(s.choking, v => updateField('swallowing', 'choking', v))}
                {s.choking === 'sim' && renderField('Frequência', s.chokingFrequency, v => updateField('swallowing', 'chokingFrequency', v), 'text', 'Ex: raro, frequente')}
              </div>
              <div>
                <label>Dificuldade para mastigar</label>
                {renderYesNo(s.chewingDifficulty, v => updateField('swallowing', 'chewingDifficulty', v))}
              </div>
              <div>
                <label>Uso de sucção/respiração oral durante a alimentação</label>
                {renderYesNo(s.suctionOralBreathing, v => updateField('swallowing', 'suctionOralBreathing', v))}
              </div>
              <div>
                <label>História de enteral/Nasogástrica</label>
                {renderYesNo(s.enteral, v => updateField('swallowing', 'enteral', v))}
              </div>
            </div>
          );

        case 'auditory':
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label>Queixas auditivas (não responde ao som, desvio de voz)</label>
                {renderYesNo(s.hearingComplaints, v => updateField('auditory', 'hearingComplaints', v))}
              </div>
              <div>
                <label>Otites de repetição</label>
                {renderYesNo(s.recurrentOtitis, v => updateField('auditory', 'recurrentOtitis', v))}
                {s.recurrentOtitis === 'sim' && renderField('Quantos episódios', s.otitisEpisodes, v => updateField('auditory', 'otitisEpisodes', v), 'number')}
              </div>
              <div>
                <label>Avaliação/Audiometria prévia</label>
                {renderYesNo(s.priorAssessment, v => updateField('auditory', 'priorAssessment', v))}
                {s.priorAssessment === 'sim' && (
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    {renderField('Data', s.priorAssessmentDate, v => updateField('auditory', 'priorAssessmentDate', v), 'date')}
                    {renderField('Resultado', s.priorAssessmentResult, v => updateField('auditory', 'priorAssessmentResult', v), 'text', 'Ex: normal, alterado')}
                  </div>
                )}
              </div>
              <div>
                <label>Encaminhado para ORL anteriormente</label>
                {renderYesNo(s.referredToORL, v => updateField('auditory', 'referredToORL', v))}
              </div>
            </div>
          );

        case 'medical':
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label>Prematuridade / complicações neonatais</label>
                {renderYesNo(s.prematurity, v => updateField('medical', 'prematurity', v))}
              </div>
              {renderField('Doenças crônicas/neurológicas', s.chronicNeurological, v => updateField('medical', 'chronicNeurological', v), 'textarea', 'Ex: epilepsia, paralisia cerebral, síndrome genética...')}
              {renderField('Cirurgias/internações relevantes', s.surgeriesHospitalizations, v => updateField('medical', 'surgeriesHospitalizations', v), 'textarea', 'Ex: adenoidectomia, internação por bronquite...')}
              {renderField('Uso medicamentoso atual', s.currentMedications, v => updateField('medical', 'currentMedications', v), 'textarea', 'Ex: risperidona 1mg/dia, metilfenidato...')}
            </div>
          );

        case 'global':
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label>Marcos do desenvolvimento motor (sentar, engatinhar, andar) dentro do esperado?</label>
                {renderYesNo(s.motorMilestones, v => updateField('global', 'motorMilestones', v))}
                {s.motorMilestones === 'não' && renderField('Detalhes', s.motorDetails, v => updateField('global', 'motorDetails', v), 'textarea', 'Ex: sentou aos 10 meses, engatinhou aos 14 meses...')}
              </div>
              <div>
                <label>Interação social / contato ocular</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['Adequado', 'Limitado'].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      className={`score-btn ${s.socialInteraction === opt ? 'active-0' : ''}`}
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                      onClick={() => updateField('global', 'socialInteraction', s.socialInteraction === opt ? null : opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              {renderField('Atenção/hiperatividade/comportamentos repetitivos', s.attentionHyperactivityRepetitive, v => updateField('global', 'attentionHyperactivityRepetitive', v), 'textarea', 'Ex: atenção reduzida, estereotipias manuais, ecolalia...')}
              <div>
                <label>Sono</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['Regular', 'Alterações'].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      className={`score-btn ${s.sleep === opt ? 'active-0' : ''}`}
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                      onClick={() => updateField('global', 'sleep', s.sleep === opt ? null : opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {s.sleep === 'Alterações' && renderField('Descrever', s.sleepDescription, v => updateField('global', 'sleepDescription', v), 'textarea', 'Ex: dificuldade para iniciar o sono, despertares noturnos...')}
              </div>
            </div>
          );

        case 'observation':
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label>Respiração em repouso</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['Nasal', 'Oral'].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      className={`score-btn ${s.breathing === opt ? 'active-0' : ''}`}
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                      onClick={() => updateField('observation', 'breathing', s.breathing === opt ? null : opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label>Postura orofacial</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['Normal', 'Alterada'].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      className={`score-btn ${s.orofacialPosture === opt ? 'active-0' : ''}`}
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                      onClick={() => updateField('observation', 'orofacialPosture', s.orofacialPosture === opt ? null : opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label>Força e mobilidade lingual</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['Adequada', 'Reduzida'].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      className={`score-btn ${s.tongueMobility === opt ? 'active-0' : ''}`}
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                      onClick={() => updateField('observation', 'tongueMobility', s.tongueMobility === opt ? null : opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {s.tongueMobility === 'Reduzida' && renderField('Detalhes', s.tongueDetails, v => updateField('observation', 'tongueDetails', v), 'textarea', 'Ex: protrusão limitada, dificuldade de lateralização...')}
              </div>
              <div>
                <label>Tônus labial/facial</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['Normal', 'Hipotonia', 'Hipertonia'].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      className={`score-btn ${s.lipTone === opt ? 'active-0' : ''}`}
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                      onClick={() => updateField('observation', 'lipTone', s.lipTone === opt ? null : opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label>Coordenação de sucção/deglutição</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['Adequada', 'Alterada'].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      className={`score-btn ${s.suctionSwallowing === opt ? 'active-0' : ''}`}
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                      onClick={() => updateField('observation', 'suctionSwallowing', s.suctionSwallowing === opt ? null : opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label>Presença de refluxo ou odor oral</label>
                {renderYesNo(s.refluxOralOdor, v => updateField('observation', 'refluxOralOdor', v))}
              </div>
              <div>
                <label>Alimentação observada durante a visita</label>
                {renderYesNo(s.feedingObserved, v => updateField('observation', 'feedingObserved', v))}
                {s.feedingObserved === 'sim' && (
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    {renderField('Consistência', s.feedingConsistency, v => updateField('observation', 'feedingConsistency', v), 'text', 'Ex: pastosa, sólida')}
                    {renderField('Comportamento', s.feedingBehavior, v => updateField('observation', 'feedingBehavior', v), 'text', 'Ex: aceitou bem, recusou')}
                  </div>
                )}
              </div>
            </div>
          );

        case 'instruments':
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {renderField('Testes formais aplicados (nome / data / resultado)', s.formalTests, v => updateField('instruments', 'formalTests', v), 'textarea', 'Ex: ABFW - 10/01/2026 - desempenho inferior esperado')}
              {renderField('Escalas parentais preenchidas', s.parentalScales, v => updateField('instruments', 'parentalScales', v), 'textarea', 'Ex: M-CHAT, BAMBI, ITC')}
              <div>
                <label>Relatórios escolares / terapêuticos disponíveis</label>
                {renderYesNo(s.schoolReports, v => updateField('instruments', 'schoolReports', v))}
              </div>
            </div>
          );

        case 'diagnosis':
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {renderField('Diagnóstico principal', s.mainDiagnosis, v => updateField('diagnosis', 'mainDiagnosis', v), 'textarea', 'Ex: Atraso de linguagem, Transtorno do Desenvolvimento da Fala...')}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {renderField('Diagnóstico diferencial/associado 1', s.differential1, v => updateField('diagnosis', 'differential1', v))}
                {renderField('Diagnóstico diferencial/associado 2', s.differential2, v => updateField('diagnosis', 'differential2', v))}
              </div>
              <div>
                <label>Área(s) afetada(s)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.25rem' }}>
                  {[
                    { id: 'speech', label: 'Fala (fonologia/articulação)' },
                    { id: 'receptiveLanguage', label: 'Linguagem receptiva' },
                    { id: 'expressiveLanguage', label: 'Linguagem expressiva' },
                    { id: 'voice', label: 'Voz' },
                    { id: 'fluency', label: 'Fluência' },
                    { id: 'swallowing', label: 'Deglutição / Deglutição atípica' },
                    { id: 'socialCommunication', label: 'Comunicação social / Pragmática' },
                    { id: 'auditoryProcessing', label: 'Auditiva / Processamento auditivo' },
                  ].map(item => (
                    <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={s.affectedAreas[item.id]}
                        onChange={() => updateNestedField('diagnosis', 'affectedAreas', item.id, !s.affectedAreas[item.id])}
                      />
                      {item.label}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label>Grau de comprometimento</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['Leve', 'Moderado', 'Grave'].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      className={`score-btn ${s.severity === opt ? 'active-0' : ''}`}
                      style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                      onClick={() => updateField('diagnosis', 'severity', s.severity === opt ? null : opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label>Probabilidade de etiologia</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {[
                    { id: 'functional', label: 'Funcional' },
                    { id: 'organic', label: 'Orgânica (ex.: alterações anatômicas)' },
                    { id: 'neurological', label: 'Neurológica' },
                    { id: 'sensory', label: 'Sensorial (auditiva)' },
                    { id: 'multifactorial', label: 'Multifatorial' },
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      className={`score-btn ${s.etiology === item.id ? 'active-0' : ''}`}
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                      onClick={() => updateField('diagnosis', 'etiology', s.etiology === item.id ? null : item.id)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );

        default:
          return null;
      }
    };

    return (
      <div key={section.id} className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <button
          onClick={() => toggleSection(section.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', textAlign: 'left',
            background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer',
            fontSize: '1rem', fontWeight: 700, padding: '0.25rem 0',
          }}
        >
          {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          {section.label}
        </button>
        {isOpen && <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>{renderContent()}</div>}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <AssessmentHeader
        title="Anamnese Fonoaudiológica"
        patientName={patient.name}
        onBack={onBack}
      />

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        Preencha todos os campos da anamnese para registrar o histórico clínico completo do paciente.
      </p>

      {sections.map(renderSection)}

      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          Ações
        </h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Ao finalizar, a anamnese será salva no histórico do paciente e poderá ser consultada no laudo.
        </p>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          style={{ alignSelf: 'flex-end', width: '220px', height: '48px' }}
          disabled={!allIdentificationFilled}
        >
          Finalizar e Salvar Anamnese
        </button>
      </div>
    </div>
  );
}
