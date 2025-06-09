
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import LandingPage from './LandingPage';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useApp();

  useEffect(() => {
    // If user is logged in, redirect to dashboard
    if (user) {
      navigate('/dashboard');
    }
    // If not logged in, stay on landing page (don't redirect)
  }, [user, navigate]);

  // If user is not logged in, show landing page
  if (!user) {
    return <LandingPage />;
  }

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando...</p>
      </div>
    </div>
  );
};

export default Index;
