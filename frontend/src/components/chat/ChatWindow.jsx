import React, { useEffect, useRef, useState } from 'react';
import { Send, Flame, Lock, ArrowLeft } from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { MessageItem } from './MessageItem';
import { TypingIndicator } from './TypingIndicator';

export const ChatWindow = ({
  targetUser,
  messages = [],
  currentUserId,
  onSendMessage,
  onTyping,
  isTargetTyping = false,
  onBackChat
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTargetTyping]);

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);

    if (onTyping) {
      onTyping(targetUser.id, true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(targetUser.id, false);
      }, 2000);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    onSendMessage(targetUser.id, inputMessage.trim());
    setInputMessage('');
    if (onTyping) onTyping(targetUser.id, false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 dark:bg-slate-900 overflow-hidden transition-colors duration-200">
      {/* Active Conversation Header */}
      <div className="px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-950 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBackChat}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Exit / Back to Chats"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <Avatar username={targetUser.username} image={targetUser.profile_image} isOnline={targetUser.is_online} size="md" />
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              {targetUser.username}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${targetUser.is_online ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              {targetUser.is_online ? 'Active now' : 'Offline'}
            </p>
          </div>
        </div>

        {/* Snapchat Disappearing Notice Banner */}
        <div className="hidden md:flex items-center space-x-2 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 px-3 py-1.5 rounded-full">
          <Flame className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">Messages vanish when leaving chat</span>
        </div>
      </div>

      {/* Message Feed Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-slate-50 dark:bg-slate-900">
        {/* Security / Privacy Banner */}
        <div className="max-w-md mx-auto my-3 p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center space-y-1 shadow-sm">
          <div className="flex justify-center text-blue-600 dark:text-blue-400 mb-1">
            <Lock className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-900 dark:text-slate-100">End-to-End Ephemeral Conversation</p>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            Messages remain visible while you stay in this chat, then permanently disappear as soon as you exit or switch conversation.
          </p>
        </div>

        {messages.map((msg) => (
          <MessageItem
            key={msg.id}
            message={msg}
            isOwn={msg.sender_id === currentUserId}
          />
        ))}

        {isTargetTyping && <TypingIndicator username={targetUser.username} />}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <form onSubmit={handleSend} className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder={`Send disappearing message to ${targetUser.username}...`}
            value={inputMessage}
            onChange={handleInputChange}
            className="flex-1 text-sm rounded-xl px-4 py-3 border transition-all duration-200 outline-none focus:ring-2 focus:ring-blue-500/30 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 border-slate-200 dark:border-slate-800 focus:border-blue-600 dark:focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="w-11 h-11 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-md active:scale-95 flex-shrink-0"
          >
            <Send className="w-4 h-4 fill-white" />
          </button>
        </div>
      </form>
    </div>
  );
};
