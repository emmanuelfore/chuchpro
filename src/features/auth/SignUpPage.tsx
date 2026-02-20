import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { GlassBox, Card } from '@/components/ui/Card';
import { useNavigate } from 'react-router-dom';
import { Building2, User, Palette, ArrowRight, ArrowLeft, CheckCircle2, Sparkles, Globe, Mail, Lock, Loader2 } from 'lucide-react';
import { authService } from '@/services/authService';

import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';

export function SignUpPage() {
    const { refreshProfile } = useAuth();
    const { switchOrganization } = useOrganization();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        orgName: '',
        orgSlug: '',
        adminName: '',
        adminEmail: '',
        password: '',
        primaryColor: '#6366f1',
        secondaryColor: '#ec4899',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // ...

    const handleRegister = async () => {
        try {
            setLoading(true);
            setError(null);
            const { organization } = await authService.signUp(formData);

            await refreshProfile();

            // Set the new organization as active immediately
            if (organization?.slug) {
                await switchOrganization(organization.slug);
            }

            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const updateFormData = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
            // Always auto-generate slug when name changes, since user can't see/edit it anymore
            ...(field === 'orgName' ? { orgSlug: value.toLowerCase().replace(/[^a-z0-9]/g, '') } : {})
        }));
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const steps = [
        { title: 'Identity', icon: <User className="w-5 h-5" /> },
        { title: 'Organization', icon: <Building2 className="w-5 h-5" /> },
        { title: 'Character', icon: <Palette className="w-5 h-5" /> }
    ];

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-500/5 rounded-full blur-[120px]"></div>

            {/* Progress Header */}
            <div className="w-full max-w-xl mb-16 relative z-10">
                <div className="flex justify-between relative px-4">
                    <div className="absolute top-[20px] left-0 w-full h-[1px] bg-white/5 z-0"></div>
                    {steps.map((s, i) => (
                        <div key={i} className="relative z-10 flex flex-col items-center">
                            <motion.div
                                animate={{
                                    scale: step === i + 1 ? 1.1 : 1,
                                    backgroundColor: step > i + 1 ? '#6366f1' : step === i + 1 ? 'rgba(255,255,255,0.05)' : 'transparent'
                                }}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300 ${step > i + 1 ? 'border-transparent text-white' :
                                    step === i + 1 ? 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] text-indigo-400' :
                                        'border-white/10 text-slate-600'
                                    }`}
                            >
                                {step > i + 1 ? <CheckCircle2 className="w-6 h-6" /> : s.icon}
                            </motion.div>
                            <span className={`text-[9px] mt-3 font-black uppercase tracking-[0.2em] ${step === i + 1 ? 'text-white' : 'text-slate-600'}`}>
                                {s.title}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-xl relative z-10"
            >
                <GlassBox className="p-10 border-white/5 bg-white/5 backdrop-blur-3xl overflow-hidden min-h-[500px] flex flex-col">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[10px] font-black uppercase tracking-widest text-center">
                            {error}
                        </div>
                    )}
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8 flex-1 flex flex-col"
                            >
                                <div className="text-center mb-4">
                                    <h2 className="text-3xl font-black text-white uppercase tracking-tight">Admin Identity</h2>
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Personalize your administrator profile</p>
                                </div>
                                <div className="space-y-6 flex-1">
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-indigo-400 transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="Full Legal Name"
                                            value={formData.adminName}
                                            onChange={(e) => updateFormData('adminName', e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-indigo-500/50 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-indigo-400 transition-colors" />
                                        <input
                                            type="email"
                                            placeholder="Primary Email Address"
                                            value={formData.adminEmail}
                                            onChange={(e) => updateFormData('adminEmail', e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-indigo-500/50 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-indigo-400 transition-colors" />
                                        <input
                                            type="password"
                                            placeholder="Secure Access Password"
                                            value={formData.password}
                                            onChange={(e) => updateFormData('password', e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-indigo-500/50 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <Button onClick={nextStep} className="w-full h-16 text-lg font-black uppercase tracking-widest" variant="premium">
                                    Step 02: Organization <ArrowRight className="ml-3 w-6 h-6" />
                                </Button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8 flex-1 flex flex-col"
                            >
                                <div className="text-center mb-4">
                                    <h2 className="text-3xl font-black text-white uppercase tracking-tight">Organization Core</h2>
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Define your organization's digital home</p>
                                </div>
                                <div className="space-y-6 flex-1">
                                    <div className="relative group">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-indigo-400 transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="Organization Name"
                                            value={formData.orgName}
                                            onChange={(e) => updateFormData('orgName', e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-indigo-500/50 outline-none transition-all"
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-bold px-4">
                                        We'll automatically set up your digital environment based on your organization name.
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                    <Button variant="outline" onClick={prevStep} className="flex-1 h-16 h-16 border-white/10 text-slate-400 font-black uppercase tracking-widest">
                                        Back
                                    </Button>
                                    <Button onClick={nextStep} className="flex-[2] h-16 text-lg font-black uppercase tracking-widest" variant="premium">
                                        Step 03: Reveal <ArrowRight className="ml-3 w-6 h-6" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8 flex-1 flex flex-col"
                            >
                                <div className="text-center mb-4">
                                    <h2 className="text-3xl font-black text-white uppercase tracking-tight">Final Character</h2>
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Custom brand aesthetics for your ministry</p>
                                </div>

                                <div className="grid grid-cols-2 gap-6 mb-4">
                                    <div className="space-y-4">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">Primary Tone</label>
                                        <div className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                                            <input
                                                type="color"
                                                value={formData.primaryColor}
                                                onChange={(e) => updateFormData('primaryColor', e.target.value)}
                                                className="w-10 h-10 rounded-lg cursor-pointer border-none p-0 bg-transparent"
                                            />
                                            <span className="text-xs font-mono text-slate-400">{formData.primaryColor}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">Accent Tone</label>
                                        <div className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                                            <input
                                                type="color"
                                                value={formData.secondaryColor}
                                                onChange={(e) => updateFormData('secondaryColor', e.target.value)}
                                                className="w-10 h-10 rounded-lg cursor-pointer border-none p-0 bg-transparent"
                                            />
                                            <span className="text-xs font-mono text-slate-400">{formData.secondaryColor}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Preview Card */}
                                <div className="flex-1 bg-white/5 rounded-3xl p-8 border border-white/5 relative overflow-hidden">
                                    <div
                                        className="absolute inset-0 opacity-20 blur-2xl"
                                        style={{ background: `radial-gradient(circle at top left, ${formData.primaryColor}, ${formData.secondaryColor})` }}
                                    ></div>
                                    <div className="relative z-10 flex flex-col h-full border-l-2 pl-6" style={{ borderColor: formData.primaryColor }}>
                                        <h4 className="text-2xl font-black text-white uppercase tracking-tighter mb-1">{formData.orgName || 'Elegance Ministry'}</h4>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Enterprise Dashboard</p>
                                        <div className="mt-auto flex items-center space-x-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                                <Sparkles className="w-4 h-4 text-indigo-400" />
                                            </div>
                                            <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full w-2/3" style={{ background: formData.primaryColor }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button variant="outline" onClick={prevStep} className="flex-1 h-16 border-white/10 text-slate-400 font-black uppercase tracking-widest">
                                        Back
                                    </Button>
                                    <Button variant="premium" className="flex-[2] h-16 text-lg font-black uppercase tracking-widest" onClick={handleRegister} disabled={loading}>
                                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Authorize Setup'}
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </GlassBox>
            </motion.div>

            <p className="mt-12 text-[11px] text-slate-600 font-black uppercase tracking-[0.3em] relative z-10">
                Found your home? <span className="text-indigo-400 hover:text-white cursor-pointer transition-colors" onClick={() => navigate('/login')}>Sign In Now</span>
            </p>
        </div>
    );
}
