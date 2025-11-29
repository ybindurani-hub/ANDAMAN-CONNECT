import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { Menu, X, Plus, Search, User as UserIcon, LogOut, Package } from 'lucide-react';

const Navbar: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <nav className="bg-slate-900 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex flex-col cursor-pointer justify-center" onClick={() => navigate('/')}>
            <span className="text-xl font-black tracking-tighter text-teal-400 leading-none">ANDAMAN</span>
            <span className="text-[10px] font-bold tracking-[0.2em] text-gray-300 leading-none mt-0.5">CONNECT</span>
          </div>

          {/* Desktop Search - Visual only for UI */}
          <div className="hidden md:flex flex-1 mx-8 max-w-2xl">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Find Cars, Mobile Phones and more..."
                className="w-full h-10 pl-4 pr-10 rounded-md bg-slate-800 border border-slate-700 text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Search className="h-5 w-5 text-teal-400" />
              </div>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {currentUser ? (
              <>
                 <Link
                  to="/profile/my-products"
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-slate-800 transition"
                >
                  <Package className="w-4 h-4 mr-2" />
                  My Ads
                </Link>
                <div className="flex items-center space-x-2">
                    <Link to="/profile">
                        <img
                            src={userProfile?.profileImage || "https://picsum.photos/40/40"}
                            alt="Profile"
                            className="h-8 w-8 rounded-full border border-gray-600 object-cover"
                        />
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="text-gray-300 hover:text-white"
                        title="Logout"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
                <Link
                  to="/add-product"
                  className="flex items-center bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-full font-bold shadow-md transition-transform transform hover:scale-105"
                >
                  <Plus className="w-5 h-5 mr-1" />
                  SELL
                </Link>
              </>
            ) : (
              <div className="flex space-x-4">
                <Link to="/login" className="text-gray-300 hover:text-white font-medium underline decoration-teal-500 decoration-2 underline-offset-4">Login</Link>
                <Link to="/add-product" className="flex items-center bg-white text-slate-900 px-4 py-2 rounded-full font-bold shadow hover:bg-gray-100 transition">
                   <Plus className="w-5 h-5 mr-1" /> SELL
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-slate-800 pb-4">
            <div className="px-4 pt-2 pb-4 space-y-1">
                 {/* Mobile Search */}
                 <div className="mb-4 relative">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full h-10 pl-3 pr-10 rounded-md bg-slate-900 border border-slate-700 text-white"
                    />
                    <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                 </div>

                {currentUser ? (
                    <>
                        <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-slate-700">
                            <div className="flex items-center">
                                <img src={userProfile?.profileImage || "https://picsum.photos/40/40"} className="w-6 h-6 rounded-full mr-2 object-cover"/>
                                My Profile
                            </div>
                        </Link>
                        <Link to="/profile/my-products" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-slate-700">My Ads</Link>
                        <Link to="/add-product" className="block px-3 py-2 rounded-md text-base font-medium text-teal-400 hover:bg-slate-700">Start Selling</Link>
                        <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-slate-700">Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-slate-700">Login / Register</Link>
                        <Link to="/add-product" className="block px-3 py-2 rounded-md text-base font-medium text-teal-400 hover:bg-slate-700">Start Selling</Link>
                    </>
                )}
            </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;