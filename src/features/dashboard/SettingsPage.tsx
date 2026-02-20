import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    Building,
    Palette,
    Globe,
    Key,
    Mail,
    Bell,
    Shield,
    CloudIcon,
    Save,
    Upload,
    User,
    Briefcase
} from 'lucide-react';

import { organizationService } from '@/services/organizationService';
import { TeamSettings } from '@/features/settings/TeamSettings';

export function SettingsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTab = searchParams.get('tab') || 'organization';
    const [activeTab, setActiveTab] = useState(initialTab);
    const { user, profile } = useAuth();
    const { organization } = useOrganization();

    const [loading, setLoading] = useState(false);
    const [orgForm, setOrgForm] = useState({
        name: '',
        email: ''
    });
    const [brandingForm, setBrandingForm] = useState({
        primary_color: '#8B5CF6',
        secondary_color: '#0EA5E9'
    });

    // Update URL when tab changes
    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        setSearchParams({ tab: tabId });
    };

    // Update active tab if URL changes (e.g. back button)
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab) setActiveTab(tab);
    }, [searchParams]);

    // Update local state when organization loads
    useEffect(() => {
        if (organization) {
            setOrgForm({
                name: organization.name,
                email: organization.contact_email || ''
            });
            setBrandingForm({
                primary_color: organization.primary_color || '#8B5CF6',
                secondary_color: organization.secondary_color || '#0EA5E9'
            });
        }
    }, [organization]);

    const handleSaveOrganization = async () => {
        if (!organization) return;
        setLoading(true);
        try {
            await organizationService.updateOrganization(organization.id, {
                name: orgForm.name,
                contact_email: orgForm.email
            });
            alert('Organization details updated successfully!');
        } catch (error) {
            console.error('Error updating organization:', error);
            alert('Failed to update organization.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveBranding = async () => {
        if (!organization) return;
        setLoading(true);
        try {
            await organizationService.updateOrganization(organization.id, {
                primary_color: brandingForm.primary_color,
                secondary_color: brandingForm.secondary_color
            });
            alert('Branding updated successfully! Refresh to see changes.');
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert('Failed to update branding.');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'profile', name: 'User Profile', icon: <User className="w-4 h-4" /> },
        { id: 'organization', name: 'Organization', icon: <Building className="w-4 h-4" /> },
        { id: 'team', name: 'Team Management', icon: <User className="w-4 h-4" /> },
        { id: 'branding', name: 'Branding', icon: <Palette className="w-4 h-4" /> },
        { id: 'integrations', name: 'Integrations', icon: <CloudIcon className="w-4 h-4" /> },
        { id: 'security', name: 'Security', icon: <Shield className="w-4 h-4" /> },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-10">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Settings</h1>
                <p className="text-gray-500 font-medium">Manage your profile, organization, and system preferences.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Tabs */}
                <div className="md:w-64 space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                                ? 'bg-white text-primary shadow-sm border border-gray-100'
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <span className={activeTab === tab.id ? 'text-primary' : 'text-gray-400'}>
                                {tab.icon}
                            </span>
                            <span>{tab.name}</span>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 space-y-8">
                    {activeTab === 'profile' && (
                        <Card className="space-y-8">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Personal Profile</h3>
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="w-20 h-20 bg-gradient-premium rounded-2xl flex items-center justify-center text-4xl shadow-lg shadow-indigo-500/20">
                                        <span className="text-white opacity-90">
                                            {profile?.first_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900">
                                            {profile?.first_name} {profile?.surname}
                                        </h2>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[10px] font-black uppercase tracking-widest">
                                                {profile?.role?.replace('_', ' ') || 'User'}
                                            </span>
                                            <span className="text-sm text-gray-500 font-medium">{organization?.name}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">First Name</label>
                                        <input
                                            type="text"
                                            defaultValue={profile?.first_name || ''}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 text-gray-600 cursor-not-allowed"
                                            readOnly
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Surname</label>
                                        <input
                                            type="text"
                                            defaultValue={profile?.surname || ''}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 text-gray-600 cursor-not-allowed"
                                            readOnly
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-bold text-gray-700">Email Address</label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                defaultValue={user?.email || ''}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 text-gray-600 cursor-not-allowed"
                                                readOnly
                                            />
                                            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-gray-100">
                                <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Account Security</h4>
                                <Button variant="outline" className="w-full justify-between group">
                                    <span className="flex items-center gap-2">
                                        <Key className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
                                        <span>Change Password</span>
                                    </span>
                                    <span className="text-xs text-gray-400">Last updated 3 months ago</span>
                                </Button>
                            </div>
                        </Card>
                    )}

                    {activeTab === 'team' && (
                        <TeamSettings />
                    )}

                    {activeTab === 'organization' && (
                        <Card className="space-y-8">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Organization Information</h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-bold text-gray-700">Church / Org Name</label>
                                        <input
                                            type="text"
                                            value={orgForm.name}
                                            onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-bold text-gray-700">Primary Email</label>
                                        <input
                                            type="email"
                                            value={orgForm.email}
                                            onChange={(e) => setOrgForm({ ...orgForm, email: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-100"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-gray-100 flex justify-end">
                                <Button variant="primary" onClick={handleSaveOrganization} disabled={loading}>
                                    <Save className="w-4 h-4 mr-2" />
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </Card>
                    )}

                    {activeTab === 'branding' && (
                        <Card className="space-y-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Visual Identity</h3>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-sm font-bold text-gray-700 block mb-3">Organization Logo</label>
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center">
                                            <Upload className="w-6 h-6 text-gray-300" />
                                        </div>
                                        <div className="space-y-2">
                                            <Button variant="outline" size="sm" className="bg-white">Update Logo</Button>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">PNG or SVG • Max 2MB</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8 pt-6">
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-gray-700 block">Primary Brand Color</label>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl border border-gray-100 bg-primary shadow-sm" style={{ backgroundColor: brandingForm.primary_color }}></div>
                                            <input
                                                type="text"
                                                value={brandingForm.primary_color}
                                                onChange={(e) => setBrandingForm({ ...brandingForm, primary_color: e.target.value })}
                                                className="flex-1 px-4 py-2 rounded-xl border border-gray-100 font-mono text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-gray-700 block">Accent Color</label>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl border border-gray-100 bg-secondary shadow-sm" style={{ backgroundColor: brandingForm.secondary_color }}></div>
                                            <input
                                                type="text"
                                                value={brandingForm.secondary_color}
                                                onChange={(e) => setBrandingForm({ ...brandingForm, secondary_color: e.target.value })}
                                                className="flex-1 px-4 py-2 rounded-xl border border-gray-100 font-mono text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-gray-100 flex justify-end">
                                <Button variant="primary" onClick={handleSaveBranding} disabled={loading}>
                                    <Save className="w-4 h-4 mr-2" />
                                    {loading ? 'Saving...' : 'Update Branding'}
                                </Button>
                            </div>
                        </Card>
                    )}

                    {activeTab === 'integrations' && (
                        <div className="space-y-6">
                            {[
                                { name: 'Supabase DB', status: 'connected', desc: 'Core data management and RLS security.', icon: <Key className="text-emerald-500" /> },
                                { name: 'Zimbabwe EcoCash', status: 'setup_required', desc: 'Accept direct payments via mobile money.', icon: <Building className="text-blue-500" /> },
                                { name: 'Paynow ZW', status: 'connected', desc: 'Gateway for cards and ZIPIT payments.', icon: <Palette className="text-purple-500" /> },
                            ].map((service) => (
                                <Card key={service.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-gray-50 rounded-xl">
                                            {service.icon}
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold text-gray-900">{service.name}</h4>
                                            <p className="text-xs text-gray-500 font-medium">{service.desc}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${service.status === 'connected' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                                            }`}>
                                            {service.status.replace('_', ' ')}
                                        </span>
                                        <Button variant="ghost" size="sm">Configure</Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
