import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Recipe } from '../../models/recipe.model';
import { RepeatDirective } from '../../shared/directives/repeat.directive';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, RepeatDirective],
  template: `
    <mat-card class="recipe-card">
      <mat-card-header>
        <mat-card-title>{{ recipe.title }}</mat-card-title>
      </mat-card-header>
      
      <img mat-card-image [src]="recipe.image || '/assets/default-recipe.jpg'" [alt]="recipe.title">
      
      <mat-card-content>
        <div class="recipe-info">
          <div class="prep-time">
            <mat-icon>schedule</mat-icon>
            <span>{{ recipe.preparationTime }} דק'</span>
          </div>
          
          <div class="difficulty">
            <span>קושי: </span>
            <div class="stars">
              <mat-icon *appRepeat="getDifficultyLevel()" class="star">star</mat-icon>
            </div>
          </div>
        </div>
      </mat-card-content>
      
      <mat-card-actions>
        <button mat-button (click)="onViewDetails()">
          <mat-icon>visibility</mat-icon>
          צפה במתכון
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .recipe-card {
      margin: 1rem;
      max-width: 300px;
      cursor: pointer;
      transition: transform 0.2s;
    }
    
    .recipe-card:hover {
      transform: translateY(-2px);
    }
    
    .recipe-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1rem;
    }
    
    .prep-time {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .difficulty {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .stars {
      display: flex;
    }
    
    .star {
      color: #ffd700;
      font-size: 16px;
    }
  `]
})
export class RecipeCardComponent {
  @Input() recipe!: Recipe;
  @Output() viewDetails = new EventEmitter<Recipe>();

  onViewDetails() {
    this.viewDetails.emit(this.recipe);
  }

  getDifficultyLevel(): number {
    switch (this.recipe.difficultyLevel) {
      case 'easy': return 1;
      case 'medium': return 2;
      case 'hard': return 3;
      default: return 1;
    }
  }
}