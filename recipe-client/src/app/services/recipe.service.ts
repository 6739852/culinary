import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Recipe, RecipeRequest } from '../models/recipe.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private apiUrl = `${environment.apiUrl}/recipes`;

  constructor(private http: HttpClient) {}

  getRecipes(search?: string, limit?: number, page?: number): Observable<Recipe[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (limit) params = params.set('limit', limit.toString());
    if (page) params = params.set('page', page.toString());
    
    return this.http.get<Recipe[]>(this.apiUrl, { params });
  }

  getMyRecipes(): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(`${this.apiUrl}/my-recipes`);
  }

  getRecipeById(id: string): Observable<Recipe> {
    return this.http.get<Recipe>(`${this.apiUrl}/${id}`);
  }

  getRecipesByPrepTime(maxMinutes: number): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(`${this.apiUrl}/prep-time?maxMinutes=${maxMinutes}`);
  }

  getRecipesByCategory(categoryName: string): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(`${this.apiUrl}/by-category/${categoryName}`);
  }

  createRecipe(recipe: RecipeRequest): Observable<Recipe> {
    return this.http.post<Recipe>(this.apiUrl, recipe);
  }

  updateRecipe(id: string, recipe: RecipeRequest): Observable<Recipe> {
    return this.http.put<Recipe>(`${this.apiUrl}/${id}`, recipe);
  }

  deleteRecipe(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post(`${this.apiUrl}/upload-image`, formData);
  }
}