import type { AppBlueprint } from '../../blueprint/schema';

export class ApiGenerator {
  static generate(blueprint: AppBlueprint): string {
    const endpointsCode = blueprint.api.endpoints.map(ep => {
      const idUpper = ep.id.toUpperCase();
      return `  ${idUpper}: { method: '${ep.method}', path: '${ep.path}' }`;
    }).join(',\n');

    return `export const API_ENDPOINTS = {
${endpointsCode}
};

export class ApiService {
  private baseUrl: string = '${blueprint.api.baseUrl}';

  async request(options: { method: string; path: string; body?: any; queryParams?: any }) {
    const url = new URL(this.baseUrl + options.path);
    if (options.queryParams) {
      Object.keys(options.queryParams).forEach(key => 
        url.searchParams.append(key, options.queryParams[key])
      );
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    const res = await fetch(url.toString(), {
      method: options.method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    if (!res.ok) {
      throw new Error('API error: ' + res.statusText);
    }

    return await res.json();
  }
}

export const apiService = new ApiService();
`;
  }
}
