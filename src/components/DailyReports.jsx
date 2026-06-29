import { useState } from 'react';
import { MessageSquare, X, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { format } from 'date-fns';

function CommentModal({ report, studentName, onSave, onClose }) {
  const [comment, setComment] = useState(report.teacherComment ?? '');

  const submit = (e) => {
    e.preventDefault();
    onSave({ teacherComment: comment, commentedAt: format(new Date(), 'yyyy-MM-dd') });
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <span className="modal-title">コメントを入力</span>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <div style={{ marginBottom: 12 }}>
          <p className="text-sm font-bold">{studentName} — {report.date}</p>
        </div>
        <form onSubmit={submit}>
          <div className="form-group">
            <label>先生からのコメント</label>
            <textarea
              className="form-control"
              rows={5}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="生徒へのフィードバックを入力してください"
              autoFocus
            />
          </div>
          <div className="flex gap-2 justify-between mt-3">
            <button type="button" className="btn btn-ghost" onClick={onClose}>キャンセル</button>
            <button type="submit" className="btn btn-primary">
              <MessageSquare size={14} />コメントを保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ReportCard({ report, studentName, onComment }) {
  const [open, setOpen] = useState(false);

  const fields = [
    { label: 'やったこと', value: report.didContent },
    { label: '成果・結果', value: report.results },
    { label: '学んだこと', value: report.learned },
    { label: 'わからなかったこと', value: report.unclear },
  ];

  return (
    <div className="card mb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2" style={{ flex: 1 }}>
          <button className="close-btn" onClick={() => setOpen(!open)}>
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <div style={{ flex: 1 }}>
            <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
              <p className="font-bold">{report.date}</p>
              <span className="badge badge-primary">{studentName}</span>
              {report.teacherComment
                ? <span className="badge badge-success">コメント済み</span>
                : <span className="badge badge-warning">未コメント</span>
              }
            </div>
            {!open && report.didContent && (
              <p className="text-xs text-gray mt-1" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 400 }}>
                {report.didContent}
              </p>
            )}
          </div>
        </div>
        <button className="btn btn-sm btn-primary" onClick={() => onComment(report)}>
          <MessageSquare size={13} />
          {report.teacherComment ? 'コメントを編集' : 'コメントする'}
        </button>
      </div>

      {open && (
        <div className="mt-3">
          <div className="divider" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {fields.map(({ label, value }) => (
              <div key={label} style={{ background: 'var(--gray-50)', borderRadius: 6, padding: '10px 14px' }}>
                <p className="text-xs font-bold" style={{ color: 'var(--primary)', marginBottom: 4 }}>{label}</p>
                <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{value || '（未記入）'}</p>
              </div>
            ))}
          </div>

          {report.teacherComment && (
            <div style={{ background: '#f0fdf4', borderRadius: 6, padding: '10px 14px', marginTop: 12, borderLeft: '3px solid var(--success)' }}>
              <p className="text-xs font-bold" style={{ color: 'var(--success)', marginBottom: 4 }}>
                先生のコメント {report.commentedAt && <span style={{ fontWeight: 400 }}>— {report.commentedAt}</span>}
              </p>
              <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{report.teacherComment}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DailyReports({ store }) {
  const { students, dailyReports } = store;
  const [filterStudent, setFilterStudent] = useState('');
  const [filterComment, setFilterComment] = useState('all'); // all | uncommented | commented
  const [commentTarget, setCommentTarget] = useState(null);

  const studentName = (id) => students.items.find((s) => s.id === id)?.name ?? '—';

  const filtered = [...dailyReports.items]
    .filter((r) => filterStudent ? r.studentId === filterStudent : true)
    .filter((r) => {
      if (filterComment === 'uncommented') return !r.teacherComment;
      if (filterComment === 'commented') return !!r.teacherComment;
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const uncommentedCount = dailyReports.items.filter((r) => !r.teacherComment).length;

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <h2>日報管理</h2>
          <p>生徒の日報を確認してコメントを送れます</p>
        </div>
        {uncommentedCount > 0 && (
          <span className="badge badge-warning" style={{ fontSize: 13, padding: '4px 12px' }}>
            未コメント {uncommentedCount}件
          </span>
        )}
      </div>

      {/* フィルター */}
      <div className="flex gap-2 mb-3" style={{ flexWrap: 'wrap' }}>
        <button className={`btn btn-sm ${!filterStudent ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilterStudent('')}>全生徒</button>
        {students.items.map((s) => (
          <button key={s.id} className={`btn btn-sm ${filterStudent === s.id ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilterStudent(s.id)}>
            {s.name}
          </button>
        ))}
      </div>
      <div className="flex gap-2 mb-3">
        {[['all', 'すべて'], ['uncommented', '未コメント'], ['commented', 'コメント済み']].map(([v, label]) => (
          <button key={v} className={`btn btn-sm ${filterComment === v ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilterComment(v)}>
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <FileText size={40} color="var(--gray-300)" />
            <p>日報がありません</p>
          </div>
        </div>
      ) : (
        filtered.map((r) => (
          <ReportCard
            key={r.id}
            report={r}
            studentName={studentName(r.studentId)}
            onComment={(r) => setCommentTarget(r)}
          />
        ))
      )}

      {commentTarget && (
        <CommentModal
          report={commentTarget}
          studentName={studentName(commentTarget.studentId)}
          onSave={(data) => { dailyReports.update(commentTarget.id, data); setCommentTarget(null); }}
          onClose={() => setCommentTarget(null)}
        />
      )}
    </div>
  );
}
