import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { Title } from '@angular/platform-browser';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [App] }).compileComponents();
  });

  it('should render brand in header', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const h1: HTMLElement | null = fixture.nativeElement.querySelector('h1');
    expect(h1?.textContent?.trim()).toBe('SKANDIA');   // 👈 coincide con tu app.html
  });

  it('should set default document title when no router is provided', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const title = TestBed.inject(Title);
    expect(title.getTitle()).toBe('ACCAI FRONT');
  });
});
