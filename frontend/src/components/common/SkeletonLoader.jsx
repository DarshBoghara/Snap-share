import React from 'react';

export const SkeletonUserItem = () => {
  return (
    <div className="w-full p-3.5 flex items-center space-x-3.5 border-b border-theme-border/40 animate-pulse">
      <div className="w-12 h-12 rounded-full skeleton-shimmer flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex justify-between items-center">
          <div className="h-4 w-28 rounded-md skeleton-shimmer" />
          <div className="h-3 w-10 rounded-md skeleton-shimmer" />
        </div>
        <div className="h-3 w-40 rounded-md skeleton-shimmer" />
      </div>
    </div>
  );
};

export const SkeletonMessage = ({ isOwn = false }) => {
  return (
    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} my-2.5 w-full`}>
      <div
        className={`h-16 w-3/5 rounded-bubble skeleton-shimmer ${
          isOwn ? 'rounded-br-none' : 'rounded-bl-none'
        }`}
      />
    </div>
  );
};

export const SkeletonConversationList = ({ count = 5 }) => {
  return (
    <div className="w-full space-y-1">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonUserItem key={i} />
      ))}
    </div>
  );
};
