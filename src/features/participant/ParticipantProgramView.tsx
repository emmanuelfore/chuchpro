import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/hooks/useAuth';
import { GlassBox } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    Calendar,
    FileText,
    ArrowLeft,
    CheckCircle2,
    Clock,
    Award,
    Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { SessionList } from '@/features/programs/SessionList';
import { ParticipantAssignments } from './ParticipantAssignments';

export function ParticipantProgramView() {
    const { programId, orgSlug } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [program, setProgram] = useState<any>(null);
    const [stats, setStats] = useState({
        attendancePercent: 0,
        assignmentsPercent: 0,
        isEligible: false
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('sessions');

    useEffect(() => {
        if (programId && user) fetchData();
    }, [programId, user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Program Info
            const { data: progData } = await supabase
                .from('programs')
                .select('*')
                .eq('id', programId)
                .single();
            setProgram(progData);

            // 2. Fetch Stats for Graduation Logic
            // Attendance
            const { data: attendanceData } = await supabase
                .from('attendance')
                .select('status')
                .eq('user_id', user!.id)
                .eq('organization_id', progData.organization_id);

            const totalSessions = 10; // Placeholder: In a real app, count sessions for this program
            const attendedCount = attendanceData?.filter(a => a.status === 'present').length || 0;
            const attendancePercent = (attendedCount / totalSessions) * 100;

            // Assignments
            const { data: assignments } = await supabase
                .from('assignments')
                .select('id')
                .eq('organization_id', progData.organization_id); // Ideally filtered by program

            const { data: submissions } = await supabase
                .from('assignment_submissions')
                .select('id')
                .eq('user_id', user!.id);

            const totalAssignments = assignments?.length || 0;
            const submittedCount = submissions?.length || 0;
            const assignmentsPercent = totalAssignments > 0 ? (submittedCount / totalAssignments) * 100 : 100;

            setStats({
                attendancePercent: Math.min(attendancePercent, 100),
                assignmentsPercent: Math.min(assignmentsPercent, 100),
                isEligible: attendancePercent >= 80 && assignmentsPercent >= 50
            });

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
    );

    if (!program) return <div className="text-white p-10">Program protocol not found.</div>;

    const tabs = [
        { id: 'sessions', name: 'Curriculum', icon: Calendar },
        { id: 'assignments', name: 'Tasks', icon: FileText },
    ];

    return (
        <div className="p-6 space-y-8 pb-24">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    className="w-10 h-10 p-0 border-white/5 bg-white/5 rounded-xl hover:bg-white/10"
                    onClick={() => navigate(`/portal/${orgSlug}/dashboard`)}
                >
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">In Pursuit of Excellence</p>
                    <h1 className="text-2xl font-black text-white uppercase tracking-tight">{program.name}</h1>
                </div>
            </div>

            {/* Graduation Progress Card */}
            <GlassBox className="p-6 border-white/5 bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Award className={`w-5 h-5 ${stats.isEligible ? 'text-amber-400' : 'text-slate-600'}`} />
                        <h3 className="text-xs font-black text-white uppercase tracking-widest">Graduation Readiness Matrix</h3>
                    </div>
                    {stats.isEligible ? (
                        <span className="bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase px-2 py-1 rounded border border-emerald-500/20">Eligible for Certification</span>
                    ) : (
                        <span className="bg-slate-500/10 text-slate-400 text-[8px] font-black uppercase px-2 py-1 rounded border border-slate-500/20">In Training Phase</span>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                            <span className="text-slate-500">Attendance Threshold</span>
                            <span className="text-white">{Math.round(stats.attendancePercent)}% / 80%</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${stats.attendancePercent}%` }}
                                className={`h-full ${stats.attendancePercent >= 80 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                            />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                            <span className="text-slate-500">Assignment Quota</span>
                            <span className="text-white">{Math.round(stats.assignmentsPercent)}% / 50%</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${stats.assignmentsPercent}%` }}
                                className={`h-full ${stats.assignmentsPercent >= 50 ? 'bg-emerald-500' : 'bg-pink-500'}`}
                            />
                        </div>
                    </div>
                </div>
            </GlassBox>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-black/40 border border-white/5 rounded-2xl w-full">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isActive
                                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            {tab.name}
                        </button>
                    );
                })}
            </div>

            {/* Content Area */}
            <div className="min-h-[40vh]">
                {activeTab === 'sessions' && <SessionList embedded={true} />}
                {activeTab === 'assignments' && <ParticipantAssignments programId={programId!} />}
            </div>
        </div>
    );
}
