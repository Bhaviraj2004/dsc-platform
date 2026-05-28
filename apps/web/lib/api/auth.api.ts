import api from './axios';

export type RegisterDto = {
  email: string;
  password: string;
  role: 'CA' | 'CLIENT';
};

export type LoginDto = {
  email: string;
  password: string;
};

export type AuthResponse = {
  access_token: string;
};

export type MeResponse = {
  id: number;
  email: string;
  // name: string;
  role: 'CA' | 'CLIENT';
  totpEnabled: boolean;
};

export const authApi = {
  register: async (dto: RegisterDto): Promise<AuthResponse> => {
    const res = await api.post('/auth/register', dto);
    return res.data;
  },

  login: async (dto: LoginDto): Promise<AuthResponse> => {
    const res = await api.post('/auth/login', dto);
    return res.data;
  },

  me: async (): Promise<MeResponse> => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};