
import { Moon, Sun } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/context/ThemeContext';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="flex items-center space-x-2">
      <Sun className="h-4 w-4 text-yellow-500" />
      <Switch
        checked={isDarkMode}
        onCheckedChange={toggleTheme}
        aria-label="Alternar tema"
      />
      <Moon className="h-4 w-4 text-blue-500" />
    </div>
  );
};

export default ThemeToggle;
