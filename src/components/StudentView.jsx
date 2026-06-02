import { useState } from 'react';
import { CheckCircle, Circle, BookOpen, ClipboardList, User, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isToday } from 'date-fns';
import { ja } from 'date-fns/locale';

const DAY_NAMES = ['日', '月', '火', '水', '木', '金', '土'];
const SUBJECTS = ['国語', '数学', '英語', '理科', '社会', 'その他'];

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

function StudentCalendar({ student, store }) {
  const [current, setCurrent] = useState(new Date());

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
    return ev;
  };

  return (
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
            return (
              <div key={dateStr} className={`calendar-cell ${!isSameMonth(d, current) ? 'other-month' : ''} ${isToday(d) ? 'today' : ''}`}>
                <div className="calendar-cell-date" style={{ color: dow === 0 ? '#dc2626' : dow === 6 ? '#4f46e5' : undefined }}>
                  {format(d, 'd')}
                </div>
                <div className="calendar-events">
                  {events.slice(0, 2).map((ev, i) => (
                    <div key={i} className={`calendar-event event-${ev.type}`}>{ev.label}</div>
                  ))}
                  {events.length > 2 && <div className="calendar-event" style={{ background: 'var(--gray-100)', color: 'var(--gray-500)' }}>+{events.length - 2}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
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

export default function StudentView({ student, store }) {
  const [tab, setTab] = useState('homework');
  const [hwFilter, setHwFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);
  const [workbookModal, setWorkbookModal] = useState(false);

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

        {tab === 'calendar' && (
          <div>
            <div className="page-header">
              <h2>カレンダー</h2>
              <p>授業・宿題提出日・テストの予定</p>
            </div>
            <StudentCalendar student={student} store={store} />
            {upcoming.length > 0 && (
              <div className="card mt-3">
                <p className="text-sm font-bold mb-2">今後の予定一覧</p>
                {upcoming.map((ev, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <span className={`calendar-event event-${ev.type}`} style={{ flexShrink: 0, padding: '2px 6px', borderRadius: 4, fontSize: 11 }}>{ev.date}</span>
                    <span className="text-sm">{ev.label}</span>
                  </div>
                ))}
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
    </>
  );
}
