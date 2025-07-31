export interface Recipe {
  _id?: string;
  title: string;
  description: string;
  category: string;
  preparationTime: number;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  layers: string[];
  instructions: string;
  image?: string;
  author?: string;
  createdAt?: Date;
}

export interface RecipeRequest {
  title: string;
  description: string;
  category: string;
  preparationTime: number;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  layers: string[];
  instructions: string;
}