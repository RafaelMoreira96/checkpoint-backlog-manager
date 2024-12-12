import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameBeatenListComponent } from './game-beaten-list.component';

describe('GameBeatenListComponent', () => {
  let component: GameBeatenListComponent;
  let fixture: ComponentFixture<GameBeatenListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GameBeatenListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameBeatenListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
