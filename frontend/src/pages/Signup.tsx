import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/auth/signup`, { email, password });
      login(res.data.token, res.data.user);
      navigate('/prediction', { replace: true });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Signup failed');
      } else {
        setError('Signup failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Create account</h1>
        <p className="text-gray-600 mb-6">Sign up with your email.</p>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 mb-4 flex gap-2">
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label flex items-center gap-2">
              <Mail className="h-4 w-4 text-purple-600" />
              <span>Email</span>
            </label>
            <input
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="name@gmail.com"
              required
            />
          </div>
          <div>
            <label className="form-label flex items-center gap-2">
              <Lock className="h-4 w-4 text-purple-600" />
              <span>Password</span>
            </label>
            <input
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="At least 8 characters"
              required
              minLength={8}
            />
          </div>
          <div>
            <label className="form-label flex items-center gap-2">
              <Lock className="h-4 w-4 text-purple-600" />
              <span>Confirm password</span>
            </label>
            <input
              className="form-input"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              type="password"
              placeholder="Repeat password"
              required
              minLength={8}
            />
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary w-full">
            {isLoading ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link className="text-purple-600 hover:text-purple-700 font-medium" to="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;

