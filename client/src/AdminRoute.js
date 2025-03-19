import React, { useState, useEffect } from 'react';
import AdminLogin from './components/AdminLogin';

function AdminRoute({ children }) {
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verify token on mount
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Make a request to a protected endpoint to verify the token
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/messages/pending`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          // Token is invalid
          localStorage.removeItem('adminToken');
          setToken(null);
        }
      } catch (error) {
        localStorage.removeItem('adminToken');
        setToken(null);
      }

      setLoading(false);
    };

    verifyToken();
  }, [token]);

  const handleLogin = (newToken) => {
    setToken(newToken);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!token) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return children;
}

export default AdminRoute; 