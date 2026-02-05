import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Github } from 'lucide-react';

export const Signup = () => {
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Placeholder auth logic
        navigate('/');
    };

    const handleSocialLogin = (provider: string) => {
        console.log(`Sign up with ${provider}`);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/20 animate-fade-in p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-xl shadow-lg border border-[hsl(var(--border))]">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-primary tracking-tight">Create an account</h1>
                    <p className="text-muted-foreground text-sm">Enter your email below to create your account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                     <div className="space-y-2">
                         <Input 
                            label="Name" 
                            type="text" 
                            placeholder="John Doe" 
                            required 
                            className="bg-muted/30"
                        />
                    </div>
                    <div className="space-y-2">
                        <Input 
                            label="Email" 
                            type="email" 
                            placeholder="m@example.com" 
                            required 
                            className="bg-muted/30"
                        />
                    </div>
                    <div className="space-y-2">
                        <Input 
                            label="Password" 
                            type="password" 
                            placeholder="••••••••" 
                            required 
                            className="bg-muted/30"
                        />
                    </div>
                    
                    <Button type="submit" className="w-full font-semibold shadow-md">
                        Create Account
                    </Button>
                </form>

                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-[hsl(var(--border))]" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Button variant="ghost" className="btn-social w-full flex gap-2 items-center justify-center" onClick={() => handleSocialLogin('google')}>
                        <svg className="h-5 w-5"  width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                            <path d="M17.788 5.108a9 9 0 1 0 3.212 6.892h-8" />
                        </svg>
                        Google
                    </Button>
                    <Button variant="ghost" className="btn-social w-full flex gap-2 items-center justify-center" onClick={() => handleSocialLogin('github')}>
                        <Github className="h-5 w-5" />
                        GitHub
                    </Button>
                </div>

                <div className="text-center text-sm">
                    <span className="text-muted-foreground">Already have an account? </span>
                    <Link to="/login" className="font-medium text-primary hover:underline">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
};
