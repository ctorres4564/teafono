import React, { useState } from 'react';
import { User, Calendar, Plus, ChevronRight, MessageSquare, Trash2, Heart, Award, ShieldAlert } from 'lucide-react';

export default function Dashboard({ patients, onSelectPatient, onAddPatient, onDeletePatient, onUpdatePatient, onStartAssessment, onViewReport, onGoToCaa }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState('');
  const [newGender, setNewGender] = useState('Masculino');
  const [newDiagnosis, setNewDiagnosis] = useState('');
  const [newBirthDate, setNewBirthDate] = useState('');
  const [newSpeechComplaint, setNewSpeechComplaint] = useState('');

  // Estados de Edição
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editGender, setEditGender] = useState('Masculino');
  const [editDiagnosis, setEditDiagnosis] = useState('');
  const [editSpeechComplaint, setEditSpeechComplaint] = useState('');

  const calculateAge = (birthDateString) => {
    if (!birthDateString) return '';
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age < 0 ? 0 : age;
  };

  const handleBirthDateChange = (dateVal) => {
    setNewBirthDate(dateVal);
    const calculated = calculateAge(dateVal);
    setNewAge(calculated !== '' ? String(calculated) : '');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newName || !newAge) return;

    onAddPatient({
      name: newName,
      age: Number(newAge),
      gender: newGender,
      diagnosis: newDiagnosis,
      birthDate: newBirthDate,
      speechComplaint: newSpeechComplaint
    });

    setNewName('');
    setNewAge('');
    setNewGender('Masculino');
    setNewDiagnosis('');
    setNewBirthDate('');
    setNewSpeechComplaint('');
    setShowAddForm(false);
  };

  const startEditing = () => {
    if (!selectedPatient) return;
    setEditName(selectedPatient.name || '');
    setEditBirthDate(selectedPatient.birthDate || '');
    setEditAge(selectedPatient.age || '');
    setEditGender(selectedPatient.gender || 'Masculino');
    setEditDiagnosis(selectedPatient.diagnosis || '');
    setEditSpeechComplaint(selectedPatient.speechComplaint || '');
    setIsEditing(true);
  };

  const handleEditBirthDateChange = (dateVal) => {
    setEditBirthDate(dateVal);
    const calculated = calculateAge(dateVal);
    setEditAge(calculated !== '' ? String(calculated) : '');
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editName || !editAge) return;

    onUpdatePatient({
      id: selectedPatient.id,
      name: editName,
      age: Number(editAge),
      gender: editGender,
      diagnosis: editDiagnosis,
      birthDate: editBirthDate,
      speechComplaint: editSpeechComplaint
    });

    setIsEditing(false);
  };

  const selectedPatient = patients.find(p => p.isSelected);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      {/* Welcome Banner */}
      <div className="glass-panel card" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Portal Fonoaudiológico de TEA</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          TeaFono: Avaliação e intervenção especializada no Transtorno do Espectro Autista. Realize triagens de M-CHAT-R/F, mapeamento de pragmática funcional (Fernandes), avaliação de seletividade alimentar (BAMBI) e estimulação por prancha de comunicação alternativa de voz.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        {/* Patients Column */}
        <div className="glass-panel card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={20} className="text-primary" /> Fichas Clínicas (Crianças)
            </h3>
            <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
              <Plus size={16} /> Nova Ficha
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(255,255,255,0.01)' }}>
              <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Novo Paciente Infantil</h4>
              <div className="form-group">
                <label>Nome Completo da Criança</label>
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: Arthur Rezende" required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Data de Nascimento</label>
                  <input type="date" value={newBirthDate} onChange={e => handleBirthDateChange(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Idade (anos - calculada)</label>
                  <input type="number" value={newAge} onChange={e => setNewAge(e.target.value)} required readOnly style={{ opacity: 0.8, cursor: 'not-allowed' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Gênero</label>
                  <select value={newGender} onChange={e => setNewGender(e.target.value)}>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Diagnóstico / Nível de Suporte (se houver)</label>
                  <input type="text" value={newDiagnosis} onChange={e => setNewDiagnosis(e.target.value)} placeholder="Ex: TEA Nível 1 de Suporte" />
                </div>
              </div>
              <div className="form-group">
                <label>Queixa Fonoaudiológica</label>
                <textarea 
                  value={newSpeechComplaint} 
                  onChange={e => setNewSpeechComplaint(e.target.value)} 
                  placeholder="Ex: Atraso de fala, dificuldade na mastigação, etc." 
                  rows={2}
                  style={{ 
                    width: '100%', 
                    padding: '0.65rem 0.8rem', 
                    borderRadius: '8px', 
                    background: 'rgba(255,255,255,0.03)', 
                    border: '1px solid var(--border-color)', 
                    color: 'var(--text-primary)', 
                    fontSize: '0.9rem',
                    resize: 'vertical'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Cadastrar</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Cancelar</button>
              </div>
            </form>
          )}

          <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
            {patients.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Nenhuma criança cadastrada.</p>
            ) : (
              patients.map(p => (
                <div 
                  key={p.id}
                  className="glass-panel"
                  style={{
                    padding: '1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderLeft: p.isSelected ? '4px solid var(--secondary-color)' : '4px solid transparent',
                    background: p.isSelected ? 'rgba(139, 92, 246, 0.05)' : 'rgba(255,255,255,0.01)',
                    marginBottom: '0.75rem'
                  }}
                  onClick={() => {
                    setIsEditing(false);
                    onSelectPatient(p);
                  }}
                >
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{p.name}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      {p.age} anos • {p.gender} • {p.diagnosis || "Sem queixa"}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={e => e.stopPropagation()}>
                    <button className="btn btn-secondary btn-icon" onClick={() => {
                      setIsEditing(false);
                      onSelectPatient(p);
                    }} style={{ width: '32px', height: '32px' }}>
                      <ChevronRight size={16} />
                    </button>
                    <button className="btn btn-secondary btn-icon" onClick={() => onDeletePatient(p.id)} style={{ width: '32px', height: '32px', borderColor: 'rgba(239,68,68,0.2)', color: 'var(--danger-color)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Selected Patient details */}
        <div className="glass-panel card" style={{ padding: '1.5rem' }}>
          <h3 className="card-title" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>Ações Clínicas & Histórico</h3>

          {selectedPatient ? (
            isEditing ? (
              <form onSubmit={handleEditSubmit} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Editar Dados do Paciente</h4>
                <div className="form-group">
                  <label>Nome Completo da Criança</label>
                  <input type="text" value={editName} onChange={e => setEditName(e.target.value)} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Data de Nascimento</label>
                    <input type="date" value={editBirthDate} onChange={e => handleEditBirthDateChange(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Idade (anos - calculada)</label>
                    <input type="number" value={editAge} onChange={e => setEditAge(e.target.value)} required readOnly style={{ opacity: 0.8, cursor: 'not-allowed' }} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Gênero</label>
                    <select value={editGender} onChange={e => setEditGender(e.target.value)}>
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Diagnóstico / Nível de Suporte</label>
                    <input type="text" value={editDiagnosis} onChange={e => setEditDiagnosis(e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Queixa Fonoaudiológica</label>
                  <textarea 
                    value={editSpeechComplaint} 
                    onChange={e => setEditSpeechComplaint(e.target.value)} 
                    rows={3}
                    style={{ 
                      width: '100%', 
                      padding: '0.65rem 0.8rem', 
                      borderRadius: '8px', 
                      background: 'rgba(255,255,255,0.03)', 
                      border: '1px solid var(--border-color)', 
                      color: 'var(--text-primary)', 
                      fontSize: '0.9rem',
                      resize: 'vertical'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Salvar Alterações</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancelar</button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{selectedPatient.name}</h4>
                    <button className="btn btn-secondary" onClick={startEditing} style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', minWidth: '100px' }}>
                      ✏️ Editar Ficha
                    </button>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <strong>Diagnóstico/Nível:</strong> {selectedPatient.diagnosis || "Não informado"}
                  </p>
                  {selectedPatient.birthDate && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <strong>Data de Nascimento:</strong> {new Date(selectedPatient.birthDate + 'T00:00:00').toLocaleDateString('pt-BR')} ({selectedPatient.age} anos)
                    </p>
                  )}
                  {selectedPatient.speechComplaint && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', borderLeft: '3px solid var(--secondary-color)' }}>
                      <strong>Queixa Fonoaudiológica:</strong> {selectedPatient.speechComplaint}
                    </p>
                  )}
                </div>

              {/* Iniciar Avaliações */}
              <div>
                <h5 style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Realizar Avaliações de Autismo</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button className="btn btn-primary" onClick={() => onStartAssessment('mchat')} style={{ justifyContent: 'flex-start', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
                    📋 Triagem de Sinais Precoces (M-CHAT-R/F)
                  </button>
                  <button className="btn btn-primary" onClick={() => onStartAssessment('pragmatics')} style={{ justifyContent: 'flex-start', background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
                    💬 Perfil Funcional de Pragmática (Fernandes)
                  </button>
                  <button className="btn btn-primary" onClick={() => onStartAssessment('bambi')} style={{ justifyContent: 'flex-start', background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' }}>
                    🍽️ Seletividade Alimentar e Sensorial (BAMBI)
                  </button>
                </div>
              </div>

              {/* Intervenção */}
              <div>
                <h5 style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Intervenção de CAA</h5>
                <button className="btn btn-secondary" onClick={onGoToCaa} style={{ width: '100%', borderColor: 'var(--secondary-color)', color: 'var(--secondary-color)', fontWeight: 700 }}>
                  🗣️ Abrir Prancha de Comunicação Alternativa
                </button>
              </div>

              {/* Histórico */}
              <div>
                <h5 style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Exames Registrados</h5>
                {(!selectedPatient.history || selectedPatient.history.length === 0) ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Nenhuma avaliação registrada ainda.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '180px', overflowY: 'auto' }}>
                    {selectedPatient.history.map(hist => (
                      <div key={hist.id} className="glass-panel" style={{ padding: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', background: 'rgba(255,255,255,0.01)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Calendar size={12} /> {new Date(hist.date).toLocaleDateString('pt-BR')}
                          </span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.25rem' }}>
                            {hist.results.mchat && (
                              <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>M-CHAT: {hist.results.mchat.risk}</span>
                            )}
                            {hist.results.pragmatics && (
                              <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Pragmática: {hist.results.pragmatics.ratePerMinute} atos/min</span>
                            )}
                            {hist.results.bambi && (
                              <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>Alimentação: {hist.results.bambi.score} pts</span>
                            )}
                          </div>
                        </div>
                        <button className="btn btn-secondary" onClick={() => onViewReport(hist.id)} style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                          Laudo
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
              <User size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p>Selecione um paciente na lista de crianças para iniciar exames ou interagir com o ComunicaTEA.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
