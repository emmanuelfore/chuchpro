import { supabase } from './supabase';

export const organizationService = {
    async updateOrganization(id: string, updates: {
        name?: string;
        contact_email?: string;
        primary_color?: string;
        secondary_color?: string;
    }) {
        const { data, error } = await supabase
            .from('organizations')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating organization:', error);
            throw new Error(error.message);
        }

        return data;
    }
};
