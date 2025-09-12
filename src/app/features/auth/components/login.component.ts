import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    InputGroupModule,
    InputGroupAddonModule,
    IconFieldModule,
    InputIconModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  submitted = false;
  isLoading = false;
  loginAttempts = 0;
  maxAttempts = 3;
  isBlocked = false;
  blockTimeRemaining = 0;

  private destroy$ = new Subject<void>();
  private blockTimer?: number;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadLoginAttempts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.blockTimer) {
      clearInterval(this.blockTimer);
    }
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      ]],
      rememberMe: [false]
    });
  }

  private loadLoginAttempts(): void {
    const storedAttempts = localStorage.getItem('loginAttempts');
    const storedBlockTime = localStorage.getItem('blockUntil');

    if (storedAttempts) {
      this.loginAttempts = parseInt(storedAttempts, 10);
    }

    if (storedBlockTime) {
      const blockUntil = new Date(storedBlockTime);
      if (blockUntil > new Date()) {
        this.isBlocked = true;
        this.startBlockTimer(blockUntil);
      } else {
        localStorage.removeItem('blockUntil');
        localStorage.removeItem('loginAttempts');
        this.loginAttempts = 0;
      }
    }
  }

  private startBlockTimer(blockUntil: Date): void {
    this.blockTimer = window.setInterval(() => {
      const now = new Date();
      const remaining = Math.max(0, Math.ceil((blockUntil.getTime() - now.getTime()) / 1000));

      if (remaining <= 0) {
        this.isBlocked = false;
        this.blockTimeRemaining = 0;
        this.loginAttempts = 0;
        localStorage.removeItem('blockUntil');
        localStorage.removeItem('loginAttempts');
        if (this.blockTimer) {
          clearInterval(this.blockTimer);
        }
      } else {
        this.blockTimeRemaining = remaining;
      }
    }, 1000);
  }

  // Getters para acceder fácilmente a los controles del formulario
  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  getPasswordStrength(): string {
    const password = this.password?.value || '';
    let strength = 0;

    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;

    if (strength <= 2) return 'Débil';
    if (strength <= 3) return 'Media';
    if (strength <= 4) return 'Fuerte';
    return 'Muy Fuerte';
  }

  getPasswordStrengthClass(): string {
    const strength = this.getPasswordStrength();
    switch (strength) {
      case 'Débil': return 'password-weak';
      case 'Media': return 'password-medium';
      case 'Fuerte': return 'password-strong';
      case 'Muy Fuerte': return 'password-very-strong';
      default: return '';
    }
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.isBlocked) {
      this.messageService.add({
        severity: 'error',
        summary: 'Acceso Bloqueado',
        detail: `Cuenta temporalmente bloqueada. Intenta en ${this.blockTimeRemaining} segundos.`,
        life: 5000
      });
      return;
    }

    if (this.loginForm.valid) {
      this.isLoading = true;
      const { email, password, rememberMe } = this.loginForm.value;

      // Simulación de proceso de login con delay realista
      setTimeout(() => {
        this.isLoading = false;

        // Simulación: login exitoso con credenciales específicas
        if (email === 'admin@simulador.com' && password === 'Admin123!') {
          this.loginAttempts = 0;
          localStorage.removeItem('loginAttempts');
          localStorage.removeItem('blockUntil');

          this.messageService.add({
            severity: 'success',
            summary: 'Login Exitoso',
            detail: 'Bienvenido al Sistema de Simulación RA',
            life: 3000
          });

          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1500);

        } else {
          // Incrementar intentos fallidos
          this.loginAttempts++;
          localStorage.setItem('loginAttempts', this.loginAttempts.toString());

          if (this.loginAttempts >= this.maxAttempts) {
            // Bloquear por 5 minutos
            const blockUntil = new Date(Date.now() + 5 * 60 * 1000);
            localStorage.setItem('blockUntil', blockUntil.toISOString());
            this.isBlocked = true;
            this.startBlockTimer(blockUntil);

            this.messageService.add({
              severity: 'error',
              summary: 'Cuenta Bloqueada',
              detail: 'Demasiados intentos fallidos. Cuenta bloqueada por 5 minutos.',
              life: 7000
            });
          } else {
            const remainingAttempts = this.maxAttempts - this.loginAttempts;
            this.messageService.add({
              severity: 'warn',
              summary: 'Credenciales Incorrectas',
              detail: `Login fallido. Te quedan ${remainingAttempts} intentos.`,
              life: 5000
            });
          }
        }
      }, 2000); // Simular delay de red

    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Formulario Inválido',
        detail: 'Por favor, corrige los errores en el formulario.',
        life: 4000
      });
    }
  }

  onSocialLogin(provider: string): void {
    this.messageService.add({
      severity: 'info',
      summary: `Login con ${provider}`,
      detail: 'Esta funcionalidad requiere configuración de OAuth2. En producción se integraría con el proveedor correspondiente.',
      life: 6000
    });
  }

  onForgotPassword(): void {
    if (this.email?.valid) {
      this.messageService.add({
        severity: 'info',
        summary: 'Recuperación de Contraseña',
        detail: `Se enviaría un token de recuperación a ${this.email.value}. En producción, esto sería un proceso seguro con token temporal.`,
        life: 6000
      });
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Email Requerido',
        detail: 'Ingresa un email válido para la recuperación de contraseña.',
        life: 4000
      });
    }
  }

  onRegister(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Registro de Usuario',
      detail: 'En producción, esto redirigiría a un formulario de registro con validación de email y políticas de contraseña.',
      life: 6000
    });
  }

  // Método para demostrar credenciales válidas
  fillDemoCredentials(): void {
    this.loginForm.patchValue({
      email: 'admin@simulador.com',
      password: 'Admin123!'
    });

    this.messageService.add({
      severity: 'info',
      summary: 'Credenciales Demo',
      detail: 'Se han llenado las credenciales de demostración. Ahora puedes hacer login.',
      life: 4000
    });
  }
}
