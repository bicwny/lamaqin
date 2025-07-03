
import { supabase } from './supabase';

export interface MeditationTopic {
  id: string;
  practice_id: string;
  topic_number: number;
  title: string;
  description?: string;
  created_at: string;
}

export const meditationTopicsService = {
  async getAllTopics(practiceId?: string): Promise<MeditationTopic[]> {
    let query = supabase
      .from('meditation_topics')
      .select('*')
      .order('topic_number');

    if (practiceId) {
      query = query.eq('practice_id', practiceId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error loading meditation topics:', error);
      throw error;
    }

    return data || [];
  },

  async getTopicByNumber(topicNumber: number, practiceId?: string): Promise<MeditationTopic | null> {
    let query = supabase
      .from('meditation_topics')
      .select('*')
      .eq('topic_number', topicNumber);

    if (practiceId) {
      query = query.eq('practice_id', practiceId);
    }

    const { data, error } = await query.single();

    if (error) {
      console.error('Error loading meditation topic:', error);
      return null;
    }

    return data;
  },

  async getTopicsRange(startNumber: number, endNumber: number, practiceId?: string): Promise<MeditationTopic[]> {
    let query = supabase
      .from('meditation_topics')
      .select('*')
      .gte('topic_number', startNumber)
      .lte('topic_number', endNumber)
      .order('topic_number');

    if (practiceId) {
      query = query.eq('practice_id', practiceId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error loading meditation topics range:', error);
      throw error;
    }

    return data || [];
  }
};
