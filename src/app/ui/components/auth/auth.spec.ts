import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Auth } from './auth';

describe('Auth', () => {
  let component: Auth;
  let fixture: ComponentFixture<Auth>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Auth]
    }).compileComponents();

    fixture = TestBed.createComponent(Auth);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Actualización de agentes');
  });

  it('should have background container', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const container = compiled.querySelector('.background-container');
    expect(container).toBeTruthy();
  });
});
