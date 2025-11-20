import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { AuthGuard } from './auth-guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let msalServiceSpy: jasmine.SpyObj<MsalService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let getAllAccountsSpy: jasmine.Spy;

  beforeEach(() => {
    getAllAccountsSpy = jasmine.createSpy('getAllAccounts');

    const msalSpy = jasmine.createSpyObj('MsalService', ['logoutRedirect']);
    Object.defineProperty(msalSpy, 'instance', {
      value: {
        getAllAccounts: getAllAccountsSpy
      }
    });

    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: MsalService, useValue: msalSpy },
        { provide: Router, useValue: routerSpyObj }
      ]
    });

    guard = TestBed.inject(AuthGuard);
    msalServiceSpy = TestBed.inject(MsalService) as jasmine.SpyObj<MsalService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should return true when user is authenticated', () => {
    getAllAccountsSpy.and.returnValue([{ homeAccountId: '123' }] as any);

    const result = guard.canActivate();

    expect(result).toBe(true);
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to login when user is not authenticated', () => {
    getAllAccountsSpy.and.returnValue([]);

    const result = guard.canActivate();

    expect(result).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should call logoutRedirect on logout', () => {
    guard.logout();
    expect(msalServiceSpy.logoutRedirect).toHaveBeenCalled();
  });
});
