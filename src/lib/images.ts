export const FALLBACK_VENDOR_IMAGE =
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80";

export const FALLBACK_AVATAR_IMAGE =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80";

export const CATEGORY_IMAGES: Record<string, string[]> = {
  "Decoration & Styling": [
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1527529482837-469817a48964?auto=format&fit=crop&w=800&q=80",
  ],
  "Catering & Cakes": [
    "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1565958011706-db5d0f1e896e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1571875250189-6b0d5e47e6cf?auto=format&fit=crop&w=800&q=80",
  ],
  "Venue & Space": [
    "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1478146059778-26028b07395a?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=800&q=80",
  ],
  "Music & Entertainment": [
    "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1429962714451-b413934b9157?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&w=800&q=80",
  ],
  "Photography & Video Editing": [
    "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc9b?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?auto=format&fit=crop&w=800&q=80",
  ],
  "Stage & Lighting": [
    "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1514525253440-b393452e8d26?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1429962714451-b413934b9157?auto=format&fit=crop&w=800&q=80",
  ],
};

export const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1527529482837-469817a48964?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1478146059778-26028b07395a?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80",
];

export const EVENT_TYPE_IMAGES: Record<string, string> = {
  Wedding: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80",
  Birthday: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80",
  "Naming Ceremony": "https://images.unsplash.com/photo-1519689680058-324335eb6361?auto=format&fit=crop&w=800&q=80",
  Conference: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&w=800&q=80",
  "Book Launch": "https://images.unsplash.com/photo-1524995997946-a1c2e315a2f8?auto=format&fit=crop&w=800&q=80",
  Graduation: "https://images.unsplash.com/photo-1523050854058-8df90110a5f1?auto=format&fit=crop&w=800&q=80",
  "Corporate Event": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
};

export function pickImageForCategory(category: string, id: string): string {
  const pool = CATEGORY_IMAGES[category] || FALLBACK_IMAGES;
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return pool[Math.abs(hash) % pool.length];
}
