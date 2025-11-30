// Lightweight generic CRUD helpers using fetch

type QueryParams = Record<string | number, string | number | boolean | undefined | null>;

export interface ApiOptions {
    baseUrl?: string;               // e.g. "https://api.example.com"
    token?: string;                 // bearer token if needed
    headers?: Record<string,string>;
    defaultJson?: boolean;          // set Content-Type: application/json for writes
}

function appendParamsToString(path: string, params?: QueryParams) {
    if (!params) return path;
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) sp.append(String(k), String(v));
    });
    const qs = sp.toString();
    return qs ? `${path}${path.includes('?') ? '&' : '?'}${qs}` : path;
}

function buildUrl(base: string | undefined, path: string, params?: QueryParams) {
    // If a valid base is provided, use URL to join and append params.
    if (base) {
        // Ensure path is absolute-ish for URL constructor
        const normalizedPath = path.startsWith('/') ? path : `/${path}`;
        const url = new URL(normalizedPath, base);
        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                if (v !== undefined && v !== null) url.searchParams.append(k, String(v));
            });
        }
        return url.toString();
    }

    // No base provided — return a relative path with query string appended.
    const relativePath = path.startsWith('/') ? path : `/${path}`;
    return appendParamsToString(relativePath, params);
}

async function request<T>(method: string, url: string, body?: any, opts?: ApiOptions) : Promise<T> {
    const headers: Record<string,string> = { ...(opts?.headers || {}) };
    if (opts?.token) headers['Authorization'] = `Bearer ${opts.token}`;
    if (opts?.defaultJson && body !== undefined) {
        // only set json content-type when not already provided
        headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }

    const init: RequestInit = {
        method,
        headers,
    };

    if (body !== undefined) {
        const contentType = headers['Content-Type'] || '';
        if (contentType.includes('application/json')) {
            init.body = JSON.stringify(body);
        } else {
            // allow sending FormData, Blob, string, etc.
            init.body = body;
        }
    }

    const res = await fetch(url, init);

    if (!res.ok) {
        const text = await res.text().catch(() => '');
        const err: any = new Error(`HTTP ${res.status} ${res.statusText}`);
        err.status = res.status;
        err.body = text;
        throw err;
    }

    // handle empty/no-content responses
    if (res.status === 204) {
        // @ts-ignore
        return undefined;
    }

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) return res.json() as Promise<T>;
    return (res.text() as unknown) as T;
}

/* Convenience CRUD exports
   resourcePath can be "/items" or "items" (baseUrl is joined via URL)
*/

export function useApi(opts?: ApiOptions) {
    const base = opts?.baseUrl;

    return {
        list: async <T = any>(resourcePath: string, params?: QueryParams) => {
            const url = buildUrl(base, resourcePath.startsWith('/') ? resourcePath : `/${resourcePath}`, params);
            return request<T>('GET', url, undefined, opts);
        },

        get: async <T = any>(resourcePath: string, id: string | number, params?: QueryParams) => {
            const path = resourcePath.endsWith('/') ? `${resourcePath}${id}` : `${resourcePath}/${id}`;
            const url = buildUrl(base, path.startsWith('/') ? path : `/${path}`, params);
            return request<T>('GET', url, undefined, opts);
        },

        create: async <T = any, B = any>(resourcePath: string, body: B) => {
            const url = buildUrl(base, resourcePath.startsWith('/') ? resourcePath : `/${resourcePath}`);
            return request<T>('POST', url, body, { ...opts, defaultJson: true });
        },

        update: async <T = any, B = any>(resourcePath: string, id: string | number, body: B, usePatch = false) => {
            const path = resourcePath.endsWith('/') ? `${resourcePath}${id}` : `${resourcePath}/${id}`;
            const url = buildUrl(base, path.startsWith('/') ? path : `/${path}`);
            return request<T>(usePatch ? 'PATCH' : 'PUT', url, body, { ...opts, defaultJson: true });
        },

        remove: async <T = any>(resourcePath: string, id: string | number) => {
            const path = resourcePath.endsWith('/') ? `${resourcePath}${id}` : `${resourcePath}/${id}`;
            const url = buildUrl(base, path.startsWith('/') ? path : `/${path}`);
            return request<T>('DELETE', url, undefined, opts);
        }
    };
}