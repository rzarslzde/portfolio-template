const viteApiUrl = import.meta.env.VITE_API_URL;

export function getApiBase() {
  const configured = viteApiUrl || window.__APP_CONFIG__?.API_URL || '/api';
  return configured.replace(/\/+$/, '');
}

export function resolveAsset(path) {
  if (!path) return '';
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  const apiBase = getApiBase();
  if (/^https?:\/\//i.test(apiBase)) {
    try {
      return new URL(path, new URL(apiBase).origin).toString();
    } catch {
      return path;
    }
  }
  return path.startsWith('/') ? path : `/${path}`;
}

export async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = localStorage.getItem('ravand_admin_token');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const hasFormData = options.body instanceof FormData;
  if (options.body && !hasFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let response;
  try {
    response = await fetch(`${getApiBase()}${path.startsWith('/') ? path : `/${path}`}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error('ارتباط با سرور برقرار نشد. لطفاً اتصال و نشانی API را بررسی کنید.');
  }

  if (response.status === 401 && token && !path.startsWith('/auth/login')) {
    localStorage.removeItem('ravand_admin_token');
  }
  if (!response.ok) {
    let message = 'در انجام درخواست مشکلی پیش آمد.';
    try {
      const payload = await response.json();
      message = payload.detail || message;
    } catch {
      // Keep the localized fallback message for non-JSON errors.
    }
    throw new Error(message);
  }
  if (response.status === 204) return null;
  return response.json();
}

export async function uploadAsset(file) {
  const body = new FormData();
  body.append('file', file);
  return request('/admin/uploads', { method: 'POST', body });
}
