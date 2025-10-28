// Breeds data for veterinary system
export interface Breed {
  id: string;
  name: string;
  species: 'Canino' | 'Felino';
}

export const breeds: Breed[] = [
  // Canine breeds
  { id: 'labrador', name: 'Labrador Retriever', species: 'Canino' },
  { id: 'golden', name: 'Golden Retriever', species: 'Canino' },
  { id: 'german_shepherd', name: 'Pastor Alemán', species: 'Canino' },
  { id: 'bulldog', name: 'Bulldog Francés', species: 'Canino' },
  { id: 'poodle', name: 'Poodle', species: 'Canino' },
  { id: 'beagle', name: 'Beagle', species: 'Canino' },
  { id: 'rottweiler', name: 'Rottweiler', species: 'Canino' },
  { id: 'yorkshire', name: 'Yorkshire Terrier', species: 'Canino' },
  { id: 'chihuahua', name: 'Chihuahua', species: 'Canino' },
  { id: 'border_collie', name: 'Border Collie', species: 'Canino' },
  { id: 'siberian_husky', name: 'Husky Siberiano', species: 'Canino' },
  { id: 'boxer', name: 'Boxer', species: 'Canino' },
  { id: 'cocker_spaniel', name: 'Cocker Spaniel', species: 'Canino' },
  { id: 'dachshund', name: 'Teckel', species: 'Canino' },
  { id: 'mastiff', name: 'Mastín', species: 'Canino' },
  { id: 'akita', name: 'Akita', species: 'Canino' },
  { id: 'shih_tzu', name: 'Shih Tzu', species: 'Canino' },
  { id: 'maltese', name: 'Maltés', species: 'Canino' },
  { id: 'pug', name: 'Pug', species: 'Canino' },
  { id: 'mixed_dog', name: 'Mestizo', species: 'Canino' },

  // Feline breeds
  { id: 'persian', name: 'Persa', species: 'Felino' },
  { id: 'siamese', name: 'Siamés', species: 'Felino' },
  { id: 'maine_coon', name: 'Maine Coon', species: 'Felino' },
  { id: 'british_shorthair', name: 'British Shorthair', species: 'Felino' },
  { id: 'ragdoll', name: 'Ragdoll', species: 'Felino' },
  { id: 'bengal', name: 'Bengal', species: 'Felino' },
  { id: 'russian_blue', name: 'Azul Ruso', species: 'Felino' },
  { id: 'abyssinian', name: 'Abisinio', species: 'Felino' },
  { id: 'scottish_fold', name: 'Scottish Fold', species: 'Felino' },
  { id: 'norwegian_forest', name: 'Bosque de Noruega', species: 'Felino' },
  { id: 'sphynx', name: 'Sphynx', species: 'Felino' },
  { id: 'oriental', name: 'Oriental', species: 'Felino' },
  { id: 'birman', name: 'Birmano', species: 'Felino' },
  { id: 'domestic_shorthair', name: 'Pelo Corto Doméstico', species: 'Felino' },
  { id: 'domestic_longhair', name: 'Pelo Largo Doméstico', species: 'Felino' },
  { id: 'mixed_cat', name: 'Mestizo', species: 'Felino' }
];

export const getBreedsBySpecies = (species: 'Canino' | 'Felino'): Breed[] => {
  return breeds.filter(breed => breed.species === species);
};

export const getBreedById = (id: string): Breed | undefined => {
  return breeds.find(breed => breed.id === id);
};