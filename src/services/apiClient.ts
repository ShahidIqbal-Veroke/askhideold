// API Client with SSL bypass for development/staging environments
export class ApiClient {
  private static getBaseUrl(): string {
    const protocol = import.meta.env.VITE_API_PROTOCOL || 'http';
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    
    // Always use HTTP in production for now due to SSL certificate issues
    if (import.meta.env.PROD) {
      return baseUrl.replace('https://', 'http://');
    }
    
    return baseUrl;
  }

  static async post(endpoint: string, data: FormData | Record<string, any>, options: RequestInit = {}): Promise<Response> {
    const url = `${this.getBaseUrl()}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        ...options,
        body: data instanceof FormData ? data : JSON.stringify(data),
        headers: {
          'Accept': 'application/json',
          ...(data instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
          ...options.headers,
        },
      });

      return response;
    } catch (error) {
      // If SSL error, retry with HTTP
      if (error instanceof TypeError && error.message.includes('certificate')) {
        const httpUrl = url.replace('https://', 'http://');
        console.warn('SSL certificate error, retrying with HTTP:', httpUrl);
        
        return fetch(httpUrl, {
          method: 'POST',
          ...options,
          body: data instanceof FormData ? data : JSON.stringify(data),
          headers: {
            'Accept': 'application/json',
            ...(data instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
            ...options.headers,
          },
        });
      }
      
      throw error;
    }
  }

  static async get(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = `${this.getBaseUrl()}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        ...options,
        headers: {
          'Accept': 'application/json',
          ...options.headers,
        },
      });

      return response;
    } catch (error) {
      // If SSL error, retry with HTTP
      if (error instanceof TypeError && error.message.includes('certificate')) {
        const httpUrl = url.replace('https://', 'http://');
        console.warn('SSL certificate error, retrying with HTTP:', httpUrl);
        
        return fetch(httpUrl, {
          method: 'GET',
          ...options,
          headers: {
            'Accept': 'application/json',
            ...options.headers,
          },
        });
      }
      
      throw error;
    }
  }
}