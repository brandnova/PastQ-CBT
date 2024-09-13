import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ children, requireSubscription = false }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuthAndSubscription = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:8000/api/user', {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setIsAuthenticated(true);
        setIsSubscribed(response.data.is_subscribed);
      } catch (error) {
        console.error('Error checking auth status:', error);
        localStorage.removeItem('access_token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndSubscription();
  }, []);

  if (isLoading) {
    return <div className="text-center mt-10">Loading...</div>; // Or any loading indicator
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requireSubscription && !isSubscribed) {
    return <Navigate to="/trial" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
