import axios from 'axios';
import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { TOKEN_KEY } from '../api/client';
import type { AuthResponse } from '../types';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post<AuthResponse>('/register', { name, email, password });
      localStorage.setItem(TOKEN_KEY, data.token);
      navigate('/dashboard');
    } catch (requestError) {
      const response = axios.isAxiosError(requestError) ? requestError.response?.data : null;
      const validationError = response?.errors
        ? Object.values(response.errors as Record<string, string[]>)[0]?.[0]
        : null;
      setError(validationError ?? response?.message ?? 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="card auth-form" onSubmit={handleSubmit}>
        <h1>Apollo Energy</h1>
        <h2>Register</h2>
        <label>Name<input value={name} onChange={(event) => setName(event.target.value)} required /></label>
        <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
        <label>Password<input type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
        {error && <p className="error">{error}</p>}
        <button disabled={loading}>{loading ? 'Creating…' : 'Register'}</button>
        <p>Already registered? <Link to="/login">Login</Link></p>
      </form>
    </main>
  );
}
