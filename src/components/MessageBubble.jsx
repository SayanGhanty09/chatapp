import React from 'react';
import { useAuth } from './AuthContext';

const MessageBubble = ({ message }) => {
    const { user } = useAuth();
    const isMe = message.user_id === user?.id;

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    return (
        <div className={`bubble-container ${isMe ? 'me' : ''}`}>
            <div className="bubble-wrapper">
                <div className="bubble-content">
                    {message.content}
                    <span className="bubble-time">
                        {formatDate(message.created_at)}
                        {isMe && (
                            <svg style={{ marginLeft: '4px', display: 'inline' }} width="16" height="11" viewBox="0 0 16 11" fill="#34b7f1">
                                <path d="M11.05 1.05l-6.55 6.55-2.55-2.55-1.05 1.05 3.6 3.6 7.6-7.6-1.05-1.05zm4.05 0l-7.6 7.6-.85-.85-1.05 1.05 1.9 1.9 8.6-8.6-1.05-1.05z"></path>
                            </svg>
                        )}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
