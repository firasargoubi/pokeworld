import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { GameMode } from '@common/game-mode.enum';
import { MapSize } from '@common/map-size.enum';
import { CreateGamePopupComponent } from './create-game-popup.component';

describe('CreateGamePopupComponent', () => {
    let component: CreateGamePopupComponent;
    let fixture: ComponentFixture<CreateGamePopupComponent>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            imports: [CreateGamePopupComponent],
            providers: [{ provide: Router, useValue: routerSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(CreateGamePopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize gameMode to FFA and mapSize to Small', () => {
        expect(component.gameMode).toBe(GameMode.FFA);
        expect(component.mapSize).toBe(MapSize.Small);
    });

    it('should update mapSize on onSizeSelection', () => {
        component.onSizeSelection(MapSize.Large);
        expect(component.mapSize).toBe(MapSize.Large);
    });

    // NOT FOR SPRINT 1, TO BE UNCOMMENTED LATER (FUNCTIONAL)
    // it('should update gameMode on onModeSelection', () => {
    //     component.onModeSelection(GameMode.CTF);
    //     expect(component.gameMode).toBe(GameMode.CTF);
    // });

    it('should navigate to /edit on onValiderSelection', () => {
        component.onValiderSelection();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/edit']);
    });
});
