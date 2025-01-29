import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsByYearComponent } from './stats-by-year.component';

describe('StatsByYearComponent', () => {
  let component: StatsByYearComponent;
  let fixture: ComponentFixture<StatsByYearComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StatsByYearComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatsByYearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
