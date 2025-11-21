import { supabase } from '../lib/supabaseClient';

export class UserService {
  static async getUserInfo(id: string) {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      if (userError) throw userError;
      return userData;
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  }
}
