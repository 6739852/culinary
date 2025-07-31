import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/recipes', pathMatch: 'full' },
  { 
    path: 'login', 
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) 
  },
  { 
    path: 'register', 
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent) 
  },
  { 
    path: 'recipes', 
    loadComponent: () => import('./pages/recipes/recipes-all.component').then(m => m.RecipesAllComponent) 
  },
  { 
    path: 'recipe-details/:id', 
    loadComponent: () => import('./pages/recipe-details/recipe-details.component').then(m => m.RecipeDetailsComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'my-recipes', 
    loadComponent: () => import('./components/recipes/my-recipes.component').then(m => m.MyRecipesComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'add-recipe', 
    loadComponent: () => import('./components/recipes/recipe-form.component').then(m => m.RecipeFormComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'recipe-form/:id', 
    loadComponent: () => import('./components/recipes/recipe-form.component').then(m => m.RecipeFormComponent),
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '/recipes' }
];