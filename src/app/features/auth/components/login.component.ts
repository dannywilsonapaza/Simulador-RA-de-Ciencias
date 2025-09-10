import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AuthService } from '../services/auth.service';
import { LoginCredentials, UserRole } from '../models/user.model';
import { PrimeAuthModule } from '../../../shared/prime-auth.module';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, PrimeAuthModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('200ms ease-in', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-out', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ]
})
export class LoginComponent implements OnInit, OnDestroy {
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  readonly authService = inject(AuthService);

  // Señales reactivas
  readonly loginError = signal<string | null>(null);

  // Formulario reactivo
  loginForm: FormGroup;

  constructor() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Los estilos ya están aplicados en el componente con :host
  }

  ngOnDestroy(): void {
    // No hay necesidad de limpiar estilos
  }

  /**
   * Verificar si un campo es inválido
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field?.invalid && (field?.dirty || field?.touched));
  }

  /**
   * Obtener mensaje de error para un campo
   */
  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);

    if (field?.errors) {
      if (field.errors['required']) {
        return 'Este campo es requerido';
      }
      if (field.errors['email']) {
        return 'Ingresa un correo válido';
      }
      if (field.errors['minlength']) {
        return 'La contraseña debe tener al menos 6 caracteres';
      }
    }

    return '';
  }

  /**
   * Obtener ruta de dashboard según el rol del usuario
   */
  private getDashboardRoute(role: UserRole): string {
    switch (role) {
      case UserRole.ADMIN:
        return '/admin-dashboard';
      case UserRole.TEACHER:
        return '/teacher-dashboard';
      case UserRole.STUDENT:
        return '/student-dashboard';
      case UserRole.GUEST:
        return '/dashboard'; // Dashboard básico para invitados
      default:
        return '/dashboard';
    }
  }

  /**
   * Manejar envío del formulario
   */
  onSubmit(): void {
    if (this.loginForm.valid && !this.authService.isLoading()) {
      this.loginError.set(null);

      const credentials: LoginCredentials = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password,
        rememberMe: this.loginForm.value.rememberMe
      };

      this.authService.login(credentials).subscribe({
        next: (response) => {
          // Login exitoso, redirigir según rol
          const userRole = response.user.role;
          const returnUrl = this.route.snapshot.queryParams['returnUrl'];

          if (returnUrl) {
            // Si hay una URL de retorno, ir ahí
            this.router.navigate([returnUrl]);
          } else {
            // Si no hay URL de retorno, ir al dashboard apropiado según el rol
            const dashboardRoute = this.getDashboardRoute(userRole);
            this.router.navigate([dashboardRoute]);
          }
        },
        error: (error) => {
          this.loginError.set(error.error || 'Error al iniciar sesión. Intenta nuevamente.');
        }
      });
    } else {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }

  /**
   * Login social (implementación futura)
   */
  socialLogin(provider: string): void {
    console.log(`Login social con ${provider} - Implementación futura`);
    // Aquí se implementaría la integración con OAuth providers
  }

  /**
   * Recuperar contraseña
   */
  forgotPassword(): void {
    console.log('Recuperar contraseña - Implementación futura');
    // Redirigir a componente de recuperación
  }

  /**
   * Ir a registro
   */
  goToRegister(): void {
    console.log('Ir a registro - Implementación futura');
    // Redirigir a componente de registro
  }
}
