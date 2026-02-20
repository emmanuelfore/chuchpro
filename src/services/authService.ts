import { supabase } from './supabase';

export const authService = {
    async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return data;
    },

    async signUp(formData: any) {
        // 1. Create Organization
        const { data: org, error: orgError } = await supabase
            .from('organizations')
            .insert([{
                name: formData.orgName,
                slug: formData.orgSlug,
                primary_color: formData.primaryColor,
                secondary_color: formData.secondaryColor,
                contact_email: formData.adminEmail,
            }])
            .select()
            .single();

        if (orgError) throw orgError;

        // 2. Sign up User
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: formData.adminEmail,
            password: formData.password,
        });

        if (authError) {
            // Rollback org creation if possible (or handle error)
            await supabase.from('organizations').delete().eq('id', org.id);
            throw authError;
        }

        if (authData.user) {
            // 3. Create User Profile
            const { error: profileError } = await supabase
                .from('users')
                .insert([{
                    // id: auto-generated
                    auth_id: authData.user.id,
                    organization_id: org.id,
                    email: formData.adminEmail,
                    first_name: formData.adminName.split(' ')[0],
                    surname: formData.adminName.split(' ').slice(1).join(' ') || 'Admin',
                    role: 'system_admin',
                    is_active: true
                }]);

            if (profileError) {
                // Critical: Rollback user and org if profile fails
                console.error('Profile creation failed, rolling back...', profileError);
                // Note: We can't easily delete the auth user from the client side due to permissions.
                // We should at least delete the organization to clean up.
                await supabase.from('organizations').delete().eq('id', org.id);
                throw new Error('Failed to create user profile. Please try again.');
            }
        }

        return { user: authData.user, organization: org };
    },

    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    }
};
