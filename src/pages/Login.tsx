
import { Card, CardContent } from '@/components/ui/card';
import LoginHeader from '@/components/auth/LoginHeader';
import LoginForm from '@/components/auth/LoginForm';
import LoginFooter from '@/components/auth/LoginFooter';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <LoginHeader />
        <CardContent>
          <LoginForm />
          <LoginFooter />
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
