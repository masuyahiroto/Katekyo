import { useState } from 'react';
import { LayoutDashboard, Users, ClipboardList, BookOpen, Calendar, Menu, X } from 'lucide-react';
import './App.css';
import { useStore } from './store/useStore';
import Dashboard from './components/Dashboard';
import Students from './components/Students';
import Homework from './components/Homework';
import Workbook from './components/Workbook';
import CalendarView from './components/CalendarView';
import Tests from './components/Tests';

const NAV = [
  { id: 'dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
  { id: 'students', label: '生徒管理', icon: Users },
  { id: 'homework', label: '宿題管理', icon: ClipboardList },
  { id: 'workbook', label: 'ワーク進捗', icon: BookOpen },
  { id: 'calendar', label: 'カレンダー', icon: Calendar },
  { id: 'tests', label: 'テスト', icon: BookOpen },
];

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const store = useStore();

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
