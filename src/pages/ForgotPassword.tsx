import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { AlertCircle, CheckCircle, ArrowLeft, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ForgotPassword = () => {
    const { resetPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [submittedEmail, setSubmittedEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        setLoading(true);

        try {
            await resetPassword(email);
            setSubmittedEmail(email);
            setSuccess(true);
            setEmail('');
        } catch (err: any) {
            let errorMessage = 'Failed to send reset email';
            
            if (err.code === 'auth/user-not-found') {
                errorMessage = 'No account found with this email address';
            } else if (err.code === 'auth/invalid-email') {
                errorMessage = 'Please enter a valid email address';
            } else if (err.code === 'auth/too-many-requests') {
                errorMessage = 'Too many requests. Please try again later';
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/20 animate-fade-in p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-xl shadow-lg border border-[hsl(var(--border))]">
                <div className="text-center space-y-2">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <Mail className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-primary tracking-tight">Forgot Password?</h1>
                    <p className="text-muted-foreground text-sm">
                        No worries! Enter your email and we'll send you reset instructions.
                    </p>
                </div>

                {error && (
                    <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-center gap-2 animate-slide-down">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {success && (
                    <div className="bg-green-500/15 text-green-600 dark:text-green-400 text-sm p-3 rounded-md flex items-center gap-2 animate-slide-down">
                        <CheckCircle className="h-4 w-4 flex-shrink-0" />
                        <div>
                            <p className="font-medium">Check your email!</p>
                            <p className="text-xs mt-1 opacity-90">
                                We've sent password reset instructions to <strong>{submittedEmail}</strong>
                            </p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Email Address"
                        type="email"
                        placeholder="m@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        autoFocus
                    />
                    
                    <Button 
                        type="submit" 
                        className="w-full font-semibold shadow-md" 
                        disabled={loading || !email}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                Sending...
                            </span>
                        ) : (
                            'Send Reset Link'
                        )}
                    </Button>
                </form>

                <div className="pt-4 border-t border-[hsl(var(--border))]">
                    <Link 
                        to="/login" 
                        className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Login
                    </Link>
                </div>

                {success && (
                    <div className="text-center text-xs text-muted-foreground space-y-2 pt-2">
                        <p>Didn't receive the email?</p>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="text-primary hover:text-primary/80 transition-colors font-medium bg-none border-none outline-none underline underline-offset-2 decoration-primary/50 hover:decoration-primary"
                            style={{ background: 'none', border: 'none' }}
                            disabled={loading}
                        >
                            Resend email
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
