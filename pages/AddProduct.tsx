import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { Category } from '../types';
import { Camera, X, AlertCircle } from 'lucide-react';

const AddProduct: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<string>('');
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // Car Specific States
  const [kmDriven, setKmDriven] = useState('');
  const [year, setYear] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [transmission, setTransmission] = useState('');

  // Property Specific States
  const [propertyType, setPropertyType] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [furnished, setFurnished] = useState('');
  const [area, setArea] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (images.length + selectedFiles.length > 5) {
        setError('Maximum 5 images allowed');
        return;
      }
      setImages((prev) => [...prev, ...selectedFiles]);
      
      const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
      setError('');
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (images.length === 0) {
        setError('Please upload at least one image');
        return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Upload Images
      const imageUrls: string[] = [];
      
      for (const image of images) {
        const storageRef = ref(storage, `products/${currentUser.uid}/${Date.now()}_${image.name}`);
        const uploadTask = await uploadBytesResumable(storageRef, image);
        const downloadURL = await getDownloadURL(uploadTask.ref);
        imageUrls.push(downloadURL);
      }

      // 2. Prepare Data
      const productData: any = {
        title,
        description,
        price: parseFloat(price),
        category,
        images: imageUrls,
        owner: currentUser.uid,
        createdAt: serverTimestamp(),
      };

      // Add category specific data
      if (category === Category.Cars) {
        if (kmDriven) productData.kmDriven = parseInt(kmDriven);
        if (year) productData.year = parseInt(year);
        if (fuelType) productData.fuelType = fuelType;
        if (transmission) productData.transmission = transmission;
      } else if (category === Category.Properties) {
        if (propertyType) productData.propertyType = propertyType;
        if (bedrooms) productData.bedrooms = parseInt(bedrooms);
        if (bathrooms) productData.bathrooms = parseInt(bathrooms);
        if (furnished) productData.furnished = furnished;
        if (area) productData.area = parseInt(area);
      }

      // 3. Add to Firestore
      await addDoc(collection(db, 'products'), productData);

      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Failed to create listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="border-b border-gray-200 p-4">
            <h1 className="text-xl font-bold text-center text-slate-800">POST YOUR AD</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded flex items-center text-sm">
                <AlertCircle className="w-4 h-4 mr-2" />
                {error}
            </div>
          )}

          {/* Category Selection */}
          <div>
             <h2 className="text-lg font-bold mb-4 text-slate-900 border-b border-gray-100 pb-2">Category</h2>
             <select
                required
                className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:border-teal-500 bg-white"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
             >
                <option value="">Select Category</option>
                {Object.values(Category).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
             </select>
          </div>

          {/* Common Details */}
          <div>
            <h2 className="text-lg font-bold mb-4 text-slate-900 border-b border-gray-100 pb-2">Include some details</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Ad Title *</label>
                    <input
                        type="text"
                        required
                        maxLength={70}
                        className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:border-teal-500"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Mention the key features of your item"
                    />
                     <div className="text-xs text-gray-400 text-right mt-1">{title.length} / 70</div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Description *</label>
                    <textarea
                        required
                        rows={4}
                        className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:border-teal-500"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Include condition, features and reason for selling"
                    />
                </div>
            </div>
          </div>

          {/* CARS SPECIFIC FIELDS */}
          {category === Category.Cars && (
             <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                <h2 className="text-md font-bold mb-3 text-slate-800">Car Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Year</label>
                        <input
                            type="number"
                            className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:border-teal-500"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            placeholder="Ex. 2018"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">KM Driven</label>
                        <input
                            type="number"
                            className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:border-teal-500"
                            value={kmDriven}
                            onChange={(e) => setKmDriven(e.target.value)}
                            placeholder="Ex. 50000"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Fuel Type</label>
                        <select
                            className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:border-teal-500 bg-white"
                            value={fuelType}
                            onChange={(e) => setFuelType(e.target.value)}
                        >
                            <option value="">Select</option>
                            <option value="Petrol">Petrol</option>
                            <option value="Diesel">Diesel</option>
                            <option value="CNG">CNG</option>
                            <option value="Electric">Electric</option>
                            <option value="LPG">LPG</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Transmission</label>
                        <select
                            className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:border-teal-500 bg-white"
                            value={transmission}
                            onChange={(e) => setTransmission(e.target.value)}
                        >
                            <option value="">Select</option>
                            <option value="Manual">Manual</option>
                            <option value="Automatic">Automatic</option>
                        </select>
                    </div>
                </div>
             </div>
          )}

          {/* PROPERTIES SPECIFIC FIELDS */}
          {category === Category.Properties && (
             <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                <h2 className="text-md font-bold mb-3 text-slate-800">Property Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Type</label>
                        <select
                            className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:border-teal-500 bg-white"
                            value={propertyType}
                            onChange={(e) => setPropertyType(e.target.value)}
                        >
                            <option value="">Select</option>
                            <option value="Apartment">Apartment</option>
                            <option value="House">House/Villa</option>
                            <option value="Plot">Plot</option>
                            <option value="Office">Office</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Carpet Area (ft²)</label>
                        <input
                            type="number"
                            className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:border-teal-500"
                            value={area}
                            onChange={(e) => setArea(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Bedrooms</label>
                        <input
                            type="number"
                            className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:border-teal-500"
                            value={bedrooms}
                            onChange={(e) => setBedrooms(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Bathrooms</label>
                        <input
                            type="number"
                            className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:border-teal-500"
                            value={bathrooms}
                            onChange={(e) => setBathrooms(e.target.value)}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Furnished Status</label>
                        <select
                            className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:border-teal-500 bg-white"
                            value={furnished}
                            onChange={(e) => setFurnished(e.target.value)}
                        >
                            <option value="">Select</option>
                            <option value="Furnished">Furnished</option>
                            <option value="Semi-Furnished">Semi-Furnished</option>
                            <option value="Unfurnished">Unfurnished</option>
                        </select>
                    </div>
                </div>
             </div>
          )}

          {/* Price */}
          <div>
            <h2 className="text-lg font-bold mb-4 text-slate-900 border-b border-gray-100 pb-2">Set a price</h2>
             <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Price *</label>
                <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">₹</span>
                    <input
                        type="number"
                        required
                        min="0"
                        className="w-full border border-gray-300 rounded p-3 pl-8 focus:outline-none focus:border-teal-500"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                    />
                </div>
            </div>
          </div>

          {/* Images */}
          <div>
            <h2 className="text-lg font-bold mb-4 text-slate-900 border-b border-gray-100 pb-2">Upload up to 5 photos</h2>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                {previews.map((src, index) => (
                    <div key={index} className="relative aspect-square border rounded overflow-hidden group">
                        <img src={src} alt="preview" className="w-full h-full object-cover" />
                        <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                
                {images.length < 5 && (
                    <label className="border-2 border-dashed border-gray-300 rounded aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition">
                        <Camera className="w-8 h-8 text-teal-500 mb-2" />
                        <span className="text-xs text-gray-500">Add photo</span>
                        <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                    </label>
                )}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-900 hover:bg-teal-800 text-white font-bold py-3 rounded text-lg transition disabled:bg-gray-400"
            >
                {loading ? 'Posting...' : 'Post now'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddProduct;