import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SoundEffect } from '@app/interfaces/sound-service';
import { AudioService } from '@app/services/audio/audio.service';
import { MatchService } from '@app/services/match/match.service';
import { TranslateModule } from '@ngx-translate/core';
import { MatchSettingsPopupComponent } from './match-settings-popup.component';

describe('MatchSettingsPopupComponent', () => {
    let component: MatchSettingsPopupComponent;
    let fixture: ComponentFixture<MatchSettingsPopupComponent>;

    let audioServiceSpy: jasmine.SpyObj<AudioService>;
    let matchServiceMock: {
        data: {
            playData: { isElementalMode: boolean };
            lobbyData: { isDropInEnabled: boolean; isRapidElimination: boolean; isFriendOnly: boolean; entryFee: number };
        };
    };

    beforeEach(async () => {
        audioServiceSpy = jasmine.createSpyObj('AudioService', ['playEffect']);
        matchServiceMock = {
            data: {
                playData: { isElementalMode: true },
                lobbyData: { isDropInEnabled: false, isRapidElimination: false, isFriendOnly: false, entryFee: 3 },
            },
        };

        await TestBed.configureTestingModule({
            imports: [MatchSettingsPopupComponent, TranslateModule.forRoot()],
            providers: [
                { provide: AudioService, useValue: audioServiceSpy },
                { provide: MatchService, useValue: matchServiceMock },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(MatchSettingsPopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should synchronize settings when isVisible becomes true in ngOnChanges', () => {
        component.matchSettings.isElementalMode = false;
        component.matchSettings.isDropInEnabled = true;
        component.matchSettings.isRapidElimination = true;

        component.ngOnChanges({
            isVisible: new SimpleChange(false, true, false),
        });

        expect(component.matchSettings.isElementalMode).toBeTrue();
        expect(component.matchSettings.isDropInEnabled).toBeFalse();
        expect(component.matchSettings.isRapidElimination).toBeFalse();
    });

    it('should not synchronize settings when isVisible does not become true in ngOnChanges', () => {
        component.matchSettings.isElementalMode = false;
        component.matchSettings.isDropInEnabled = true;
        component.matchSettings.isRapidElimination = false;

        component.ngOnChanges({
            isVisible: new SimpleChange(true, false, false),
        });

        expect(component.matchSettings.isElementalMode).toBeFalse();
        expect(component.matchSettings.isDropInEnabled).toBeTrue();
        expect(component.matchSettings.isRapidElimination).toBeFalse();
    });

    it('should synchronize settings from MatchService', () => {
        matchServiceMock.data.playData.isElementalMode = false;
        matchServiceMock.data.lobbyData.isDropInEnabled = true;
        matchServiceMock.data.lobbyData.isRapidElimination = true;
        matchServiceMock.data.lobbyData.entryFee = 9;

        component.synchronizeSettings();

        expect(component.matchSettings.isElementalMode).toBeFalse();
        expect(component.matchSettings.isDropInEnabled).toBeTrue();
        expect(component.matchSettings.isRapidElimination).toBeTrue();
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(component.matchSettings.entryFee).toBe(9);
    });

    it('should toggle elemental mode and play click sound', () => {
        component.matchSettings.isElementalMode = false;

        component.toggleElementalMode();

        expect(audioServiceSpy.playEffect).toHaveBeenCalledWith(SoundEffect.Click);
        expect(component.matchSettings.isElementalMode).toBeTrue();
    });

    it('should toggle drop-in/drop-out and play click sound', () => {
        component.matchSettings.isDropInEnabled = false;

        component.toggleDropInDropOut();

        expect(audioServiceSpy.playEffect).toHaveBeenCalledWith(SoundEffect.Click);
        expect(component.matchSettings.isDropInEnabled).toBeTrue();
    });

    it('should toggle rapid elimination and play click sound', () => {
        component.matchSettings.isRapidElimination = false;

        component.toggleRapidElimination();

        expect(audioServiceSpy.playEffect).toHaveBeenCalledWith(SoundEffect.Click);
        expect(component.matchSettings.isRapidElimination).toBeTrue();
    });

    it('should emit selected settings and play click sound on validation', () => {
        const emitSpy = spyOn(component.settingsSelected, 'emit');
        component.matchSettings = {
            isElementalMode: true,
            isDropInEnabled: true,
            isRapidElimination: false,
            isFriendOnly: false,
            entryFee: 0,
        };

        component.onValidateSelection();

        expect(audioServiceSpy.playEffect).toHaveBeenCalledWith(SoundEffect.Click);
        expect(emitSpy).toHaveBeenCalledWith(component.matchSettings);
    });
});
