import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { AuthService } from '../../services/auth.service';
import { Recipe } from '../../models/recipe.model';

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="recipe-detail-container" *ngIf="recipe">
      <div class="recipe-header">
        <div class="recipe-image">
          <img [src]="recipe.image || '/assets/default-recipe.jpg'" [alt]="recipe.title">
          <div class="difficulty-badge" [class]="'difficulty-' + recipe.difficultyLevel">
            {{ recipe.difficultyLevel }}
          </div>
        </div>
        
        <div class="recipe-info">
          <h1>{{ recipe.title }}</h1>
          <p class="recipe-description">{{ recipe.description }}</p>
          
          <div class="recipe-meta">
            <div class="meta-item">
              <i class="bi bi-clock"></i>
              <span>{{ recipe.preparationTime }} minutes</span>
            </div>
            <div class="meta-item">
              <i class="bi bi-tag"></i>
              <span>{{ recipe.category }}</span>
            </div>
            <div class="meta-item">
              <i class="bi bi-person"></i>
              <span>{{ recipe.author || 'Unknown' }}</span>
            </div>
          </div>
          
          <div class="recipe-actions" *ngIf="canEdit">
            <a [routerLink]="['/edit-recipe', recipe._id]" class="btn btn-primary">
              <i class="bi bi-pencil"></i> Edit Recipe
            </a>
            <button (click)="deleteRecipe()" class="btn btn-danger">
              <i class="bi bi-trash"></i> Delete Recipe
            </button>
          </div>
        </div>
      </div>
      
      <div class="recipe-content">
        <div class="ingredients-section">
          <h2><i class="bi bi-list-ul"></i> Ingredients</h2>
          <ul class="ingredients-list">
            <li *ngFor="let layer of recipe.layers">{{ layer }}</li>
          </ul>
        </div>
        
        <div class="instructions-section">
          <h2><i class="bi bi-journal-text"></i> Instructions</h2>
          <div class="instructions-content">{{ recipe.instructions }}</div>
        </div>
      </div>
      
      <div class="back-button">
        <a routerLink="/recipes" class="btn btn-outline">
          <i class="bi bi-arrow-left"></i> Back to Recipes
        </a>
      </div>
    </div>
    
    <div class="loading" *ngIf="!recipe">
      <i class="bi bi-hourglass-split"></i>
      <p>Loading recipe...</p>
    </div>
  `,
  styles: [`
    .recipe-detail-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }
    
    .recipe-header {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-bottom: 2rem;
      background: white;
      border-radius: 15px;
      overflow: hidden;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    
    .recipe-image {
      position: relative;
      height: 400px;
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
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: 500;
      text-transform: capitalize;
    }
    
    .difficulty-easy { background: #28a745; color: white; }
    .difficulty-medium { background: #ffc107; color: #333; }
    .difficulty-hard { background: #dc3545; color: white; }
    
    .recipe-info {
      padding: 2rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    
    .recipe-info h1 {
      color: #333;
      margin-bottom: 1rem;
      font-size: 2rem;
    }
    
    .recipe-description {
      color: #666;
      font-size: 1.1rem;
      line-height: 1.6;
      margin-bottom: 2rem;
    }
    
    .recipe-meta {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    
    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #666;
    }
    
    .meta-item i {
      color: #667eea;
      width: 20px;
    }
    
    .recipe-actions {
      display: flex;
      gap: 1rem;
    }
    
    .recipe-content {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }
    
    .ingredients-section,
    .instructions-section {
      background: white;
      padding: 2rem;
      border-radius: 15px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    
    .ingredients-section h2,
    .instructions-section h2 {
      color: #333;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .ingredients-list {
      list-style: none;
      padding: 0;
    }
    
    .ingredients-list li {
      padding: 0.75rem 0;
      border-bottom: 1px solid #eee;
      position: relative;
      padding-left: 1.5rem;
    }
    
    .ingredients-list li:before {
      content: '•';
      color: #667eea;
      font-weight: bold;
      position: absolute;
      left: 0;
    }
    
    .ingredients-list li:last-child {
      border-bottom: none;
    }
    
    .instructions-content {
      line-height: 1.8;
      color: #333;
      white-space: pre-wrap;
    }
    
    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 5px;
      text-decoration: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s;
      font-weight: 500;
    }
    
    .btn-primary {
      background: #667eea;
      color: white;
    }
    
    .btn-primary:hover {
      background: #5a6fd8;
    }
    
    .btn-danger {
      background: #dc3545;
      color: white;
    }
    
    .btn-danger:hover {
      background: #c82333;
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
    
    .back-button {
      text-align: center;
    }
    
    .loading {
      text-align: center;
      padding: 3rem;
      color: #666;
    }
    
    .loading i {
      font-size: 3rem;
      margin-bottom: 1rem;
      animation: spin 2s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @media (max-width: 768px) {
      .recipe-header {
        grid-template-columns: 1fr;
      }
      
      .recipe-content {
        grid-template-columns: 1fr;
      }
      
      .recipe-actions {
        flex-direction: column;
      }
    }
  `]
})
export class RecipeDetailComponent implements OnInit {
  recipe: Recipe | null = null;
  canEdit = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private recipeService: RecipeService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadRecipe(id);
    }
  }

  loadRecipe(id: string) {
    this.recipeService.getRecipeById(id).subscribe({
      next: (recipe) => {
        this.recipe = recipe;
        this.checkEditPermission();
      },
      error: (err) => {
        console.error('Error loading recipe:', err);
        this.router.navigate(['/recipes']);
      }
    });
  }

  checkEditPermission() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && this.recipe) {
      this.canEdit = currentUser.role === 'admin' || currentUser._id === this.recipe.author;
    }
  }

  deleteRecipe() {
    if (this.recipe && confirm('Are you sure you want to delete this recipe?')) {
      this.recipeService.deleteRecipe(this.recipe._id!).subscribe({
        next: () => {
          this.router.navigate(['/recipes']);
        },
        error: (err) => console.error('Error deleting recipe:', err)
      });
    }
  }
}