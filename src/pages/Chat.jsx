import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../components/AuthContext';
import Navbar from '../components/Navbar';
import MessageBubble from '../components/MessageBubble';
import { Send, Smile, Paperclip } from 'lucide-react';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const { user } = useAuth();
    const messagesEndRef = useRef(null);
    const scrollContainerRef = useRef(null);

    const scrollToBottom = (behavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const { data, error } = await supabase
                    .from('messages')
                    .select('*')
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

        const subscription = supabase
            .channel('public:messages')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages' },
                (payload) => {
                    setMessages((current) => [...current, payload.new]);
                    setTimeout(() => scrollToBottom(), 50);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [user?.id]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            const { error } = await supabase.from('messages').insert([
                {
                    content: newMessage,
                    user_id: user.id,
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
            <Navbar />

            <main className="chat-main whatsapp-bg">
                <div
                    ref={scrollContainerRef}
                    className="messages-list scrollbar-hide"
                >
                    {loading ? (
                        <div className="loading-wrapper">
                            <div className="spinner" style={{ borderTopColor: 'var(--wa-teal)' }}></div>
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
            </main>
        </div>
    );
};

export default Chat;
