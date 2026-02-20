import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/services/supabase';
import { GlassBox } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    Calendar,
    Users,
    Settings,
    ArrowLeft,
    Info,
    Layers,
    Loader2
} from 'lucide-react';
import { SessionList } from './SessionList';
import { EnrollmentManager } from './EnrollmentManager';
import { GroupManagement } from './GroupManagement';
import { AssignmentManager } from './AssignmentManager';

export function ProgramDetails() {
    const { programId } = useParams();
    const navigate = useNavigate();
    const [program, setProgram] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('sessions');

    useEffect(() => {
        if (programId) fetchProgram();
    }, [programId]);

    const fetchProgram = async () => {
        try {
            const { data, error } = await supabase
                .from('programs')
                .select('*')
                .eq('id', programId)
                .single();
            if (error) throw error;
            setProgram(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
    );

    if (!program) return <div className="text-white">Program not found.</div>;

    const tabs = [
        { id: 'sessions', name: 'Curriculum', icon: Calendar },
        { id: 'assignments', name: 'Assignments', icon: Info },
        { id: 'students', name: 'Participants', icon: Users },
        { id: 'groups', name: 'Cohorts', icon: Layers },
        { id: 'settings', name: 'Management', icon: Settings },
    ];

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex items-center gap-6">
                <Button
                    variant="outline"
                    className="w-12 h-12 p-0 border-white/5 bg-white/5 rounded-xl hover:bg-white/10"
                    onClick={() => navigate('/dashboard/programs')}
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{program.category || 'General'}</span>
                        <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Master Blueprint</span>
                    </div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight">{program.name}</h1>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-slate-900 border border-white/5 rounded-2xl w-fit">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isActive
                                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                }`}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            {tab.name}
                        </button>
                    );
                })}
            </div>

            {/* Content Area */}
            <div className="min-h-[60vh]">
                {activeTab === 'sessions' && <SessionList embedded={true} />}
                {activeTab === 'assignments' && <AssignmentManager programId={programId!} />}
                {activeTab === 'students' && <EnrollmentManager programId={programId} />}
                {activeTab === 'groups' && <GroupManagement programId={programId!} />}
                {activeTab === 'settings' && (
                    <GlassBox className="p-12 border-white/5 flex flex-col items-center justify-center text-center">
                        <Info className="w-12 h-12 text-slate-700 mb-6" />
                        <h3 className="text-xl font-black text-slate-400 uppercase tracking-tight">Configuration Matrix</h3>
                        <p className="max-w-md text-[10px] text-slate-500 mt-4 leading-relaxed font-black uppercase tracking-[0.2em]">
                            Direct program manipulation is currently locked to maintain architectural integrity.
                        </p>
                    </GlassBox>
                )}
            </div>
        </div>
    );
}
