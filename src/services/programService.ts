import { supabase } from './supabase';
import { Program } from '@/types';

export const programService = {
    async getPrograms(organizationId: string) {
        const { data, error } = await supabase
            .from('programs')
            .select('*')
            .eq('organization_id', organizationId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Program[];
    },

    async getProgramById(id: string) {
        const { data, error } = await supabase
            .from('programs')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Program;
    },

    async createProgram(program: Partial<Program>) {
        const { data, error } = await supabase
            .from('programs')
            .insert([program])
            .select()
            .single();

        if (error) throw error;
        return data as Program;
    },

    async updateProgram(id: string, updates: Partial<Program>) {
        const { data, error } = await supabase
            .from('programs')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Program;
    },

    async deleteProgram(id: string) {
        const { error } = await supabase
            .from('programs')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
