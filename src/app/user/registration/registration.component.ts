import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { FirstKeyPipe } from '../../Shared/pipes/first-key.pipe';
import { AuthService } from '../../Shared/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FirstKeyPipe],
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent {
  form!: FormGroup;

  constructor(private formBuilder: FormBuilder, private service: AuthService) {
    this.initializeForm();
  }
  isSubmitted: boolean = false;

  private initializeForm() {
    this.form = this.formBuilder.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/(?=.*[^a-zA-Z0-9 ])/)
      ]],
      confirmPassword: ['']
    }, { validators: this.passwordMatchValidator });
  }
  //this is how do the inter dependent validation work 
  passwordMatchValidator: ValidatorFn = (control: AbstractControl): null | object => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else {
      confirmPassword?.setErrors(null);
    }
    return null;
  }

  onSubmit() {
    this.isSubmitted = true;
    if (this.form.valid) {
      this.service.createUser(this.form.value).subscribe({
        next: (res: any) => {
          if (res.succeeded) {
            this.form.reset();
            this.isSubmitted = false;
            Swal.fire({
              icon: 'success',
              title: 'Registration Successful',
              text: 'You have been successfully registered!',
              confirmButtonText: 'Ok'
            });
          }
          console.log(res);
        },
        error: (err) => {
          if (err.error.errors) {
            err.error.errors.forEach((x: any) => {
              switch (x.code) {
                case "DuplicateEmail":
                  Swal.fire({
                    icon: 'error',
                    title: 'Registration Failed',
                    text: 'Duplicate Email. Please try again.',
                    confirmButtonText: 'Ok'
                  });
                  break;
                case "DuplicateUserName":
                  Swal.fire({
                    icon: 'error',
                    title: 'Registration Failed',
                    text: 'Username is already taken. Please try a different one.',
                    confirmButtonText: 'Ok'
                  });
                  break;
                default:
                  Swal.fire({
                    icon: 'error',
                    title: 'Registration Failed',
                    text: 'Please try again later.',
                    confirmButtonText: 'Ok'
                  });
                  break;
              }
            });
          } else {
            console.log('error:', err);
          }
        }

      });
    }
  }


  //disply custom error messages
  hasDisplayableError(controlName: string): Boolean {
    const control = this.form.get(controlName);
    return Boolean(control?.invalid) && (this.isSubmitted || Boolean(control?.touched)||Boolean(control?.dirty));
  }
}
