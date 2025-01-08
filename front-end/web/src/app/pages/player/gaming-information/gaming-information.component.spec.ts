import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamingInformationComponent } from './gaming-information.component';

describe('GamingInformationComponent', () => {
  let component: GamingInformationComponent;
  let fixture: ComponentFixture<GamingInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GamingInformationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GamingInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
