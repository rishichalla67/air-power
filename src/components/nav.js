import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Nav() {
    const [isOpen, setIsOpen] = useState(false);
    const { currentUser, userData, logout } = useAuth();
    const navigate = useNavigate();

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    return (
        <nav className="bg-blue-900 p-4 relative">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-white text-2xl font-bold">AP</Link>
                
                {/* Hamburger menu for mobile */}
                <div className="md:hidden">
                    <button onClick={toggleMenu} className="text-white focus:outline-none">
                        <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                            {isOpen ? (
                                <path fillRule="evenodd" clipRule="evenodd" d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z" />
                            ) : (
                                <path fillRule="evenodd" d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Navigation links */}
                <div className={`md:flex ${isOpen ? 'block' : 'hidden'} absolute top-full left-0 right-0 md:relative bg-blue-900 md:bg-transparent z-50`}>
                    <ul className="md:flex md:space-x-4 md:justify-end w-full">
                        <li>
                            <Link to="/" className="block py-2 md:py-0 px-4 md:px-0 text-white hover:text-navy-200">
                                Home
                            </Link>
                        </li>
                        {currentUser ? (
                            <>
                                <li>
                                    <Link to="/schedule" className="block py-2 md:py-0 px-4 md:px-0 text-white hover:text-navy-200">
                                        Schedule
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/profile" className="block py-2 md:py-0 px-4 md:px-0 text-white hover:text-navy-200">
                                        Profile
                                    </Link>
                                </li>
                                {userData && userData.isAdmin && (
                                    <li>
                                        <Link to="/signup" className="block py-2 md:py-0 px-4 md:px-0 text-white hover:text-navy-200">
                                            Register
                                        </Link>
                                    </li>
                                )}
                                <li>
                                    <button onClick={handleLogout} className="block w-full text-left py-2 md:py-0 px-4 md:px-0 text-white hover:text-navy-200">
                                        Logout
                                    </button>
                                </li>
                            </>
                        ) : (
                            <li>
                                <Link to="/login" className="block py-2 md:py-0 px-4 md:px-0 text-white hover:text-navy-200">
                                    Login
                                </Link>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Nav;