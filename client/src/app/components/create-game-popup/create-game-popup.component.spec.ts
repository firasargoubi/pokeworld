import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AudioService } from '@app/services/audio/audio.service';
import { PageEndpoint } from '@common/interfaces/endpoint.enum';
import { GameMode, MapSize } from '@common/interfaces/map-data';
import { TranslateModule } from '@ngx-translate/core';
import { CreateGamePopupComponent } from './create-game-popup.component';
import { GameDataService } from '@app/services/game-data/game-data.service';

describe('CreateGamePopupComponent', () => {
    let component: CreateGamePopupComponent;
    let fixture: ComponentFixture<CreateGamePopupComponent>;
    let routerSpy: jasmine.SpyObj<Router>;
    let mockAudioService: jasmine.SpyObj<AudioService>;
    let gameDataService: jasmine.SpyObj<GameDataService>;

    beforeEach(async () => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        mockAudioService = jasmine.createSpyObj('AudioService', ['playEffect', 'preloadEffectsForPage']);
        gameDataService = jasmine.createSpyObj('GameDataService', ['createNewGame']);

        await TestBed.configureTestingModule({
            imports: [CreateGamePopupComponent, TranslateModule.forRoot()],
            providers: [
                { provide: Router, useValue: routerSpy },
                { provide: AudioService, useValue: mockAudioService },
                { provide: GameDataService, useValue: gameDataService },
            ],
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

    it('should update gameMode on onModeSelection', () => {
        component.onModeSelection(GameMode.CTF);
        expect(component.gameMode).toBe(GameMode.CTF);
    });

    it('should navigate to edit page on onValiderSelection', () => {
        component.onValiderSelection();
        expect(routerSpy.navigate).toHaveBeenCalledWith([PageEndpoint.Edit]);
    });
});
