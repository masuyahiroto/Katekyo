import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Trash2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isToday } from 'date-fns';
import { ja } from 'date-fns/locale';

const DAY_NAMES = ['日', '月', '火', '水', '木', '金', '土'];

function SessionModal({ students, onSave, onClose }) {
  const [form, setForm] = useState({ studentId: '', date: format(new Date(), 'yyyy-MM-dd'), startTime: '17:00', endTime: '18:30', memo: '' });

  const submit = (e) => {
    e.preventDefault();
    if (!form.studentId) return;
    onSave(form);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">授業日を追加</span>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={submit}>
          <div className="form-group">
            <label>生徒 *</label>
            <select className="form-control" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })}>
              <option value="">選択してください</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>日付</label>
            <input type="date" className="form-control" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>開始時刻</label>
              <input type="time" className="form-control" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
            </div>
            <div className="form-group">
              <label>終了時刻</label>
              <input type="time" className="form-control" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>メモ</label>
            <textarea className="form-control" rows={2} value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} />
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

export default function CalendarView({ store }) {
  const { students, homework, sessions, tests } = store;
  const [current, setCurrent] = useState(new Date());
  const [modal, setModal] = useState(false);

  const monthStart = startOfMonth(current);
  const monthEnd = endOfMonth(current);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = [];
  let day = gridStart;
  while (day <= gridEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const studentName = (id) => students.items.find((s) => s.id === id)?.name ?? '—';

  const getEvents = (dateStr) => {
    const ev = [];
    sessions.items.filter((s) => s.date === dateStr).forEach((s) => {
      ev.push({ type: 'session', label: `${studentName(s.studentId)} 授業` });
    });
    homework.items.filter((h) => h.dueDate === dateStr && !h.done).forEach((h) => {
      ev.push({ type: 'homework', label: `${studentName(h.studentId)} 宿題` });
    });
    tests.items.filter((t) => t.date === dateStr).forEach((t) => {
      ev.push({ type: 'test', label: t.title });
    });
    return ev;
  };

  // List of upcoming events for sidebar
  const today = format(new Date(), 'yyyy-MM-dd');
  const upcoming = [
    ...sessions.items.filter((s) => s.date >= today).map((s) => ({ date: s.date, label: `${studentName(s.studentId)} 授業 ${s.startTime}`, type: 'session' })),
    ...homework.items.filter((h) => h.dueDate && h.dueDate >= today && !h.done).map((h) => ({ date: h.dueDate, label: `${studentName(h.studentId)} 宿題提出`, type: 'homework' })),
    ...tests.items.filter((t) => t.date >= today).map((t) => ({ date: t.date, label: t.title, type: 'test' })),
  ].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 10);

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <h2>カレンダー</h2>
          <p>授業日・提出日・テスト日を一覧確認</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={16} />授業日を追加</button>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: '1fr 280px' }}>
        {/* Calendar */}
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
                const sameMonth = isSameMonth(d, current);
                const today_ = isToday(d);
                const dow = d.getDay();
                return (
                  <div key={dateStr} className={`calendar-cell ${!sameMonth ? 'other-month' : ''} ${today_ ? 'today' : ''}`}>
                    <div className="calendar-cell-date" style={{ color: dow === 0 ? '#dc2626' : dow === 6 ? '#4f46e5' : undefined }}>
                      {format(d, 'd')}
                    </div>
                    <div className="calendar-events">
                      {events.slice(0, 3).map((ev, i) => (
                        <div key={i} className={`calendar-event event-${ev.type}`}>{ev.label}</div>
                      ))}
                      {events.length > 3 && <div className="calendar-event" style={{ background: 'var(--gray-100)', color: 'var(--gray-500)' }}>+{events.length - 3}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upcoming list */}
        <div className="card">
          <div className="card-header"><span className="card-title">今後の予定</span></div>
          {upcoming.length === 0 ? (
            <div className="empty-state"><p>予定はありません</p></div>
          ) : (
            upcoming.map((ev, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <span className={`calendar-event event-${ev.type}`} style={{ flexShrink: 0 }}>{ev.date}</span>
                <span className="text-sm">{ev.label}</span>
              </div>
            ))
          )}

          <div className="divider" />
          <p className="text-xs text-gray mb-2">授業日の一覧</p>
          {sessions.items.length === 0 ? (
            <p className="text-sm text-gray">授業日がありません</p>
          ) : (
            sessions.items.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8).map((s) => (
              <div key={s.id} className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm">{s.date} {s.startTime}〜{s.endTime}</p>
                  <p className="text-xs text-gray">{studentName(s.studentId)}</p>
                </div>
                <button className="btn btn-sm btn-ghost" onClick={() => sessions.remove(s.id)}><Trash2 size={12} /></button>
              </div>
            ))
          )}
        </div>
      </div>

      {modal && (
        <SessionModal
          students={students.items}
          onSave={(data) => { sessions.add(data); setModal(false); }}
          onClose={() => setModal(false)}
        />
      )}
    </div>
  );
}
