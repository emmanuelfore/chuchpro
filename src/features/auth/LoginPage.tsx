import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { GlassBox } from '@/components/ui/Card';
import { useNavigate, useParams } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { authService } from '@/services/authService';
import { supabase } from '@/services/supabase';
import { useOrganization } from '@/hooks/useOrganization';

export function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { switchOrganization } = useOrganization();
    const { orgSlug } = useParams();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);
            const { user } = await authService.signIn(email, password);

            if (user) {
                // Fetch ALL profiles associated with this user
                const { data: profiles } = await supabase
                    .from('users')
                    .select('role, organization_id, organizations(slug)')
                    .or(`auth_id.eq.${user.id},id.eq.${user.id}`);

                if (profiles && profiles.length > 0) {
                    // 1. If trying to login to specific portal
                    if (orgSlug) {
                        const targetProfile = profiles.find((p: any) => p.organizations?.slug === orgSlug);

                        if (targetProfile) {
                            if (targetProfile.role === 'participant') {
                                navigate(`/portal/${orgSlug}/dashboard`);
                            } else {
                                // Save slug for Admin Dashboard context
                                await switchOrganization(orgSlug);
                                navigate('/dashboard');
                            }
                            return;
                        }

                        // User logged in but not member of this org
                        setError('You are not a member of this organization.');
                        await authService.signOut(); // Force logout so they can try again or login elsewhere?
                        return;
                    }

                    // 2. Generic Login - Try to restore last session or default
                    const lastSlug = localStorage.getItem('active_org_slug');
                    if (lastSlug) {
                        const match = profiles.find((p: any) => p.organizations?.slug === lastSlug);
                        if (match) {
                            if (match.role === 'participant') {
                                navigate(`/portal/${lastSlug}/dashboard`);
                            } else {
                                await switchOrganization(lastSlug);
                                navigate('/dashboard');
                            }
                            return;
                        }
                    }

                    // 3. Default to first profile
                    const first = profiles[0];
                    const slug = (first.organizations as any)?.slug;
                    if (first.role === 'participant') {
                        navigate(`/portal/${slug}/dashboard`);
                    } else {
                        await switchOrganization(slug);
                        navigate('/dashboard');
                    }
                } else {
                    // No profiles found
                    setError('No account profiles found.');
                    await authService.signOut();
                }
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-500/10 rounded-full blur-[120px]"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-gradient-premium rounded-3xl flex items-center justify-center mx-auto mb-6 text-4xl shadow-2xl shadow-indigo-500/20 animate-pulse-subtle">
                        ⛪
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tight mb-2 uppercase">Sign In</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Access your Digital Ministry</p>
                </div>

                <GlassBox className="p-10 border-white/5 bg-white/5 backdrop-blur-2xl">
                    <form className="space-y-8" onSubmit={handleLogin}>
                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[10px] font-black uppercase tracking-widest text-center">
                                {error}
                            </div>
                        )}
                        <div className="space-y-6">
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-0 transition-all outline-none"
                                    required
                                />
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-pink-400 transition-colors" />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-pink-500/50 focus:ring-0 transition-all outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                            <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200 transition-colors">
                                <input type="checkbox" className="rounded bg-white/5 border-white/10 text-indigo-500 focus:ring-0 h-4 w-4" />
                                <span>Remember me</span>
                            </label>
                            <span className="text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors">Forgot Password?</span>
                        </div>

                        <Button type="submit" className="w-full h-16 text-lg font-black uppercase tracking-widest" variant="premium" disabled={loading}>
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Sign In Now <ArrowRight className="ml-3 w-6 h-6" /></>}
                        </Button>
                    </form>
                </GlassBox>

                <div className="mt-12 text-center">
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">
                        Don't have an account?
                        <span
                            className="text-white hover:text-indigo-400 ml-2 cursor-pointer transition-colors border-b border-indigo-500/50 pb-0.5"
                            onClick={() => navigate('/signup')}
                        >
                            Start 30-Day Trial
                        </span>
                    </p>
                </div>
            </motion.div>

            {/* Bottom Accent */}
            <div className="absolute bottom-8 left-0 right-0 text-center opacity-20 flex items-center justify-center space-x-2">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Trust In Digital Excellence</span>
            </div>
        </div>
    );
}
