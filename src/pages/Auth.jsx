import React, { useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { MessageSquare, Loader2 } from 'lucide-react';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    const { signIn, signUp } = useAuth();

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (isLogin) {
                const { error } = await signIn({ email, password });
                if (error) throw error;
            } else {
                const { error } = await signUp({ email, password });
                if (error) throw error;
                setMessage('Check your email for the confirmation link!');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-icon-wrapper">
                        <MessageSquare size={48} />
                    </div>
                    <h2 className="auth-title">
                        {isLogin ? 'WhatsApp Login' : 'Create Account'}
                    </h2>
                </div>

                {error && (
                    <div className="alert alert-error">
                        <p>{error}</p>
                    </div>
                )}

                {message && (
                    <div className="alert alert-success">
                        <p>{message}</p>
                    </div>
                )}

                <form onSubmit={handleAuth}>
                    <div className="form-group">
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="auth-input"
                            placeholder="Email"
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="auth-input"
                            placeholder="Password"
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="auth-submit-btn"
                    >
                        {loading ? <Loader2 className="spinner" size={20} /> : (isLogin ? 'Login' : 'Sign Up')}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="auth-toggle-btn"
                    >
                        {isLogin ? 'Create Account' : 'Back to Login'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Auth;
