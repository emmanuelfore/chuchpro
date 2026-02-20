
import { useAuth } from '@/hooks/useAuth';
import { GlassBox } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LogOut, User, Mail, Phone, Shield, Home, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ParticipantProfile() {
    const { profile, signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate('/')
    };

    return (
        <div className="p-6 space-y-8">
            <div className="space-y-1 pt-6 text-center">
                <div className="w-20 h-20 mx-auto bg-gradient-premium rounded-full flex items-center justify-center text-3xl shadow-xl shadow-indigo-500/20 mb-4">
                    {profile?.first_name?.charAt(0)}
                </div>
                <h1 className="text-2xl font-black text-white uppercase tracking-tight">
                    {profile?.first_name} {profile?.surname}
                </h1>
                <p className="text-slate-400 text-sm font-medium">{profile?.email}</p>
                <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-indigo-400 mt-2">
                    Participant
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Personal Information</h2>
                <GlassBox className="space-y-0 p-0 overflow-hidden">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400">
                                <User className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Full Name</p>
                                <p className="text-sm text-white font-medium">{profile?.first_name} {profile?.surname}</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400">
                                <Mail className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address</p>
                                <p className="text-sm text-white font-medium">{profile?.email}</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400">
                                <Phone className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phone</p>
                                <p className="text-sm text-white font-medium">{profile?.phone_number || 'Not set'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400">
                                <Home className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Residential Address</p>
                                <p className="text-sm text-white font-medium">{profile?.residential_address || 'Not set'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400">
                                <Heart className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Marital Status</p>
                                <p className="text-sm text-white font-medium capitalize">{profile?.marital_status || 'Not set'}</p>
                            </div>
                        </div>
                    </div>
                </GlassBox>
            </div>

            <div className="space-y-4">
                <Button
                    variant="outline"
                    className="w-full border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 h-14 font-black uppercase tracking-widest"
                    onClick={handleLogout}
                >
                    <LogOut className="w-4 h-4 mr-2" /> Log Out
                </Button>
            </div>

            <p className="text-center text-[10px] text-slate-700 font-bold uppercase tracking-widest pt-10">
                Version 1.0.0
            </p>
        </div>
    );
}
