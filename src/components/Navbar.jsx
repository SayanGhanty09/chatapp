import React from 'react';
import { useAuth } from '../components/AuthContext';
import { MoreVertical, Search, Phone, Video, ArrowLeft } from 'lucide-react';

const Navbar = ({ selectedUser }) => {
    const { signOut } = useAuth();

    return (
        <nav className="nav-container">
            <div className="nav-content">
                <div className="nav-brand">
                    <div className="user-img">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08s5.97 1.09 6 3.08c-1.29 1.94-3.5 3.22-6 3.22z"></path>
                        </svg>
                    </div>
                    <div className="user-info">
                        <span className="user-name">{selectedUser?.email?.split('@')[0]}</span>
                        <span className="user-status">online</span>
                    </div>
                </div>

                <div className="nav-controls">
                    <button title="Video Call"><Video size={20} /></button>
                    <button title="Voice Call"><Phone size={20} /></button>
                    <button title="Search"><Search size={20} /></button>
                    <button onClick={signOut} title="Logout"><MoreVertical size={20} /></button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
