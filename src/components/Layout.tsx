
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const handleMenuClick = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex w-full bg-gray-50">
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={cn(
        "w-64 bg-white shadow-lg h-screen fixed left-0 top-0 z-40 transform transition-transform duration-300 ease-in-out",
        "lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 sm:p-6 border-b">
          <h1 className="text-xl sm:text-2xl font-bold text-pink-600">BelezaSmart</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">{user?.email}</p>
        </div>
        
        <nav className="mt-4 sm:mt-6 pb-20 overflow-y-auto h-full">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleMenuClick(item.path)}
              className={cn(
                "w-full text-left px-4 sm:px-6 py-2 sm:py-3 flex items-center space-x-3 transition-colors text-sm sm:text-base",
                location.pathname === item.path
                  ? "bg-pink-50 text-pink-600 border-r-2 border-pink-600"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              <span className="text-base sm:text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
          
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 sm:px-6 py-2 sm:py-3 flex items-center space-x-3 text-red-600 hover:bg-red-50 transition-colors mt-4 text-sm sm:text-base"
          >
            <span className="text-base sm:text-lg">🚪</span>
            <span className="font-medium">Sair</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
