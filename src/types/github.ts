export interface GitHubResponse {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  name: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface GithubAuthClient {
  id: string;
  email: string | null;
  name: string;
  avatar: string;
  username: string;
  provider: string;
}
