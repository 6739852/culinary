import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { Recipe } from '../../models/recipe.model';

@Component({
  selector: 'app-my-recipes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="my-recipes-container">
      <div class="header">
        <h1>My Recipes</h1>
        <p>Manage your personal recipe collection</p>
        <a routerLink="/add-recipe" class="btn btn-primary">
          <i class="bi bi-plus-circle"></i> Add New Recipe
        </a>
      </div>
      
      <div class="recipes-grid" *ngIf="recipes.length > 0; else noRecipes">
        <div *ngFor="let recipe of recipes" class="recipe-card">
          <div class="recipe-image">
            <img [src]="recipe.image || '/assets/default-recipe.jpg'" [alt]="recipe.title">
            <div class="difficulty-badge" [class]="'difficulty-' + recipe.difficultyLevel">
              {{ recipe.difficultyLevel }}
            </div>
          </div>
          
          <div class="recipe-content">
            <h3>{{ recipe.title }}</h3>
            <p class="recipe-description">{{ recipe.description }}</p>
            
            <div class="recipe-meta">
              <span class="prep-time">
                <i class="bi bi-clock"></i>
                {{ recipe.preparationTime }} min
              </span>
              <span class="category">
                <i class="bi bi-tag"></i>
                {{ recipe.category }}
              </span>
            </div>
            
            <div class="recipe-actions">
              <a [routerLink]="['/recipe', recipe._id]" class="btn btn-outline">
                <i class="bi bi-eye"></i> View
              </a>
              <a [routerLink]="['/edit-recipe', recipe._id]" class="btn btn-primary">
                <i class="bi bi-pencil"></i> Edit
              </a>
              <button (click)="deleteRecipe(recipe)" class="btn btn-danger">
                <i class="bi bi-trash"></i> Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <ng-template #noRecipes>
        <div class="no-recipes">
          <i class="bi bi-journal-bookmark"></i>
          <h3>No recipes yet</h3>
          <p>Start sharing your amazing recipes with the community!</p>
          <a routerLink="/add-recipe" class="btn btn-primary">
            <i class="bi bi-plus-circle"></i> Create Your First Recipe
          </a>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .my-recipes-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }
    
    .header {
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .header h1 {
      color: #333;
      margin-bottom: 0.5rem;
    }
    
    .header p {
      color: #666;
      font-size: 1.1rem;
      margin-bottom: 1.5rem;
    }
    
    .recipes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 2rem;
    }
    
    .recipe-card {
      background: white;
      border-radius: 15px;
      overflow: hidden;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
      transition: transform 0.3s, box-shadow 0.3s;
    }
    
    .recipe-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    }
    
    .recipe-image {
      position: relative;
      height: 200px;
      overflow: hidden;
    }
    
    .recipe-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .difficulty-badge {
      position: absolute;
      top: 1rem;
      right: 1rem;
      padding: 0.25rem 0.75rem;
      border-radius: 15px;
      font-size: 0.875rem;
      font-weight: 500;
      text-transform: capitalize;
    }
    
    .difficulty-easy { background: #28a745; color: white; }
    .difficulty-medium { background: #ffc107; color: #333; }
    .difficulty-hard { background: #dc3545; color: white; }
    
    .recipe-content {
      padding: 1.5rem;
    }
    
    .recipe-content h3 {
      margin-bottom: 0.5rem;
      color: #333;
    }
    
    .recipe-description {
      color: #666;
      margin-bottom: 1rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .recipe-meta {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      font-size: 0.875rem;
      color: #666;
    }
    
    .recipe-meta span {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    
    .recipe-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    
    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 5px;
      text-decoration: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s;
      font-size: 0.875rem;
      font-weight: 500;
    }
    
    .btn-primary {
      background: #667eea;
      color: white;
    }
    
    .btn-primary:hover {
      background: #5a6fd8;
    }
    
    .btn-outline {
      background: transparent;
      color: #667eea;
      border: 1px solid #667eea;
    }
    
    .btn-outline:hover {
      background: #667eea;
      color: white;
    }
    
    .btn-danger {
      background: #dc3545;
      color: white;
    }
    
    .btn-danger:hover {
      background: #c82333;
    }
    
    .no-recipes {
      text-align: center;
      padding: 3rem;
      color: #666;
    }
    
    .no-recipes i {
      font-size: 4rem;
      margin-bottom: 1rem;
      color: #667eea;
    }
    
    .no-recipes h3 {
      margin-bottom: 1rem;
      color: #333;
    }
    
    .no-recipes p {
      margin-bottom: 2rem;
      font-size: 1.1rem;
    }
  `]
})
export class MyRecipesComponent implements OnInit {
  recipes: Recipe[] = [];

  constructor(private recipeService: RecipeService) {}

  ngOnInit() {
    this.loadMyRecipes();
  }

  loadMyRecipes() {
    this.recipeService.getMyRecipes().subscribe({
      next: (recipes) => this.recipes = recipes,
      error: (err) => console.error('Error loading my recipes:', err)
    });
  }

  deleteRecipe(recipe: Recipe) {
    if (confirm(`Are you sure you want to delete "${recipe.title}"?`)) {
      this.recipeService.deleteRecipe(recipe._id!).subscribe({
        next: () => {
          this.recipes = this.recipes.filter(r => r._id !== recipe._id);
        },
        error: (err) => console.error('Error deleting recipe:', err)
      });
    }
  }
}