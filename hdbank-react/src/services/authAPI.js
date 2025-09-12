// Authentication API Service for HDBank
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class AuthAPI {
  // Login user
  static async login(username, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Store token in localStorage
        localStorage.setItem('hdbank_token', data.token);
        localStorage.setItem('hdbank_user', JSON.stringify(data.user));
        
        console.log('✅ Login successful:', data.user.username);
        return data;
      } else {
        console.log('❌ Login failed:', data.message);
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  }

  // Logout user
  static async logout() {
    try {
      const token = localStorage.getItem('hdbank_token');
      
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      const data = await response.json();

      // Clear local storage regardless of API response
      localStorage.removeItem('hdbank_token');
      localStorage.removeItem('hdbank_user');

      console.log('✅ Logout successful');
      return data;
    } catch (error) {
      // Clear local storage even if API call fails
      localStorage.removeItem('hdbank_token');
      localStorage.removeItem('hdbank_user');
      
      console.error('Logout API error:', error);
      return { success: true }; // Return success to continue logout
    }
  }

  // Get user profile
  static async getProfile() {
    try {
      const token = localStorage.getItem('hdbank_token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        return data.profile;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Get profile API error:', error);
      throw error;
    }
  }

  // Verify token
  static async verifyToken() {
    try {
      const token = localStorage.getItem('hdbank_token');
      
      if (!token) {
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Verify token API error:', error);
      return false;
    }
  }

  // Get current user from localStorage
  static getCurrentUser() {
    try {
      const userStr = localStorage.getItem('hdbank_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  // Check if user is authenticated
  static isAuthenticated() {
    const token = localStorage.getItem('hdbank_token');
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  // Test API connection
  static async testConnection() {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
      const data = await response.json();
      
      console.log('API Health Check:', data);
      return data.status === 'OK';
    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  }
}

export default AuthAPI;
