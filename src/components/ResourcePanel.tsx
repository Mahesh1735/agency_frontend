import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  IconButton,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon, Link as LinkIcon, Upload as UploadIcon, InsertLink as InsertLinkIcon } from '@mui/icons-material';
import { getUserResources, createResource, updateResourceLastUsed, Resource } from '../services/resourceService';
import { useAuth } from '../contexts/AuthContext';
import { uploadFileToS3 } from '../services/s3Service';

interface ResourcePanelProps {
  onResourceSelect: (title: string, url: string) => void;
  autoInsertLatest?: boolean;
}

export const ResourcePanel: React.FC<ResourcePanelProps> = ({ 
  onResourceSelect, 
  autoInsertLatest = false 
}) => {
  const { currentUser } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [newResource, setNewResource] = useState({ title: '', url: '' });
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    loadResources();
  }, [currentUser?.uid]);

  useEffect(() => {
    console.log('User state:', currentUser);
    console.log('Loading state:', loading);
  }, [currentUser, loading]);

  useEffect(() => {
    console.log('Current user object:', {
      user: currentUser,
      uid: currentUser?.uid,
      email: currentUser?.email,
      isAuthenticated: !!currentUser
    });
  }, [currentUser]);

  const loadResources = async () => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }
    
    try {
      console.log('Fetching resources for user:', currentUser.uid);
      const userResources = await getUserResources(currentUser.uid);
      setResources(userResources);
    } catch (error) {
      console.error('Error loading resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUrlChange = async (url: string) => {
    setNewResource(prev => ({ ...prev, url }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const fileUrl = await uploadFileToS3(file);
      setNewResource({
        title: file.name,
        url: fileUrl
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentUser?.uid) {
      console.error('No valid user ID found:', { user: currentUser });
      alert('Authentication error. Please try logging out and back in.');
      return;
    }

    if (!newResource.title || !newResource.url) {
      console.log('Missing resource fields:', { 
        title: newResource.title, 
        url: newResource.url 
      });
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      const resource = await createResource(
        currentUser.uid,
        newResource.title,
        newResource.url,
        newResource.url.includes('s3.amazonaws.com') ? 'file' : 'link'
      );

      setResources(prev => [resource, ...prev]);
      setOpenDialog(false);
      setNewResource({ title: '', url: '' });

      // Auto-insert if initiated from paperclip
      if (autoInsertLatest) {
        onResourceSelect(resource.title, resource.url);
      }

    } catch (error) {
      console.error('Error creating resource:', error);
      alert('Failed to create resource. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResourceClick = async (resource: Resource) => {
    try {
      await updateResourceLastUsed(resource.id);
      onResourceSelect(resource.title, resource.url);
    } catch (error) {
      console.error('Error updating resource last used:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        height: '100%', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        bgcolor: '#0A0A0F'
      }}>
        <CircularProgress sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: '#0A0A0F',
      borderRight: 1,
      borderColor: 'rgba(55, 65, 81, 0.5)',
      position: 'relative'
    }}>
      <Typography 
        variant="h6" 
        sx={{ 
          p: 2.5,
          borderBottom: 1, 
          borderColor: 'rgba(55, 65, 81, 0.5)',
          color: 'white',
          fontSize: '1rem',
          fontWeight: 600,
          letterSpacing: '0.025em'
        }}
      >
        Resources
      </Typography>
      
      <List 
        className="flex-1 overflow-auto px-3 py-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-800/20 [&::-webkit-scrollbar-thumb]:bg-gray-700 hover:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full"
        sx={{
          flex: 1,
          overflow: 'auto',
          px: 3,
          py: 2,
        }}
      >
        {resources.map((resource) => (
          <ListItem
            key={resource.id}
            sx={{
              mb: 1.5,
              bgcolor: 'rgba(31, 41, 55, 0.4)',
              borderRadius: 2,
              border: 1,
              borderColor: 'rgba(55, 65, 81, 0.2)',
              '&:hover': {
                bgcolor: 'rgba(31, 41, 55, 0.6)',
                transform: 'translateY(-1px)',
                transition: 'all 0.2s ease-in-out',
              },
              transition: 'all 0.2s ease-in-out',
            }}
            secondaryAction={
              <IconButton 
                edge="end" 
                onClick={() => handleResourceClick(resource)}
                sx={{ 
                  color: 'primary.main',
                  '&:hover': { 
                    color: 'primary.light',
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <AddIcon />
              </IconButton>
            }
          >
            <ListItemText 
              primary={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {resource.title}
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(resource.url, '_blank');
                    }}
                    sx={{ 
                      color: 'rgba(156, 163, 175, 1)',
                      padding: '4px',
                      '&:hover': { 
                        color: 'primary.light',
                      },
                    }}
                  >
                    <LinkIcon fontSize="small" />
                  </IconButton>
                </div>
              }
              secondary={new Date(resource.lastUsed).toLocaleDateString()}
              sx={{
                '& .MuiListItemText-primary': {
                  color: 'white',
                  fontWeight: 500
                },
                '& .MuiListItemText-secondary': {
                  color: 'rgba(156, 163, 175, 1)'
                }
              }}
            />
          </ListItem>
        ))}
      </List>

      <Box sx={{ p: 3, borderTop: 1, borderColor: 'rgba(55, 65, 81, 0.5)' }}>
        <Button
          data-testid="add-resource-button"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          fullWidth
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            py: 1.5,
            borderRadius: 2,
            '&:hover': {
              bgcolor: 'primary.dark',
              transform: 'translateY(-1px)',
            },
            textTransform: 'none',
            fontSize: '0.875rem',
            fontWeight: 500,
            letterSpacing: '0.025em',
            transition: 'all 0.2s ease-in-out',
          }}
          variant="contained"
        >
          Add Resource
        </Button>
      </Box>

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#1F2937',
            color: 'white',
            borderRadius: 3,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }
        }}
      >
        <DialogTitle sx={{ 
          p: 3,
          borderBottom: 1, 
          borderColor: 'rgba(55, 65, 81, 0.5)',
          fontSize: '1rem',
          fontWeight: 600,
          letterSpacing: '0.025em'
        }}>
          Add New Resource
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <TextField
              label="URL"
              value={newResource.url}
              onChange={(e) => handleUrlChange(e.target.value)}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  borderRadius: 2,
                  fontSize: '0.875rem',
                  '& fieldset': {
                    borderColor: 'rgba(55, 65, 81, 0.5)',
                    borderWidth: '2px',
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(156, 163, 175, 1)',
                  fontSize: '0.875rem',
                },
              }}
            />
            <TextField
              label="Title"
              value={newResource.title}
              onChange={(e) => setNewResource(prev => ({ ...prev, title: e.target.value }))}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: 'rgba(55, 65, 81, 0.5)',
                    borderWidth: '2px',
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(156, 163, 175, 1)',
                },
              }}
            />
            <Button
              component="label"
              startIcon={<UploadIcon />}
              disabled={uploadingFile}
              sx={{
                color: 'white',
                bgcolor: 'rgba(31, 41, 55, 0.4)',
                borderRadius: 2,
                py: 1.5,
                '&:hover': {
                  bgcolor: 'rgba(31, 41, 55, 0.6)',
                  transform: 'translateY(-1px)',
                },
                textTransform: 'none',
                transition: 'all 0.2s ease-in-out',
              }}
            >
              Upload File
              <input
                type="file"
                hidden
                onChange={handleFileUpload}
              />
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: 1, borderColor: 'rgba(55, 65, 81, 0.5)', gap: 1 }}>
          <Button 
            onClick={() => setOpenDialog(false)}
            sx={{ 
              color: 'rgba(156, 163, 175, 1)',
              '&:hover': { 
                color: 'white',
                transform: 'translateY(-1px)',
              },
              textTransform: 'none',
              transition: 'all 0.2s ease-in-out',
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!newResource.title || !newResource.url || loading}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              px: 3,
              py: 1,
              borderRadius: 2,
              '&:hover': {
                bgcolor: 'primary.dark',
                transform: 'translateY(-1px)',
              },
              textTransform: 'none',
              transition: 'all 0.2s ease-in-out',
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              'Add Resource'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 