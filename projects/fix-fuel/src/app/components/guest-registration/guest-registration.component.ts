import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonInput, IonItem, IonSpinner, IonText } from '@ionic/angular/standalone';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-guest-registration',
  templateUrl: './guest-registration.component.html',
  styleUrls: ['./guest-registration.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonInput,
    IonButton,
    IonSpinner,
    IonText
  ],
})
export class GuestRegistrationComponent {
  @Output() registered = new EventEmitter<void>();

  fullName: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

  registerGuest(): void {
    if (!this.fullName.trim()) {
      this.errorMessage = 'Full name is required.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.http.post(`${environment.baseUrl}/api/v1/user/guest`, JSON.stringify(this.fullName), {
      responseType: 'text',
      headers: { 
        'Content-Type': 'application/json',
        'accept': 'text/plain',
        'x-language': 'en'
      }
    }).subscribe({
      next: (obfuscatedId: string) => {
        this.isLoading = false;
        // Save to localStorage
        localStorage.setItem('guest_token', obfuscatedId);
        // Emit the event
        this.registered.emit();
        // Navigate to return url or default
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/fill-gas';
        this.router.navigate([returnUrl]);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Registration failed. Please try again.';
        console.error('Guest registration error:', error);
      }
    });
  }
}
