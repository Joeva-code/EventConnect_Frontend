export const categories = [
  "Decoration & Styling",
  "Catering & Cakes",
  "Venue & Space",
  "Music & Entertainment",
  "Photography & Video Editing",
  "Stage & Lighting",
] as const;

export type Category = (typeof categories)[number];

// This is a UI shape only. Vendor records are always fetched from the backend.
export type Vendor = {
  id: string;
  name: string;
  category: string;
  location: string;
  rating: number;
  reviews: number;
  startingPrice: string;
  image: string;
  description: string;
  isPublished: boolean;
};
