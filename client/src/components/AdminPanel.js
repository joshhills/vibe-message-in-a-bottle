import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  TextField,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { SKETCHES } from '../components/SketchSelector';

// Import bottle images
import bottle1 from '../assets/bottles/bottle1.png';
import bottle2 from '../assets/bottles/bottle2.png';
import bottle3 from '../assets/bottles/bottle3.png';
import bottle4 from '../assets/bottles/bottle4.png';
import bottle5 from '../assets/bottles/bottle5.png';
import bottle6 from '../assets/bottles/bottle6.png';
import bottle7 from '../assets/bottles/bottle7.png';
import bottle8 from '../assets/bottles/bottle8.png';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3011';

const bottles = [bottle1, bottle2, bottle3, bottle4, bottle5, bottle6, bottle7, bottle8];

function AdminPanel() {
  const navigate = useNavigate();
  const [pendingMessages, setPendingMessages] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [createAdminDialogOpen, setCreateAdminDialogOpen] = useState(false);
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.reload();
  };

  const handleAuthError = () => {
    setError('Your session has expired. Please log in again.');
    setTimeout(() => {
      handleLogout();
    }, 2000);
  };

  const fetchPendingMessages = useCallback(async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/admin/messages/pending`,
        getAuthHeaders()
      );
      setPendingMessages(response.data);
      setError(null); // Clear any existing errors on successful fetch
    } catch (error) {
      console.error('Error details:', error);
      if (error.response?.status === 401) {
        handleAuthError();
      } else {
        setError('Error fetching pending messages');
      }
    }
  }, []);

  const fetchAllMessages = useCallback(async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/admin/messages`,
        getAuthHeaders()
      );
      setAllMessages(response.data);
      setError(null);
    } catch (error) {
      console.error('Error details:', error);
      if (error.response?.status === 401) {
        handleAuthError();
      } else {
        setError('Error fetching all messages');
      }
    }
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/me`, getAuthHeaders());
      setCurrentUser(response.data);
    } catch (err) {
      console.error('Error fetching current user:', err);
      if (err.response?.status === 401) {
        handleAuthError();
      }
    }
  }, []);  // Empty dependency array since getAuthHeaders is stable

  useEffect(() => {
    // Check if we have a token before fetching
    const token = localStorage.getItem('adminToken');
    if (!token) {
      handleLogout();
      return;
    }

    // Initial fetch
    fetchPendingMessages();
    fetchAllMessages();
    fetchCurrentUser();
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchPendingMessages();
      fetchAllMessages();
      fetchCurrentUser();  // Also refresh the current user
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchPendingMessages, fetchAllMessages, fetchCurrentUser]);  // Add fetchCurrentUser to dependencies

  const handleModerate = async (id, status) => {
    try {
      await axios.post(
        `${API_URL}/api/admin/messages/${id}/moderate`,
        { status },
        getAuthHeaders()
      );
      // Remove the message from the list
      setPendingMessages(messages => messages.filter(m => m._id !== id));
      // Refresh all messages
      fetchAllMessages();
      setError(null); // Clear any existing errors on success
    } catch (error) {
      console.error('Error details:', error);
      if (error.response?.status === 401) {
        handleAuthError();
      } else {
        setError('Error moderating message');
      }
    }
  };

  const handleDeleteClick = (message) => {
    setMessageToDelete(message);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(
        `${API_URL}/api/admin/messages/${messageToDelete._id}`,
        getAuthHeaders()
      );
      // Remove the message from both lists
      setPendingMessages(messages => messages.filter(m => m._id !== messageToDelete._id));
      setAllMessages(messages => messages.filter(m => m._id !== messageToDelete._id));
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
    } catch (error) {
      console.error('Error details:', error);
      setError('Error deleting message');
    }
  };

  const handleReject = async (messageId) => {
    try {
      await axios.delete(
        `${API_URL}/api/admin/messages/${messageId}`,
        getAuthHeaders()
      );
      // Refresh both tables after deletion
      fetchPendingMessages();
      fetchAllMessages();
      setError(null); // Clear any existing errors on success
    } catch (error) {
      console.error('Error rejecting message:', error);
      if (error.response?.status === 401) {
        handleAuthError();
      } else {
        setError('Failed to reject message');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const handleCreateAdmin = async () => {
    try {
      await axios.post(`${API_URL}/api/auth/create-admin`, 
        { username: newAdminUsername, password: newAdminPassword },
        getAuthHeaders()
      );
      setCreateAdminDialogOpen(false);
      setNewAdminUsername('');
      setNewAdminPassword('');
      setSuccess('Admin user created successfully');
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating admin user');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">Admin Panel</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          {currentUser && (
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Logged in as: {currentUser.username}
            </Typography>
          )}
          <Button variant="contained" color="primary" onClick={() => setCreateAdminDialogOpen(true)}>
            Create Admin User
          </Button>
          <Button variant="outlined" color="error" onClick={handleLogout}>
            Logout
          </Button>
        </Stack>
      </Stack>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Success Message */}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Pending Messages Section */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Pending Messages ({pendingMessages.length})
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Author</TableCell>
                <TableCell>Content</TableCell>
                <TableCell>Bottle</TableCell>
                <TableCell>Sketch</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingMessages.map((message) => (
                <TableRow key={message._id}>
                  <TableCell>{formatDate(message.createdAt)}</TableCell>
                  <TableCell>{message.author || 'Anonymous'}</TableCell>
                  <TableCell>{message.content}</TableCell>
                  <TableCell>
                    <img
                      src={bottles[message.bottleStyle - 1]}
                      alt={`Bottle ${message.bottleStyle}`}
                      style={{ width: '30px', height: '60px' }}
                    />
                  </TableCell>
                  <TableCell>
                    {message.sketch !== undefined && message.sketch !== 0 && SKETCHES[message.sketch]?.icon && (
                      <img
                        src={SKETCHES[message.sketch].icon}
                        alt="Sketch"
                        style={{ height: '50px' }}
                      />
                    )}
                  </TableCell>
                  <TableCell>Pending</TableCell>
                  <TableCell>
                    {message.location ? (
                      <a
                        href={`https://www.google.com/maps?q=${message.location.latitude},${message.location.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#3498db', textDecoration: 'none' }}
                      >
                        {message.location.city}, {message.location.country}
                      </a>
                    ) : message.ipAddress ? (
                      <Typography variant="body2" color="text.secondary">
                        Location unavailable
                      </Typography>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => handleModerate(message._id, 'approved')}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => handleReject(message._id)}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* All Messages Section */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          All Messages ({allMessages.length})
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Author</TableCell>
                <TableCell>Content</TableCell>
                <TableCell>Bottle</TableCell>
                <TableCell>Sketch</TableCell>
                <TableCell>Views</TableCell>
                <TableCell>Approver</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allMessages.map((message) => (
                <TableRow key={message._id}>
                  <TableCell>{formatDate(message.createdAt)}</TableCell>
                  <TableCell>{message.author || 'Anonymous'}</TableCell>
                  <TableCell>{message.content}</TableCell>
                  <TableCell>
                    <img
                      src={bottles[message.bottleStyle - 1]}
                      alt={`Bottle ${message.bottleStyle}`}
                      style={{ width: '30px', height: '60px' }}
                    />
                  </TableCell>
                  <TableCell>
                    {message.sketch !== undefined && message.sketch !== 0 && SKETCHES[message.sketch]?.icon && (
                      <img
                        src={SKETCHES[message.sketch].icon}
                        alt="Sketch"
                        style={{ height: '50px' }}
                      />
                    )}
                  </TableCell>
                  <TableCell>{message.readBy?.length || 0}</TableCell>
                  <TableCell>{message.approvedBy || '-'}</TableCell>
                  <TableCell>
                    {message.location ? (
                      <a
                        href={`https://www.google.com/maps?q=${message.location.latitude},${message.location.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#3498db', textDecoration: 'none' }}
                      >
                        {message.location.city}, {message.location.country}
                      </a>
                    ) : message.ipAddress ? (
                      <Typography variant="body2" color="text.secondary">
                        Location unavailable
                      </Typography>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={() => handleReject(message._id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Message</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this message? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={createAdminDialogOpen} onClose={() => setCreateAdminDialogOpen(false)}>
        <DialogTitle>Create New Admin User</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Username"
            fullWidth
            value={newAdminUsername}
            onChange={(e) => setNewAdminUsername(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            value={newAdminPassword}
            onChange={(e) => setNewAdminPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateAdminDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateAdmin} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminPanel; 