import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">Welcome to Recipe World</h1>
        <p class="hero-subtitle">Discover, create, and share amazing recipes with our community</p>
        <div class="hero-actions">
          <a routerLink="/recipes" class="btn btn-primary btn-lg">
            <i class="bi bi-search"></i> Explore Recipes
          </a>
          <a routerLink="/register" class="btn btn-outline btn-lg">
            <i class="bi bi-person-plus"></i> Join Community
          </a>
        </div>
      </div>
      <div class="hero-image">
        <i class="bi bi-egg-fried"></i>
      </div>
    </div>
    
    <div class="features-section">
      <div class="container">
        <h2>Why Choose Recipe World?</h2>
        <div class="features-grid">
          <div class="feature-card">
            <i class="bi bi-search"></i>
            <h3>Discover</h3>
            <p>Find amazing recipes from our community of passionate cooks</p>
          </div>
          <div class="feature-card">
            <i class="bi bi-plus-circle"></i>
            <h3>Create</h3>
            <p>Share your own recipes and cooking tips with the world</p>
          </div>
          <div class="feature-card">
            <i class="bi bi-people"></i>
            <h3>Connect</h3>
            <p>Join a community of food lovers and cooking enthusiasts</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hero-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 4rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 1200px;
      margin: 0 auto;
      border-radius: 20px;
      margin-top: 2rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }
    
    .hero-content {
      flex: 1;
      max-width: 600px;
    }
    
    .hero-title {
      font-size: 3rem;
      font-weight: bold;
      margin-bottom: 1rem;
      line-height: 1.2;
    }
    
    .hero-subtitle {
      font-size: 1.2rem;
      margin-bottom: 2rem;
      opacity: 0.9;
    }
    
    .hero-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    
    .hero-image {
      flex: 1;
      text-align: center;
      font-size: 8rem;
      opacity: 0.3;
    }
    
    .btn {
      padding: 1rem 2rem;
      border: none;
      border-radius: 50px;
      text-decoration: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s;
      font-weight: 600;
      font-size: 1.1rem;
    }
    
    .btn-lg {
      padding: 1.2rem 2.5rem;
    }
    
    .btn-primary {
      background: white;
      color: #667eea;
    }
    
    .btn-primary:hover {
      background: #f8f9ff;
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    }
    
    .btn-outline {
      background: transparent;
      color: white;
      border: 2px solid white;
    }
    
    .btn-outline:hover {
      background: white;
      color: #667eea;
      transform: translateY(-2px);
    }
    
    .features-section {
      padding: 4rem 2rem;
      background: white;
      margin: 2rem auto;
      max-width: 1200px;
      border-radius: 20px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    
    .features-section h2 {
      text-align: center;
      color: #333;
      margin-bottom: 3rem;
      font-size: 2.5rem;
    }
    
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
    }
    
    .feature-card {
      text-align: center;
      padding: 2rem;
      border-radius: 15px;
      background: linear-gradient(135deg, #f8f9ff 0%, #e8ecff 100%);
      transition: transform 0.3s;
    }
    
    .feature-card:hover {
      transform: translateY(-5px);
    }
    
    .feature-card i {
      font-size: 3rem;
      color: #667eea;
      margin-bottom: 1rem;
    }
    
    .feature-card h3 {
      color: #333;
      margin-bottom: 1rem;
      font-size: 1.5rem;
    }
    
    .feature-card p {
      color: #666;
      line-height: 1.6;
    }
    
    @media (max-width: 768px) {
      .hero-section {
        flex-direction: column;
        text-align: center;
        padding: 3rem 1rem;
      }
      
      .hero-title {
        font-size: 2rem;
      }
      
      .hero-image {
        font-size: 4rem;
        margin-top: 2rem;
      }
      
      .hero-actions {
        justify-content: center;
      }
      
      .features-section {
        padding: 3rem 1rem;
      }
      
      .features-section h2 {
        font-size: 2rem;
      }
    }
  `]
})
export class HomeComponent {}