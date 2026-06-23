const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function setToken(token: string): void {
  localStorage.setItem('token', token);
}

export function clearToken(): void {
  localStorage.removeItem('token');
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const json = (await res.json()) as ApiResponse<T>;

  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || 'Request failed');
  }
  return json.data as T;
}

export const authApi = {
  login: (email: string, password: string) =>
    api<{ token: string; user: { name: string; email: string; role: string } }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) },
    ),
};

export const payrollApi = {
  months: () => api<unknown[]>('/payroll/months'),
  ytd: () => api<{ gross: number; netPay: number; months: number }>('/payroll/ytd'),
  compare: (from: string, to: string) =>
    api<{ changes: { field: string; from: number; to: number; delta: number }[] }>(
      `/payroll/compare?from=${from}&to=${to}`,
    ),
};

export const payslipApi = {
  list: () => api<unknown[]>('/payslips'),
  upload: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api<unknown>('/payslips/upload', { method: 'POST', body: form });
  },
};

export const taxApi = {
  declaration: () => api<unknown>('/tax/declaration'),
  simulate: (extra80C: number) =>
    api<{
      annualTaxSaving: number;
      monthlyTdsSaving: number;
      steps: { label: string; value: number; note: string }[];
      assumptions: string[];
    }>('/tax/simulate', { method: 'POST', body: JSON.stringify({ extra80C }) }),
};

export const checklistApi = {
  get: () => api<{ id: string; title: string; description: string; status: string }[]>('/checklist'),
};

export const chatApi = {
  ask: (question: string) =>
    api<{ answer: string; sources: { field: string; value: unknown }[]; refused: boolean }>(
      '/chat/ask',
      { method: 'POST', body: JSON.stringify({ question }) },
    ),
};
