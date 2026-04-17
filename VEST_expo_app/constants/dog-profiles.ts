export type DogProfile = {
  id: number;
  name: string;
  breed: string;
  age: string;
  image: string;
};

export const DOG_PROFILES: readonly DogProfile[] = [
  {
    id: 1,
    name: 'Max',
    breed: 'Golden Retriever',
    age: '3 yrs',
    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&h=200&fit=crop',
  },
  {
    id: 2,
    name: 'Bella',
    breed: 'French Bulldog',
    age: '5 yrs',
    image: 'https://images.unsplash.com/photo-1648817931653-6cf0ccfbfab0?w=200&h=200&fit=crop',
  },
  {
    id: 3,
    name: 'Charlie',
    breed: 'Corgi',
    age: '2 yrs',
    image: 'https://images.unsplash.com/photo-1655930251344-c2a67323dac1?w=200&h=200&fit=crop',
  },
];