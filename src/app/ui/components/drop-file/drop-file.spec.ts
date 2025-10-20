import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropFile } from './drop-file';

describe('DropFile', () => {
  let component: DropFile;
  let fixture: ComponentFixture<DropFile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropFile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DropFile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
