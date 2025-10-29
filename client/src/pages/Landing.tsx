import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { apiRequest } from '../lib/auth';
import { setToken } from '../lib/auth';
import { Heart, Shield, Users } from 'lucide-react';

export default function Landing() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      if (isLogin) {
        const data = await apiRequest('POST', '/auth/login', {
          phoneNumber,
          password,
        });
        setToken(data.token);
        window.location.href = '/';
      } else {
        if (!name || !email) {
          setMessage('All fields are required');
          setLoading(false);
          return;
        }

        const data = await apiRequest('POST', '/auth/register', {
          name,
          phoneNumber,
          email,
          password,
        });
        setToken(data.token);
        window.location.href = '/';
      }
    } catch (error: any) {
      setMessage(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      {/* Header */}
      <header className="container mx-auto px-6 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">Saathi</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-600 dark:text-slate-400">Already have an account?</span>
            <Button
              variant="outline"
              onClick={() => setIsLogin(true)}
              className="rounded-full"
            >
              Sign In
            </Button>
          </div>
        </nav>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* Left side - Branding */}
          <div className="space-y-8 animate-slide-up">
            <div className="space-y-6">
              <h1 className="text-6xl font-bold leading-tight text-slate-900 dark:text-white">
                Your <span className="text-blue-600 dark:text-blue-500">Trusted</span> Companion
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                Empowering independence with smart reminders, seamless communication, 
                and personalized care designed for seniors.
              </p>
            </div>

            <div className="flex items-center gap-8 pt-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Secure</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Your data is safe</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-500" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Trusted</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">By thousands</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  {isLogin ? 'Sign in to continue to Saathi' : 'Join thousands of happy users'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {!isLogin && (
                  <div className="space-y-2 animate-fade-in">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Full Name
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={!isLogin}
                      className="h-12 rounded-xl border-2 focus:border-blue-500 dark:focus:border-blue-600"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    placeholder="10-digit phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    className="h-12 rounded-xl border-2 focus:border-blue-500 dark:focus:border-blue-600"
                  />
                </div>

                {!isLogin && (
                  <div className="space-y-2 animate-fade-in">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required={!isLogin}
                      className="h-12 rounded-xl border-2 focus:border-blue-500 dark:focus:border-blue-600"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 rounded-xl border-2 focus:border-blue-500 dark:focus:border-blue-600"
                  />
                  {!isLogin && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Must be at least 6 characters
                    </p>
                  )}
                </div>

                {message && (
                  <div className={`p-4 rounded-xl border-2 ${
                    message.includes('error') || message.includes('Invalid') || message.includes('already exists')
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                      : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                  }`}>
                    <p className="font-medium text-sm">{message}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Processing...
                    </span>
                  ) : (
                    isLogin ? 'Sign In' : 'Create Account'
                  )}
                </Button>

                <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setMessage('');
                    }}
                    className="font-semibold text-blue-600 dark:text-blue-500 hover:underline"
                  >
                    {isLogin ? 'Sign Up' : 'Sign In'}
                  </button>
                </p>
              </form>
            </div>

            <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
