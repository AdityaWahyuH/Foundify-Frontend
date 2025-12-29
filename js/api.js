class ApiService {
    constructor() {
        this.baseURL = 'http://localhost:8000/api';
        this.token = localStorage.getItem('token');
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...(this.token && { 'Authorization': `Bearer ${this.token}` })
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }
            return data;
        } catch (error) {
            showToast(error.message, 'error');
            throw error;
        }
    }

    // Authentication
    async login(credentials) {
        return this.request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
    }

    async register(data) {
        return this.request('/auth/register', { method: 'POST', body: JSON.stringify(data) });
    }

    async adminLogin(credentials) {
        return this.request('/auth/admin/login', { method: 'POST', body: JSON.stringify(credentials) });
    }

    async me() {
        return this.request('/auth/me');
    }

    async adminMe() {
        return this.request('/auth/admin/me');
    }

    async logout() {
        return this.request('/auth/logout', { method: 'POST' });
    }

    // Barang Hilang
    async getBarangHilang(page = 1) {
        return this.request(`/barang-hilang?page=${page}`);
    }

    async createBarangHilang(data) {
        const formData = new FormData();
        for (let key in data) {
            formData.append(key, data[key]);
        }
        return fetch(`${this.baseURL}/barang-hilang`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${this.token}` },
            body: formData
        }).then(res => res.json());
    }

    // Barang Ditemukan
    async getBarangDitemukan(page = 1) {
        return this.request(`/barang-ditemukan?page=${page}`);
    }

    // Klaim
    async getKlaim() {
        return this.request('/klaim');
    }

    async createKlaim(data, barangId) {
        return this.request(`/klaim/${barangId}`, { method: 'POST', body: JSON.stringify(data) });
    }

    // Poin
    async getPoin() {
        return this.request('/poin');
    }

    // Katalog Reward
    async getKatalogReward() {
        return this.request('/katalog-reward');
    }
}

const api = new ApiService();
