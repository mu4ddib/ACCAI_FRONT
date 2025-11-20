import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { InactivityService } from './inactivity-service';

describe('InactivityService', () => {
  let service: InactivityService;
  let clearTimeoutSpy: jasmine.Spy;
  let setTimeoutSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InactivityService);
    clearTimeoutSpy = spyOn(window, 'clearTimeout');
    setTimeoutSpy = spyOn(window, 'setTimeout').and.returnValue(123 as any);
  });

  afterEach(() => {
    service.stop();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start timer on start()', () => {
    service.start();
    expect(setTimeoutSpy).toHaveBeenCalled();
  });

  it('should setup event listeners on start()', () => {
    const addEventListenerSpy = spyOn(document, 'addEventListener');
    service.start();
    expect(addEventListenerSpy).toHaveBeenCalledTimes(4);
  });

  it('should clear timeout on stop()', () => {
    service.start();
    service.stop();
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('should reset timer on user activity', fakeAsync(() => {
    service.start();
    const initialCallCount = setTimeoutSpy.calls.count();

    const mouseEvent = new MouseEvent('mousedown');
    document.dispatchEvent(mouseEvent);
    tick();

    expect(setTimeoutSpy.calls.count()).toBeGreaterThan(initialCallCount);
  }));
});
