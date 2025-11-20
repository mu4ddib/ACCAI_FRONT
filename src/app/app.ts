import { Component, Inject, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';
import { MSAL_GUARD_CONFIG, MsalBroadcastService, MsalGuardConfiguration, MsalService } from '@azure/msal-angular';
import { EventMessage, EventType, InteractionStatus, RedirectRequest, AuthenticationResult } from '@azure/msal-browser';
import { InactivityService } from './core/service/inactivity-service';
import { AuthGuard } from './core/guards/auth-guard';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  private router = inject(Router, { optional: true });
  private route = inject(ActivatedRoute, { optional: true });
  private title = inject(Title);
  private _authService = inject(MsalService);
  private _msalBroadcastService = inject(MsalBroadcastService);
  private inactivityService = inject(InactivityService);
  private authGuard = inject(AuthGuard);

  public loginDisplay = false;
  private readonly _destroying$ = new Subject<void>();
  currentRoute: string = '/';
  activeTab: string = '';
  appName = 'ACCAI FRONT';
  pageTitle = signal(this.appName);

  constructor(@Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration) {
    if (this.router && this.route) {
      this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
        let r: ActivatedRoute = this.route!;
        while (r.firstChild) r = r.firstChild;
        const t = (r.snapshot.data['pageTitle'] as string) ?? this.appName;
        this.pageTitle.set(t);
        this.title.setTitle(`${t} · ${this.appName}`);
      });
    } else {
      this.title.setTitle(this.appName);
    }
  }

  goTo(path: string): void {
    this.activeTab = path;
    this.router?.navigate(['/' + path]);
  }

  ngOnInit(): void {
    this.loginDisplay = false;

    this.router?.events.subscribe(() => {
      this.currentRoute = this.router?.url || '/';
    });


    this._authService.handleRedirectObservable().subscribe({
      next: (result: AuthenticationResult) => {
        if (result) {
          this._authService.instance.setActiveAccount(result.account);
          this.setLoginDisplay();
        }
      },
      error: (error) => {
        console.error('Error en autenticación:', error);
      }
    });

    this._authService.instance.enableAccountStorageEvents();


    this._msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) =>
          msg.eventType === EventType.ACCOUNT_ADDED ||
          msg.eventType === EventType.ACCOUNT_REMOVED
        )
      )
      .subscribe((result: EventMessage) => {
        if (this._authService.instance.getAllAccounts().length === 0) {
          window.location.pathname = '/';
        } else {
          this.setLoginDisplay();
        }
      });


    this._msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        this.checkAndSetActiveAccount();
        this.setLoginDisplay();
      });
  }

  setLoginDisplay(): void {
    this.loginDisplay = this._authService.instance.getAllAccounts().length > 0;


    if (this.loginDisplay && (this.currentRoute === '/' || this.currentRoute === '')) {
      setTimeout(() => {
        this.router?.navigate(['/importar-csv']);
      }, 100);
    }
  }

  checkAndSetActiveAccount(): void {
    const activeAccount = this._authService.instance.getActiveAccount();

    if (!activeAccount && this._authService.instance.getAllAccounts().length > 0) {
      const accounts = this._authService.instance.getAllAccounts();
      this._authService.instance.setActiveAccount(accounts[0]);
      this.inactivityService.start();
    } else if (activeAccount) {
      this.inactivityService.start();
    }
  }

  loginRedirect(): void {
    if (this.msalGuardConfig.authRequest) {
      this._authService.loginRedirect({
        ...this.msalGuardConfig.authRequest,
      } as RedirectRequest);
    } else {
      this._authService.loginRedirect();
    }
  }

  logout(): void {
    this.inactivityService.stop();
    this.authGuard.logout();
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
    this.inactivityService.stop();
  }
}
