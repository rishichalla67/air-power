import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Nav() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <nav className="bg-blue-900 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-white text-2xl font-bold">A.P.H. & AC</Link>
                
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
                <div className={`md:flex ${isOpen ? 'block' : 'hidden'}`}>
                    <ul className="md:flex md:space-x-4">
                        <li>
                            <Link to="/" className="block mt-4 md:inline-block md:mt-0 text-white hover:text-navy-200">
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link to="/schedule" className="block mt-4 md:inline-block md:mt-0 text-white hover:text-navy-200">
                                Schedule
                            </Link>
                        </li>
                        <li>
                            <Link to="/profile" className="block mt-4 md:inline-block md:mt-0 text-white hover:text-navy-200">
                                Profile
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Nav;