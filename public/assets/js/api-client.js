class ApiClient {
    constructor(baseUrl = '') {
        this.baseUrl = baseUrl || window.location.origin;
        this.accessToken = localStorage.getItem('access_token');
    }

    async request(method, endpoint, data = null) {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (this.accessToken) {
            headers['Authorization'] = `Bearer ${this.accessToken}`;
        }

        const options = {
            method,
            headers,
        };

        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, options);

        if (response.status === 401) {
            // Try to refresh token
            const refreshed = await this.refreshToken();
            if (refreshed) {
                headers['Authorization'] = `Bearer ${this.accessToken}`;
                const retryResponse = await fetch(`${this.baseUrl}${endpoint}`, options);
                return this.handleResponse(retryResponse);
            }
        }

        return this.handleResponse(response);
    }

    async handleResponse(response) {
        const contentType = response.headers.get('content-type');
        const isJson = contentType && contentType.includes('application/json');
        const data = isJson ? await response.json() : await response.text();

        if (!response.ok) {
            throw new Error(data.error || data.message || 'Request failed');
        }

        return data;
    }

    async refreshToken() {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) return false;

        try {
            const response = await fetch(`${this.baseUrl}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: refreshToken }),
            });

            if (response.ok) {
                const data = await response.json();
                this.accessToken = data.access_token;
                localStorage.setItem('access_token', data.access_token);
                if (data.refresh_token) {
                    localStorage.setItem('refresh_token', data.refresh_token);
                }
                return true;
            }
        } catch (e) {
            console.error('Token refresh failed:', e);
        }

        return false;
    }

    get(endpoint, params) {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return this.request('GET', endpoint + query);
    }

    post(endpoint, data) {
        return this.request('POST', endpoint, data);
    }

    put(endpoint, data) {
        return this.request('PUT', endpoint, data);
    }

    delete(endpoint) {
        return this.request('DELETE', endpoint);
    }
}

const api = new ApiClient();

// User authentication helpers
const Auth = {
    isLoggedIn() {
        return !!localStorage.getItem('access_token');
    },

    getUser() {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    },

    setUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
    },

    logout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
    }
};

// Media library helpers
const Library = {
    async getItems(params = {}) {
        return api.get('/api/library', params);
    },

    async getItem(id) {
        return api.get(`/api/library/item/${id}`);
    },

    async getContinueWatching() {
        return api.get('/api/library/continue-watching');
    },

    async getRecentlyAdded() {
        return api.get('/api/library/recently-added');
    },

    async search(query) {
        return api.get('/api/library/search', { q: query });
    },

    async getItemDetails(id) {
        return api.get(`/api/library/item/${id}/details`);
    }
};

// Playback helpers
const Player = {
    async getPlaybackInfo(itemId) {
        return api.get(`/api/player/${itemId}/playback-info`);
    },

    async reportProgress(itemId, position, duration) {
        return api.post(`/api/player/${itemId}/progress`, {
            position,
            duration
        });
    },

    async markWatched(itemId) {
        return api.post(`/api/player/${itemId}/watched`);
    }
};

// Export for use in other scripts
window.api = api;
window.Auth = Auth;
window.Library = Library;
window.Player = Player;
