
import { Link } from 'react-router-dom';

const LoginFooter = () => {
  return (
    <div className="mt-6 space-y-4 text-center">
      <Link 
        to="/forgot-password" 
        className="text-sm text-pink-600 hover:text-pink-700 hover:underline"
      >
        Esqueci minha senha
      </Link>
      
      <div className="text-sm text-gray-600">
        Não tem uma conta?{' '}
        <Link 
          to="/register" 
          className="text-pink-600 hover:text-pink-700 hover:underline"
        >
          Criar conta
        </Link>
      </div>
      
      <div className="bg-gray-50 p-3 rounded-md text-xs text-gray-600">
        <p className="font-medium mb-1">Para testar o sistema:</p>
        <p>Crie uma conta ou use credenciais válidas</p>
      </div>
    </div>
  );
};

export default LoginFooter;
