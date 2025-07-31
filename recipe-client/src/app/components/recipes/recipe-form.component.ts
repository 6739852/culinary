import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { CategoryService } from '../../services/category.service';
import { Recipe } from '../../models/recipe.model';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-recipe-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="recipe-form-container">
      <div class="form-header">
        <h1>{{ isEditMode ? 'Edit Recipe' : 'Add New Recipe' }}</h1>
        <p>{{ isEditMode ? 'Update your recipe details' : 'Share your amazing recipe with the community' }}</p>
      </div>
      
      <form [formGroup]="recipeForm" (ngSubmit)="onSubmit()" class="recipe-form">
        <div class="form-row">
          <div class="form-group">
            <label for="title">Recipe Title *</label>
            <input type="text" id="title" formControlName="title" class="form-control">
            <div *ngIf="recipeForm.get('title')?.invalid && recipeForm.get('title')?.touched" class="error">
              Title is required
            </div>
          </div>
          
          <div class="form-group">
            <label for="category">Category *</label>
            <select id="category" formControlName="category" class="form-control">
              <option value="">Select a category</option>
              <option *ngFor="let category of categories" [value]="category.name">
                {{ category.name }}
              </option>
            </select>
            <div *ngIf="recipeForm.get('category')?.invalid && recipeForm.get('category')?.touched" class="error">
              Category is required
            </div>
          </div>
        </div>
        
        <div class="form-group">
          <label for="description">Description *</label>
          <textarea id="description" formControlName="description" class="form-control" rows="3"></textarea>
          <div *ngIf="recipeForm.get('description')?.invalid && recipeForm.get('description')?.touched" class="error">
            Description is required
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="preparationTime">Preparation Time (minutes) *</label>
            <input type="number" id="preparationTime" formControlName="preparationTime" class="form-control" min="1">
            <div *ngIf="recipeForm.get('preparationTime')?.invalid && recipeForm.get('preparationTime')?.touched" class="error">
              Preparation time is required and must be positive
            </div>
          </div>
          
          <div class="form-group">
            <label for="difficultyLevel">Difficulty Level *</label>
            <select id="difficultyLevel" formControlName="difficultyLevel" class="form-control">
              <option value="">Select difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <div *ngIf="recipeForm.get('difficultyLevel')?.invalid && recipeForm.get('difficultyLevel')?.touched" class="error">
              Difficulty level is required
            </div>
          </div>
        </div>
        
        <div class="form-group">
          <label>Ingredients *</label>
          <div formArrayName="layers" class="ingredients-list">
            <div *ngFor="let layer of layers.controls; let i = index" class="ingredient-item">
              <input [formControlName]="i" class="form-control" placeholder="Enter ingredient">
              <button type="button" (click)="removeLayer(i)" class="btn btn-remove">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
          <button type="button" (click)="addLayer()" class="btn btn-outline">
            <i class="bi bi-plus"></i> Add Ingredient
          </button>
          <div *ngIf="layers.length === 0" class="error">
            At least one ingredient is required
          </div>
        </div>
        
        <div class="form-group">
          <label for="instructions">Instructions *</label>
          <textarea id="instructions" formControlName="instructions" class="form-control" rows="6" 
                    placeholder="Describe the cooking steps in detail..."></textarea>
          <div *ngIf="recipeForm.get('instructions')?.invalid && recipeForm.get('instructions')?.touched" class="error">
            Instructions are required
          </div>
        </div>
        
        <div class="form-group">
          <label for="image">Recipe Image</label>
          <input type="file" id="image" (change)="onImageSelect($event)" accept="image/*" class="form-control">
          <div *ngIf="selectedImage" class="image-preview">
            <img [src]="imagePreview" alt="Preview">
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" (click)="goBack()" class="btn btn-outline">
            <i class="bi bi-arrow-left"></i> Cancel
          </button>
          <button type="submit" [disabled]="recipeForm.invalid || loading" class="btn btn-primary">
            <i class="bi bi-check-circle"></i>
            {{ loading ? 'Saving...' : (isEditMode ? 'Update Recipe' : 'Create Recipe') }}
          </button>
        </div>
        
        <div *ngIf="error" class="error">{{ error }}</div>
      </form>
    </div>
  `,
  styles: [`
    .recipe-form-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }
    
    .form-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .form-header h1 {
      color: #333;
      margin-bottom: 0.5rem;
    }
    
    .form-header p {
      color: #666;
      font-size: 1.1rem;
    }
    
    .recipe-form {
      background: white;
      padding: 2rem;
      border-radius: 15px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    
    .form-group {
      margin-bottom: 1.5rem;
    }
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #333;
    }
    
    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }
    
    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
    }
    
    .ingredients-list {
      margin-bottom: 1rem;
    }
    
    .ingredient-item {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      align-items: center;
    }
    
    .ingredient-item .form-control {
      flex: 1;
    }
    
    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s;
      font-weight: 500;
      text-decoration: none;
    }
    
    .btn-primary {
      background: #667eea;
      color: white;
    }
    
    .btn-primary:hover:not(:disabled) {
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
    
    .btn-remove {
      background: #dc3545;
      color: white;
      padding: 0.5rem;
    }
    
    .btn-remove:hover {
      background: #c82333;
    }
    
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 2rem;
    }
    
    .error {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }
    
    .image-preview {
      margin-top: 1rem;
    }
    
    .image-preview img {
      max-width: 200px;
      max-height: 200px;
      border-radius: 5px;
      object-fit: cover;
    }
    
    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }
      
      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class RecipeFormComponent implements OnInit {
  recipeForm: FormGroup;
  categories: Category[] = [];
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  loading = false;
  error = '';
  isEditMode = false;
  recipeId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private recipeService: RecipeService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.recipeForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      preparationTime: ['', [Validators.required, Validators.min(1)]],
      difficultyLevel: ['', Validators.required],
      layers: this.fb.array([]),
      instructions: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadCategories();
    this.recipeId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.recipeId;
    
    if (this.isEditMode && this.recipeId) {
      this.loadRecipe(this.recipeId);
    } else {
      this.addLayer(); // Add one empty ingredient field
    }
  }

  get layers() {
    return this.recipeForm.get('layers') as FormArray;
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (categories) => this.categories = categories,
      error: (err) => console.error('Error loading categories:', err)
    });
  }

  loadRecipe(id: string) {
    this.recipeService.getRecipeById(id).subscribe({
      next: (recipe) => {
        this.recipeForm.patchValue({
          title: recipe.title,
          description: recipe.description,
          category: recipe.category,
          preparationTime: recipe.preparationTime,
          difficultyLevel: recipe.difficultyLevel,
          instructions: recipe.instructions
        });
        
        // Load ingredients
        recipe.layers.forEach(layer => {
          this.layers.push(this.fb.control(layer));
        });
      },
      error: (err) => {
        console.error('Error loading recipe:', err);
        this.router.navigate(['/recipes']);
      }
    });
  }

  addLayer() {
    this.layers.push(this.fb.control(''));
  }

  removeLayer(index: number) {
    this.layers.removeAt(index);
  }

  onImageSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.recipeForm.valid && this.layers.length > 0) {
      this.loading = true;
      this.error = '';
      
      const recipeData = {
        ...this.recipeForm.value,
        layers: this.layers.value.filter((layer: string) => layer.trim())
      };
      
      const operation = this.isEditMode 
        ? this.recipeService.updateRecipe(this.recipeId!, recipeData)
        : this.recipeService.createRecipe(recipeData);
      
      operation.subscribe({
        next: (recipe) => {
          if (this.selectedImage) {
            this.uploadImage(recipe._id!);
          } else {
            this.router.navigate(['/recipe', recipe._id]);
          }
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to save recipe';
          this.loading = false;
        }
      });
    }
  }

  uploadImage(recipeId: string) {
    if (this.selectedImage) {
      this.recipeService.uploadImage(this.selectedImage).subscribe({
        next: () => {
          this.router.navigate(['/recipe', recipeId]);
        },
        error: (err) => {
          console.error('Error uploading image:', err);
          this.router.navigate(['/recipe', recipeId]);
        }
      });
    }
  }

  goBack() {
    if (this.isEditMode && this.recipeId) {
      this.router.navigate(['/recipe', this.recipeId]);
    } else {
      this.router.navigate(['/recipes']);
    }
  }
}