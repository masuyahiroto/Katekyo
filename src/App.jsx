import { useState } from 'react';
import { LayoutDashboard, Users, ClipboardList, BookOpen, Calendar, Menu, X, FileText } from 'lucide-react';
import './App.css';
import { useStore } from './store/useStore';
import Dashboard from './components/Dashboard';
import Students from './components/Students';
import Homework from './components/Homework';
import Workbook from './components/Workbook';
import CalendarView from './components/CalendarView';
import Tests from './components/Tests';
import StudentView from './components/StudentView';
import DailyReports from './components/DailyReports';

const NAV = [
  { id: 'dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
  { id: 'students', label: '生徒管理', icon: Users },
  { id: 'homework', label: '宿題管理', icon: ClipboardList },
  { id: 'workbook', label: 'ワーク進捗', icon: BookOpen },
  { id: 'calendar', label: 'カレンダー', icon: Calendar },
  { id: 'tests', label: 'テスト', icon: BookOpen },
  { id: 'dailyreports', label: '日報管理', icon: FileText },
];

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const store = useStore();

  if (!store.ready) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 8 }}>
        <p style={{ fontSize: 16, color: 'var(--gray-500)' }}>読み込み中...</p>
      </div>
    );
  }

  const studentKey = new URLSearchParams(window.location.search).get('student');
  if (studentKey) {
    const student = store.students.items.find((s) => s.accessKey === studentKey);
    if (!student) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontSize: 16, fontWeight: 700 }}>無効なURLです</p>
          <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>先生に正しいURLを確認してください。</p>
        </div>
      );
    }
    return <StudentView student={student} store={store} />;
  }

  const navigate = (id) => {
    setPage(id);
    setSidebarOpen(false);
  };

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard store={store} />;
      case 'students': return <Students store={store} />;
      case 'homework': return <Homework store={store} />;
      case 'workbook': return <Workbook store={store} />;
      case 'calendar': return <CalendarView store={store} />;
      case 'tests': return <Tests store={store} />;
      case 'dailyreports': return <DailyReports store={store} />;
      default: return null;
    }
  };

  return (
    <div className="app">
      <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <h1>Educate</h1>
          <p>家庭教師管理システム</p>
        </div>
        <div className="sidebar-nav">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`nav-item ${page === id ? 'active' : ''}`} onClick={() => navigate(id)}>
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>
      </nav>

      <main className="main">
        {renderPage()}
      </main>
    </div>
  );
}
