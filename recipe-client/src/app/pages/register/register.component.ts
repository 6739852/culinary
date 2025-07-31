import { Component, OnInit } from '@angular/core';
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
  selector: 'app-register',
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
    <div class="register-container">
      <mat-card class="register-card">
        <mat-card-header>
          <mat-card-title>הרשמה למערכת</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="registerForm" (ngSubmit)="onRegister()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>שם משתמש</mat-label>
              <input matInput formControlName="username">
              @if (registerForm.get('username')?.hasError('required')) {
                <mat-error>שם משתמש נדרש</mat-error>
              }
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>אימייל</mat-label>
              <input matInput type="email" formControlName="email">
              @if (registerForm.get('email')?.hasError('required')) {
                <mat-error>אימייל נדרש</mat-error>
              }
              @if (registerForm.get('email')?.hasError('email')) {
                <mat-error>אימייל לא תקין</mat-error>
              }
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>סיסמה</mat-label>
              <input matInput type="password" formControlName="password">
              @if (registerForm.get('password')?.hasError('required')) {
                <mat-error>סיסמה נדרשת</mat-error>
              }
              @if (registerForm.get('password')?.hasError('minlength')) {
                <mat-error>סיסמה חייבת להכיל לפחות 6 תווים</mat-error>
              }
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>כתובת</mat-label>
              <input matInput formControlName="address">
              @if (registerForm.get('address')?.hasError('required')) {
                <mat-error>כתובת נדרשת</mat-error>
              }
            </mat-form-field>
          </form>
        </mat-card-content>
        
        <mat-card-actions class="actions">
          <button mat-raised-button color="primary" 
                  [disabled]="registerForm.invalid || loading" 
                  (click)="onRegister()">
            {{ loading ? 'נרשם...' : 'הרשם' }}
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: 2rem;
    }
    
    .register-card {
      width: 100%;
      max-width: 400px;
    }
    
    .full-width {
      width: 100%;
      margin-bottom: 1rem;
    }
    
    .actions {
      display: flex;
      justify-content: center;
      padding: 1rem;
    }
  `]
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      address: ['', Validators.required]
    });
  }

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      const { email, password } = navigation.extras.state;
      this.registerForm.patchValue({ email, password });
    }
  }

  onRegister() {
    if (this.registerForm.valid) {
      this.loading = true;
      
      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          this.snackBar.open('נרשמת בהצלחה!', 'סגור', { duration: 3000 });
          this.router.navigate(['/recipes']);
        },
        error: (err) => {
          const message = err.error?.message || 'שגיאה בהרשמה';
          if (message.includes('duplicate') || message.includes('exists')) {
            this.snackBar.open('משתמש כבר קיים במערכת', 'סגור', { duration: 5000 });
          } else {
            this.snackBar.open('שגיאה בהרשמה: ' + message, 'סגור', { duration: 5000 });
          }
          this.loading = false;
        }
      });
    }
  }
}