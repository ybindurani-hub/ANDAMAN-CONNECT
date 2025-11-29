export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  profileImage?: string;
}

export interface Product {
  id?: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  owner: string; // uid of the owner
  ownerName?: string; // Optional for display
  ownerImage?: string; // Optional for display
  createdAt: any; // Firestore Timestamp

  // Paid Features
  isBoosted?: boolean;
  boostedUntil?: any; // Firestore Timestamp

  // Car specific
  kmDriven?: number;
  year?: number;
  fuelType?: string; // Petrol, Diesel, CNG, Electric
  transmission?: string; // Manual, Automatic

  // Property specific
  propertyType?: string; // Apartment, House, Plot, Commercial
  bedrooms?: number;
  bathrooms?: number;
  furnished?: string; // Furnished, Semi-furnished, Unfurnished
  area?: number; // sq ft
}

export enum Category {
  Cars = 'Cars',
  Properties = 'Properties',
  Mobiles = 'Mobiles',
  Bikes = 'Bikes',
  Electronics = 'Electronics',
  Furniture = 'Furniture',
  Fashion = 'Fashion',
  Other = 'Other',
}