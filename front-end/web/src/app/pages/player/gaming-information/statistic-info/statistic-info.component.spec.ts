import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatisticInfoComponent } from './statistic-info.component';

describe('StatisticInfoComponent', () => {
  let component: StatisticInfoComponent;
  let fixture: ComponentFixture<StatisticInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StatisticInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatisticInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
