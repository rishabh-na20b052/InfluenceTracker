import LoginForm from '@/components/login-form';
import { Rocket } from 'lucide-react';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="flex items-center gap-2 mb-8">
        <Rocket className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold font-headline">Influence Tracker</h1>
      </div>
      <LoginForm />
    </main>
  );
}
