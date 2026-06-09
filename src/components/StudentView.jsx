import { useState } from 'react';
import { CheckCircle, Circle, BookOpen, ClipboardList, User, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Plus, X, Trash2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isToday } from 'date-fns';
import { ja } from 'date-fns/locale';

const DAY_NAMES = ['日', '月', '火', '水', '木', '金', '土'];
const SUBJECTS = ['国語', '数学', '英語', '理科', '社会', 'その他'];
const EVENT_TYPES = ['勉強', '部活', '習い事', 'その他'];
const EVENT_COLORS = { 勉強: '#4f46e5', 部活: '#16a34a', 習い事: '#ea580c', その他: '#6b7280' };
const Q_TYPES = ['記述', '選択', '○×'];

function StudentEventModal({ studentId, initialDate, onSave, onClose }) {
  const [form, setForm] = useState({ title: '', date: initialDate || format(new Date(), 'yyyy-MM-dd'), type: 'その他', memo: '' });

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date) return;
    onSave({ ...form, studentId });
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">予定を追加</span>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={submit}>
          <div className="form-group">
            <label>タイトル *</label>
            <input className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="例：塾の自習、サッカー練習" />
          </div>
          <div className="form-group">
            <label>日付 *</label>
            <input type="date" className="form-control" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="form-group">
            <label>カテゴリ</label>
            <select className="form-control" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>メモ</label>
            <textarea className="form-control" rows={2} value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} placeholder="詳細・場所など" />
          </div>
          <div className="flex gap-2 justify-between mt-3">
            <button type="button" className="btn btn-ghost" onClick={onClose}>キャンセル</button>
            <button type="submit" className="btn btn-primary"><Plus size={16} />追加</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StudentWorkbookModal({ studentId, onSave, onClose }) {
  const [form, setForm] = useState({ subject: '', title: '', totalPages: 100, startPage: 1 });

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || form.totalPages < 1) return;
    const pages = {};
    for (let i = form.startPage; i <= form.startPage + form.totalPages - 1; i++) pages[i] = false;
    onSave({ ...form, studentId, pages, totalPages: Number(form.totalPages), startPage: Number(form.startPage) });
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">ワークを追加</span>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={submit}>
          <div className="form-group">
            <label>科目</label>
            <select className="form-control" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
              <option value="">選択してください</option>
              {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>ワーク名 *</label>
            <input className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="例：中学数学 標準問題集" />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>開始ページ</label>
              <input type="number" className="form-control" min={1} value={form.startPage} onChange={(e) => setForm({ ...form, startPage: Number(e.target.value) })} />
            </div>
            <div className="form-group">
              <label>総ページ数</label>
              <input type="number" className="form-control" min={1} max={500} value={form.totalPages} onChange={(e) => setForm({ ...form, totalPages: Number(e.target.value) })} />
            </div>
          </div>
          <div className="flex gap-2 justify-between mt-3">
            <button type="button" className="btn btn-ghost" onClick={onClose}>キャンセル</button>
            <button type="submit" className="btn btn-primary"><Plus size={16} />追加</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StudentCalendar({ student, store, onAddEvent }) {
  const [current, setCurrent] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const monthStart = startOfMonth(current);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(endOfMonth(current), { weekStartsOn: 0 });

  const days = [];
  let day = gridStart;
  while (day <= gridEnd) { days.push(day); day = addDays(day, 1); }

  const getEvents = (dateStr) => {
    const ev = [];
    store.sessions.items.filter((s) => s.studentId === student.id && s.date === dateStr)
      .forEach((s) => ev.push({ type: 'session', label: `授業 ${s.startTime}` }));
    store.homework.items.filter((h) => h.studentId === student.id && h.dueDate === dateStr && !h.done)
      .forEach((h) => ev.push({ type: 'homework', label: h.title }));
    store.tests.items.filter((t) => t.studentId === student.id && t.date === dateStr)
      .forEach((t) => ev.push({ type: 'test', label: t.title }));
    store.studentEvents.items.filter((e) => e.studentId === student.id && e.date === dateStr)
      .forEach((e) => ev.push({ type: 'student', label: e.title, color: EVENT_COLORS[e.type] || EVENT_COLORS['その他'] }));
    return ev;
  };

  const dayEvents = selectedDate ? getEvents(selectedDate) : [];
  const dayStudentEvents = selectedDate
    ? store.studentEvents.items.filter((e) => e.studentId === student.id && e.date === selectedDate)
    : [];

  return (
    <div>
      <div className="calendar">
        <div className="calendar-header">
          <button className="btn btn-ghost btn-sm" onClick={() => setCurrent(subMonths(current, 1))}><ChevronLeft size={16} /></button>
          <h3>{format(current, 'yyyy年M月', { locale: ja })}</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => setCurrent(addMonths(current, 1))}><ChevronRight size={16} /></button>
        </div>
        <div className="calendar-grid">
          <div className="calendar-days-grid">
            {DAY_NAMES.map((d, i) => (
              <div key={d} className="calendar-day-name" style={{ color: i === 0 ? '#dc2626' : i === 6 ? '#4f46e5' : undefined }}>{d}</div>
            ))}
            {days.map((d) => {
              const dateStr = format(d, 'yyyy-MM-dd');
              const events = getEvents(dateStr);
              const dow = d.getDay();
              const isSelected = selectedDate === dateStr;
              return (
                <div
                  key={dateStr}
                  className={`calendar-cell ${!isSameMonth(d, current) ? 'other-month' : ''} ${isToday(d) ? 'today' : ''}`}
                  style={{ cursor: 'pointer', outline: isSelected ? '2px solid var(--primary)' : undefined, borderRadius: isSelected ? 6 : undefined }}
                  onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                >
                  <div className="calendar-cell-date" style={{ color: dow === 0 ? '#dc2626' : dow === 6 ? '#4f46e5' : undefined }}>
                    {format(d, 'd')}
                  </div>
                  <div className="calendar-events">
                    {events.slice(0, 2).map((ev, i) => (
                      <div key={i} className={`calendar-event ${ev.color ? '' : `event-${ev.type}`}`} style={ev.color ? { background: ev.color + '22', color: ev.color, borderLeft: `2px solid ${ev.color}` } : undefined}>{ev.label}</div>
                    ))}
                    {events.length > 2 && <div className="calendar-event" style={{ background: 'var(--gray-100)', color: 'var(--gray-500)' }}>+{events.length - 2}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selectedDate && (
        <div className="card mt-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold">{selectedDate} の予定</p>
            <button className="btn btn-primary btn-sm" onClick={() => onAddEvent(selectedDate)}><Plus size={14} />予定を追加</button>
          </div>
          {dayEvents.length === 0 ? (
            <p className="text-sm text-gray">予定はありません</p>
          ) : (
            <div>
              {dayEvents.map((ev, i) => (
                <div key={i} className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`calendar-event ${ev.color ? '' : `event-${ev.type}`}`} style={ev.color ? { background: ev.color + '22', color: ev.color, borderLeft: `2px solid ${ev.color}`, flexShrink: 0 } : { flexShrink: 0 }}>
                      {ev.type === 'student' ? 'マイ予定' : ev.type === 'session' ? '授業' : ev.type === 'homework' ? '宿題' : 'テスト'}
                    </div>
                    <span className="text-sm">{ev.label}</span>
                  </div>
                  {ev.type === 'student' && (
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => {
                        const found = dayStudentEvents.find((e) => e.title === ev.label);
                        if (found) store.studentEvents.remove(found.id);
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PageGrid({ wb, onToggle }) {
  const pages = wb.pages ?? {};
  const pageNums = Object.keys(pages).map(Number).sort((a, b) => a - b);
  const done = pageNums.filter((p) => pages[p]).length;
  const pct = pageNums.length > 0 ? Math.round((done / pageNums.length) * 100) : 0;
  const fillClass = pct < 30 ? 'danger' : pct < 70 ? 'warning' : 'success';

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray">{done} / {pageNums.length} ページ完了</span>
        <span className="text-xs font-bold" style={{ color: pct < 30 ? 'var(--danger)' : pct < 70 ? 'var(--warning)' : 'var(--success)' }}>{pct}%</span>
      </div>
      <div className="progress-bar mb-2">
        <div className={`progress-fill ${fillClass}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="page-grid">
        {pageNums.map((p) => (
          <button
            key={p}
            className={`page-cell ${pages[p] ? 'done' : 'undone'}`}
            title={`p.${p}`}
            onClick={() => onToggle(wb.id, p)}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── 自主テスト: 作成フォーム ───────────────────────────────────────────────
function SelfTestCreateForm({ studentId, onSave, onCancel }) {
  const [form, setForm] = useState({ title: '', subject: '', questions: [] });

  const addQ = () =>
    setForm((f) => ({ ...f, questions: [...f.questions, { text: '', type: '記述', choices: ['', '', '', ''], answer: '', points: 5 }] }));

  const removeQ = (i) => setForm((f) => ({ ...f, questions: f.questions.filter((_, idx) => idx !== i) }));

  const updateQ = (i, patch) =>
    setForm((f) => ({ ...f, questions: f.questions.map((q, idx) => (idx === i ? { ...q, ...patch } : q)) }));

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
    if (!form.title.trim() || form.questions.length === 0) return;
    onSave({ ...form, studentId, attempts: [], createdAt: format(new Date(), 'yyyy-MM-dd') });
  };

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div><h2>テストを作る</h2><p>問題を追加して自分用のテストを作成します</p></div>
        <button className="btn btn-ghost btn-sm" onClick={onCancel}>← 一覧に戻る</button>
      </div>
      <form onSubmit={submit}>
        <div className="card mb-3">
          <div className="grid-2">
            <div className="form-group">
              <label>タイトル *</label>
              <input className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="例：英単語テスト" />
            </div>
            <div className="form-group">
              <label>科目</label>
              <select className="form-control" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                <option value="">選択</option>
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold">問題 ({form.questions.length}問)</p>
            <button type="button" className="btn btn-sm btn-ghost" onClick={addQ}><Plus size={14} />問題を追加</button>
          </div>

          {form.questions.length === 0 && (
            <div className="empty-state"><BookOpen size={32} color="var(--gray-300)" /><p>「問題を追加」から問題を作りましょう</p></div>
          )}

          {form.questions.map((q, i) => (
            <div className="question-block" key={i} style={{ marginBottom: 12 }}>
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
                  <label style={{ fontSize: 12 }}>模範解答（任意）</label>
                  <input className="form-control" value={q.answer} onChange={(e) => updateQ(i, { answer: e.target.value })} placeholder="自分で確認するための答え" />
                </div>
              )}
              <div className="form-group" style={{ marginTop: 8, marginBottom: 0 }}>
                <label style={{ fontSize: 12 }}>配点</label>
                <input type="number" className="form-control" style={{ width: 80 }} min={1} value={q.points} onChange={(e) => updateQ(i, { points: Number(e.target.value) })} />
              </div>
            </div>
          ))}

          {form.questions.length > 0 && (
            <div className="flex gap-2 justify-between mt-3">
              <button type="button" className="btn btn-ghost" onClick={onCancel}>キャンセル</button>
              <button type="submit" className="btn btn-primary"><Plus size={16} />テストを保存</button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

// ─── 自主テスト: 実施画面 ─────────────────────────────────────────────────────
function SelfTestTakeView({ test, onFinish, onCancel }) {
  const [answers, setAnswers] = useState({});

  const submit = (e) => {
    e.preventDefault();
    let score = 0;
    let total = 0;
    test.questions.forEach((q, i) => {
      total += q.points ?? 0;
      if (q.type === '記述') {
        // 記述は自己採点なのでスキップ（後で結果画面で確認）
      } else {
        if (answers[i] === q.answer) score += q.points ?? 0;
      }
    });
    const attempt = { date: format(new Date(), 'yyyy-MM-dd'), answers, score, total };
    onFinish(attempt);
  };

  const totalPoints = test.questions.reduce((s, q) => s + (q.points ?? 0), 0);

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <h2>{test.title}</h2>
          <p>{test.subject && <span className="badge badge-gray mr-1">{test.subject}</span>}全{test.questions.length}問 / 計{totalPoints}点</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onCancel}>← 中断</button>
      </div>
      <form onSubmit={submit}>
        {test.questions.map((q, i) => (
          <div className="card mb-3" key={i}>
            <div className="flex items-center gap-2 mb-3">
              <span className="badge badge-primary">Q{i + 1}</span>
              <span className="badge badge-gray">{q.type}</span>
              <span className="text-xs text-gray">{q.points}点</span>
            </div>
            <p className="text-sm font-bold mb-3">{q.text || `問題 ${i + 1}`}</p>

            {q.type === '選択' && (
              <div className="question-options">
                {q.choices.filter(Boolean).map((c, ci) => (
                  <label key={ci} className="option-row" style={{ cursor: 'pointer', padding: '8px 10px', border: '1px solid var(--gray-200)', borderRadius: 6, marginBottom: 6, background: answers[i] === String(ci) ? 'var(--primary-light)' : 'white' }}>
                    <input type="radio" name={`q-${i}`} checked={answers[i] === String(ci)} onChange={() => setAnswers({ ...answers, [i]: String(ci) })} />
                    <span className="text-sm">{c}</span>
                  </label>
                ))}
              </div>
            )}
            {q.type === '○×' && (
              <div className="question-options" style={{ gap: 8 }}>
                {['○', '×'].map((v) => (
                  <label key={v} className="option-row" style={{ cursor: 'pointer', padding: '10px 24px', border: '1px solid var(--gray-200)', borderRadius: 6, justifyContent: 'center', background: answers[i] === v ? 'var(--primary-light)' : 'white', fontWeight: 700, fontSize: 18 }}>
                    <input type="radio" name={`q-${i}`} checked={answers[i] === v} onChange={() => setAnswers({ ...answers, [i]: v })} style={{ display: 'none' }} />
                    {v}
                  </label>
                ))}
              </div>
            )}
            {q.type === '記述' && (
              <textarea
                className="form-control"
                rows={3}
                placeholder="解答を入力..."
                value={answers[i] ?? ''}
                onChange={(e) => setAnswers({ ...answers, [i]: e.target.value })}
              />
            )}
          </div>
        ))}

        <div className="flex gap-2 justify-between mt-2">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>中断</button>
          <button type="submit" className="btn btn-primary">提出して採点</button>
        </div>
      </form>
    </div>
  );
}

// ─── 自主テスト: 結果画面 ─────────────────────────────────────────────────────
function SelfTestResultView({ test, attempt, onRetry, onBack }) {
  const autoScore = test.questions.reduce((s, q, i) => {
    if (q.type === '記述') return s;
    return s + (attempt.answers[i] === q.answer ? (q.points ?? 0) : 0);
  }, 0);
  const autoTotal = test.questions.reduce((s, q) => q.type === '記述' ? s : s + (q.points ?? 0), 0);
  const hasKijutsu = test.questions.some((q) => q.type === '記述');

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div><h2>採点結果</h2><p>{test.title}</p></div>
        <button className="btn btn-ghost btn-sm" onClick={onBack}>← 一覧に戻る</button>
      </div>

      <div className="card mb-3" style={{ textAlign: 'center', padding: '24px 16px' }}>
        <p className="text-xs text-gray mb-1">自動採点スコア（選択・○×）</p>
        <p style={{ fontSize: 40, fontWeight: 900, color: autoScore / autoTotal >= 0.8 ? 'var(--success)' : autoScore / autoTotal >= 0.5 ? 'var(--warning)' : 'var(--danger)' }}>
          {autoScore} <span style={{ fontSize: 18, fontWeight: 400 }}>/ {autoTotal} 点</span>
        </p>
        {hasKijutsu && <p className="text-xs text-gray mt-2">記述問題は自己採点してください</p>}
        <div className="flex gap-2 justify-center mt-4">
          <button className="btn btn-ghost" onClick={onBack}>一覧へ</button>
          <button className="btn btn-primary" onClick={onRetry}>もう一度解く</button>
        </div>
      </div>

      {test.questions.map((q, i) => {
        const userAns = attempt.answers[i];
        const isCorrect = q.type === '記述' ? null : userAns === q.answer;
        return (
          <div className="card mb-2" key={i} style={{ borderLeft: `4px solid ${q.type === '記述' ? 'var(--gray-300)' : isCorrect ? 'var(--success)' : 'var(--danger)'}` }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-primary">Q{i + 1}</span>
              <span className="badge badge-gray">{q.type}</span>
              {q.type !== '記述' && (
                <span className={`badge ${isCorrect ? 'badge-success' : 'badge-danger'}`}>{isCorrect ? '正解' : '不正解'}</span>
              )}
              {q.type === '記述' && <span className="badge badge-gray">自己採点</span>}
            </div>
            <p className="text-sm font-bold mb-2">{q.text || `問題 ${i + 1}`}</p>
            {q.type === '選択' && (
              <div>
                <p className="text-xs" style={{ color: isCorrect ? 'var(--success)' : 'var(--danger)' }}>
                  あなたの答え: {userAns !== undefined ? q.choices[Number(userAns)] : '未回答'}
                </p>
                {!isCorrect && <p className="text-xs text-gray">正解: {q.choices[Number(q.answer)]}</p>}
              </div>
            )}
            {q.type === '○×' && (
              <div>
                <p className="text-xs" style={{ color: isCorrect ? 'var(--success)' : 'var(--danger)' }}>
                  あなたの答え: {userAns ?? '未回答'}
                </p>
                {!isCorrect && <p className="text-xs text-gray">正解: {q.answer}</p>}
              </div>
            )}
            {q.type === '記述' && (
              <div>
                <p className="text-xs text-gray mb-1">あなたの答え: {userAns || '（未回答）'}</p>
                {q.answer && <p className="text-xs" style={{ color: 'var(--primary)' }}>模範解答: {q.answer}</p>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── 自主テスト: 一覧 ─────────────────────────────────────────────────────────
function SelfTestListView({ student, store, onCreate, onTake }) {
  const myTests = store.selfTests.items
    .filter((t) => t.studentId === student.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div><h2>自主テスト</h2><p>自分で作って解けるテスト</p></div>
        <button className="btn btn-primary btn-sm" onClick={onCreate}><Plus size={14} />テストを作る</button>
      </div>

      {myTests.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <BookOpen size={40} color="var(--gray-300)" />
            <p>まだテストがありません。「テストを作る」から始めましょう！</p>
          </div>
        </div>
      ) : (
        myTests.map((t) => {
          const totalPoints = t.questions.reduce((s, q) => s + (q.points ?? 0), 0);
          const lastAttempt = t.attempts?.length > 0 ? t.attempts[t.attempts.length - 1] : null;
          const autoTotal = t.questions.reduce((s, q) => q.type === '記述' ? s : s + (q.points ?? 0), 0);
          return (
            <div className="card mb-3" key={t.id}>
              <div className="flex items-center justify-between">
                <div style={{ flex: 1 }}>
                  <p className="font-bold">{t.title}</p>
                  <div className="flex gap-2 mt-1" style={{ flexWrap: 'wrap' }}>
                    {t.subject && <span className="badge badge-gray">{t.subject}</span>}
                    <span className="badge badge-primary">{t.questions.length}問 / 計{totalPoints}点</span>
                    <span className="text-xs text-gray">作成: {t.createdAt}</span>
                    {t.attempts?.length > 0 && <span className="badge badge-gray">{t.attempts.length}回受験</span>}
                    {lastAttempt && (
                      <span className="badge badge-success">最高: {lastAttempt.score} / {autoTotal}点</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-primary btn-sm" onClick={() => onTake(t)}>解く</button>
                  <button className="btn btn-sm btn-ghost" onClick={() => store.selfTests.remove(t.id)}><Trash2 size={12} /></button>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default function StudentView({ student, store }) {
  const [tab, setTab] = useState('homework');
  const [hwFilter, setHwFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);
  const [workbookModal, setWorkbookModal] = useState(false);
  const [eventModal, setEventModal] = useState(null); // null | date string
  // 自主テスト
  const [selfTestMode, setSelfTestMode] = useState('list'); // 'list' | 'create' | 'take' | 'result'
  const [takingTest, setTakingTest] = useState(null);
  const [testResult, setTestResult] = useState(null); // { test, attempt }

  const today = format(new Date(), 'yyyy-MM-dd');

  const myHw = store.homework.items
    .filter((h) => h.studentId === student.id)
    .filter((h) => hwFilter === 'all' ? true : hwFilter === 'pending' ? !h.done : h.done)
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });

  const myWb = store.workbooks.items.filter((w) => w.studentId === student.id);

  const myTests = [...store.tests.items.filter((t) => t.studentId === student.id)]
    .sort((a, b) => b.date.localeCompare(a.date));

  const upcoming = [
    ...store.sessions.items
      .filter((s) => s.studentId === student.id && s.date >= today)
      .map((s) => ({ date: s.date, label: `授業 ${s.startTime}〜${s.endTime}`, type: 'session' })),
    ...store.homework.items
      .filter((h) => h.studentId === student.id && h.dueDate && h.dueDate >= today && !h.done)
      .map((h) => ({ date: h.dueDate, label: `宿題提出: ${h.title}`, type: 'homework' })),
    ...store.tests.items
      .filter((t) => t.studentId === student.id && t.date >= today)
      .map((t) => ({ date: t.date, label: `テスト: ${t.title}`, type: 'test' })),
  ].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 10);

  const togglePage = (wbId, page) => {
    const wb = store.workbooks.items.find((w) => w.id === wbId);
    if (!wb) return;
    store.workbooks.update(wbId, { pages: { ...wb.pages, [page]: !wb.pages[page] } });
  };

  const pendingCount = store.homework.items.filter((h) => h.studentId === student.id && !h.done).length;
  const upcomingTestCount = store.tests.items.filter((t) => t.studentId === student.id && t.date >= today).length;

  const TABS = [
    { id: 'homework', label: '宿題管理', badge: pendingCount > 0 ? pendingCount : null },
    { id: 'workbook', label: 'ワーク進捗' },
    { id: 'tests', label: 'テスト', badge: upcomingTestCount > 0 ? upcomingTestCount : null },
    { id: 'selftest', label: '自主テスト' },
    { id: 'calendar', label: '今後の予定' },
  ];

  return (
    <>
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
      <div style={{ background: 'white', borderBottom: '1px solid var(--gray-200)', padding: '16px 20px' }}>
        <div className="flex items-center gap-2">
          <div style={{ background: 'var(--primary-light)', width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <User size={18} color="var(--primary)" />
          </div>
          <div>
            <p className="font-bold" style={{ fontSize: 16 }}>{student.name}</p>
            <p className="text-xs text-gray">{student.grade} — Educate</p>
          </div>
        </div>
        <div className="flex gap-2 mt-3" style={{ flexWrap: 'wrap' }}>
          {TABS.map(({ id, label, badge }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`btn btn-sm ${tab === id ? 'btn-primary' : 'btn-ghost'}`}
            >
              {label}
              {badge && (
                <span style={{ background: 'var(--danger)', color: 'white', borderRadius: 99, fontSize: 10, fontWeight: 700, padding: '1px 5px', marginLeft: 4 }}>
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px 16px', maxWidth: 800, margin: '0 auto' }}>

        {tab === 'homework' && (
          <div>
            <div className="page-header">
              <h2>宿題管理</h2>
              <p>宿題の確認と完了の記録</p>
            </div>
            <div className="flex gap-2 mb-3">
              {[['all', 'すべて'], ['pending', '未完了'], ['done', '完了済み']].map(([v, label]) => (
                <button key={v} className={`btn btn-sm ${hwFilter === v ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setHwFilter(v)}>{label}</button>
              ))}
            </div>
            <div className="card">
              {myHw.length === 0 ? (
                <div className="empty-state">
                  <ClipboardList size={40} color="var(--gray-300)" />
                  <p>{hwFilter === 'pending' ? '未完了の宿題はありません' : hwFilter === 'done' ? '完了した宿題はありません' : '宿題が登録されていません'}</p>
                </div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>完了</th>
                        <th>科目</th>
                        <th>内容</th>
                        <th>提出期限</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myHw.map((h) => {
                        const overdue = !h.done && h.dueDate && h.dueDate < today;
                        return (
                          <tr key={h.id} style={{ opacity: h.done ? 0.6 : 1 }}>
                            <td>
                              <button
                                className="close-btn"
                                style={{ color: h.done ? 'var(--success)' : 'var(--gray-300)' }}
                                onClick={() => store.homework.update(h.id, { done: !h.done })}
                              >
                                {h.done ? <CheckCircle size={20} /> : <Circle size={20} />}
                              </button>
                            </td>
                            <td>{h.subject && <span className="badge badge-gray">{h.subject}</span>}</td>
                            <td style={{ textDecoration: h.done ? 'line-through' : 'none' }}>{h.title}</td>
                            <td>
                              {h.dueDate ? (
                                <span className={`badge ${h.done ? 'badge-gray' : overdue ? 'badge-danger' : 'badge-warning'}`}>
                                  {h.dueDate}
                                </span>
                              ) : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'workbook' && (
          <div>
            <div className="page-header flex justify-between items-center">
              <div>
                <h2>ワーク進捗</h2>
                <p>問題集のページごとの進捗</p>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setWorkbookModal(true)}><Plus size={14} />ワークを追加</button>
            </div>
            {myWb.length === 0 ? (
              <div className="card">
                <div className="empty-state">
                  <BookOpen size={40} color="var(--gray-300)" />
                  <p>ワークが登録されていません</p>
                </div>
              </div>
            ) : (
              <div className="grid-2">
                {myWb.map((wb) => (
                  <div className="card" key={wb.id}>
                    <div className="mb-2">
                      <p className="font-bold">{wb.title}</p>
                      {wb.subject && <span className="badge badge-gray mt-1">{wb.subject}</span>}
                    </div>
                    <div className="divider" />
                    <PageGrid wb={wb} onToggle={togglePage} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'tests' && (
          <div>
            <div className="page-header">
              <h2>テスト</h2>
              <p>テストの予定と結果</p>
            </div>
            {myTests.length === 0 ? (
              <div className="card">
                <div className="empty-state">
                  <BookOpen size={40} color="var(--gray-300)" />
                  <p>テストが登録されていません</p>
                </div>
              </div>
            ) : (
              myTests.map((t) => {
                const totalPoints = t.questions?.reduce((s, q) => s + (q.points ?? 0), 0) ?? 0;
                const isExpanded = expanded === t.id;
                const isPast = t.date < today;
                return (
                  <div className="card mb-3" key={t.id}>
                    <div className="flex items-center gap-2">
                      <button className="close-btn" onClick={() => setExpanded(isExpanded ? null : t.id)}>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      <div style={{ flex: 1 }}>
                        <p className="font-bold">{t.title}</p>
                        <div className="flex gap-2 mt-1">
                          {t.subject && <span className="badge badge-gray">{t.subject}</span>}
                          <span className={`badge ${isPast ? 'badge-gray' : 'badge-danger'}`}>{t.date}</span>
                          {t.score !== undefined && (
                            <span className="badge badge-success">{t.score} / {totalPoints}点</span>
                          )}
                        </div>
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
                                  <p key={ci} className="text-xs text-gray">{ci + 1}. {c}</p>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {tab === 'selftest' && (
          selfTestMode === 'create' ? (
            <SelfTestCreateForm
              studentId={student.id}
              onSave={(data) => { store.selfTests.add(data); setSelfTestMode('list'); }}
              onCancel={() => setSelfTestMode('list')}
            />
          ) : selfTestMode === 'take' && takingTest ? (
            <SelfTestTakeView
              test={takingTest}
              onFinish={(attempt) => {
                const updated = [...(takingTest.attempts ?? []), attempt];
                store.selfTests.update(takingTest.id, { attempts: updated });
                setTestResult({ test: { ...takingTest, attempts: updated }, attempt });
                setSelfTestMode('result');
              }}
              onCancel={() => { setTakingTest(null); setSelfTestMode('list'); }}
            />
          ) : selfTestMode === 'result' && testResult ? (
            <SelfTestResultView
              test={testResult.test}
              attempt={testResult.attempt}
              onRetry={() => { setTakingTest(testResult.test); setSelfTestMode('take'); }}
              onBack={() => { setTestResult(null); setSelfTestMode('list'); }}
            />
          ) : (
            <SelfTestListView
              student={student}
              store={store}
              onCreate={() => setSelfTestMode('create')}
              onTake={(t) => { setTakingTest(t); setSelfTestMode('take'); }}
            />
          )
        )}

        {tab === 'calendar' && (
          <div>
            <div className="page-header flex justify-between items-center">
              <div>
                <h2>カレンダー</h2>
                <p>授業・宿題提出日・テストの予定、自分の予定</p>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setEventModal(format(new Date(), 'yyyy-MM-dd'))}><Plus size={14} />予定を追加</button>
            </div>
            <div className="flex gap-2 mb-3" style={{ flexWrap: 'wrap', fontSize: 12 }}>
              <span className="calendar-event event-session">授業</span>
              <span className="calendar-event event-homework">宿題</span>
              <span className="calendar-event event-test">テスト</span>
              <span className="calendar-event" style={{ background: '#4f46e522', color: '#4f46e5', borderLeft: '2px solid #4f46e5' }}>マイ予定</span>
            </div>
            <StudentCalendar student={student} store={store} onAddEvent={(date) => setEventModal(date)} />
            {upcoming.length > 0 && (
              <div className="card mt-3">
                <p className="text-sm font-bold mb-2">今後の予定一覧</p>
                {[
                  ...upcoming,
                  ...store.studentEvents.items
                    .filter((e) => e.studentId === student.id && e.date >= today)
                    .map((e) => ({ date: e.date, label: e.title, type: 'student', color: EVENT_COLORS[e.type] || EVENT_COLORS['その他'] }))
                ]
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .map((ev, i) => (
                    <div key={i} className="flex items-center gap-2 mb-2">
                      <span
                        className={`calendar-event ${ev.color ? '' : `event-${ev.type}`}`}
                        style={ev.color ? { background: ev.color + '22', color: ev.color, borderLeft: `2px solid ${ev.color}`, flexShrink: 0, padding: '2px 6px', borderRadius: 4, fontSize: 11 } : { flexShrink: 0, padding: '2px 6px', borderRadius: 4, fontSize: 11 }}
                      >
                        {ev.date}
                      </span>
                      <span className="text-sm">{ev.label}</span>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        )}
      </div>
    </div>

      {workbookModal && (
        <StudentWorkbookModal
          studentId={student.id}
          onSave={(data) => { store.workbooks.add(data); setWorkbookModal(false); }}
          onClose={() => setWorkbookModal(false)}
        />
      )}
      {eventModal !== null && (
        <StudentEventModal
          studentId={student.id}
          initialDate={eventModal}
          onSave={(data) => { store.studentEvents.add(data); setEventModal(null); }}
          onClose={() => setEventModal(null)}
        />
      )}
    </>
  );
}
