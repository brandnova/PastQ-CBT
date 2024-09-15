import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ children, requireSubscription = false }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuthAndSubscription = async () => {
      try {
        await refreshTokenIfNeeded();
        const userData = await fetchUserInfo();
        setIsAuthenticated(true);
        setIsSubscribed(userData.is_subscribed);
        setUser(userData);
      } catch (error) {
        console.error('Error checking auth status:', error);
        localStorage.removeItem('access_token');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndSubscription();
  }, []);

  const refreshTokenIfNeeded = async () => {
    const token = localStorage.getItem('access_token');
    if (!token || isTokenExpired(token)) {
      await refreshAccessToken();
    }
  };

  const isTokenExpired = (token) => {
    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decodedToken.exp < currentTime;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  };

  const refreshAccessToken = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/refresh', {}, {
        withCredentials: true,
      });
      const newAccessToken = response.data.token;
      localStorage.setItem('access_token', newAccessToken);
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw error;
    }
  };

  const fetchUserInfo = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token found');
    }

    try {
      const response = await axios.get('http://localhost:8000/api/user', {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user info:', error);
      if (error.response && error.response.status === 401) {
        // Token might be expired, try refreshing
        await refreshAccessToken();
        // Retry fetching user info with new token
        const newToken = localStorage.getItem('access_token');
        const retryResponse = await axios.get('http://localhost:8000/api/user', {
          headers: { Authorization: `Bearer ${newToken}` },
          withCredentials: true,
        });
        return retryResponse.data;
      }
      throw error;
    }
  };

  if (isLoading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requireSubscription && !isSubscribed) {
    return <Navigate to="/trial" state={{ from: location }} replace />;
  }

  // Pass the user data and a function to update it to the protected component
  return React.cloneElement(children, { user, setUser: (updatedUser) => setUser(updatedUser) });
};

export default ProtectedRoute;