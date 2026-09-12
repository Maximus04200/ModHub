import { apiClient } from './client';
import type { Category, ModDetail, ModSummary, SearchResult } from './types';

export interface ModSearchParams {
  q?: string;
  gameKey?: string;
  categoryId?: string;
  page?: number;
}

interface CreateModInput {
  title: string;
  summary: string;
  description: string;
  gameKey: string;
  categoryId: string;
  gameMetadata?: Record<string, unknown>;
}

interface AddVersionInput {
  versionLabel: string;
  changelog: string;
  fileUrl: string;
  fileSizeBytes: number;
}

export const modsApi = {
  async search(params: ModSearchParams): Promise<SearchResult> {
    const { data } = await apiClient.get<SearchResult>('/mods', { params });
    return data;
  },

  async getBySlug(slug: string): Promise<ModDetail> {
    const { data } = await apiClient.get<ModDetail>(`/mods/${slug}`);
    return data;
  },

  async create(input: CreateModInput): Promise<ModSummary> {
    const { data } = await apiClient.post<ModSummary>('/mods', input);
    return data;
  },

  async addVersion(modId: string, input: AddVersionInput): Promise<void> {
    await apiClient.post(`/mods/${modId}/versions`, input);
  },

  async rate(modId: string, value: number): Promise<void> {
    await apiClient.post(`/mods/${modId}/ratings`, { value });
  },

  async comment(modId: string, body: string): Promise<void> {
    await apiClient.post(`/mods/${modId}/comments`, { body });
  },

  async follow(modId: string): Promise<void> {
    await apiClient.post(`/mods/${modId}/follow`);
  },

  async unfollow(modId: string): Promise<void> {
    await apiClient.delete(`/mods/${modId}/follow`);
  },

  async mine(): Promise<ModSummary[]> {
    const { data } = await apiClient.get<ModSummary[]>('/mods/mine');
    return data;
  },

  async pending(): Promise<ModSummary[]> {
    const { data } = await apiClient.get<ModSummary[]>('/mods/moderation/pending');
    return data;
  },

  async moderate(modId: string, status: 'APPROVED' | 'REJECTED'): Promise<void> {
    await apiClient.patch(`/mods/${modId}/moderate`, { status });
  },

  async categories(): Promise<Category[]> {
    const { data } = await apiClient.get<Category[]>('/categories');
    return data;
  },
};
