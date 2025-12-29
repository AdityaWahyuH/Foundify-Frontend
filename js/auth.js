class AuthManager {
    static async userLogin(email, password) {
        try {
            const response = await api.login({ email, password });
            api.setToken(response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            showToast('Login berhasil!');
            window.location.href = 'pages/dashboard.html';
        } catch (error) {
            console.error('Login failed:', error);
        }
    }

    static async adminLogin(email, password) {
        try {
            const response = await api.adminLogin({ email, password });
            api.setToken(response.token);
            localStorage.setItem('admin', JSON.stringify(response.admin));
            showToast('Admin login berhasil!');
            window.location.href = 'pages/admin-dashboard.html';
        } catch (error) {
            console.error('Admin login failed:', error);
        }
    }

    static async register(data) {
        try {
            await api.register(data);
            showToast('Registrasi berhasil! Silakan login.');
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Register failed:', error);
        }
    }

    static logout() {
        localStorage.clear();
        window.location.href = '../index.html';
    }

    static isAuthenticated() {
        return !!localStorage.getItem('token');
    }

    static isAdmin() {
        return !!localStorage.getItem('admin');
    }

    static getUserRole() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user).role : null;
    }
}
