import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListMissingDataComponent } from './list-missing-data.component';

describe('ListMissingDataComponent', () => {
  let component: ListMissingDataComponent;
  let fixture: ComponentFixture<ListMissingDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListMissingDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListMissingDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
