import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../models/category.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  getCategoriesWithRecipes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/with-recipes`);
  }

  getCategoryByCode(code: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/by-code/${code}`);
  }

  getCategoryByName(name: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/by-name/${name}`);
  }
}