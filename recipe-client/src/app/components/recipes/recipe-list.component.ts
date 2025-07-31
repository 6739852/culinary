import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RecipeService } from '../../services/recipe.service';
import { CategoryService } from '../../services/category.service';
import { Recipe } from '../../models/recipe.model';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="recipe-list-container">
      <div class="header">
        <h1>Discover Amazing Recipes</h1>
        <p>Find your next favorite dish from our collection</p>
      </div>
      
      <div class="filters">
        <div class="search-box">
          <i class="bi bi-search"></i>
          <input 
            type="text" 
            [(ngModel)]="searchTerm" 
            (input)="onSearch()" 
            placeholder="Search recipes..."
            class="search-input"
          >
        </div>
        
        <div class="filter-buttons">
          <button 
            (click)="filterByCategory('')" 
            [class.active]="selectedCategory === ''"
            class="filter-btn"
          >
            All
          </button>
          <button 
            *ngFor="let category of categories" 
            (click)="filterByCategory(category.name)"
            [class.active]="selectedCategory === category.name"
            class="filter-btn"
          >
            {{ category.name }}
          </button>
        </div>
        
        <div class="prep-time-filter">
          <label>Max prep time:</label>
          <select [(ngModel)]="maxPrepTime" (change)="onPrepTimeFilter()" class="prep-select">
            <option value="">Any</option>
            <option value="15">15 min</option>
            <option value="30">30 min</option>
            <option value="60">1 hour</option>
          </select>
        </div>
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
              <a [routerLink]="['/recipe', recipe._id]" class="btn btn-primary">
                <i class="bi bi-eye"></i> View Recipe
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <ng-template #noRecipes>
        <div class="no-recipes">
          <i class="bi bi-search"></i>
          <h3>No recipes found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .recipe-list-container {
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
    }
    
    .filters {
      background: white;
      padding: 1.5rem;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: center;
    }
    
    .search-box {
      position: relative;
      flex: 1;
      min-width: 250px;
    }
    
    .search-box i {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #666;
    }
    
    .search-input {
      width: 100%;
      padding: 0.75rem 1rem 0.75rem 2.5rem;
      border: 1px solid #ddd;
      border-radius: 25px;
      font-size: 1rem;
    }
    
    .filter-buttons {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    
    .filter-btn {
      padding: 0.5rem 1rem;
      border: 1px solid #ddd;
      background: white;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.3s;
    }
    
    .filter-btn:hover,
    .filter-btn.active {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }
    
    .prep-time-filter {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .prep-select {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 5px;
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
    }
    
    .btn-primary {
      background: #667eea;
      color: white;
    }
    
    .btn-primary:hover {
      background: #5a6fd8;
    }
    
    .no-recipes {
      text-align: center;
      padding: 3rem;
      color: #666;
    }
    
    .no-recipes i {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
  `]
})
export class RecipeListComponent implements OnInit {
  recipes: Recipe[] = [];
  categories: Category[] = [];
  searchTerm = '';
  selectedCategory = '';
  maxPrepTime = '';

  constructor(
    private recipeService: RecipeService,
    private categoryService: CategoryService
  ) {}

  ngOnInit() {
    this.loadRecipes();
    this.loadCategories();
  }

  loadRecipes() {
    this.recipeService.getRecipes(this.searchTerm).subscribe({
      next: (recipes) => this.recipes = recipes,
      error: (err) => console.error('Error loading recipes:', err)
    });
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (categories) => this.categories = categories,
      error: (err) => console.error('Error loading categories:', err)
    });
  }

  onSearch() {
    this.loadRecipes();
  }

  filterByCategory(categoryName: string) {
    this.selectedCategory = categoryName;
    if (categoryName) {
      this.recipeService.getRecipesByCategory(categoryName).subscribe({
        next: (recipes) => this.recipes = recipes,
        error: (err) => console.error('Error filtering by category:', err)
      });
    } else {
      this.loadRecipes();
    }
  }

  onPrepTimeFilter() {
    if (this.maxPrepTime) {
      this.recipeService.getRecipesByPrepTime(+this.maxPrepTime).subscribe({
        next: (recipes) => this.recipes = recipes,
        error: (err) => console.error('Error filtering by prep time:', err)
      });
    } else {
      this.loadRecipes();
    }
  }
}