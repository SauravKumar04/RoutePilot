// frontend/src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Map as MapIcon, Loader2 } from 'lucide-react';
import { loginUser } from '../api/authApi';
import { useAuthStore } from '../store/authStore';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const Login = () => {
  const navigate = useNavigate();
  const setCredentials = useAuthStore((state) => state.setCredentials);
  const [authError, setAuthError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (response) => {
      setCredentials(response.data.user, response.data.token);
      navigate('/dashboard');
    },
    onError: (error) => {
      setAuthError(error.message || 'Authentication failed. Please check your credentials.');
    },
  });

  const onSubmit = (data) => {
    setAuthError('');
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-6 sm:px-6 lg:px-8 bg-gray-50/50 font-sans animate-fade-in">
      
      {/* Minimal Logo / Back to home */}
      <div className="absolute top-8 left-8">
        <Link to="/" className="flex items-center space-x-2 opacity-60 hover:opacity-100 transition-opacity">
          <MapIcon className="w-4 h-4 text-gray-900" strokeWidth={2.5} />
          <span className="text-[13px] font-semibold tracking-tight text-gray-900">RoutePilot</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-[400px]">
        <h2 className="text-center text-2xl font-semibold tracking-tight text-gray-900 mb-2">
          Welcome back
        </h2>
        <p className="text-center text-[14px] text-gray-500 font-medium mb-8">
          Enter your credentials to access your workspace.
        </p>

        <div className="bg-white py-8 px-6 sm:px-10 border border-gray-200/80 rounded-2xl shadow-sm">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            
            {authError && (
              <div className="p-3 text-[13px] font-medium text-red-700 bg-red-50 border border-red-100 rounded-xl">
                {authError}
              </div>
            )}
            
            <div>
              <label className="block text-[12px] font-semibold tracking-wide text-gray-600 mb-1.5">
                Email Address
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className={`w-full px-3.5 py-2.5 bg-gray-50/50 rounded-xl text-[14px] font-medium text-gray-900 border ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:bg-white focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5'} outline-none transition-all`}
                placeholder="name@company.com"
              />
              {errors.email && <p className="mt-1.5 text-[12px] font-medium text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-[12px] font-semibold tracking-wide text-gray-600 mb-1.5">
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                autoComplete="current-password"
                className="w-full px-3.5 py-2.5 bg-gray-50/50 rounded-xl text-[14px] font-medium text-gray-900 border border-gray-200 focus:bg-white focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5 outline-none transition-all"
                placeholder="••••••••"
              />
              {errors.password && <p className="mt-1.5 text-[12px] font-medium text-red-600">{errors.password.message}</p>}
            </div>

            <button 
              type="submit" 
              disabled={loginMutation.isPending}
              className="w-full h-11 bg-gray-900 text-white text-[14px] font-medium rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors shadow-sm mt-2 flex items-center justify-center"
            >
              {loginMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" /> : 'Sign in'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <span className="text-[13px] text-gray-500 font-medium">Don't have an account? </span>
            <Link to="/register" className="text-[13px] font-semibold text-gray-900 hover:text-blue-600 transition-colors">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;