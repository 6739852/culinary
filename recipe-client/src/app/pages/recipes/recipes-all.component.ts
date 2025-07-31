import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RecipeService } from '../../services/recipe.service';
import { CategoryService } from '../../services/category.service';
import { AuthService } from '../../services/auth.service';
import { Recipe } from '../../models/recipe.model';
import { Category } from '../../models/category.model';
import { RecipeCardComponent } from '../../components/recipes/recipe-card.component';

@Component({
  selector: 'app-recipes-all',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatGridListModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    RecipeCardComponent
  ],
  template: `
    <div class="recipes-container">
      <h1>כל המתכונים</h1>
      
      <div class="filters">
        <mat-form-field appearance="outline">
          <mat-label>חיפוש לפי שם</mat-label>
          <input matInput [(ngModel)]="searchTerm" (input)="onSearch()">
        </mat-form-field>
        
        <mat-form-field appearance="outline">
          <mat-label>קטגוריה</mat-label>
          <mat-select [(ngModel)]="selectedCategory" (selectionChange)="onCategoryChange()">
            <mat-option value="">כל הקטגוריות</mat-option>
            @for (category of categories; track category._id) {
              <mat-option [value]="category.name">{{ category.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        
        <mat-form-field appearance="outline">
          <mat-label>זמן הכנה מקסימלי (דקות)</mat-label>
          <mat-select [(ngModel)]="maxPrepTime" (selectionChange)="onPrepTimeChange()">
            <mat-option value="">כל הזמנים</mat-option>
            <mat-option value="15">15 דקות</mat-option>
            <mat-option value="30">30 דקות</mat-option>
            <mat-option value="60">שעה</mat-option>
            <mat-option value="120">שעתיים</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
      
      @if (loading) {
        <div class="loading">
          <mat-spinner></mat-spinner>
        </div>
      } @else {
        <mat-grid-list [cols]="getColumns()" rowHeight="400px" gutterSize="16px">
          @for (recipe of recipes; track recipe._id) {
            <mat-grid-tile>
              <app-recipe-card 
                [recipe]="recipe" 
                (viewDetails)="onViewDetails($event)">
              </app-recipe-card>
            </mat-grid-tile>
          }
        </mat-grid-list>
        
        @if (totalRecipes > pageSize) {
          <mat-paginator 
            [length]="totalRecipes"
            [pageSize]="pageSize"
            [pageSizeOptions]="[6, 12, 24]"
            (page)="onPageChange($event)">
          </mat-paginator>
        }
      }
    </div>
  `,
  styles: [`
    .recipes-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    h1 {
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }
    
    .filters mat-form-field {
      min-width: 200px;
    }
    
    .loading {
      display: flex;
      justify-content: center;
      padding: 2rem;
    }
    
    @media (max-width: 768px) {
      .filters {
        flex-direction: column;
      }
      
      .filters mat-form-field {
        width: 100%;
      }
    }
  `]
})
export class RecipesAllComponent implements OnInit {
  recipes: Recipe[] = [];
  categories: Category[] = [];
  searchTerm = '';
  selectedCategory = '';
  maxPrepTime = '';
  loading = false;
  
  // Pagination
  currentPage = 0;
  pageSize = 6;
  totalRecipes = 0;

  constructor(
    private recipeService: RecipeService,
    private categoryService: CategoryService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.loadRecipes();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (categories) => this.categories = categories,
      error: (err) => console.error('Error loading categories:', err)
    });
  }

  loadRecipes() {
    this.loading = true;
    const params = {
      search: this.searchTerm,
      page: this.currentPage + 1,
      limit: this.pageSize
    };

    this.recipeService.getRecipes(params.search, params.limit, params.page).subscribe({
      next: (response: any) => {
        this.recipes = Array.isArray(response) ? response : response.recipes || [];
        this.totalRecipes = response.total || this.recipes.length;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading recipes:', err);
        this.loading = false;
      }
    });
  }

  onSearch() {
    this.currentPage = 0;
    this.loadRecipes();
  }

  onCategoryChange() {
    this.currentPage = 0;
    if (this.selectedCategory) {
      this.loading = true;
      this.recipeService.getRecipesByCategory(this.selectedCategory).subscribe({
        next: (recipes) => {
          this.recipes = recipes;
          this.totalRecipes = recipes.length;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error filtering by category:', err);
          this.loading = false;
        }
      });
    } else {
      this.loadRecipes();
    }
  }

  onPrepTimeChange() {
    this.currentPage = 0;
    if (this.maxPrepTime) {
      this.loading = true;
      this.recipeService.getRecipesByPrepTime(+this.maxPrepTime).subscribe({
        next: (recipes) => {
          this.recipes = recipes;
          this.totalRecipes = recipes.length;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error filtering by prep time:', err);
          this.loading = false;
        }
      });
    } else {
      this.loadRecipes();
    }
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadRecipes();
  }

  onViewDetails(recipe: Recipe) {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/recipe-details', recipe._id]);
    } else {
      this.router.navigate(['/login']);
    }
  }

  getColumns(): number {
    const width = window.innerWidth;
    if (width < 600) return 1;
    if (width < 960) return 2;
    return 3;
  }
}