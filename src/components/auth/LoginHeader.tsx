
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const LoginHeader = () => {
  return (
    <CardHeader className="text-center">
      <div className="flex items-center justify-center space-x-2 mb-4">
        <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-lg font-extrabold leading-none">B</span>
        </div>
        <span className="text-2xl font-bold text-pink-600">BelezaSmart</span>
      </div>
      <CardTitle className="text-2xl">Login</CardTitle>
      <CardDescription>
        Entre com suas credenciais para acessar sua conta
      </CardDescription>
    </CardHeader>
  );
};

export default LoginHeader;
