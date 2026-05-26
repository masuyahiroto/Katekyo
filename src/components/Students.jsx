import { useState } from 'react';
import { Plus, Trash2, X, User } from 'lucide-react';

const GRADES = ['小1','小2','小3','小4','小5','小6','中1','中2','中3','高1','高2','高3'];
const SUBJECTS = ['国語','数学','英語','理科','社会'];

function StudentModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial ?? { name: '', grade: '', subjects: [], memo: '' });

  const toggle = (sub) =>
    setForm((f) => ({
      ...f,
      subjects: f.subjects.includes(sub) ? f.subjects.filter((s) => s !== sub) : [...f.subjects, sub],
    }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave(form);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{initial ? '生徒を編集' : '生徒を追加'}</span>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={submit}>
          <div className="form-group">
            <label>名前 *</label>
            <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="山田 太郎" />
          </div>
          <div className="form-group">
            <label>学年</label>
            <select className="form-control" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })}>
              <option value="">選択してください</option>
              {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>担当科目</label>
            <div className="flex gap-2" style={{ flexWrap: 'wrap', marginTop: 4 }}>
              {SUBJECTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`badge ${form.subjects.includes(s) ? 'badge-primary' : 'badge-gray'}`}
                  style={{ cursor: 'pointer', padding: '4px 12px', fontSize: 13 }}
                  onClick={() => toggle(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>メモ</label>
            <textarea className="form-control" rows={3} value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} placeholder="特記事項など" />
          </div>
          <div className="flex gap-2 justify-between mt-3">
            <button type="button" className="btn btn-ghost" onClick={onClose}>キャンセル</button>
            <button type="submit" className="btn btn-primary"><Plus size={16} />保存</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Students({ store }) {
  const { students } = store;
  const [modal, setModal] = useState(null); // null | 'add' | student object

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <h2>生徒管理</h2>
          <p>担当する生徒の情報を管理します</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('add')}><Plus size={16} />生徒を追加</button>
      </div>

      {students.items.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <User size={40} color="var(--gray-300)" />
            <p>まだ生徒が登録されていません</p>
          </div>
        </div>
      ) : (
        <div className="grid-2">
          {students.items.map((s) => (
            <div className="card" key={s.id} style={{ cursor: 'pointer' }} onClick={() => setModal(s)}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="stat-icon" style={{ background: 'var(--primary-light)', width: 36, height: 36, borderRadius: 8 }}>
                    <User size={18} color="var(--primary)" />
                  </div>
                  <div>
                    <p className="font-bold">{s.name}</p>
                    <p className="text-xs text-gray">{s.grade}</p>
                  </div>
                </div>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={(e) => { e.stopPropagation(); students.remove(s.id); }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              {s.subjects?.length > 0 && (
                <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                  {s.subjects.map((sub) => <span key={sub} className="badge badge-primary">{sub}</span>)}
                </div>
              )}
              {s.memo && <p className="text-sm text-gray mt-2">{s.memo}</p>}
            </div>
          ))}
        </div>
      )}

      {modal === 'add' && (
        <StudentModal
          onSave={(data) => { students.add(data); setModal(null); }}
          onClose={() => setModal(null)}
        />
      )}
      {modal && modal !== 'add' && (
        <StudentModal
          initial={modal}
          onSave={(data) => { students.update(modal.id, data); setModal(null); }}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
