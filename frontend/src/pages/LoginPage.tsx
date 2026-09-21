import axios from 'axios';
import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { TOKEN_KEY } from '../api/client';
import type { AuthResponse } from '../types';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post<AuthResponse>('/login', { email, password });
      localStorage.setItem(TOKEN_KEY, data.token);
      navigate('/dashboard');
    } catch (requestError) {
      setError(
        axios.isAxiosError(requestError)
          ? requestError.response?.data?.message ?? 'Login failed.'
          : 'Login failed.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="card auth-form" onSubmit={handleSubmit}>
        <h1>Apollo Energy</h1>
        <h2>Login</h2>
        <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
        <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
        {error && <p className="error">{error}</p>}
        <button disabled={loading}>{loading ? 'Logging in…' : 'Login'}</button>
        <p>No account? <Link to="/register">Register</Link></p>
      </form>
    </main>
  );
}
