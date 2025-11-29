import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AddProduct from './pages/AddProduct';
import ProductDetail from './pages/ProductDetail';
import Profile from './pages/Profile';
import MyProducts from './pages/MyProducts';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/product/:id" element={<ProductDetail />} />

              {/* Protected Routes */}
              <Route
                path="/add-product"
                element={
                  <ProtectedRoute>
                    <AddProduct />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              {/* The prompt asked for /profile/edit, but Profile page handles both viewing and editing for simplicity.
                  We can map /profile/edit to the same component or a sub-component if needed. 
                  Here, /profile allows editing. */}
              <Route 
                path="/profile/edit" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route
                path="/profile/my-products"
                element={
                  <ProtectedRoute>
                    <MyProducts />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          
          <footer className="bg-slate-900 text-white py-8 mt-auto">
             <div className="max-w-7xl mx-auto px-4 text-center">
                 <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} Andaman Connect. All rights reserved.</p>
             </div>
          </footer>
        </div>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;