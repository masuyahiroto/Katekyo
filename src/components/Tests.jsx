import { useState } from 'react';
import { Plus, X, Trash2, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';

const SUBJECTS = ['国語', '数学', '英語', '理科', '社会', 'その他'];
const Q_TYPES = ['記述', '選択', '○×'];

function TestModal({ students, onSave, onClose }) {
  const [form, setForm] = useState({
    studentId: '',
    subject: '',
    title: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    questions: [],
  });

  const addQ = () =>
    setForm((f) => ({
      ...f,
      questions: [...f.questions, { text: '', type: '記述', choices: ['', '', '', ''], answer: '', points: 5 }],
    }));

  const removeQ = (i) =>
    setForm((f) => ({ ...f, questions: f.questions.filter((_, idx) => idx !== i) }));

  const updateQ = (i, patch) =>
    setForm((f) => ({
      ...f,
      questions: f.questions.map((q, idx) => (idx === i ? { ...q, ...patch } : q)),
    }));

  const updateChoice = (qi, ci, val) =>
    setForm((f) => ({
      ...f,
      questions: f.questions.map((q, idx) => {
        if (idx !== qi) return q;
        const choices = [...q.choices];
        choices[ci] = val;
        return { ...q, choices };
      }),
    }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.studentId || !form.title.trim()) return;
    onSave(form);
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <span className="modal-title">テストを作成</span>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={submit}>
          <div className="grid-2">
            <div className="form-group">
              <label>生徒 *</label>
              <select className="form-control" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })}>
                <option value="">選択</option>
                {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>科目</label>
              <select className="form-control" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                <option value="">選択</option>
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>テストタイトル *</label>
            <input className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="例：二次方程式 確認テスト" />
          </div>
          <div className="form-group">
            <label>実施予定日</label>
            <input type="date" className="form-control" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>

          <div className="divider" />
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold">問題 ({form.questions.length}問)</p>
            <button type="button" className="btn btn-sm btn-ghost" onClick={addQ}><Plus size={14} />問題を追加</button>
          </div>

          {form.questions.map((q, i) => (
            <div className="question-block" key={i}>
              <div className="flex items-center justify-between mb-2">
                <span className="badge badge-primary">Q{i + 1}</span>
                <div className="flex gap-2">
                  <select className="form-control" style={{ width: 90, padding: '4px 8px', fontSize: 12 }} value={q.type} onChange={(e) => updateQ(i, { type: e.target.value })}>
                    {Q_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <button type="button" className="btn btn-sm btn-ghost" onClick={() => removeQ(i)}><Trash2 size={12} /></button>
                </div>
              </div>
              <div className="form-group">
                <input className="form-control" value={q.text} onChange={(e) => updateQ(i, { text: e.target.value })} placeholder={`問題文 ${i + 1}`} />
              </div>
              {q.type === '選択' && (
                <div className="question-options">
                  {q.choices.map((c, ci) => (
                    <div className="option-row" key={ci}>
                      <input type="radio" name={`ans-${i}`} checked={q.answer === String(ci)} onChange={() => updateQ(i, { answer: String(ci) })} />
                      <input className="form-control" style={{ flex: 1 }} value={c} onChange={(e) => updateChoice(i, ci, e.target.value)} placeholder={`選択肢 ${ci + 1}`} />
                    </div>
                  ))}
                  <p className="text-xs text-gray">正解の選択肢を選んでください</p>
                </div>
              )}
              {q.type === '○×' && (
                <div className="question-options">
                  {['○', '×'].map((v) => (
                    <label key={v} className="option-row" style={{ cursor: 'pointer' }}>
                      <input type="radio" name={`ans-${i}`} checked={q.answer === v} onChange={() => updateQ(i, { answer: v })} />
                      <span className="text-sm">{v}</span>
                    </label>
                  ))}
                </div>
              )}
              {q.type === '記述' && (
                <div className="form-group">
                  <label style={{ fontSize: 12 }}>模範解答</label>
                  <input className="form-control" value={q.answer} onChange={(e) => updateQ(i, { answer: e.target.value })} placeholder="模範解答（任意）" />
                </div>
              )}
              <div className="form-group" style={{ marginTop: 8, marginBottom: 0 }}>
                <label style={{ fontSize: 12 }}>配点</label>
                <input type="number" className="form-control" style={{ width: 80 }} min={1} value={q.points} onChange={(e) => updateQ(i, { points: Number(e.target.value) })} />
              </div>
            </div>
          ))}

          <div className="flex gap-2 justify-between mt-3">
            <button type="button" className="btn btn-ghost" onClick={onClose}>キャンセル</button>
            <button type="submit" className="btn btn-primary"><Plus size={16} />作成</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ScoreModal({ test, onSave, onClose }) {
  const [scores, setScores] = useState(test.studentAnswers ?? {});

  const submit = (e) => {
    e.preventDefault();
    const totalScore = test.questions.reduce((sum, q, i) => {
      const correct = q.type === '記述' ? true : scores[i] === q.answer;
      return sum + (correct ? q.points : 0);
    }, 0);
    onSave({ studentAnswers: scores, score: totalScore });
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <span className="modal-title">採点：{test.title}</span>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={submit}>
          {test.questions.map((q, i) => (
            <div className="question-block" key={i}>
              <div className="flex items-center justify-between mb-2">
                <span className="badge badge-primary">Q{i + 1} ({q.points}点)</span>
                <span className="text-xs text-gray">{q.type}</span>
              </div>
              <p className="text-sm mb-2">{q.text || `問題 ${i + 1}`}</p>
              {q.type === '選択' && (
                <div className="question-options">
                  {q.choices.map((c, ci) => (
                    <label key={ci} className="option-row" style={{ cursor: 'pointer' }}>
                      <input type="radio" name={`score-${i}`} checked={scores[i] === String(ci)} onChange={() => setScores({ ...scores, [i]: String(ci) })} />
                      <span className={`text-sm ${q.answer === String(ci) ? 'font-bold' : ''}`}>{c} {q.answer === String(ci) ? '✓' : ''}</span>
                    </label>
                  ))}
                </div>
              )}
              {q.type === '○×' && (
                <div className="question-options">
                  {['○', '×'].map((v) => (
                    <label key={v} className="option-row" style={{ cursor: 'pointer' }}>
                      <input type="radio" name={`score-${i}`} checked={scores[i] === v} onChange={() => setScores({ ...scores, [i]: v })} />
                      <span className="text-sm">{v}</span>
                    </label>
                  ))}
                </div>
              )}
              {q.type === '記述' && (
                <div>
                  <p className="text-xs text-gray mb-1">模範解答：{q.answer || '—'}</p>
                  <select className="form-control" style={{ width: 120 }} value={scores[i] ?? ''} onChange={(e) => setScores({ ...scores, [i]: e.target.value })}>
                    <option value="">未採点</option>
                    <option value="correct">正解</option>
                    <option value="wrong">不正解</option>
                  </select>
                </div>
              )}
            </div>
          ))}
          <div className="flex gap-2 justify-between mt-3">
            <button type="button" className="btn btn-ghost" onClick={onClose}>キャンセル</button>
            <button type="submit" className="btn btn-success">採点を保存</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Tests({ store }) {
  const { students, tests } = store;
  const [createModal, setCreateModal] = useState(false);
  const [scoreModal, setScoreModal] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const studentName = (id) => students.items.find((s) => s.id === id)?.name ?? '—';

  const today = format(new Date(), 'yyyy-MM-dd');
  const sorted = [...tests.items].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <h2>テスト管理</h2>
          <p>テストの作成・採点・記録を管理します</p>
        </div>
        <button className="btn btn-primary" onClick={() => setCreateModal(true)}><Plus size={16} />テストを作成</button>
      </div>

      {sorted.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <BookOpen size={40} color="var(--gray-300)" />
            <p>テストが作成されていません</p>
          </div>
        </div>
      ) : (
        sorted.map((t) => {
          const totalPoints = t.questions?.reduce((s, q) => s + (q.points ?? 0), 0) ?? 0;
          const isExpanded = expanded === t.id;
          const isPast = t.date < today;
          return (
            <div className="card mb-3" key={t.id}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2" style={{ flex: 1 }}>
                  <button className="close-btn" onClick={() => setExpanded(isExpanded ? null : t.id)}>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <div>
                    <p className="font-bold">{t.title}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="badge badge-primary">{studentName(t.studentId)}</span>
                      {t.subject && <span className="badge badge-gray">{t.subject}</span>}
                      <span className={`badge ${isPast ? 'badge-gray' : 'badge-danger'}`}>{t.date}</span>
                      {t.score !== undefined && <span className="badge badge-success">{t.score} / {totalPoints}点</span>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {t.questions?.length > 0 && (
                    <button className="btn btn-sm btn-success" onClick={() => setScoreModal(t)}>採点</button>
                  )}
                  <button className="btn btn-sm btn-ghost" onClick={() => tests.remove(t.id)}><Trash2 size={14} /></button>
                </div>
              </div>

              {isExpanded && t.questions?.length > 0 && (
                <div className="mt-3">
                  <div className="divider" />
                  <p className="text-sm font-bold mb-2">問題一覧（{t.questions.length}問 / 計{totalPoints}点）</p>
                  {t.questions.map((q, i) => (
                    <div key={i} className="question-block" style={{ marginBottom: 8 }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="badge badge-gray">Q{i + 1}</span>
                        <span className="badge badge-primary">{q.type}</span>
                        <span className="text-xs text-gray">{q.points}点</span>
                      </div>
                      <p className="text-sm">{q.text || `問題 ${i + 1}`}</p>
                      {q.type === '選択' && (
                        <div className="mt-1">
                          {q.choices.filter(Boolean).map((c, ci) => (
                            <p key={ci} className={`text-xs ${q.answer === String(ci) ? 'font-bold' : 'text-gray'}`}>
                              {ci + 1}. {c} {q.answer === String(ci) ? '← 正解' : ''}
                            </p>
                          ))}
                        </div>
                      )}
                      {q.type === '○×' && <p className="text-xs mt-1">正解：{q.answer || '未設定'}</p>}
                      {q.type === '記述' && q.answer && <p className="text-xs text-gray mt-1">模範解答：{q.answer}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}

      {createModal && (
        <TestModal
          students={students.items}
          onSave={(data) => { tests.add(data); setCreateModal(false); }}
          onClose={() => setCreateModal(false)}
        />
      )}
      {scoreModal && (
        <ScoreModal
          test={scoreModal}
          onSave={(data) => { tests.update(scoreModal.id, data); setScoreModal(null); }}
          onClose={() => setScoreModal(null)}
        />
      )}
    </div>
  );
}
