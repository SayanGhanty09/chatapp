import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../components/AuthContext';
import Navbar from '../components/Navbar';
import MessageBubble from '../components/MessageBubble';
import { Send, Smile, Paperclip, User, Loader2, LogOut, MessageSquare } from 'lucide-react';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [profiles, setProfiles] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingProfiles, setLoadingProfiles] = useState(true);
    const [sending, setSending] = useState(false);
    const { user, signOut } = useAuth();
    const messagesEndRef = useRef(null);
    const scrollContainerRef = useRef(null);

    const scrollToBottom = (behavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    // 1. Fetch Profiles
    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .neq('id', user.id);

                if (error) throw error;
                setProfiles(data || []);
            } catch (err) {
                console.error('Error fetching profiles:', err);
            } finally {
                setLoadingProfiles(false);
            }
        };

        if (user) fetchProfiles();
    }, [user]);

    // 2. Fetch Messages when selectedUser changes
    useEffect(() => {
        if (!selectedUser) return;

        const fetchMessages = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('messages')
                    .select('*')
                    .or(`and(user_id.eq.${user.id},recipient_id.eq.${selectedUser.id}),and(user_id.eq.${selectedUser.id},recipient_id.eq.${user.id})`)
                    .order('created_at', { ascending: true });

                if (error) throw error;
                setMessages(data || []);
            } catch (err) {
                console.error('Error fetching messages:', err);
            } finally {
                setLoading(false);
                setTimeout(() => scrollToBottom('auto'), 100);
            }
        };

        fetchMessages();

        // Simplify Realtime Subscription
        const subscription = supabase
            .channel('public:messages')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages' },
                (payload) => {
                    const isRelevant =
                        (payload.new.user_id === user.id && payload.new.recipient_id === selectedUser.id) ||
                        (payload.new.user_id === selectedUser.id && payload.new.recipient_id === user.id);

                    if (isRelevant) {
                        setMessages((current) => [...current, payload.new]);
                        setTimeout(() => scrollToBottom(), 50);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [user.id, selectedUser]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending || !selectedUser) return;

        setSending(true);
        try {
            const { error } = await supabase.from('messages').insert([
                {
                    content: newMessage,
                    user_id: user.id,
                    recipient_id: selectedUser.id
                },
            ]);
            if (error) throw error;
            setNewMessage('');
        } catch (err) {
            console.error('Error sending message:', err.message);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="chat-page">
            {/* Sidebar */}
            <aside className="chat-sidebar">
                <div className="sidebar-header">
                    <div className="user-avatar">
                        <User size={24} />
                    </div>
                    <div className="nav-controls">
                        <button title="Status"><Smile size={20} color="#54656f" /></button>
                        <button title="Logout" onClick={signOut}><LogOut size={20} color="#54656f" /></button>
                    </div>
                </div>

                <div className="user-list scrollbar-hide">
                    {loadingProfiles ? (
                        <div className="loading-wrapper"><Loader2 className="spinner" size={24} /></div>
                    ) : profiles.length === 0 ? (
                        <p className="text-center p-4 text-gray-500">No users found</p>
                    ) : (
                        profiles.map((profile) => (
                            <div
                                key={profile.id}
                                className={`user-item ${selectedUser?.id === profile.id ? 'active' : ''}`}
                                onClick={() => setSelectedUser(profile)}
                            >
                                <div className="user-avatar">
                                    <User size={24} />
                                </div>
                                <div className="user-details">
                                    <div className="user-item-name">{profile.email.split('@')[0]}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className="chat-main">
                {selectedUser ? (
                    <>
                        <Navbar selectedUser={selectedUser} />
                        <div className="whatsapp-bg messages-list scrollbar-hide" style={{ flex: 1 }}>
                            {loading ? (
                                <div className="loading-wrapper">
                                    <div className="spinner"></div>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <MessageBubble key={msg.id} message={msg} />
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="input-area">
                            <button className="icon-btn"><Smile size={24} color="#919191" /></button>
                            <button className="icon-btn"><Paperclip size={24} color="#919191" /></button>

                            <form onSubmit={handleSendMessage} className="input-form">
                                <textarea
                                    rows="1"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage(e);
                                        }
                                    }}
                                    placeholder="Type a message"
                                    className="chat-textarea"
                                />
                            </form>

                            <button
                                onClick={handleSendMessage}
                                disabled={!newMessage.trim() || sending}
                                className="send-btn-wa"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="no-chat-selected">
                        <div className="no-chat-icon">
                            <svg viewBox="0 0 450 350" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="225" cy="150" r="100" fill="#F0F2F5" />
                                <path d="M225 110V190M185 150H265" stroke="#D1D7DB" strokeWidth="10" strokeLinecap="round" />
                            </svg>
                        </div>
                        <h1 className="no-chat-title">Supabase Web</h1>
                        <p className="no-chat-text">
                            Send and receive messages without keeping your phone online.<br />
                            Use Supabase Web on up to 4 linked devices and 1 phone at the same time.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Chat;
