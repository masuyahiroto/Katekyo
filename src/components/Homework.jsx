import { useState } from 'react';
import { Plus, X, CheckCircle, Circle, Trash2, ClipboardList } from 'lucide-react';
import { format } from 'date-fns';

const SUBJECTS = ['国語', '数学', '英語', '理科', '社会', 'その他'];

function HwModal({ students, onSave, onClose }) {
  const [form, setForm] = useState({ studentId: '', subject: '', title: '', dueDate: '', memo: '' });

  const submit = (e) => {
    e.preventDefault();
    if (!form.studentId || !form.title.trim()) return;
    onSave({ ...form, done: false, assignedDate: format(new Date(), 'yyyy-MM-dd') });
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">宿題を追加</span>
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
            <label>科目</label>
            <select className="form-control" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
              <option value="">選択してください</option>
              {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>内容 *</label>
            <input className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="例：教科書 p.42〜45 の問題" />
          </div>
          <div className="form-group">
            <label>提出期限</label>
            <input type="date" className="form-control" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
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

export default function Homework({ store }) {
  const { students, homework } = store;
  const [modal, setModal] = useState(false);
  const [filter, setFilter] = useState('all'); // all | pending | done

  const today = format(new Date(), 'yyyy-MM-dd');

  const items = homework.items
    .filter((h) => filter === 'all' ? true : filter === 'pending' ? !h.done : h.done)
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });

  const studentName = (id) => students.items.find((s) => s.id === id)?.name ?? '—';

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <h2>宿題管理</h2>
          <p>宿題の出題・完了状況を管理します</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={16} />宿題を追加</button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-3">
        {[['all', 'すべて'], ['pending', '未完了'], ['done', '完了済み']].map(([v, label]) => (
          <button key={v} className={`btn btn-sm ${filter === v ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(v)}>{label}</button>
        ))}
      </div>

      <div className="card">
        {items.length === 0 ? (
          <div className="empty-state">
            <ClipboardList size={40} color="var(--gray-300)" />
            <p>{filter === 'pending' ? '未完了の宿題はありません' : filter === 'done' ? '完了した宿題はありません' : '宿題が登録されていません'}</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>完了</th>
                  <th>生徒</th>
                  <th>科目</th>
                  <th>内容</th>
                  <th>提出期限</th>
                  <th>出題日</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((h) => {
                  const overdue = !h.done && h.dueDate && h.dueDate < today;
                  return (
                    <tr key={h.id} style={{ opacity: h.done ? 0.6 : 1 }}>
                      <td>
                        <button
                          className="close-btn"
                          style={{ color: h.done ? 'var(--success)' : 'var(--gray-300)' }}
                          onClick={() => homework.update(h.id, { done: !h.done })}
                        >
                          {h.done ? <CheckCircle size={20} /> : <Circle size={20} />}
                        </button>
                      </td>
                      <td>{studentName(h.studentId)}</td>
                      <td>{h.subject && <span className="badge badge-gray">{h.subject}</span>}</td>
                      <td style={{ textDecoration: h.done ? 'line-through' : 'none' }}>{h.title}</td>
                      <td>
                        {h.dueDate ? (
                          <span className={`badge ${h.done ? 'badge-gray' : overdue ? 'badge-danger' : 'badge-warning'}`}>
                            {h.dueDate}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="text-xs text-gray">{h.assignedDate}</td>
                      <td>
                        <button className="btn btn-sm btn-ghost" onClick={() => homework.remove(h.id)}><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <HwModal
          students={students.items}
          onSave={(data) => { homework.add(data); setModal(false); }}
          onClose={() => setModal(false)}
        />
      )}
    </div>
  );
}
