import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageTestComponent } from './page-test.component';

describe('PageTestComponent', () => {
  let component: PageTestComponent;
  let fixture: ComponentFixture<PageTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PageTestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
