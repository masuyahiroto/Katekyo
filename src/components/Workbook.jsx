import { useState } from 'react';
import { Plus, X, Trash2, BookOpen } from 'lucide-react';

const SUBJECTS = ['国語', '数学', '英語', '理科', '社会', 'その他'];

function WorkbookModal({ students, onSave, onClose }) {
  const [form, setForm] = useState({ studentId: '', subject: '', title: '', totalPages: 100, startPage: 1 });

  const submit = (e) => {
    e.preventDefault();
    if (!form.studentId || !form.title.trim() || form.totalPages < 1) return;
    const pages = {};
    for (let i = form.startPage; i <= form.startPage + form.totalPages - 1; i++) {
      pages[i] = false;
    }
    onSave({ ...form, pages, totalPages: Number(form.totalPages), startPage: Number(form.startPage) });
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

export default function Workbook({ store }) {
  const { students, workbooks } = store;
  const [modal, setModal] = useState(false);
  const [filterStudent, setFilterStudent] = useState('');

  const togglePage = (wbId, page) => {
    const wb = workbooks.items.find((w) => w.id === wbId);
    if (!wb) return;
    const pages = { ...wb.pages, [page]: !wb.pages[page] };
    workbooks.update(wbId, { pages });
  };

  const filtered = filterStudent
    ? workbooks.items.filter((w) => w.studentId === filterStudent)
    : workbooks.items;

  const studentName = (id) => students.items.find((s) => s.id === id)?.name ?? '—';

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <h2>ワーク進捗管理</h2>
          <p>ページごとの進捗を視覚的に確認できます</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={16} />ワークを追加</button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-3" style={{ flexWrap: 'wrap' }}>
        <button className={`btn btn-sm ${!filterStudent ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilterStudent('')}>すべて</button>
        {students.items.map((s) => (
          <button key={s.id} className={`btn btn-sm ${filterStudent === s.id ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilterStudent(s.id)}>{s.name}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <BookOpen size={40} color="var(--gray-300)" />
            <p>ワークが登録されていません</p>
          </div>
        </div>
      ) : (
        <div className="grid-2">
          {filtered.map((wb) => (
            <div className="card" key={wb.id}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-bold">{wb.title}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="badge badge-primary">{studentName(wb.studentId)}</span>
                    {wb.subject && <span className="badge badge-gray">{wb.subject}</span>}
                  </div>
                </div>
                <button className="btn btn-sm btn-ghost" onClick={() => workbooks.remove(wb.id)}><Trash2 size={14} /></button>
              </div>
              <div className="divider" />
              <PageGrid wb={wb} onToggle={togglePage} />
            </div>
          ))}
        </div>
      )}

      {modal && (
        <WorkbookModal
          students={students.items}
          onSave={(data) => { workbooks.add(data); setModal(false); }}
          onClose={() => setModal(false)}
        />
      )}
    </div>
  );
}
