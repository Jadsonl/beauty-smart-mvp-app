
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/agendamentos', label: 'Agendamentos', icon: '📅' },
    { path: '/clientes', label: 'Clientes', icon: '👥' },
    { path: '/servicos', label: 'Serviços', icon: '✂️' },
    { path: '/financeiro', label: 'Financeiro', icon: '💰' },
    { path: '/estoque', label: 'Estoque', icon: '📦' },
    { path: '/planos', label: 'Planos', icon: '🎯' },
    { path: '/configuracoes', label: 'Configurações', icon: '⚙️' },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex w-full bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg h-screen fixed left-0 top-0 z-10">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-pink-600">BelezaSmart</h1>
          <p className="text-sm text-gray-600 mt-1">{user?.email}</p>
        </div>
        
        <nav className="mt-6">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "w-full text-left px-6 py-3 flex items-center space-x-3 transition-colors",
                location.pathname === item.path
                  ? "bg-pink-50 text-pink-600 border-r-2 border-pink-600"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
          
          <button
            onClick={handleLogout}
            className="w-full text-left px-6 py-3 flex items-center space-x-3 text-red-600 hover:bg-red-50 transition-colors mt-4"
          >
            <span className="text-lg">🚪</span>
            <span className="font-medium">Sair</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
