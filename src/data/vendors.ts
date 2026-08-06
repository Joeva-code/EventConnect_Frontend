export const categories = [
  "Decoration & Styling",
  "Catering & Cakes",
  "Venue & Space",
  "Music & Entertainment",
  "Photography & Video Editing",
  "Stage & Lighting",
] as const;

export type Category = (typeof categories)[number];

export type Vendor = {
  id: string;
  name: string;
  category: Category;
  location: string;
  rating: number;
  reviews: number;
  startingPrice: string;
  image: string;
};

export const vendors: Vendor[] = [
  {
    id: "aduke-decor-events",
    name: "Aduke Décor & Events",
    category: "Decoration & Styling",
    location: "Lagos",
    rating: 4.9,
    reviews: 214,
    startingPrice: "₦150,000",
    image:
      "https://images.unsplash.com/photo-1649677874593-a04cb075c7a0?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "coral-gold-bridal-styling",
    name: "Coral & Gold Bridal Styling",
    category: "Decoration & Styling",
    location: "Benin City",
    rating: 4.8,
    reviews: 96,
    startingPrice: "₦180,000",
    image:
      "https://images.unsplash.com/photo-1618999114008-fbf937170cdb?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "jollof-and-co-catering",
    name: "Jollof & Co. Catering",
    category: "Catering & Cakes",
    location: "Lagos",
    rating: 4.9,
    reviews: 302,
    startingPrice: "₦8,500 / plate",
    image:
      "https://images.unsplash.com/photo-1763048443535-1243379234e2?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "amakas-kitchen",
    name: "Amaka's Kitchen",
    category: "Catering & Cakes",
    location: "Port Harcourt",
    rating: 4.7,
    reviews: 158,
    startingPrice: "₦7,000 / plate",
    image:
      "https://images.unsplash.com/photo-1638436684761-7e59f8a9072f?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "the-grand-marquee",
    name: "The Grand Marquee",
    category: "Venue & Space",
    location: "Abuja",
    rating: 4.8,
    reviews: 121,
    startingPrice: "₦2,000,000",
    image:
      "https://images.unsplash.com/photo-1738860283475-c7590c92eae8?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "regal-events-center",
    name: "Regal Events Center",
    category: "Venue & Space",
    location: "Lagos",
    rating: 4.9,
    reviews: 187,
    startingPrice: "₦2,500,000",
    image:
      "https://images.unsplash.com/photo-1551381891-678fe677d619?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "rhythm-nation-band",
    name: "Rhythm Nation Band",
    category: "Music & Entertainment",
    location: "Lagos",
    rating: 4.8,
    reviews: 143,
    startingPrice: "₦400,000",
    image:
      "https://images.unsplash.com/photo-1689152496387-7c91e1ad129e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "frame-and-focus-photography",
    name: "Frame & Focus Photography",
    category: "Photography & Video Editing",
    location: "Lagos",
    rating: 5.0,
    reviews: 267,
    startingPrice: "₦250,000",
    image:
      "https://images.unsplash.com/photo-1661332306744-70f9ed1a7f40?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "golden-hour-films",
    name: "Golden Hour Films",
    category: "Photography & Video Editing",
    location: "Abuja",
    rating: 4.7,
    reviews: 89,
    startingPrice: "₦300,000",
    image:
      "https://images.unsplash.com/photo-1739526169714-10141479601d?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "luminous-stage-co",
    name: "Luminous Stage Co.",
    category: "Stage & Lighting",
    location: "Lagos",
    rating: 4.8,
    reviews: 112,
    startingPrice: "₦350,000",
    image:
      "https://images.unsplash.com/photo-1649525663526-01467119a796?auto=format&fit=crop&w=800&q=80",
  },
];
