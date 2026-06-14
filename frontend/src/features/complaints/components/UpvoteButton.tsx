import React, { useState, useEffect } from 'react';
import { FiThumbsUp } from 'react-icons/fi';

interface UpvoteButtonProps {
  complaintId: string;
  initialVoteCount: number;
  onVoteChange?: (id: string, newCount: number) => void;
}

export const UpvoteButton: React.FC<UpvoteButtonProps> = ({ 
  complaintId, 
  initialVoteCount, 
  onVoteChange 
}) => {
  const getStoredVotes = () => {
    const stored = localStorage.getItem('complaintVotes');
    return stored ? JSON.parse(stored) : {};
  };

  //VoteCount starts from initialVoteCount (from backend)
  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Track if user has upvoted based on localStorage
  const [hasUpvoted, setHasUpvoted] = useState(() => {
    const storedVotes = getStoredVotes();
    return !!storedVotes[complaintId];
  });

  // Sync when initialVoteCount changes (like after refresh)
  useEffect(() => {
    setVoteCount(initialVoteCount);
  }, [initialVoteCount]);

  // Check localStorage on mount and when complaintId changes
  useEffect(() => {
    const storedVotes = getStoredVotes();
    const isVoted = !!storedVotes[complaintId];
    setHasUpvoted(isVoted);
  }, [complaintId]);

  const handleUpvote = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const storedVotes = getStoredVotes();
    const currentlyUpvoted = !!storedVotes[complaintId];
    
    if (currentlyUpvoted) {
      // User is REMOVING their upvote
      delete storedVotes[complaintId];
      const newCount = Math.max(0, voteCount - 1);
      setVoteCount(newCount);
      setHasUpvoted(false);
      
      if (onVoteChange) {
        onVoteChange(complaintId, newCount);
      }
    } else {
      // User is ADDING their upvote
      storedVotes[complaintId] = true;
      const newCount = voteCount + 1;
      setVoteCount(newCount);
      setHasUpvoted(true);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
      
      if (onVoteChange) {
        onVoteChange(complaintId, newCount);
      }
    }
    
    localStorage.setItem('complaintVotes', JSON.stringify(storedVotes));
  };

  return (
    <button
      onClick={handleUpvote}
      className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-full 
        transition-all duration-200 ease-in-out
        ${hasUpvoted 
          ? 'bg-[#00C6A7] text-white hover:bg-[#00b397]' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }
        ${isAnimating ? 'scale-110' : 'scale-100'}
        active:scale-95
      `}
      aria-label={hasUpvoted ? 'Remove upvote' : 'Upvote'}
    >
      <FiThumbsUp 
        size={14} 
        className={`${isAnimating ? 'animate-bounce' : ''}`}
        fill={hasUpvoted ? 'currentColor' : 'none'}
      />
      <span className="text-sm font-medium">{voteCount}</span>
    </button>
  );
};