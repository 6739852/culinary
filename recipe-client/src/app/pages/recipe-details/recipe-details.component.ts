import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { RecipeService } from '../../services/recipe.service';
import { AuthService } from '../../services/auth.service';
import { Recipe } from '../../models/recipe.model';
import { DurationPipe } from '../../shared/pipes/duration.pipe';
import { RepeatDirective } from '../../shared/directives/repeat.directive';

@Component({
  selector: 'app-recipe-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
    DurationPipe,
    RepeatDirective
  ],
  template: `
    @if (recipe) {
      <div class="recipe-details-container">
        <mat-card class="recipe-card">
          <mat-card-header>
            <mat-card-title>{{ recipe.title }}</mat-card-title>
            <mat-card-subtitle>קטגוריה: {{ recipe.category }}</mat-card-subtitle>
          </mat-card-header>
          
          <img mat-card-image [src]="recipe.image || '/assets/default-recipe.jpg'" [alt]="recipe.title">
          
          <mat-card-content>
            <div class="recipe-info">
              <div class="info-item">
                <mat-icon>schedule</mat-icon>
                <span>זמן הכנה: {{ recipe.preparationTime | duration }}</span>
              </div>
              
              <div class="info-item">
                <mat-icon>restaurant</mat-icon>
                <span>דרגת קושי: </span>
                <div class="stars">
                  <mat-icon *appRepeat="getDifficultyLevel()" class="star">star</mat-icon>
                </div>
              </div>
            </div>
            
            <div class="description">
              <h3>תיאור:</h3>
              <p>{{ recipe.description }}</p>
            </div>
            
            <div class="ingredients">
              <h3>
                <mat-icon>list</mat-icon>
                רכיבים:
              </h3>
              <ul>
                @for (ingredient of recipe.layers; track $index) {
                  <li>
                    <mat-icon class="ingredient-icon">fiber_manual_record</mat-icon>
                    {{ ingredient }}
                  </li>
                }
              </ul>
            </div>
            
            <div class="instructions">
              <h3>
                <mat-icon>description</mat-icon>
                אופן ההכנה:
              </h3>
              <div class="instruction-steps">
                @for (step of getInstructionSteps(); track $index) {
                  <div class="step">
                    <span class="step-number">{{ $index + 1 }}</span>
                    <span class="step-text">{{ step }}</span>
                  </div>
                }
              </div>
            </div>
          </mat-card-content>
          
          <mat-card-actions>
            @if (canEdit()) {
              <button mat-raised-button color="primary" (click)="editRecipe()">
                <mat-icon>edit</mat-icon>
                ערוך מתכון
              </button>
              
              <button mat-raised-button color="warn" (click)="deleteRecipe()">
                <mat-icon>delete</mat-icon>
                מחק מתכון
              </button>
            }
            
            <button mat-button (click)="goBack()">
              <mat-icon>arrow_back</mat-icon>
              חזור
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    } @else {
      <div class="loading">
        <p>טוען מתכון...</p>
      </div>
    }
  `,
  styles: [`
    .recipe-details-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .recipe-card {
      width: 100%;
    }
    
    .recipe-info {
      display: flex;
      gap: 2rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }
    
    .info-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .stars {
      display: flex;
    }
    
    .star {
      color: #ffd700;
      font-size: 20px;
    }
    
    .description, .ingredients, .instructions {
      margin-bottom: 2rem;
    }
    
    .description h3, .ingredients h3, .instructions h3 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      color: #1976d2;
    }
    
    .ingredients ul {
      list-style: none;
      padding: 0;
    }
    
    .ingredients li {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      padding: 0.5rem;
      background-color: #f5f5f5;
      border-radius: 4px;
    }
    
    .ingredient-icon {
      color: #4caf50;
      font-size: 12px;
    }
    
    .instruction-steps {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .step {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      background-color: #f5f5f5;
      border-radius: 4px;
      border-right: 4px solid #1976d2;
    }
    
    .step-number {
      background-color: #1976d2;
      color: white;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      flex-shrink: 0;
    }
    
    .step-text {
      flex: 1;
    }
    
    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 50vh;
    }
    
    @media (max-width: 768px) {
      .recipe-info {
        flex-direction: column;
        gap: 1rem;
      }
      
      .step {
        flex-direction: column;
        gap: 0.5rem;
      }
    }
  `]
})
export class RecipeDetailsComponent implements OnInit {
  recipe: Recipe | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private recipeService: RecipeService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadRecipe(id);
    }
  }

  loadRecipe(id: string) {
    this.recipeService.getRecipeById(id).subscribe({
      next: (recipe) => this.recipe = recipe,
      error: (err) => {
        console.error('Error loading recipe:', err);
        this.snackBar.open('שגיאה בטעינת המתכון', 'סגור', { duration: 3000 });
        this.router.navigate(['/recipes']);
      }
    });
  }

  getDifficultyLevel(): number {
    if (!this.recipe) return 1;
    switch (this.recipe.difficultyLevel) {
      case 'easy': return 1;
      case 'medium': return 2;
      case 'hard': return 3;
      default: return 1;
    }
  }

  getInstructionSteps(): string[] {
    if (!this.recipe?.instructions) return [];
    return this.recipe.instructions.split('\n').filter(step => step.trim());
  }

  canEdit(): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser && this.recipe && 
           (currentUser._id === this.recipe.author || currentUser.role === 'admin');
  }

  editRecipe() {
    if (this.recipe) {
      this.router.navigate(['/recipe-form', this.recipe._id]);
    }
  }

  deleteRecipe() {
    if (this.recipe && confirm('האם אתה בטוח שברצונך למחוק את המתכון?')) {
      this.recipeService.deleteRecipe(this.recipe._id!).subscribe({
        next: () => {
          this.snackBar.open('המתכון נמחק בהצלחה', 'סגור', { duration: 3000 });
          this.router.navigate(['/recipes']);
        },
        error: (err) => {
          console.error('Error deleting recipe:', err);
          this.snackBar.open('שגיאה במחיקת המתכון', 'סגור', { duration: 3000 });
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/recipes']);
  }
}