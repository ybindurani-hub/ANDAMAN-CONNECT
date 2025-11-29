import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Camera, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState(userProfile?.name || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [newImage, setNewImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    setMessage('');

    try {
      let photoURL = userProfile?.profileImage;

      // 1. Upload new image if selected
      if (newImage) {
        const storageRef = ref(storage, `users/${currentUser.uid}/profile_${Date.now()}`);
        await uploadBytes(storageRef, newImage);
        photoURL = await getDownloadURL(storageRef);
      }

      // 2. Update Auth Profile
      await updateProfile(currentUser, {
        displayName: name,
        photoURL: photoURL
      });

      // 3. Update Firestore Document
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        name: name,
        profileImage: photoURL
      });

      setMessage('Profile updated successfully!');
      // Force reload or state update would happen via AuthContext listener
      setTimeout(() => window.location.reload(), 1000); 

    } catch (error) {
      console.error(error);
      setMessage('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-slate-900 h-32 relative"></div>
        
        <div className="px-8 pb-8">
            <div className="relative -mt-16 mb-6 flex justify-between items-end">
                <div className="relative">
                    <img 
                        src={preview || userProfile?.profileImage || "https://picsum.photos/100/100"} 
                        alt="Profile" 
                        className="w-32 h-32 rounded-full border-4 border-white object-cover bg-white"
                    />
                    <label className="absolute bottom-0 right-0 bg-teal-500 text-white p-2 rounded-full cursor-pointer hover:bg-teal-600 transition shadow">
                        <Camera className="w-4 h-4" />
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                </div>
            </div>

            <h1 className="text-2xl font-bold text-slate-800 mb-6">Edit Profile</h1>

            {message && (
                <div className={`p-4 mb-4 rounded ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="John Doe"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        type="email"
                        value={userProfile?.email || ''}
                        disabled
                        className="w-full border border-gray-300 rounded-md p-2.5 bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;