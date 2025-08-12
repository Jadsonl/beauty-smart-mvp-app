
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { BarChart3, Users, UserCheck, Scissors, Calendar, Package, DollarSign, Settings } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: BarChart3, 
      active: location.pathname === '/dashboard' 
    },
    { 
      name: 'Clientes', 
      href: '/clientes', 
      icon: Users, 
      active: location.pathname === '/clientes' 
    },
    { 
      name: 'Profissionais', 
      href: '/profissionais', 
      icon: UserCheck, 
      active: location.pathname === '/profissionais' 
    },
    { 
      name: 'Serviços', 
      href: '/servicos', 
      icon: Scissors, 
      active: location.pathname === '/servicos' 
    },
    { 
      name: 'Agendamentos', 
      href: '/agendamentos', 
      icon: Calendar, 
      active: location.pathname === '/agendamentos' 
    },
    { 
      name: 'Estoque', 
      href: '/estoque', 
      icon: Package, 
      active: location.pathname === '/estoque' 
    },
    { 
      name: 'Financeiro', 
      href: '/financeiro', 
      icon: DollarSign, 
      active: location.pathname === '/financeiro' 
    },
    { 
      name: 'Configurações', 
      href: '/configuracoes', 
      icon: Settings, 
      active: location.pathname === '/configuracoes' 
    }
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
    <div className="min-h-screen flex w-full bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-md shadow-md transition-colors"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="h-5 w-5 dark:text-white" /> : <Menu className="h-5 w-5 dark:text-white" />}
      </button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={cn(
        "w-64 bg-white dark:bg-gray-800 shadow-lg h-screen fixed left-0 top-0 z-40 transform transition-all duration-300 ease-in-out",
        "lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 sm:p-6 border-b dark:border-gray-700">
          <h1 className="text-xl sm:text-2xl font-bold text-pink-600 dark:text-pink-400">BelezaSmart</h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 truncate">{user?.email}</p>
          <div className="mt-3">
            <ThemeToggle />
          </div>
        </div>
        
        <nav className="mt-4 sm:mt-6 pb-20 overflow-y-auto h-full">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.href}
                onClick={() => handleMenuClick(item.href)}
                className={cn(
                  "w-full text-left px-4 sm:px-6 py-2 sm:py-3 flex items-center space-x-3 transition-colors text-sm sm:text-base",
                  location.pathname === item.href
                    ? "bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 border-r-2 border-pink-600 dark:border-pink-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                )}
              >
                <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-medium">{item.name}</span>
              </button>
            );
          })}
          
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 sm:px-6 py-2 sm:py-3 flex items-center space-x-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mt-4 text-sm sm:text-base"
          >
            <span className="text-base sm:text-lg">🚪</span>
            <span className="font-medium">Sair</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
