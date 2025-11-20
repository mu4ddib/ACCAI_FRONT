import { Injectable, inject } from '@angular/core';
import { MsalService } from '@azure/msal-angular';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  private msalService = inject(MsalService);

  logout(): void {
    this.msalService.logoutRedirect();
  }
}
