import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameBrowserPageComponent } from './game-browser-page.component';

describe('GameBrowserPageComponent', () => {
  let component: GameBrowserPageComponent;
  let fixture: ComponentFixture<GameBrowserPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameBrowserPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameBrowserPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
