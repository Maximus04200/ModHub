export type Role = 'USER' | 'ADMIN';
export type ModStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: Role;
}

export interface AuthResult {
  token: string;
  user: AuthUser;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface ModSummary {
  id: string;
  title: string;
  slug: string;
  summary: string;
  gameKey: string;
  status: ModStatus;
  createdAt: string;
  category: Category;
  author: { id: string; displayName: string };
}

export interface ModVersion {
  id: string;
  versionLabel: string;
  changelog: string;
  fileUrl: string;
  fileSizeBytes: number;
  downloadCount: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  body: string;
  createdAt: string;
  user: { id: string; displayName: string };
}

export interface ModDetail extends ModSummary {
  description: string;
  versions: ModVersion[];
  comments: Comment[];
  metadata: Record<string, unknown>;
  _count: { ratings: number; comments: number; follows: number };
}

export interface SearchResult {
  items: ModSummary[];
  total: number;
  page: number;
  pageSize: number;
}
