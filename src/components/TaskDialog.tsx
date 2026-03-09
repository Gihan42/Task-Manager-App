import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Link as MuiLink,
} from '@mui/material';
import {
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon,
  Download as DownloadIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';

import type { Task, AttachedFile } from '../types';
import { useToast } from '../context/ToastContext';

interface TaskDialogProps {
  open: boolean;
  onClose: () => void;
  task: Task;
  listId: string;
  onSave: (taskId: string, updates: Partial<Task>) => Promise<void>;
  readOnly?: boolean;
  canViewAttachments?: boolean;
}

export const TaskDialog: React.FC<TaskDialogProps> = ({
  open,
  onClose,
  task,
  onSave,
  readOnly = false,
  canViewAttachments = true,
}) => {
  const { success, error: toastError } = useToast();

  const [content, setContent] = useState(task.content);
  const [externalLink, setExternalLink] = useState(task.externalLink || '');
  const [files, setFiles] = useState<AttachedFile[]>(task.files || []);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setContent(task.content);
    setExternalLink(task.externalLink || '');
    setFiles(task.files || []);
  }, [task]);

  const handleSave = async () => {
    try {
      await onSave(task.id, { content, externalLink, files });
      success('Task updated');
      onClose();
    } catch (err) {
      console.error(err);
      toastError('Failed to update task');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      toastError('File too large (max 500KB)');
      return;
    }

    if (fileInputRef.current) fileInputRef.current.value = '';

    setUploading(true);
    setUploadProgress(0);

    const reader = new FileReader();

    reader.onload = (event) => {
      if (event.target?.result) {
        const newFile: AttachedFile = {
          name: file.name,
          url: event.target.result as string,
          type: file.type,
          createdAt: new Date().toISOString(),
        };

        setFiles((prev) => [...prev, newFile]);
        success('File attached');
        setUploading(false);
      }
    };

    reader.onerror = () => {
      toastError('Failed to read file');
      setUploading(false);
    };

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        setUploadProgress((event.loaded / event.total) * 100);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleDeleteFile = (fileToDelete: AttachedFile) => {
    if (!window.confirm(`Delete ${fileToDelete.name}?`)) return;
    setFiles((prev) => prev.filter((f) => f.url !== fileToDelete.url));
    success('File removed');
  };

  const handleOpenLink = () => {
    if (!externalLink) return;
    window.open(
      externalLink.startsWith('http')
        ? externalLink
        : `https://${externalLink}`,
      '_blank'
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: 'rgba(15, 23, 42, 0.55) !important',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
          backgroundImage: 'none !important',
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>Edit Task</Typography>
        <IconButton onClick={onClose} sx={{ color: 'rgba(255,255,255,0.7)' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Description */}
        <div>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', mb: 0.5, display: 'block', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.7rem' }}>
            Description
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={readOnly}
            InputProps={{ sx: { color: 'white', padding: 0 } }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: 2,
                padding: 0,
                margin: 0,
                '& fieldset': { border: 'none' },
              },
              '& .MuiInputBase-inputMultiline': {
                padding: '12px 14px',
              },
            }}
          />
        </div>

        {/* External Link */}
        {canViewAttachments && (
        <TextField
          label="External Link"
          fullWidth
          value={externalLink}
          onChange={(e) => setExternalLink(e.target.value)}
          disabled={readOnly}
          InputLabelProps={{ shrink: true, sx: { color: 'rgba(255,255,255,0.6)' } }}
          InputProps={{
            sx: { color: 'white' },
            startAdornment: (
              <AttachFileIcon sx={{ mr: 1, color: 'rgba(255,255,255,0.5)', fontSize: 20 }} />
            ),
            endAdornment: externalLink && (
              <IconButton onClick={handleOpenLink} size="small" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                <OpenInNewIcon fontSize="small" />
              </IconButton>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: 2,
              '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
              '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
              '&.Mui-focused fieldset': { borderColor: '#1d4ed8', borderWidth: 2 },
            },
          }}
        />
        )}

        {/* Attachments */}
        {canViewAttachments && (
        <div>
          <Typography
            variant="subtitle2"
            sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1, color: 'rgba(255,255,255,0.8)' }}
          >
            <AttachFileIcon fontSize="small" sx={{ color: 'rgba(255,255,255,0.6)' }} />
            Attachments ({files.length})
          </Typography>

          {!readOnly && (
            <>
              <input
                type="file"
                hidden
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <Button
                size="small"
                startIcon={<CloudUploadIcon />}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                variant="outlined"
                sx={{
                  mb: 2,
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.3)',
                  '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.05)' },
                }}
              >
                Upload File
              </Button>
            </>
          )}

          {uploading && (
            <>
              <LinearProgress
                variant="determinate"
                value={uploadProgress}
                sx={{ mb: 1 }}
              />
              <Typography variant="caption">
                Uploading... {Math.round(uploadProgress)}%
              </Typography>
            </>
          )}

          <List dense>
            {files.length === 0 && (
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
                No attachments yet
              </Typography>
            )}

            {files.map((file, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={
                    <MuiLink
                      href={file.url}
                      target="_blank"
                      underline="hover"
                      sx={{ fontWeight: 500, color: 'white' }}
                    >
                      {file.name}
                    </MuiLink>
                  }
                  secondary={
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>
                      {new Date(file.createdAt).toLocaleDateString()}
                    </span>
                  }
                />

                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    href={file.url}
                    target="_blank"
                    sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: 'white' } }}
                  >
                    <DownloadIcon />
                  </IconButton>

                  {!readOnly && (
                    <IconButton
                      edge="end"
                      onClick={() => handleDeleteFile(file)}
                      sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: '#f87171' } }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </div>
        )}
      </DialogContent>

      <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.08)', px: 3, py: 2 }}>
        <Button onClick={onClose} sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }}>Cancel</Button>
        {!readOnly && (
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={uploading}
            sx={{
              backgroundColor: '#1e3a8a',
              '&:hover': { backgroundColor: '#1d4ed8' },
              '&:disabled': { backgroundColor: 'rgba(30, 58, 138, 0.5)' },
            }}
          >
            Save Changes
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};