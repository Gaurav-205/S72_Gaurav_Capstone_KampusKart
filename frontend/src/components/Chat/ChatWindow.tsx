import React, { ComponentType, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { io, Socket } from 'socket.io-client';
import { format } from 'date-fns';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  CircularProgress,
  Menu,
  MenuItem,
  Tooltip,
  Button,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ReplyIcon from '@mui/icons-material/Reply';
import { API_BASE, SOCKET_URL } from '../../config';
import { ChatSkeleton } from '../common/SkeletonLoader';

// Chat Color Theme Configuration
// Using the same color scheme as buttons and other feature components
const CHAT_THEME = {
  primary: '#181818',        // Dark gray/black - matches button default bg
  primaryHover: '#00C6A7',   // Teal - matches button hover state
  primaryDark: '#009e87',    // Darker teal
  background: '#ffffff',     // White background
  cardBg: '#f9fafb',        // Light gray for cards
  border: '#e5e7eb',        // Border color
  textPrimary: '#1f2937',   // Primary text
  textSecondary: '#6b7280', // Secondary text
  textMuted: '#9ca3af',     // Muted text
};

interface ChatUser {
  _id?: string;
  id?: string;
  name?: string;
  profilePicture?: string | { url?: string };
}

interface ChatAttachment {
  type?: string;
  url: string;
  name: string;
}

interface ChatReaction {
  emoji?: string;
  user?: ChatUser;
}

interface ChatReadEntry {
  user?: ChatUser;
}

interface ChatMessage {
  _id: string;
  message: string;
  sender?: ChatUser;
  timestamp?: string;
  edited?: boolean;
  attachments?: ChatAttachment[];
  reactions?: ChatReaction[];
  readBy?: ChatReadEntry[];
  replyTo?: ChatMessage;
}

interface PaginatedChatResponse {
  messages: ChatMessage[];
  pagination?: {
    page: number;
    pages: number;
  };
}

interface ServerToClientEvents {
  'previous-messages': (data: ChatMessage[] | PaginatedChatResponse) => void;
  connect_error: () => void;
  disconnect: (reason: string) => void;
  connect: () => void;
  'new-message': (message: ChatMessage) => void;
  'online-users': (users: ChatUser[]) => void;
  'user-typing': (userData: ChatUser) => void;
  'user-stop-typing': (userData: ChatUser) => void;
  'message-updated': (updatedMessage: ChatMessage) => void;
  'message-deleted': (data: { _id: string }) => void;
}

interface ClientToServerEvents {
  join: (data: { _id?: string; name?: string; profilePicture?: string | { url?: string } }) => void;
  typing: (data: { _id?: string; name?: string }) => void;
  'stop-typing': (data: { _id?: string; name?: string }) => void;
}

interface EmojiSelectData {
  native?: string;
}

const ChatWindow = () => {
  // Helper to get auth token from either storage (sessionStorage used when remember=false)
  const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');

  // iOS keyboard overlap fix: replaced visualViewport listener with 100svh on parent container

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<ChatUser[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerDirection, setEmojiPickerDirection] = useState<'up' | 'down'>('up');
  const [emojiPickerComponent, setEmojiPickerComponent] = useState<ComponentType<Record<string, unknown>> | null>(null);
  const [emojiData, setEmojiData] = useState<Record<string, unknown> | null>(null);
  const [isEmojiLoading, setIsEmojiLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const [editText, setEditText] = useState('');
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [sendingMessage, setSendingMessage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { user } = useAuth();
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null); // Separate ref for load-more trigger (top of list)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);
  const emojiToggleButtonRef = useRef<HTMLButtonElement | null>(null);

  const canSendMessage = newMessage.trim().length > 0 || attachments.length > 0;

  const markMessageAsRead = useCallback(async (messageId: string) => {
    try {
      await fetch(`${API_BASE}/api/chat/messages/${messageId}/read`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
    } catch {
      // Error marking message as read
    }
  }, []);

  useEffect(() => {
    const token = getToken();
    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
      auth: {
        token,
      },
    });

    // Join chat when component mounts
    if (user) {
      socketRef.current.emit('join', {
        _id: user._id,
        name: user.name,
        profilePicture: user.profilePicture,
      });
    }

    // Listen for previous messages
    socketRef.current.on('previous-messages', (data: ChatMessage[] | PaginatedChatResponse) => {
      // Support both array and object formats
      if (Array.isArray(data)) {
        setMessages(data);
        setHasMore(false); // No pagination info from socket
      } else if (data && data.messages) {
        setMessages(data.messages);
        if (data.pagination) {
          setHasMore(data.pagination.page < data.pagination.pages);
        }
      }
      setLoading(false);
      setError(null);
    });

    // Handle connection errors
    socketRef.current.on('connect_error', () => {
      setError('Failed to connect to chat server');
      setLoading(false);
    });

    socketRef.current.on('disconnect', (reason: string) => {
      if (reason === 'io server disconnect') {
        setError('Connection lost. Please refresh the page.');
      }
    });

    socketRef.current.on('connect', () => {
      setError(null);
    });

    // Listen for new messages
    socketRef.current.on('new-message', (message: ChatMessage) => {
      if (message) {
        setMessages((prev: ChatMessage[]) => {
          // Check if message already exists to prevent duplicates
          const messageExists = prev.some(msg => msg._id === message._id);
          if (messageExists) {
            return prev;
          }
          return [...prev, message];
        });
        markMessageAsRead(message._id);
      }
    });

    // Listen for online users
    socketRef.current.on('online-users', (users: ChatUser[]) => {
      if (Array.isArray(users)) {
        setOnlineUsers(users);
      }
    });

    // Listen for typing indicators
    socketRef.current.on('user-typing', (userData: ChatUser) => {
      if (userData && user && (userData._id !== user._id && userData.id !== user.id)) {
        setIsTyping(true);
      }
    });

    socketRef.current.on('user-stop-typing', (userData: ChatUser) => {
      if (userData && user && (userData._id !== user._id && userData.id !== user.id)) {
        setIsTyping(false);
      }
    });

    // Listen for message updates (edits, reactions, etc.)
    socketRef.current.on('message-updated', (updatedMessage: ChatMessage) => {
      if (updatedMessage) {
        setMessages((prev: ChatMessage[]) =>
          prev.map((msg: ChatMessage) =>
            msg._id === updatedMessage._id ? updatedMessage : msg
          )
        );
      }
    });

    // Listen for message-deleted
    socketRef.current.on('message-deleted', (data: { _id: string }) => {
      if (data && data._id) {
        setMessages((prev: ChatMessage[]) => prev.filter((msg: ChatMessage) => msg._id !== data._id));
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [user, markMessageAsRead]);

  // Load emoji picker dependencies only when needed.
  useEffect(() => {
    let mounted = true;

    const loadEmojiAssets = async () => {
      if (!showEmojiPicker || (emojiPickerComponent && emojiData) || isEmojiLoading) return;

      try {
        setIsEmojiLoading(true);
        const [pickerModule, dataModule] = await Promise.all([
          import('@emoji-mart/react'),
          import('@emoji-mart/data'),
        ]);

        if (!mounted) return;
        setEmojiPickerComponent(() => pickerModule.default);
        setEmojiData(dataModule.default);
      } catch {
        // Ignore lazy-load errors; chat remains usable without emoji picker.
      } finally {
        if (mounted) setIsEmojiLoading(false);
      }
    };

    loadEmojiAssets();

    return () => {
      mounted = false;
    };
  }, [showEmojiPicker, emojiPickerComponent, emojiData, isEmojiLoading]);

  useEffect(() => {
    if (!showEmojiPicker) return;

    // Boundary-aware placement so picker stays visible on short viewports.
    const toggleRect = emojiToggleButtonRef.current?.getBoundingClientRect();
    if (toggleRect) {
      const estimatedPickerHeight = 360;
      const spaceAbove = toggleRect.top;
      const spaceBelow = window.innerHeight - toggleRect.bottom;
      setEmojiPickerDirection(spaceAbove >= estimatedPickerHeight || spaceAbove > spaceBelow ? 'up' : 'down');
    }

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target;
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(target) &&
        emojiToggleButtonRef.current &&
        !emojiToggleButtonRef.current.contains(target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showEmojiPicker]);

  // Load more messages when scrolling up
  const loadMoreMessages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE}/api/chat/messages?page=${page + 1}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error('Failed to load more messages');
      }
      const data = await response.json();
      if (data && data.messages && Array.isArray(data.messages)) {
        setMessages((prev) => [...data.messages, ...prev]);
        setPage((prev) => prev + 1);
        if (data.pagination) {
          setHasMore(data.pagination.page < data.pagination.pages);
        }
      }
    } catch {
      // Error loading more messages
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 1.0,
    };

    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && !loading) {
        loadMoreMessages();
      }
    };

    observerRef.current = new IntersectionObserver(handleObserver, options);

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, loadMoreMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' && attachments.length === 0) return;
    if (sendingMessage) return; // Prevent multiple submissions

    setSendingMessage(true);
    const messageText = newMessage.trim();
    const currentAttachments = [...attachments];
    
    // Clear form immediately
    setNewMessage('');
    setAttachments([]);
    setReplyTo(null);
    setShowEmojiPicker(false);

    const formData = new FormData();
    formData.append('message', messageText);
    if (replyTo) {
      formData.append('replyTo', replyTo._id);
    }
    currentAttachments.forEach((file) => {
      formData.append('attachments', file);
    });

    try {
      const response = await fetch(`${API_BASE}/api/chat/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body: formData,
      });

      if (!response.ok) {
        // Restore the message if sending failed
        setNewMessage(messageText);
        setAttachments(currentAttachments);
        throw new Error('Failed to send message');
      }
    } catch {
      // Restore the message if sending failed
      setNewMessage(messageText);
      setAttachments(currentAttachments);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setAttachments((prev: File[]) => [...prev, ...files]);
  };

  const handleTyping = () => {
    if (!socketRef.current || !user) return;
    
    socketRef.current.emit('typing', {
      _id: user._id,
      name: user.name,
    });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current && user) {
        socketRef.current.emit('stop-typing', {
          _id: user._id,
          name: user.name,
        });
      }
    }, 1000);
  };

  const handleMessageActions = (message: ChatMessage, event: React.MouseEvent<HTMLElement>) => {
    setSelectedMessage(message);
    setAnchorEl(event.currentTarget); // Use the button as anchor
  };

  const handleDeleteMessage = async () => {
    if (!selectedMessage) return;
    try {
      const response = await fetch(`${API_BASE}/api/chat/messages/${selectedMessage._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      if (response.ok) {
        setMessages((prev: ChatMessage[]) =>
          prev.filter((msg: ChatMessage) => msg._id !== selectedMessage._id)
        );
      } else {
        throw new Error('Failed to delete message');
      }
    } catch {
      // Error deleting message
    } finally {
      setAnchorEl(null);
      setSelectedMessage(null);
    }
  };

  const handleEditMessage = async () => {
    if (!selectedMessage || !editText.trim() || !user) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/chat/messages/${selectedMessage._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ message: editText.trim() }),
      });
      
      if (response.ok) {
        const updatedMessage = await response.json();
        if (updatedMessage) {
          setMessages((prev: ChatMessage[]) =>
            prev.map((msg: ChatMessage) =>
              msg._id === selectedMessage._id ? { ...msg, ...updatedMessage } : msg
            )
          );
        }
      } else {
        // Failed to edit message
      }
    } catch {
      // Error editing message
    }
    setEditingMessage(null);
    setEditText('');
    setAnchorEl(null);
    setSelectedMessage(null);
  };

  const startEditing = (message: ChatMessage) => {
    setEditingMessage(message);
    setEditText(message.message);
    setAnchorEl(null);
  };

  // Scroll to bottom only when a new message is added (not when loading older messages)
  const prevMessageCountRef = useRef(0);
  useEffect(() => {
    const prev = prevMessageCountRef.current;
    const curr = messages.length;
    // Only scroll if messages were appended (new message), not prepended (load more)
    if (curr > prev && messages[curr - 1] !== messages[prev - 1]) {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
    prevMessageCountRef.current = curr;
  }, [messages]);

  // Fix logo import for Avatar
  const logoUrl = '/Logo.webp';

  // Clean, minimal chat header
  const ChatHeader = () => (
    <Box
      sx={{
        px: { xs: 2, sm: 3 },
        py: { xs: 2, sm: 2.5 },
        mb: 0,
        background: CHAT_THEME.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'none',
        borderBottom: `2px solid ${CHAT_THEME.border}`,
      }}
    >
      <Box display="flex" alignItems="center" gap={{ xs: 1.5, sm: 2 }}>
        <Box
          sx={{
            width: { xs: 44, sm: 48 },
            height: { xs: 44, sm: 48 },
            borderRadius: '12px',
            background: CHAT_THEME.cardBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `2px solid ${CHAT_THEME.border}`,
          }}
        >
          <Avatar
            src={logoUrl}
            sx={{ 
              width: { xs: 36, sm: 40 }, 
              height: { xs: 36, sm: 40 },
              border: 'none',
            }}
          />
        </Box>
        <Box>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 800,
              color: CHAT_THEME.textPrimary,
              fontSize: { xs: '1rem', sm: '1.25rem' },
              letterSpacing: '-0.02em',
              mb: 0.25,
            }}
          >
            KampusKart Chat
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#10b981',
              }}
            />
            <Typography 
              variant="caption" 
              sx={{ 
                color: CHAT_THEME.textSecondary,
                fontWeight: 500,
                fontSize: '0.75rem',
              }}
            >
              {(() => {
                const currentUserId = user?._id || user?.id;
                const othersOnlineCount = onlineUsers.filter((onlineUser) => {
                  const onlineUserId = onlineUser._id || onlineUser.id;
                  return !!onlineUserId && onlineUserId !== currentUserId;
                }).length;
                if (othersOnlineCount === 0) return 'Just you online';
                return `${othersOnlineCount} ${othersOnlineCount === 1 ? 'person' : 'people'} online`;
              })()}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  // Enhanced message bubble
  const renderMessage = (message: ChatMessage) => {
    if (!message) return null;
    if (!message.sender) return null;
    if (!user) return null;
    // Safely check sender ID
    const senderId = message.sender?._id || message.sender?.id;
    const userId = user?._id || user?.id;
    if (!senderId || !userId) return null;
    const isOwnMessage = senderId === userId;
    const hasReactions = message.reactions && Array.isArray(message.reactions) && message.reactions.length > 0;
    const isRead = message.readBy && Array.isArray(message.readBy) && message.readBy.some((r: ChatReadEntry) => r?.user?._id === userId || r?.user?.id === userId);
    return (
      <ListItem
        key={message._id}
        alignItems="flex-start"
        sx={{
          flexDirection: isOwnMessage ? 'row-reverse' : 'row',
          position: 'relative',
          mb: 1.5,
        }}
        disableGutters
      >
        <ListItemAvatar sx={{ minWidth: 48 }}>
          <Avatar
            src={
              typeof message.sender.profilePicture === 'string'
                ? message.sender.profilePicture
                : message.sender.profilePicture?.url
            }
            alt={message.sender.name}
            sx={{ 
              border: `2px solid ${CHAT_THEME.border}`,
              width: { xs: 40, sm: 44 },
              height: { xs: 40, sm: 44 },
            }}
          />
        </ListItemAvatar>
        <Box 
          sx={{
            bgcolor: isOwnMessage ? '#f0fdf4' : CHAT_THEME.background,
            border: `2px solid ${CHAT_THEME.border}`,
            borderRadius: '12px',
            p: { xs: 1.5, sm: 1.75 },
            pr: isOwnMessage ? '44px' : undefined,
            minWidth: 120,
            maxWidth: { xs: '80%', sm: 420 },
            ml: isOwnMessage ? 0 : { xs: 0.5, sm: 1 },
            mr: isOwnMessage ? { xs: 0.5, sm: 1 } : 0,
            position: 'relative',
          }}
        >
          {message.replyTo && (
            <Box 
              sx={{ 
                mb: 1.5, 
                p: 1, 
                bgcolor: isOwnMessage ? 'rgba(0, 198, 167, 0.08)' : 'rgba(0, 0, 0, 0.04)', 
                borderRadius: '8px', 
                borderLeft: `4px solid ${CHAT_THEME.primary}`,
                display: 'block'
              }}
            >
              <Typography variant="caption" sx={{ color: CHAT_THEME.primary, fontWeight: 700, display: 'block', mb: 0.25, fontSize: '0.75rem' }}>
                {message.replyTo.sender?.name || 'User'}
              </Typography>
              <Typography variant="body2" noWrap sx={{ color: CHAT_THEME.textSecondary, fontSize: '0.8125rem', opacity: 0.8 }}>
                {message.replyTo.message}
              </Typography>
            </Box>
          )}
          {editingMessage?._id === message._id ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <TextField
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                variant="outlined"
                size="small"
                multiline
                maxRows={3}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    fontSize: '0.875rem',
                    padding: '4px 8px',
                  }
                }}
              />
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button
                  size="small"
                  onClick={() => {
                    setEditingMessage(null);
                    setEditText('');
                  }}
                  sx={{ fontSize: '0.75rem', px: 1, py: 0.5 }}
                >
                  Cancel
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleEditMessage}
                  disabled={!editText.trim() || editText.trim() === message.message}
                  sx={{ fontSize: '0.75rem', px: 1, py: 0.5 }}
                >
                  Save
                </Button>
              </Box>
            </Box>
          ) : (
            <Typography 
              variant="body2" 
              sx={{ 
                wordBreak: 'break-word',
                color: '#1f2937',
                fontSize: '0.9375rem',
                lineHeight: 1.6,
                fontWeight: 400,
              }}
            >
              {message.message}
              {message.edited && (
                <Typography 
                  component="span" 
                  variant="caption" 
                  sx={{ 
                    ml: 1,
                    color: '#6b7280',
                    fontSize: '0.75rem',
                    fontStyle: 'italic',
                  }}
                >
                  (edited)
                </Typography>
              )}
            </Typography>
          )}
          {message.attachments && message.attachments.length > 0 && (
            <Box sx={{ mt: 1 }}>
              {message.attachments.map((attachment: ChatAttachment, index: number) => (
                <Box key={index} sx={{ mb: 1 }}>
                  {attachment.type === 'image' ? (
                    <img
                      src={attachment.url}
                      alt={attachment.name}
                      style={{ maxWidth: '180px', borderRadius: '8px' }}
                    />
                  ) : (
                    <Button
                      variant="outlined"
                      size="small"
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {attachment.name}
                    </Button>
                  )}
                </Box>
              ))}
            </Box>
          )}
          {hasReactions && (
            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.75, flexWrap: 'wrap' }}>
              {message.reactions.map((reaction: ChatReaction, index: number) => (
                <Tooltip key={index} title={reaction?.user?.name || 'Unknown'} placement="top">
                  <Typography 
                    component="span" 
                    variant="caption" 
                    sx={{ 
                      bgcolor: isOwnMessage ? 'rgba(0, 198, 167, 0.1)' : CHAT_THEME.cardBg,
                      px: 1,
                      py: 0.25,
                      borderRadius: '8px',
                      fontSize: 16,
                      border: `2px solid ${CHAT_THEME.border}`,
                      '&:hover': {
                        transform: 'scale(1.1)',
                      }
                    }}
                  >
                    {reaction.emoji}
                  </Typography>
                </Tooltip>
              ))}
            </Box>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1.5 }}>
            <Typography 
              variant="caption" 
              sx={{ 
                color: CHAT_THEME.textSecondary,
                fontWeight: 500,
                fontSize: '0.75rem',
              }}
            >
              {message.sender.name}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: CHAT_THEME.textMuted,
                fontSize: '0.7rem',
              }}
            >
              {format(new Date(message.timestamp), 'HH:mm')}
            </Typography>
            {isOwnMessage && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: isRead ? CHAT_THEME.primaryHover : CHAT_THEME.textMuted,
                  fontSize: '0.7rem',
                  fontWeight: isRead ? 600 : 400,
                }}
              >
                {isRead ? '✓✓ Read' : '✓ Sent'}
              </Typography>
            )}
          </Box>

          {user && (
            <IconButton
              size="small"
              onClick={(e) => handleMessageActions(message, e)}
              sx={{
                position: 'absolute',
                top: 6,
                right: 6,
                backgroundColor: CHAT_THEME.cardBg,
                border: `2px solid ${CHAT_THEME.border}`,
                borderRadius: '8px',
                width: 28,
                height: 28,
                opacity: 0.9,
                transition: 'opacity 0.2s ease',
                '&:hover': {
                  backgroundColor: CHAT_THEME.cardBg,
                  opacity: 1,
                }
              }}
            >
              <MoreVertIcon fontSize="small" sx={{ color: CHAT_THEME.textSecondary }} />
            </IconButton>
          )}
        </Box>

      </ListItem>
    );
  };

  useEffect(() => {
    if (anchorEl && !document.body.contains(anchorEl)) {
      setAnchorEl(null);
      setSelectedMessage(null);
    }
  }, [anchorEl]);

  // Error state
  if (error && (!messages || messages.length === 0)) {
    return (
      <Box 
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '100svh',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#f7f7fa',
          overflow: 'hidden',
          minHeight: 0,
          pt: '72px',
        }}
      >
        {/* Chat Header during error */}
        <Paper
          elevation={1}
          sx={{
            p: 2,
            mb: 0,
            bgcolor: '#fff',
            borderRadius: '0 0 16px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #e0e0e0',
            boxShadow: 'none',
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              src={logoUrl}
              sx={{ bgcolor: 'error.main', width: 40, height: 40 }}
            />
            <Box>
              <Typography variant="h6" fontWeight={700} color="error.main">
                KampusKart Chat
              </Typography>
              <Typography variant="caption" color="error.main">
                Connection Error
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Error Content */}
        <Box 
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: 3,
            gap: 3,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'error.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img 
                src={logoUrl} 
                alt="KampusKart" 
                style={{ 
                  width: '50px', 
                  height: '50px',
                  filter: 'brightness(0) invert(1)',
                }} 
              />
            </Box>
            
            <Typography variant="h6" fontWeight={600} color="error.main">
              Connection Failed
            </Typography>
            
            <Typography variant="body2" color="text.secondary" textAlign="center">
              {error}
            </Typography>
          </Box>

          <Button 
            variant="contained" 
            color="primary"
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Retry Connection
          </Button>
        </Box>
      </Box>
    );
  }

  if (loading && (!messages || messages.length === 0)) {
    return (
      <Box 
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '100svh',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#ffffff',
          overflow: 'hidden',
          minHeight: 0,
          pt: '72px',
        }}
      >
        <ChatSkeleton messageCount={8} />
      </Box>
    );
  }

  // Navbar height constant
  const NAVBAR_H = 72;

  return (
    <Box sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      // Use visual viewport height so the chat shrinks when iOS keyboard opens
      height: '100svh',
      zIndex: 10,
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#fafafa',
      overflow: 'hidden',
      minHeight: 0,
      pt: `${NAVBAR_H}px`,
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'none',
        pointerEvents: 'none',
        zIndex: 0,
      }
    }}>
      <ChatHeader />
      {/* Messages */}
      <Box sx={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        p: 0,
        mb: 0,
        bgcolor: 'transparent',
        border: 'none',
        boxShadow: 'none',
        position: 'relative',
        zIndex: 1,
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(0, 0, 0, 0.02)',
          borderRadius: '10px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: CHAT_THEME.primaryHover,
          borderRadius: '10px',
          border: '2px solid transparent',
          backgroundClip: 'padding-box',
          '&:hover': {
            background: CHAT_THEME.primaryDark,
            backgroundClip: 'padding-box',
          },
        },
      }}>
        {loading && messages.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5,
              px: 2,
              py: 1,
              bgcolor: CHAT_THEME.cardBg,
              borderRadius: '8px',
              border: `2px solid ${CHAT_THEME.border}`,
            }}>
              <CircularProgress 
                size={18} 
                sx={{ 
                  color: CHAT_THEME.primary,
                }} 
              />
              <Typography variant="caption" sx={{ color: CHAT_THEME.primary, fontWeight: 500, fontSize: '0.8rem' }}>
                Loading more messages...
              </Typography>
            </Box>
          </Box>
        )}
        <List sx={{ p: { xs: 2, sm: 3 } }}>
          <div ref={loadMoreRef} />
          {Array.isArray(messages) && messages.map((message) => (
            message && message._id ? (
              <React.Fragment key={message._id}>
                {renderMessage(message)}
              </React.Fragment>
            ) : null
          ))}
          <div ref={messagesEndRef} />
        </List>
      </Box>

      {/* Sticky Input and Reply Preview */}
      <Box sx={{ 
        position: 'sticky', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        background: '#fafafa',
        zIndex: 20, 
        pt: 2, 
        pb: { xs: 'max(env(safe-area-inset-bottom), 12px)', sm: 2 },
        px: { xs: 2, sm: 3 },
      }}>
        {/* Reply Preview */}
        {replyTo && (
          <Paper 
            sx={{ 
              p: 1.5, 
              mb: 1.5, 
              bgcolor: '#f0fdf4',
              borderRadius: '8px',
              border: `2px solid ${CHAT_THEME.border}`,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '4px',
                background: CHAT_THEME.primaryHover,
              }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="caption" sx={{ color: CHAT_THEME.primary, fontWeight: 700, fontSize: '0.75rem', ml: 1 }}>
                Replying to {replyTo.sender.name}
              </Typography>
              <IconButton 
                size="small" 
                onClick={() => setReplyTo(null)}
                sx={{ 
                  color: CHAT_THEME.textSecondary,
                  width: 28,
                  height: 28,
                  '&:hover': { 
                    bgcolor: CHAT_THEME.cardBg,
                    color: CHAT_THEME.primary,
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
            <Typography variant="body2" noWrap sx={{ color: CHAT_THEME.textPrimary, ml: 1, fontSize: '0.875rem' }}>
              {replyTo.message}
            </Typography>
          </Paper>
        )}
        {/* Typing Indicator */}
        <Box sx={{
          maxHeight: isTyping ? 64 : 0,
          opacity: isTyping ? 1 : 0,
          transform: isTyping ? 'translateY(0)' : 'translateY(6px)',
          transition: 'max-height 220ms ease, opacity 180ms ease, transform 220ms ease',
          overflow: 'hidden',
          pointerEvents: 'none',
          mb: isTyping ? 1.5 : 0,
        }}>
          <Box sx={{ 
            px: 2, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5,
            py: 1,
            bgcolor: CHAT_THEME.cardBg,
            borderRadius: '8px',
            border: `2px solid ${CHAT_THEME.border}`,
          }}>
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              <Box sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                bgcolor: CHAT_THEME.primary,
                animation: 'bounce 1.4s infinite',
                '@keyframes bounce': { 
                  '0%, 60%, 100%': { transform: 'translateY(0)' }, 
                  '30%': { transform: 'translateY(-6px)' } 
                } 
              }} />
              <Box sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                bgcolor: CHAT_THEME.primary,
                animation: 'bounce 1.4s infinite 0.2s',
                '@keyframes bounce': { 
                  '0%, 60%, 100%': { transform: 'translateY(0)' }, 
                  '30%': { transform: 'translateY(-6px)' } 
                } 
              }} />
              <Box sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                bgcolor: CHAT_THEME.primary,
                animation: 'bounce 1.4s infinite 0.4s',
                '@keyframes bounce': { 
                  '0%, 60%, 100%': { transform: 'translateY(0)' }, 
                  '30%': { transform: 'translateY(-6px)' } 
                } 
              }} />
            </Box>
            <Typography variant="caption" sx={{ color: CHAT_THEME.primary, fontWeight: 600, fontSize: '0.8rem' }}>
              Someone is typing...
            </Typography>
          </Box>
        </Box>
        {/* Message Input */}
        <Paper
          component="form"
          onSubmit={handleSendMessage}
          sx={{
            px: { xs: 1.5, sm: 2 },
            py: { xs: 1.25, sm: 1.5 },
            display: 'flex',
            alignItems: 'flex-end',
            gap: { xs: 0.75, sm: 1 },
            boxShadow: 'none',
            borderRadius: '12px',
            border: `2px solid ${CHAT_THEME.border}`,
            bgcolor: CHAT_THEME.background,
            transition: 'border-color 0.2s ease',
            '&:focus-within': {
              borderColor: CHAT_THEME.primary,
            }
          }}
        >
          <input
            type="file"
            multiple
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
          <IconButton 
            onClick={() => fileInputRef.current?.click()} 
            size="small"
            sx={{ 
              color: CHAT_THEME.textSecondary,
              width: 40,
              height: 40,
              borderRadius: '8px',
              '&:hover': { 
                bgcolor: CHAT_THEME.cardBg,
                color: CHAT_THEME.primary,
              },
              transition: 'all 0.2s ease',
            }}
          >
            <AttachFileIcon />
          </IconButton>
          <IconButton 
            ref={emojiToggleButtonRef}
            onClick={() => {
              const toggleRect = emojiToggleButtonRef.current?.getBoundingClientRect();
              if (toggleRect) {
                const estimatedPickerHeight = 360;
                const spaceAbove = toggleRect.top;
                const spaceBelow = window.innerHeight - toggleRect.bottom;
                setEmojiPickerDirection(spaceAbove >= estimatedPickerHeight || spaceAbove > spaceBelow ? 'up' : 'down');
              }
              setShowEmojiPicker((prev) => !prev);
            }} 
            size="small"
            sx={{ 
              color: CHAT_THEME.textSecondary,
              width: 40,
              height: 40,
              borderRadius: '8px',
              bgcolor: showEmojiPicker ? CHAT_THEME.cardBg : 'transparent',
              '&:hover': { 
                bgcolor: CHAT_THEME.cardBg,
                color: CHAT_THEME.primary,
              },
              transition: 'all 0.2s ease',
            }}
          >
            <EmojiEmotionsIcon />
          </IconButton>
          {showEmojiPicker && (
            <Box
              ref={emojiPickerRef}
              sx={{
                position: 'absolute',
                ...(emojiPickerDirection === 'up' ? { bottom: '100%' } : { top: '100%' }),
                left: 0,
                zIndex: 30,
                mt: emojiPickerDirection === 'down' ? 1 : 0,
                mb: emojiPickerDirection === 'up' ? 1 : 0,
                maxHeight: '65vh',
                overflow: 'auto',
                borderRadius: '12px',
                boxShadow: '0 10px 24px rgba(0,0,0,0.16)',
              }}
            >
              {emojiPickerComponent && emojiData ? (
                React.createElement(emojiPickerComponent, {
                  data: emojiData,
                  theme: 'light',
                  onEmojiSelect: (emoji: EmojiSelectData) => {
                    setNewMessage((prev) => prev + (emoji?.native || ''));
                    setShowEmojiPicker(false);
                  },
                })
              ) : (
                <Paper
                  sx={{
                    p: 1.5,
                    borderRadius: '10px',
                    border: `2px solid ${CHAT_THEME.border}`,
                    bgcolor: CHAT_THEME.background,
                    minWidth: 200,
                  }}
                >
                  <Typography variant="caption" sx={{ color: CHAT_THEME.textSecondary, fontWeight: 600 }}>
                    {isEmojiLoading ? 'Loading emoji...' : 'Emoji unavailable'}
                  </Typography>
                </Paper>
              )}
            </Box>
          )}
          {/* Show selected attachments as chips */}
          {attachments.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1, px: 2 }}>
              {attachments.map((file: File, idx: number) => (
                <Paper 
                  key={idx} 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    p: 0.75, 
                    px: 1.25,
                    bgcolor: CHAT_THEME.cardBg,
                    borderRadius: '8px',
                    border: `2px solid ${CHAT_THEME.border}`,
                  }}
                >
                  <Typography variant="caption" sx={{ mr: 1, color: CHAT_THEME.textSecondary, fontWeight: 500, fontSize: '0.75rem' }}>
                    {file.name}
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                    sx={{
                      width: 20,
                      height: 20,
                      color: CHAT_THEME.textSecondary,
                      '&:hover': {
                        bgcolor: CHAT_THEME.border,
                        color: CHAT_THEME.primary,
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Paper>
              ))}
            </Box>
          )}
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                bgcolor: CHAT_THEME.cardBg,
                fontSize: '1rem',
                '& fieldset': {
                  borderColor: 'transparent',
                },
                '&:hover fieldset': {
                  borderColor: 'transparent',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'transparent',
                  borderWidth: '0px',
                },
              },
              '& .MuiInputBase-input': {
                py: 1.25,
                px: 1.5,
                fontSize: '16px',
                color: CHAT_THEME.textPrimary,
                '&::placeholder': {
                  color: CHAT_THEME.textMuted,
                  opacity: 1,
                },
              },
            }}
            inputProps={{ style: { fontSize: '16px' } }}
          />
          <IconButton 
            type="submit" 
            disabled={!canSendMessage || sendingMessage}
            sx={{
              width: { xs: 40, sm: 44 },
              height: { xs: 40, sm: 44 },
              borderRadius: '8px',
              background: canSendMessage && !sendingMessage
                ? CHAT_THEME.primary
                : '#e5e7eb',
              color: canSendMessage && !sendingMessage
                ? '#ffffff'
                : '#9ca3af',
              '&:hover': {
                background: canSendMessage && !sendingMessage
                  ? CHAT_THEME.primaryHover
                  : '#d1d5db',
              },
              '&:disabled': {
                background: '#e5e7eb',
                color: '#9ca3af',
              },
              transition: 'background 0.2s ease',
            }}
          >
            {sendingMessage ? (
              <CircularProgress size={20} sx={{ color: '#ffffff' }} />
            ) : (
              <SendIcon sx={{ fontSize: { xs: 20, sm: 22 } }} />
            )}
          </IconButton>
        </Paper>
      </Box>

      {/* Message Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
            border: `2px solid ${CHAT_THEME.border}`,
            minWidth: 120
          }
        }}
      >
        {selectedMessage && (
          <MenuItem
            onClick={() => {
              setReplyTo(selectedMessage);
              setAnchorEl(null);
            }}
            sx={{
              borderRadius: '6px',
              mx: 0.5,
              my: 0.25,
              '&:hover': { backgroundColor: CHAT_THEME.cardBg }
            }}
          >
            <ReplyIcon fontSize="small" sx={{ mr: 1.5, color: CHAT_THEME.textSecondary }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>Reply</Typography>
          </MenuItem>
        )}
        
        {selectedMessage && user && (selectedMessage.sender?._id === user._id || selectedMessage.sender?.id === user.id) && (
          <>
            <MenuItem 
              onClick={() => {
                startEditing(selectedMessage);
                setAnchorEl(null);
              }}
              sx={{
                borderRadius: '6px',
                mx: 0.5,
                my: 0.25,
                '&:hover': { backgroundColor: CHAT_THEME.cardBg }
              }}
            >
              <EditIcon fontSize="small" sx={{ mr: 1.5, color: CHAT_THEME.textSecondary }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>Edit</Typography>
            </MenuItem>
            <MenuItem 
              onClick={() => {
                handleDeleteMessage();
                setAnchorEl(null);
              }}
              sx={{
                borderRadius: '6px',
                mx: 0.5,
                my: 0.25,
                '&:hover': {
                  backgroundColor: '#fef2f2'
                }
              }}
            >
              <DeleteIcon fontSize="small" sx={{ mr: 1.5, color: '#ef4444' }} />
              <Typography variant="body2" sx={{ fontWeight: 500, color: '#ef4444' }}>Delete</Typography>
            </MenuItem>
          </>
        )}
      </Menu>

    </Box>
  );
};

export default ChatWindow; 