import { useState, useEffect } from 'react';
import { Card, GlassBox } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    Users,
    Calendar,
    Award,
    TrendingUp,
    QrCode,
    ChevronRight,
    Sparkles,
    Activity,
    Zap,
    Clock,
    Loader2,
    Banknote,
    ExternalLink,
    Copy,
    Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { profileService } from '@/services/profileService';

export function DashboardOverview() {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const { organization } = useOrganization();

    const [stats, setStats] = useState({
        programs: 0,
        participants: 0,
        verificationRate: '100%',
        certificates: 0,
        revenue: 0
    });
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (organization?.id) {
            fetchDashboardData();
        }
    }, [organization?.id]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [s, a] = await Promise.all([
                profileService.getStats(organization!.id),
                profileService.getRecentActivity(organization!.id)
            ]);
            setStats(s as any);
            setActivities(a);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { label: 'Active Curriculums', value: stats.programs, icon: <Calendar className="w-5 h-5" />, color: 'indigo', trend: '+2 this month' },
        { label: 'Total Participants', value: stats.participants, icon: <Users className="w-5 h-5" />, color: 'pink', trend: '+14% growth' },
        { label: 'Verification Rate', value: stats.verificationRate, icon: <QrCode className="w-5 h-5" />, color: 'amber', trend: 'Optimal' },
        { label: 'Total Revenue', value: `$${stats.revenue.toLocaleString()}`, icon: <Banknote className="w-5 h-5" />, color: 'emerald', trend: 'Live Sync' },
    ];

    return (
        <div className="space-y-12 pb-20">
            {/* Top Greeting */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div className="flex items-center space-x-2 mb-2">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">System Online</span>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight uppercase">
                        Greetings, {profile?.first_name || 'Servant'}
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Ministry oversight and performance metrics</p>
                </motion.div>

                <div className="flex gap-4">
                    <Button variant="premium" className="h-14 px-8 font-black uppercase tracking-widest text-xs" onClick={() => navigate('/dashboard/qr')}>
                        <QrCode className="w-4 h-4 mr-3" /> Launch Quick Scan
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {statCards.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="bg-slate-900/40 border-white/5 p-8 group hover:border-indigo-500/30 transition-all relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                {stat.icon}
                            </div>
                            <div className={`p-3 rounded-xl bg-${stat.color}-500/10 border border-${stat.color}-500/20 w-fit mb-6 text-${stat.color}-400`}>
                                {stat.icon}
                            </div>
                            <h3 className="text-4xl font-black text-white tracking-tighter mb-2">{stat.value}</h3>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">{stat.label}</p>
                            <div className="flex items-center text-[9px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/5 w-fit px-2 py-1 rounded">
                                <TrendingUp className="w-3 h-3 mr-1.5" /> {stat.trend}
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Areas */}
            <div className="grid lg:grid-cols-3 gap-12">
                {/* Recent Activity */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center space-x-3">
                            <Activity className="w-5 h-5 text-indigo-400" />
                            <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Activity Stream</h3>
                        </div>
                        <Button variant="ghost" className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white">
                            View all logs <ChevronRight className="w-3 h-3 ml-2" />
                        </Button>
                    </div>

                    <div className="space-y-6">
                        {loading ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                            </div>
                        ) : activities.map((activity, i) => (
                            <motion.div
                                key={activity.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Card className="p-6 bg-slate-900/40 border-white/5 hover:bg-slate-900/60 transition-colors flex items-center justify-between group">
                                    <div className="flex items-center space-x-6">
                                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-indigo-400 overflow-hidden">
                                            {activity.users.profile_photo_url ? (
                                                <img src={activity.users.profile_photo_url} className="w-full h-full object-cover" />
                                            ) : (
                                                activity.users.first_name[0] + activity.users.surname[0]
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white uppercase tracking-tight">
                                                {activity.users.first_name} {activity.users.surname}
                                            </p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                                                Checked in to <span className="text-indigo-400">{activity.sessions.name}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center justify-end text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">
                                            <Clock className="w-3 h-3 mr-2" /> {new Date(activity.checkin_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase tracking-widest rounded-lg border border-emerald-500/20 text-center">
                                            Verified
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions / Side Info */}
                <div className="space-y-12">
                    <Card className="p-8 bg-slate-900/40 border-white/5 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Globe className="w-32 h-32" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center space-x-3 mb-6">
                                <Globe className="w-4 h-4 text-indigo-400" />
                                <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Participant Hub</h3>
                            </div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed mb-6">
                                Share this link with your members to let them enroll and check-in.
                            </p>
                            <div className="flex items-center gap-2 p-3 bg-white/5 border border-white/5 rounded-xl mb-4">
                                <span className="text-[10px] font-bold text-slate-400 truncate flex-1">
                                    {window.location.origin}/portal/{organization?.slug}
                                </span>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(`${window.location.origin}/portal/${organization?.slug}`);
                                        alert('Link copied to clipboard!');
                                    }}
                                    className="p-2 hover:bg-white/10 rounded-lg text-indigo-400 transition-colors"
                                >
                                    <Copy className="w-3 h-3" />
                                </button>
                            </div>
                            <Button
                                variant="ghost"
                                className="w-full h-12 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white border border-white/5"
                                onClick={() => window.open(`/portal/${organization?.slug}`, '_blank')}
                            >
                                <ExternalLink className="w-3.5 h-3.5 mr-2" /> Preview Portal
                            </Button>
                        </div>
                    </Card>

                    <GlassBox className="p-8 bg-gradient-to-br from-indigo-600 to-purple-700 border-none relative overflow-hidden group shadow-2xl shadow-indigo-500/20">
                        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <QrCode className="w-48 h-48" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-4">Quick QR Terminal</h3>
                            <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest leading-relaxed mb-8">
                                Instantly activate the attendance engine for your current session matrix.
                            </p>
                            <Button
                                variant="outline"
                                className="w-full h-14 bg-white/10 border-white/20 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/20"
                                onClick={() => navigate('/dashboard/qr')}
                            >
                                Open Terminal
                            </Button>
                        </div>
                    </GlassBox>

                    <Card className="p-8 bg-slate-900/40 border-white/5">
                        <div className="flex items-center space-x-3 mb-8">
                            <Zap className="w-4 h-4 text-amber-500" />
                            <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Rapid Actions</h3>
                        </div>
                        <div className="space-y-4">
                            {[
                                { label: 'Assemble Program', icon: <Calendar className="w-4 h-4" />, path: '/dashboard/programs/new' },
                                { label: 'Reward Catalog', icon: <Award className="w-4 h-4" />, path: '/dashboard/rewards' },
                                { label: 'User Directory', icon: <Users className="w-4 h-4" />, path: '/dashboard/users' },
                            ].map((action) => (
                                <button
                                    key={action.label}
                                    onClick={() => navigate(action.path)}
                                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-transparent hover:border-white/5 hover:bg-white/10 transition-all group"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="text-slate-500 group-hover:text-indigo-400 transition-colors">
                                            {action.icon}
                                        </div>
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">{action.label}</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                </button>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
