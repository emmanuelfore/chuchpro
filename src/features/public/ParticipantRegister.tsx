import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/Button';
import { GlassBox } from '@/components/ui/Card';
import { supabase } from '@/services/supabase';
import { Loader2, User, Mail, Lock, Phone, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export function ParticipantRegister() {
    const { orgSlug } = useParams();
    const [searchParams] = useSearchParams();
    const programId = searchParams.get('program');

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [orgData, setOrgData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        firstName: '',
        surname: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        maritalStatus: 'single'
    });

    useEffect(() => {
        if (orgSlug) fetchOrg();
    }, [orgSlug]);

    const fetchOrg = async () => {
        const { data } = await supabase.from('organizations').select('id, name, primary_color').eq('slug', orgSlug).single();
        if (data) setOrgData(data);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (!orgData) throw new Error('Organization not found');

            // 1. Sign Up Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: form.email,
                password: form.password,
            });

            if (authError) throw authError;

            if (authData.user) {
                // 2. Create User Profile
                // Check if profile already exists for this org
                const { data: existingProfile } = await supabase
                    .from('users')
                    .select('id')
                    .eq('auth_id', authData.user.id)
                    .eq('organization_id', orgData.id)
                    .maybeSingle();

                if (!existingProfile) {
                    const { error: profileError } = await supabase
                        .from('users')
                        .insert([{
                            // id: auto-generated
                            auth_id: authData.user.id,
                            organization_id: orgData.id,
                            email: form.email,
                            first_name: form.firstName,
                            surname: form.surname,
                            phone_number: form.phone,
                            residential_address: form.address,
                            marital_status: form.maritalStatus,
                            role: 'participant',
                            is_active: true
                        }]);

                    if (profileError) throw profileError;
                }



                // 3. Login immediately (Supabase usually auto-logs unless verify required)
                // If programId present, create enrollment (FUTURE STEP, keeping simple for now)

                // Redirect to Login or Dashboard (if we have a Participant Dashboard)
                // For now, redirect to portal login with success message
                navigate(`/portal/${orgSlug}/login?registered=true`);
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    if (!orgData && !loading) return null;

    return (
        <PublicLayout showFooter={false}>
            <div className="max-w-md mx-auto mt-10">
                <Button variant="ghost" className="mb-8 pl-0 hover:pl-0 text-slate-400 hover:text-white" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                </Button>

                <div className="text-center mb-10 space-y-2">
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Create Account</h1>
                    <p className="text-slate-400 text-sm font-medium">Join <span className="text-white font-bold">{orgData?.name}</span></p>
                </div>

                <GlassBox className="p-8 border-white/10 bg-black/40 backdrop-blur-xl">
                    <form onSubmit={handleRegister} className="space-y-6">
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold text-center">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">First Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500/50 transition-colors"
                                    value={form.firstName}
                                    onChange={e => setForm({ ...form, firstName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Surname</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500/50 transition-colors"
                                    value={form.surname}
                                    onChange={e => setForm({ ...form, surname: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:border-indigo-500/50 transition-colors"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="tel"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:border-indigo-500/50 transition-colors"
                                    value={form.phone}
                                    onChange={e => setForm({ ...form, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Residential Address</label>
                            <input
                                type="text"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500/50 transition-colors"
                                value={form.address}
                                onChange={e => setForm({ ...form, address: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Marital Status</label>
                            <select
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500/50 transition-colors"
                                value={form.maritalStatus}
                                onChange={e => setForm({ ...form, maritalStatus: e.target.value })}
                            >
                                <option value="single" className="bg-slate-900">Single</option>
                                <option value="married" className="bg-slate-900">Married</option>
                                <option value="widowed" className="bg-slate-900">Widowed</option>
                                <option value="divorced" className="bg-slate-900">Divorced</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:border-indigo-500/50 transition-colors"
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <Button variant="premium" className="w-full h-14 text-sm font-black uppercase tracking-widest mt-6" disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
                        </Button>
                    </form>
                </GlassBox>

                <p className="text-center mt-8 text-xs text-slate-500 font-medium">
                    Already have an account? <span className="text-indigo-400 cursor-pointer hover:text-white transition-colors" onClick={() => navigate(`/portal/${orgSlug}/login`)}>Sign In</span>
                </p>
            </div>
        </PublicLayout>
    );
}
