import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/Button';
import { Card, GlassBox } from '@/components/ui/Card';
import { supabase } from '@/services/supabase';
import { Loader2, Calendar, MapPin, ArrowRight, CheckCircle2, Users } from 'lucide-react';
import { Program } from '@/types';

export function OrgLandingPage() {
    const { orgSlug } = useParams();
    const navigate = useNavigate();
    const [orgData, setOrgData] = useState<any>(null);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (orgSlug) {
            fetchOrgData();
        }
    }, [orgSlug]);

    const fetchOrgData = async () => {
        try {
            setLoading(true);

            // 1. Fetch Org by Slug
            const { data: org, error: orgError } = await supabase
                .from('organizations')
                .select('*')
                .eq('slug', orgSlug)
                .single();

            if (orgError || !org) throw new Error('Organization not found');
            setOrgData(org);

            // 2. Fetch Active Programs
            const { data: progs, error: progError } = await supabase
                .from('programs')
                .select('*')
                .eq('organization_id', org.id)
                .eq('status', 'active')
                .eq('is_visible', true)
                .order('start_date', { ascending: true });

            if (progError) console.error(progError);
            setPrograms(progs || []);

        } catch (error) {
            console.error('Error loading portal:', error);
            // navigate('/404'); // TODO: Create 404
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <PublicLayout>
                <div className="min-h-[60vh] flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-white animate-spin" />
                </div>
            </PublicLayout>
        );
    }

    if (!orgData) return null;

    return (
        <PublicLayout>
            <div className="max-w-6xl mx-auto space-y-20">

                {/* Hero Section */}
                <div className="text-center space-y-8 pt-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Enrollment Open</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500">Welcome to</span><br />
                        {orgData.name}
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg text-slate-400 font-medium leading-relaxed">
                        {orgData.description || "Join us in our journey of growth, learning, and community. Manage your programs, track your progress, and connect with others."}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button
                            variant="premium"
                            className="h-16 px-10 text-lg font-black uppercase tracking-widest"
                            onClick={() => navigate(`/portal/${orgSlug}/register`)}
                        >
                            Become a Member
                        </Button>
                        <Button
                            variant="outline"
                            className="h-16 px-10 text-lg font-black uppercase tracking-widest border-white/10 hover:bg-white/5"
                            onClick={() => navigate(`/portal/${orgSlug}/login`)}
                        >
                            Member Login
                        </Button>
                    </div>
                </div>

                {/* Featured Programs */}
                {programs.length > 0 && (
                    <div className="space-y-10">
                        <div className="flex items-end justify-between border-b border-white/10 pb-6">
                            <h2 className="text-3xl font-black text-white uppercase tracking-tight">Available Programs</h2>
                            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest hidden md:block">
                                {programs.length} Active Courses
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {programs.map(program => (
                                <GlassBox key={program.id} className="group hover:bg-white/10 transition-all duration-300 border-white/5">
                                    <div className="aspect-video bg-gradient-to-br from-indigo-500/20 to-purple-500/20 relative overflow-hidden">
                                        {program.image_url ? (
                                            <img src={program.image_url} alt={program.name} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-white/10 font-black text-6xl uppercase transform -rotate-12">
                                                {program.category?.substring(0, 3) || 'PRG'}
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4">
                                            <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest text-white border border-white/10">
                                                {program.category || 'General'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-8 space-y-6">
                                        <div>
                                            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2 group-hover:text-indigo-400 transition-colors">
                                                {program.name}
                                            </h3>
                                            <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed">
                                                {program.description}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-500">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-indigo-400" />
                                                <span>{new Date(program.start_date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-pink-400" />
                                                <span>{program.max_participants || 'Unl.'} Seats</span>
                                            </div>
                                        </div>

                                        <Button className="w-full border-white/10 hover:bg-white/10 text-xs font-black uppercase tracking-widest h-12" variant="outline"
                                            onClick={() => navigate(`/portal/${orgSlug}/register?program=${program.id}`)}
                                        >
                                            Enroll Now <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>
                                </GlassBox>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
