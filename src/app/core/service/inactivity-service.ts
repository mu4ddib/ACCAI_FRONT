import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InactivityService {
  private timeout: any;
  private readonly INACTIVITY_TIME = 30 * 60 * 1000; // 30 minutos

  start(): void {
    this.resetTimer();
    this.setupListeners();
  }

  stop(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  private resetTimer(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(() => this.onTimeout(), this.INACTIVITY_TIME);
  }

  private setupListeners(): void {
    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, () => this.resetTimer(), true);
    });
  }

  private onTimeout(): void {

  }
}
