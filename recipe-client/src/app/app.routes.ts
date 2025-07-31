import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./components/layout/home.component').then(m => m.HomeComponent) 
  },
  { 
    path: 'login', 
    loadComponent: () => import('./components/auth/login.component').then(m => m.LoginComponent) 
  },
  { 
    path: 'register', 
    loadComponent: () => import('./components/auth/register.component').then(m => m.RegisterComponent) 
  },
  { 
    path: 'recipes', 
    loadComponent: () => import('./components/recipes/recipe-list.component').then(m => m.RecipeListComponent) 
  },
  { 
    path: 'recipe/:id', 
    loadComponent: () => import('./components/recipes/recipe-detail.component').then(m => m.RecipeDetailComponent) 
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
    path: 'edit-recipe/:id', 
    loadComponent: () => import('./components/recipes/recipe-form.component').then(m => m.RecipeFormComponent),
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '/recipes' }
];