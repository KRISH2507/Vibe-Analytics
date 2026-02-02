import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function AuthCallback() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (error) {
            console.error('Auth error:', error);
            navigate('/login?error=' + error);
            return;
        }

        if (token) {
            // Store the auth token
            localStorage.setItem('authToken', token);
            // Redirect to dashboard
            navigate('/dashboard');
        } else {
            // No token, redirect to login
            navigate('/login');
        }
    }, [searchParams, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-muted-foreground">Completing authentication...</p>
            </div>
        </div>
    );
}
