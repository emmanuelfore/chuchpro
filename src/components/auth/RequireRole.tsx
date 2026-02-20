
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface RequireRoleProps {
    children: JSX.Element;
    roles: string[];
}

export function RequireRole({ children, roles }: RequireRoleProps) {
    const { user, profile, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-950">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (!user || !profile) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!roles.includes(profile.role)) {
        // Redirect to a dashboard they *can* access, or a 403 page
        // For now, redirect to their allowed dashboard root
        if (profile.role === 'participant') {
            // Need orgSlug to redirect correctly, but we might not have it here easily if outside org context
            // For now, let's just show a simple "Unauthorized" or redirect to home
            return <Navigate to="/" replace />;
        }
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}
