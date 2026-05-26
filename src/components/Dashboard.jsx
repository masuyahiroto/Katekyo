import { Users, BookOpen, ClipboardList, Calendar } from 'lucide-react';
import { format, isToday, parseISO, isFuture, isPast } from 'date-fns';

export default function Dashboard({ store }) {
  const { students, homework, sessions, tests } = store;

  const today = format(new Date(), 'yyyy-MM-dd');
  const todaySessions = sessions.items.filter((s) => s.date === today);
  const pendingHw = homework.items.filter((h) => !h.done);
  const upcomingTests = tests.items.filter((t) => t.date >= today).slice(0, 3);

  const stats = [
    { label: '生徒数', value: students.items.length, icon: Users, color: '#4f46e5', bg: '#e0e7ff' },
    { label: '未完了の宿題', value: pendingHw.length, icon: ClipboardList, color: '#d97706', bg: '#fef3c7' },
    { label: '今日の授業', value: todaySessions.length, icon: Calendar, color: '#16a34a', bg: '#dcfce7' },
    { label: '予定テスト数', value: upcomingTests.length, icon: BookOpen, color: '#dc2626', bg: '#fee2e2' },
  ];

  return (
    <div>
      <div className="page-header">
        <h2>ダッシュボード</h2>
        <p>{format(new Date(), 'yyyy年M月d日')} — 概況</p>
      </div>

      <div className="grid-3 mb-3" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        {stats.map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ background: s.bg }}>
              <s.icon size={20} color={s.color} />
            </div>
            <div className="stat-info">
              <p>{s.label}</p>
              <h3>{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        {/* 今日の授業 */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">今日の授業</span>
          </div>
          {todaySessions.length === 0 ? (
            <div className="empty-state"><p>今日の授業はありません</p></div>
          ) : (
            todaySessions.map((s) => {
              const student = students.items.find((st) => st.id === s.studentId);
              return (
                <div key={s.id} className="flex items-center gap-2 mb-2">
                  <span className="badge badge-primary">{s.startTime}〜{s.endTime}</span>
                  <span className="text-sm">{student?.name ?? '—'}</span>
                </div>
              );
            })
          )}
        </div>

        {/* 未完了の宿題 */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">未完了の宿題</span>
          </div>
          {pendingHw.length === 0 ? (
            <div className="empty-state"><p>未完了の宿題はありません</p></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>生徒</th>
                    <th>内容</th>
                    <th>期限</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingHw.slice(0, 6).map((h) => {
                    const student = students.items.find((s) => s.id === h.studentId);
                    const overdue = h.dueDate && h.dueDate < today;
                    return (
                      <tr key={h.id}>
                        <td>{student?.name ?? '—'}</td>
                        <td>{h.title}</td>
                        <td>
                          {h.dueDate ? (
                            <span className={`badge ${overdue ? 'badge-danger' : 'badge-warning'}`}>
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

        {/* 直近のテスト */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">予定テスト</span>
          </div>
          {upcomingTests.length === 0 ? (
            <div className="empty-state"><p>予定テストはありません</p></div>
          ) : (
            upcomingTests.map((t) => {
              const student = students.items.find((s) => s.id === t.studentId);
              return (
                <div key={t.id} className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-bold">{t.title}</p>
                    <p className="text-xs text-gray">{student?.name}</p>
                  </div>
                  <span className="badge badge-danger">{t.date}</span>
                </div>
              );
            })
          )}
        </div>

        {/* 生徒一覧 */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">生徒一覧</span>
          </div>
          {students.items.length === 0 ? (
            <div className="empty-state"><p>生徒が登録されていません</p></div>
          ) : (
            students.items.map((s) => {
              const hwCount = homework.items.filter((h) => h.studentId === s.id && !h.done).length;
              return (
                <div key={s.id} className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-bold">{s.name}</p>
                    <p className="text-xs text-gray">{s.grade}</p>
                  </div>
                  {hwCount > 0 && <span className="badge badge-warning">宿題 {hwCount}件</span>}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
