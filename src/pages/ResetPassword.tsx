import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { AlertCircle, CheckCircle, ArrowLeft, Lock } from 'lucide-react';

export const ResetPassword = () => {
    const [params] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();
    const oobCode = params.get('oobCode') ?? '';
    const stateEmail = (location.state as { email?: string })?.email ?? '';

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(!stateEmail && !!oobCode);
    const [verifiedEmail, setVerifiedEmail] = useState(stateEmail);
    const [success, setSuccess] = useState(false);

    useEffect(() => {

        if (stateEmail) {
            setVerifiedEmail(stateEmail);
            setVerifying(false);
            return;
        }

        const verifyCode = async () => {
            if (!oobCode) {
                setError('No email or reset link provided. Please enter your email on the login page.');
                setVerifying(false);
                return;
            }
            try {
                const email = await verifyPasswordResetCode(auth, oobCode);
                setVerifiedEmail(email);
            } catch {
                setError('This reset link has expired or is invalid. Please request a new one.');
            } finally {
                setVerifying(false);
            }
        };
        verifyCode();
    }, [oobCode, stateEmail]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {

            if (oobCode) {
                await confirmPasswordReset(auth, oobCode, password);
            }
            const response = await fetch(`${import.meta.env.VITE_API_URL}employee/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: verifiedEmail, newPassword: password }),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => null);
                throw new Error(errData?.message || 'Failed to update password in database');
            }

            setSuccess(true);

            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };


    if (verifying) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-muted/20 p-4">
                <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-xl shadow-lg border border-[hsl(var(--border))] text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-muted-foreground">Verifying reset link...</p>
                </div>
            </div>
        );
    }


    if (success) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-muted/20 animate-fade-in p-4">
                <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-xl shadow-lg border border-[hsl(var(--border))]">
                    <div className="text-center space-y-4">
                        <div className="flex justify-center">
                            <div className="p-3 bg-green-500/10 rounded-full">
                                <CheckCircle className="h-8 w-8 text-green-500" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-primary">Password Reset Successful!</h2>
                        <p className="text-muted-foreground text-sm">
                            Your password has been changed successfully. Redirecting to login...
                        </p>
                    </div>
                    <Link to="/login">
                        <Button className="w-full font-semibold shadow-md">
                            Go to Login
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/20 animate-fade-in p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-xl shadow-lg border border-[hsl(var(--border))]">
                <div className="text-center space-y-2">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <Lock className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-primary tracking-tight">Reset Password</h1>
                    {verifiedEmail && (
                        <p className="text-muted-foreground text-sm">
                            Enter a new password for <strong>{verifiedEmail}</strong>
                        </p>
                    )}
                </div>

                {error && (
                    <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-center gap-2 animate-slide-down">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {verifiedEmail ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="New Password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            autoComplete="new-password"
                            autoFocus
                        />
                        <Input
                            label="Confirm Password"
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                            autoComplete="new-password"
                        />

                        <Button
                            type="submit"
                            className="w-full font-semibold shadow-md"
                            disabled={loading || !password || !confirmPassword}
                        >
                            {loading ? 'Saving...' : 'Change Password'}
                        </Button>
                    </form>
                ) : (
                    <div className="pt-2">
                        <Link to="/forgot-password">
                            <Button className="w-full font-semibold shadow-md">
                                Request New Reset Link
                            </Button>
                        </Link>
                    </div>
                )}

                <div className="pt-4 border-t border-[hsl(var(--border))]">
                    <Link
                        to="/login"
                        className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};
