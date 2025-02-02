import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerSelectionPageComponent } from './player-selection-page.component';

describe('PlayerSelectionPageComponent', () => {
  let component: PlayerSelectionPageComponent;
  let fixture: ComponentFixture<PlayerSelectionPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerSelectionPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerSelectionPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
