import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DragAndDropList } from './drag-and-drop-list';

describe('DragAndDropList', () => {
  let component: DragAndDropList;
  let fixture: ComponentFixture<DragAndDropList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DragAndDropList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DragAndDropList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
