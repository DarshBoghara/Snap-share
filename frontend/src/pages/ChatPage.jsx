import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { userService } from '../services/userService';
import { messageService } from '../services/messageService';
import { Navbar } from '../components/layout/Navbar';
import { UserList } from '../components/chat/UserList';
import { ChatWindow } from '../components/chat/ChatWindow';
import { SkeletonConversationList } from '../components/common/SkeletonLoader';
import { EmptyState } from '../components/common/EmptyState';

export const ChatPage = () => {
  const { user } = useAuth();
  const { sendEvent, subscribe } = useSocket();

  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const [loadingUsers, setLoadingUsers] = useState(true);

  const activeUserRef = useRef(activeUser);
  const messagesRef = useRef(messages);

  useEffect(() => {
    activeUserRef.current = activeUser;
  }, [activeUser]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Purge received messages in the current conversation when leaving/switching chat
  const triggerExitDisappearingPurge = () => {
    const currentActive = activeUserRef.current;
    const currentMsgs = messagesRef.current;

    if (!currentActive) return;

    const unpurgedReceivedIds = currentMsgs
      .filter(m => m.sender_id === currentActive.id)
      .map(m => m.id);

    if (unpurgedReceivedIds.length > 0) {
      sendEvent('read_message', { message_ids: unpurgedReceivedIds });
    }
  };

  const handleSelectUser = (newUser) => {
    if (activeUser && activeUser.id !== newUser?.id) {
      triggerExitDisappearingPurge();
    }
    setActiveUser(newUser);
  };

  const handleBackChat = () => {
    triggerExitDisappearingPurge();
    setActiveUser(null);
  };

  // Fetch initial users and unread counts
  const loadInitialData = async () => {
    setLoadingUsers(true);
    try {
      const counts = await messageService.getUnreadCounts();
      setUnreadCounts(counts);

      const recentUsers = await userService.searchUsers('');
      setUsers(recentUsers);
    } catch (e) {
      console.error('Failed to load initial chat data:', e);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Purge on unmount
  useEffect(() => {
    return () => {
      triggerExitDisappearingPurge();
    };
  }, []);

  // Search users callback
  const handleSearch = async (query) => {
    try {
      if (!query.trim()) {
        const defaultUsers = await userService.searchUsers('');
        setUsers(defaultUsers);
        return;
      }
      const results = await userService.searchUsers(query);
      setUsers(results);
    } catch (e) {
      console.error('User search error:', e);
    }
  };

  // Load conversation when active user changes
  useEffect(() => {
    if (!activeUser) return;
    const loadConversation = async () => {
      try {
        const history = await messageService.getConversation(activeUser.id);
        setMessages(history);
        setUnreadCounts(prev => ({ ...prev, [activeUser.id]: 0 }));
      } catch (e) {
        console.error('Failed to fetch conversation history:', e);
      }
    };
    loadConversation();
  }, [activeUser]);

  // Subscribe to real-time WebSocket events
  useEffect(() => {
    const unsubscribeNewMsg = subscribe('new_message', (newMsg) => {
      const currentActive = activeUserRef.current;
      if (
        currentActive && (newMsg.sender_id === currentActive.id || newMsg.receiver_id === currentActive.id)
      ) {
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      } else if (newMsg.sender_id !== user?.id) {
        setUnreadCounts(prev => ({
          ...prev,
          [newMsg.sender_id]: (prev[newMsg.sender_id] || 0) + 1
        }));
      }
    });

    const unsubscribeDeleted = subscribe('message_deleted', (data) => {
      setMessages(prev => prev.filter(m => m.id !== data.message_id));
    });

    const unsubscribeTyping = subscribe('typing_indicator', (data) => {
      setTypingUsers(prev => ({
        ...prev,
        [data.sender_id]: data.is_typing
      }));
    });

    const unsubscribePresence = subscribe('user_presence', (data) => {
      setUsers(prev => prev.map(u => {
        if (u.id === data.user_id) {
          return { ...u, is_online: data.is_online };
        }
        return u;
      }));
      if (activeUserRef.current && activeUserRef.current.id === data.user_id) {
        setActiveUser(prev => prev ? { ...prev, is_online: data.is_online } : null);
      }
    });

    return () => {
      unsubscribeNewMsg();
      unsubscribeDeleted();
      unsubscribeTyping();
      unsubscribePresence();
    };
  }, [user?.id, subscribe]);

  const handleSendMessage = (receiverId, content) => {
    sendEvent('send_message', { receiver_id: receiverId, message: content });
  };

  const handleTyping = (receiverId, isTyping) => {
    const eventName = isTyping ? 'typing' : 'stop_typing';
    sendEvent(eventName, { receiver_id: receiverId });
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <Navbar />

      {/* Full-width, Full-height edge-to-edge Chat Interface */}
      <main className="w-full h-[calc(100vh-56px)] flex overflow-hidden">
        {/* Left Sidebar - User List */}
        <div className={`w-full md:w-80 lg:w-96 h-full flex-shrink-0 ${activeUser ? 'hidden md:block' : 'block'}`}>
          {loadingUsers ? (
            <div className="h-full bg-white dark:bg-slate-950 p-4 border-r border-slate-200 dark:border-slate-800">
              <SkeletonConversationList count={7} />
            </div>
          ) : (
            <UserList
              users={users}
              activeUserId={activeUser?.id}
              onSelectUser={handleSelectUser}
              onSearch={handleSearch}
              unreadCounts={unreadCounts}
            />
          )}
        </div>

        {/* Right Main Pane - Active Chat Window or Empty State */}
        <div className={`w-full flex-1 h-full ${!activeUser ? 'hidden md:block' : 'block'}`}>
          {activeUser ? (
            <ChatWindow
              targetUser={activeUser}
              messages={messages}
              currentUserId={user?.id}
              onSendMessage={handleSendMessage}
              onTyping={handleTyping}
              isTargetTyping={!!typingUsers[activeUser.id]}
              onBackChat={handleBackChat}
            />
          ) : (
            <div className="w-full h-full">
              <EmptyState type="no-chat" />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
