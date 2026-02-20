
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { supabase } from '@/services/supabase';
import { GlassBox } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Search, Calendar, Users, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Program } from '@/types';

export function ProgramBrowser() {
    const { user } = useAuth();
    const { organization } = useOrganization();
    const navigate = useNavigate();
    const { orgSlug } = useParams();

    const [programs, setPrograms] = useState<Program[]>([]);
    const [enrolledProgramIds, setEnrolledProgramIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [enrollingId, setEnrollingId] = useState<string | null>(null);

    useEffect(() => {
        if (organization && user) {
            fetchData();
        }
    }, [organization, user]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // 1. Fetch all active programs
            const { data: progs, error: progError } = await supabase
                .from('programs')
                .select('*')
                .eq('organization_id', organization?.id)
                .eq('status', 'active')
                .eq('is_visible', true)
                .order('start_date', { ascending: true });

            if (progError) throw progError;
            setPrograms(progs || []);

            // 2. Fetch my enrollments to check status
            const { data: enrolls, error: enrollError } = await supabase
                .from('enrollments')
                .select('program_id')
                .eq('user_id', user?.id)
                .in('status', ['active', 'pending']); // Exclude completed/dropped if you want allow re-enrollment logic differently

            if (enrollError) throw enrollError;
            setEnrolledProgramIds(enrolls?.map(e => e.program_id) || []);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async (programId: string, fee: number) => {
        try {
            setEnrollingId(programId);

            // 1. Create Enrollment (Pending Payment)
            const { error } = await supabase
                .from('enrollments')
                .insert([{
                    organization_id: organization!.id,
                    user_id: user!.id,
                    program_id: programId,
                    status: fee > 0 ? 'pending' : 'active',
                    payment_status: fee > 0 ? 'pending' : 'paid',
                    amount_due: fee,
                    enrollment_source: 'web_portal',
                    qr_code_data: `${user!.id}-${programId}-${Date.now()}` // Simple unique string
                }]);

            if (error) {
                // Check for duplicate enrollment
                if (error.code === '23505') {
                    throw new Error('You are already enrolled in this program.');
                }
                throw error;
            }

            // 2. Feedback & Redirect
            if (fee > 0) {
                // Show "Pay at Office" modal or toast, then redirect
                alert(`Enrollment successful! Please visit the administration office to pay the enrollment fee of $${fee} to activate your access.`);
            } else {
                alert('Enrollment successful!');
            }

            navigate(`/portal/${organization?.slug}/dashboard`);

        } catch (err: any) {
            alert(err.message);
        } finally {
            setEnrollingId(null);
        }
    };

    return (
        <div className="p-6 pb-32 space-y-6">
            <div className="space-y-2 pt-6">
                <h1 className="text-2xl font-black text-white uppercase tracking-tight">Discover Programs</h1>
                <p className="text-slate-400 text-sm">Find your next step in the journey.</p>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                    type="text"
                    placeholder="Search courses..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm outline-none focus:border-indigo-500/50 transition-colors"
                />
            </div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
            ) : (
                <div className="space-y-4">
                    {programs.map(program => {
                        const isEnrolled = enrolledProgramIds.includes(program.id);
                        return (
                            <GlassBox key={program.id} className="p-0 overflow-hidden group">
                                <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 relative">
                                    {program.image_url && (
                                        <img src={program.image_url} alt="" className="w-full h-full object-cover opacity-60" />
                                    )}
                                    <div className="absolute top-3 right-3">
                                        <span className="px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-[10px] font-black uppercase tracking-widest text-white border border-white/10">
                                            {program.category || 'General'}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-5 space-y-4">
                                    <div>
                                        <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">{program.name}</h3>
                                        <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">{program.description}</p>
                                    </div>

                                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3 h-3 text-indigo-400" />
                                            <span>Starts {new Date(program.start_date).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    {isEnrolled ? (
                                        <Button
                                            className="w-full bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 font-black uppercase tracking-widest h-12"
                                            onClick={() => navigate(`/portal/${orgSlug}/dashboard`)}
                                        >
                                            <CheckCircle2 className="w-4 h-4 mr-2" /> Enrolled
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="premium"
                                            className="w-full"
                                            onClick={() => handleEnroll(program.id, program.enrollment_fee || 0)}
                                            disabled={enrollingId === program.id || isEnrolled}
                                        >
                                            {enrollingId === program.id ? (
                                                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Processing...</>
                                            ) : isEnrolled ? (
                                                'Already Enrolled'
                                            ) : (
                                                program.enrollment_fee && program.enrollment_fee > 0
                                                    ? `Enroll for $${program.enrollment_fee}`
                                                    : 'Enroll Now (Free)'
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </GlassBox>
                        );
                    })}

                    {programs.length === 0 && (
                        <div className="text-center py-10 text-slate-500 text-sm">
                            No active programs available at the moment.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
