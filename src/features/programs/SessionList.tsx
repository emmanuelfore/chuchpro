import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Calendar, Clock, MapPin, MoreVertical, QrCode, Users, CheckCircle, ArrowLeft, Sparkles, Zap, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { sessionService } from '@/services/sessionService';
import { programService } from '@/services/programService';
import { useAuth } from '@/hooks/useAuth';
import { Session, Program } from '@/types';
import { Banknote, AlertCircle } from 'lucide-react';

export function SessionList({ embedded = false }: { embedded?: boolean }) {
    const { programId } = useParams();
    const navigate = useNavigate();
    const { profile, user } = useAuth();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [program, setProgram] = useState<Program | null>(null);
    const [paymentStatuses, setPaymentStatuses] = useState<Record<string, any>>({});
    const [attendanceData, setAttendanceData] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isParticipant = profile?.role === 'participant';

    useEffect(() => {
        if (programId) {
            fetchData();
        }
    }, [programId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [sessData, progData] = await Promise.all([
                sessionService.getSessions(programId!),
                programService.getProgramById(programId!)
            ]);
            setSessions(sessData);
            setProgram(progData);

            if (isParticipant && user) {
                // Fetch user's specific sess-enrollments and attendance
                const statusMap: Record<string, any> = {};
                const attMap: Record<string, any> = {};

                await Promise.all(sessData.map(async (s) => {
                    try {
                        const status = await sessionService.getSessionPaymentStatus(s.id, user.id);
                        if (status) statusMap[s.id] = status;

                        // Check attendance for this session
                        const { data: att } = await (await import('@/services/supabase')).supabase
                            .from('attendance')
                            .select('*')
                            .eq('session_id', s.id)
                            .eq('user_id', user.id)
                            .single();
                        if (att) attMap[s.id] = att;
                    } catch (e) {
                        console.error('Error fetching session details:', e);
                    }
                }));
                setPaymentStatuses(statusMap);
                setAttendanceData(attMap);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading && sessions.length === 0) {
        return (
            <div className={`flex items-center justify-center ${embedded ? 'h-32' : 'h-[60vh]'}`}>
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className={`space-y-12 ${embedded ? '' : 'pb-32'}`}>
            {!embedded && (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-center space-x-6">
                        <button
                            onClick={() => navigate('/dashboard/programs')}
                            className="w-14 h-14 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl flex items-center justify-center transition-all group"
                        >
                            <ArrowLeft className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
                        </button>
                        <div>
                            <div className="flex items-center space-x-2 mb-1">
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">{program?.name || 'Program'}</span>
                                <span className="text-slate-700 font-black">•</span>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Session Matrix</span>
                            </div>
                            <h1 className="text-4xl font-black text-white tracking-tight uppercase">Curriculum Schedule</h1>
                        </div>
                    </div>
                    <Button
                        variant="premium"
                        className="h-14 px-8 font-black uppercase tracking-widest text-xs"
                        onClick={() => navigate(`/dashboard/programs/${programId}/sessions/new`)}
                    >
                        <Plus className="w-4 h-4 mr-3" /> Insert New Session
                    </Button>
                </div>
            )}

            {embedded && (
                <div className="flex justify-between items-center bg-white/5 p-6 rounded-3xl border border-white/5">
                    <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-tight">Curriculum Schedule</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Manage individual sessions and attendance</p>
                    </div>
                    <Button
                        variant="premium"
                        size="sm"
                        className="h-10 text-[10px] font-black uppercase tracking-widest"
                        onClick={() => navigate(`/dashboard/programs/${programId}/sessions/new`)}
                    >
                        <Plus className="w-3 h-3 mr-2" /> New Session
                    </Button>
                </div>
            )}

            {
                error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold uppercase tracking-widest">
                        Error loading sessions: {error}
                    </div>
                )
            }

            <div className="grid gap-8">
                {sessions.map((session, i) => (
                    <motion.div
                        key={session.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="p-0 overflow-hidden bg-slate-900/40 border-white/5 hover:border-indigo-500/30 transition-all group">
                            <div className="flex flex-col md:flex-row">
                                {/* Date Accent Card */}
                                <div className="bg-slate-950 md:w-40 flex flex-col items-center justify-center p-8 border-b md:border-b-0 md:border-r border-white/5 relative overflow-hidden group-hover:bg-indigo-500/5 transition-colors">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-premium opacity-50"></div>
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-2 group-hover:text-indigo-400">
                                        {new Date(session.session_date).toLocaleDateString('en-US', { month: 'short' })}
                                    </p>
                                    <p className="text-5xl font-black text-white leading-none tracking-tighter">
                                        {new Date(session.session_date).getDate()}
                                    </p>
                                    <div className="mt-4 w-8 h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full w-full bg-indigo-500/20 group-hover:bg-indigo-500/50 transition-colors"></div>
                                    </div>
                                </div>

                                {/* Session Details */}
                                <div className="flex-1 p-8 flex flex-col justify-center">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4">
                                                <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-2xl ${session.is_active
                                                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                                    : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                                    }`}>
                                                    {session.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                                <div className="flex items-center text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                                    <Clock className="w-3.5 h-3.5 mr-2 text-indigo-400" /> {session.start_time.slice(0, 5)} - {session.end_time.slice(0, 5)}
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black text-white uppercase tracking-tight group-hover:text-indigo-400 transition-colors">{session.name}</h3>
                                                <div className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-3">
                                                    <MapPin className="w-3.5 h-3.5 mr-2 text-pink-400" /> {session.location || 'Location Pending'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {isParticipant && (
                                                <div className={`px-4 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${paymentStatuses[session.id]?.payment_status === 'paid'
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                                    }`}>
                                                    <Banknote className="w-3.5 h-3.5" />
                                                    {paymentStatuses[session.id]?.payment_status === 'paid' ? 'Paid' : 'Unpaid ($5)'}
                                                </div>
                                            )}
                                            <button className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-all border border-transparent hover:border-white/10">
                                                <MoreVertical className="w-5 h-5 text-slate-500 group-hover:text-white" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-4 pt-8 border-t border-white/5">
                                        <div className="flex items-center gap-8">
                                            <div className="flex items-center gap-4 group/stat">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${attendanceData[session.id]
                                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                                    : 'bg-white/5 text-slate-500'
                                                    }`}>
                                                    <CheckCircle className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-white leading-none">
                                                        {attendanceData[session.id] ? 'Present' : 'Absent'}
                                                    </p>
                                                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-1">Verification Status</p>
                                                </div>
                                            </div>

                                            {isParticipant && paymentStatuses[session.id]?.payment_status !== 'paid' && (
                                                <div className="flex items-center gap-3 text-rose-400 animate-pulse">
                                                    <AlertCircle className="w-4 h-4" />
                                                    <p className="text-[9px] font-black uppercase tracking-widest">Enrollment Lock: Pay to Access</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-4">
                                            {!isParticipant && (
                                                <div className="flex gap-3">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-12 px-6 text-[10px] font-black uppercase tracking-widest border-white/5 text-slate-400 hover:text-white"
                                                        onClick={() => navigate(`/dashboard/qr?session=${session.id}&mode=manual`)}
                                                    >
                                                        <Users className="w-4 h-4 mr-2" /> Manage Attendance
                                                    </Button>
                                                    <Button
                                                        variant="premium"
                                                        size="sm"
                                                        className="h-12 px-6 text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-500/20"
                                                        onClick={() => navigate(`/dashboard/qr?session=${session.id}`)}
                                                    >
                                                        <QrCode className="w-4 h-4 mr-2" /> Launch Terminal
                                                    </Button>
                                                </div>
                                            )}
                                            {isParticipant && (
                                                <Button
                                                    variant="outline"
                                                    className="h-12 px-6 border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white"
                                                    disabled={paymentStatuses[session.id]?.payment_status !== 'paid'}
                                                    onClick={() => navigate(`/portal/${profile?.orgSlug}/dashboard/qr?session=${session.id}`)}
                                                >
                                                    {paymentStatuses[session.id]?.payment_status === 'paid' ? 'Self Check-in' : 'Locked'}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}

                {sessions.length === 0 && !loading && (
                    <div className="h-64 rounded-3xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center p-10 text-center">
                        <Calendar className="w-12 h-12 text-slate-600 mb-4" />
                        <h3 className="text-xl font-black text-slate-400 uppercase tracking-tight">No Sessions Slotted</h3>
                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-2">Begin scheduling curriculum sessions for this program.</p>
                    </div>
                )}
            </div>
        </div >
    );
}
