// API configuration helper
export const getApiUrl = (path: string) => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}/api${cleanPath}`;
};

