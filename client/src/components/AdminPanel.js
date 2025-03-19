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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

// Import bottle images
import bottle1 from '../assets/bottles/bottle1.svg';
import bottle2 from '../assets/bottles/bottle2.svg';
import bottle3 from '../assets/bottles/bottle3.svg';
import bottle4 from '../assets/bottles/bottle4.svg';
import bottle5 from '../assets/bottles/bottle5.svg';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const bottles = [bottle1, bottle2, bottle3, bottle4, bottle5];

function AdminPanel() {
  const navigate = useNavigate();
  const [pendingMessages, setPendingMessages] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);

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

  useEffect(() => {
    // Check if we have a token before fetching
    const token = localStorage.getItem('adminToken');
    if (!token) {
      handleLogout();
      return;
    }

    fetchPendingMessages();
    fetchAllMessages();
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchPendingMessages();
      fetchAllMessages();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchPendingMessages, fetchAllMessages]);

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

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Admin Panel
        </Typography>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
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
                <TableCell>Status</TableCell>
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
                  <TableCell>Pending</TableCell>
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
                <TableCell>Views</TableCell>
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
                  <TableCell>{message.readBy?.length || 0}</TableCell>
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
    </Box>
  );
}

export default AdminPanel; 