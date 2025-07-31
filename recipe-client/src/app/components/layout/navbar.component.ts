import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="nav-container">
        <a routerLink="/recipes" class="nav-brand">
          <i class="bi bi-egg-fried"></i>
          Recipe App
        </a>
        
        <div class="nav-menu">
          <a routerLink="/recipes" routerLinkActive="active" class="nav-link">
            <i class="bi bi-journal-bookmark"></i> כל המתכונים
          </a>
          
          <ng-container *ngIf="currentUser$ | async as user; else guestMenu">
            <a routerLink="/my-recipes" routerLinkActive="active" class="nav-link">
              <i class="bi bi-person-lines-fill"></i> המתכונים שלי
            </a>
            <a routerLink="/add-recipe" routerLinkActive="active" class="nav-link">
              <i class="bi bi-plus-circle"></i> הוסף מתכון
            </a>
            
            <div class="user-menu">
              <span class="user-name">
                <i class="bi bi-person-circle"></i> {{ user.username }}
              </span>
              <button (click)="logout()" class="btn btn-outline">
                <i class="bi bi-box-arrow-right"></i> יציאה
              </button>
            </div>
          </ng-container>
          
          <ng-template #guestMenu>
            <span class="guest-name">
              <i class="bi bi-person"></i> אורח
            </span>
            <a routerLink="/login" routerLinkActive="active" class="nav-link">
              <i class="bi bi-box-arrow-in-right"></i> כניסה
            </a>
            <a routerLink="/register" routerLinkActive="active" class="nav-link">
              <i class="bi bi-person-plus"></i> הרשמה
            </a>
          </ng-template>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1rem 0;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 1rem;
    }
    
    .nav-brand {
      font-size: 1.5rem;
      font-weight: bold;
      color: white;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .nav-menu {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .nav-link {
      color: white;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 5px;
      transition: background-color 0.3s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .nav-link:hover,
    .nav-link.active {
      background-color: rgba(255,255,255,0.2);
    }
    
    .user-menu {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-left: 1rem;
      padding-left: 1rem;
      border-left: 1px solid rgba(255,255,255,0.3);
    }
    
    .user-name, .guest-name {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 500;
    }
    
    .guest-name {
      color: rgba(255,255,255,0.8);
    }
    
    .btn {
      padding: 0.5rem 1rem;
      border-radius: 5px;
      text-decoration: none;
      cursor: pointer;
      border: none;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s;
    }
    
    .btn-outline {
      background: transparent;
      color: white;
      border: 1px solid white;
    }
    
    .btn-outline:hover {
      background: white;
      color: #667eea;
    }
    
    @media (max-width: 768px) {
      .nav-menu {
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      
      .user-menu {
        margin-left: 0;
        padding-left: 0;
        border-left: none;
        flex-wrap: wrap;
      }
    }
  `]
})
export class NavbarComponent {
  currentUser$ = this.authService.currentUser$;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}