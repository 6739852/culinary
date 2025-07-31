import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatCardModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule,
    MatSnackBarModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>כניסה למערכת</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onLogin()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>אימייל</mat-label>
              <input matInput type="email" formControlName="email">
              @if (loginForm.get('email')?.hasError('required')) {
                <mat-error>אימייל נדרש</mat-error>
              }
              @if (loginForm.get('email')?.hasError('email')) {
                <mat-error>אימייל לא תקין</mat-error>
              }
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>סיסמה</mat-label>
              <input matInput type="password" formControlName="password">
              @if (loginForm.get('password')?.hasError('required')) {
                <mat-error>סיסמה נדרשת</mat-error>
              }
            </mat-form-field>
          </form>
        </mat-card-content>
        
        <mat-card-actions class="actions">
          <button mat-raised-button color="primary" 
                  [disabled]="loginForm.invalid || loading" 
                  (click)="onLogin()">
            {{ loading ? 'מתחבר...' : 'כניסה' }}
          </button>
          
          <button mat-button (click)="goToRegister()">
            הרשמה
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: 2rem;
    }
    
    .login-card {
      width: 100%;
      max-width: 400px;
    }
    
    .full-width {
      width: 100%;
      margin-bottom: 1rem;
    }
    
    .actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.loading = true;
      
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.snackBar.open('התחברת בהצלחה!', 'סגור', { duration: 3000 });
          this.router.navigate(['/recipes']);
        },
        error: (err) => {
          this.snackBar.open('שגיאה בהתחברות: ' + (err.error?.message || 'נסה שוב'), 'סגור', { duration: 5000 });
          this.loading = false;
        }
      });
    }
  }

  goToRegister() {
    const formData = this.loginForm.value;
    this.router.navigate(['/register'], { 
      state: { email: formData.email, password: formData.password } 
    });
  }
}