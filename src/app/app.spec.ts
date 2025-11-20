import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { MsalService, MsalBroadcastService, MSAL_GUARD_CONFIG } from '@azure/msal-angular';
import { Subject } from 'rxjs';
import { App } from './app';
import { InactivityService } from './core/service/inactivity-service';
import { AuthGuard } from './core/guards/auth-guard';

describe('App', () => {
  let component: App;
  let fixture: ComponentFixture<App>;
  let msalServiceSpy: jasmine.SpyObj<MsalService>;
  let getAllAccountsSpy: jasmine.Spy;
  let getActiveAccountSpy: jasmine.Spy;
  let setActiveAccountSpy: jasmine.Spy;
  let enableAccountStorageEventsSpy: jasmine.Spy;
  let routerSpy: jasmine.SpyObj<Router>;
  let inactivityServiceSpy: jasmine.SpyObj<InactivityService>;

  beforeEach(async () => {
    getAllAccountsSpy = jasmine.createSpy('getAllAccounts');
    getActiveAccountSpy = jasmine.createSpy('getActiveAccount');
    setActiveAccountSpy = jasmine.createSpy('setActiveAccount');
    enableAccountStorageEventsSpy = jasmine.createSpy('enableAccountStorageEvents');

    const msalSpy = jasmine.createSpyObj('MsalService', [
      'handleRedirectObservable',
      'loginRedirect',
      'logoutRedirect'
    ]);

    Object.defineProperty(msalSpy, 'instance', {
      value: {
        getAllAccounts: getAllAccountsSpy,
        enableAccountStorageEvents: enableAccountStorageEventsSpy,
        getActiveAccount: getActiveAccountSpy,
        setActiveAccount: setActiveAccountSpy
      }
    });

    const broadcastSpy = jasmine.createSpyObj('MsalBroadcastService', [], {
      msalSubject$: new Subject(),
      inProgress$: new Subject()
    });

    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate'], {
      events: new Subject(),
      url: '/'
    });

    const inactivitySpy = jasmine.createSpyObj('InactivityService', ['start', 'stop']);

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: MsalService, useValue: msalSpy },
        { provide: MsalBroadcastService, useValue: broadcastSpy },
        { provide: Router, useValue: routerSpyObj },
        { provide: InactivityService, useValue: inactivitySpy },
        { provide: Title, useValue: jasmine.createSpyObj('Title', ['setTitle']) },
        { provide: AuthGuard, useValue: jasmine.createSpyObj('AuthGuard', ['logout']) },
        {
          provide: MSAL_GUARD_CONFIG,
          useValue: { interactionType: 'redirect', authRequest: { scopes: ['user.read'] } }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    msalServiceSpy = TestBed.inject(MsalService) as jasmine.SpyObj<MsalService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    inactivityServiceSpy = TestBed.inject(InactivityService) as jasmine.SpyObj<InactivityService>;

    msalServiceSpy.handleRedirectObservable.and.returnValue(new Subject());
    getAllAccountsSpy.and.returnValue([]);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with loginDisplay as false', () => {
    expect(component.loginDisplay).toBe(false);
  });

  it('should set loginDisplay to true when accounts exist', () => {
    getAllAccountsSpy.and.returnValue([{ homeAccountId: '123' }] as any);
    component.setLoginDisplay();
    expect(component.loginDisplay).toBe(true);
  });

  it('should navigate to importar-csv when logged in', () => {
    getAllAccountsSpy.and.returnValue([{ homeAccountId: '123' }] as any);
    component.currentRoute = '/';
    component.setLoginDisplay();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/importar-csv']);
  });

  it('should call loginRedirect on loginRedirect()', () => {
    component.loginRedirect();
    expect(msalServiceSpy.loginRedirect).toHaveBeenCalled();
  });

  it('should start inactivity service when setting active account', () => {
    getActiveAccountSpy.and.returnValue(null);
    getAllAccountsSpy.and.returnValue([{ homeAccountId: '123' }] as any);

    component.checkAndSetActiveAccount();

    expect(setActiveAccountSpy).toHaveBeenCalled();
    expect(inactivityServiceSpy.start).toHaveBeenCalled();
  });

  it('should navigate when goTo is called', () => {
    component.goTo('importar-csv');
    expect(component.activeTab).toBe('importar-csv');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/importar-csv']);
  });
});
