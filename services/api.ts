import { User, SavedSession, SectionTemplate, Framework, CanvasSection, Viewport, ProblemStatement } from '../types';

const API_BASE = process.env.REACT_APP_API_URL || '';
let token: string | null = localStorage.getItem('auth_token');

export const api = {
  setToken: (newToken: string) => {
    token = newToken;
    localStorage.setItem('auth_token', newToken);
  },

  getToken: () => token,

  clearToken: () => {
    token = null;
    localStorage.removeItem('auth_token');
  },

  async register(email: string, name: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password })
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    this.setToken(data.token);
    return data;
  },

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    this.setToken(data.token);
    return data;
  },

  async getSessions(): Promise<SavedSession[]> {
    const res = await fetch(`${API_BASE}/api/sessions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch sessions');
    const sessions = await res.json();
    return sessions.map((s: any) => ({
      id: s.id,
      problem: { text: s.problemText, timestamp: s.lastModified },
      framework: s.frameworkData,
      sections: s.sectionsData || [],
      viewport: s.viewportData,
      lastModified: s.lastModified
    }));
  },

  async saveSession(session: {
    id?: string;
    problemText: string;
    frameworkData: Framework;
    sectionsData: CanvasSection[];
    viewportData?: Viewport;
  }): Promise<SavedSession> {
    const res = await fetch(`${API_BASE}/api/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(session)
    });
    if (!res.ok) throw new Error('Failed to save session');
    const data = await res.json();
    return {
      id: data.id,
      problem: { text: data.problemText, timestamp: data.lastModified },
      framework: data.frameworkData,
      sections: data.sectionsData || [],
      viewport: data.viewportData,
      lastModified: data.lastModified
    };
  },

  async deleteSession(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/sessions/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to delete session');
  },

  async getTemplates(): Promise<SectionTemplate[]> {
    const res = await fetch(`${API_BASE}/api/templates`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch templates');
    return await res.json();
  },

  async saveTemplate(name: string, data: any): Promise<SectionTemplate> {
    const res = await fetch(`${API_BASE}/api/templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, data })
    });
    if (!res.ok) throw new Error('Failed to save template');
    return await res.json();
  },

  async deleteTemplate(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/templates/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to delete template');
  }
};
