import axios from 'axios';
import { env } from '../config/env.js';

const client = axios.create({
  baseURL: env.ai.url,
  timeout: 10_000,
  headers: env.ai.token ? { 'x-service-token': env.ai.token } : {},
});

export const aiService = {
  async predictMood(mood: string): Promise<{ genre: string | null }> {
    const { data } = await client.post('/mood', { mood });
    return data;
  },
  async recommend(payload: {
    liked: string[];
    disliked: string[];
    candidates: unknown[];
    limit: number;
  }) {
    const { data } = await client.post('/recommend', payload);
    return data;
  },
};
