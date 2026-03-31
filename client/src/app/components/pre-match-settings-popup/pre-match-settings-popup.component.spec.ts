import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SoundEffect } from '@app/interfaces/sound-service';
import { AudioService } from '@app/services/audio/audio.service';
import { MatchService } from '@app/services/match/match.service';
import { TranslateModule } from '@ngx-translate/core';
import { PreMatchSettingsPopupComponent } from './pre-match-settings-popup.component';

describe('PreMatchSettingsPopupComponent', () => {
    let component: PreMatchSettingsPopupComponent;
    let fixture: ComponentFixture<PreMatchSettingsPopupComponent>;

    let audioServiceSpy: jasmine.SpyObj<AudioService>;
    let matchServiceMock: {
        data: {
            lobbyData: { isFriendOnly: boolean };
        };
    };

    beforeEach(async () => {
        audioServiceSpy = jasmine.createSpyObj('AudioService', ['playEffect']);
        matchServiceMock = {
            data: {
                lobbyData: { isFriendOnly: false },
            },
        };

        await TestBed.configureTestingModule({
            imports: [PreMatchSettingsPopupComponent, TranslateModule.forRoot()],
            providers: [
                { provide: AudioService, useValue: audioServiceSpy },
                { provide: MatchService, useValue: matchServiceMock },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(PreMatchSettingsPopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should synchronize settings when isVisible becomes true in ngOnChanges', () => {
        matchServiceMock.data.lobbyData.isFriendOnly = true;

        component.ngOnChanges({
            isVisible: new SimpleChange(false, true, false),
        });

        expect(component.matchSettings.isFriendOnly).toBeTrue();
    });

    it('should not synchronize settings when isVisible does not become true in ngOnChanges', () => {
        component.matchSettings.isFriendOnly = false;
        matchServiceMock.data.lobbyData.isFriendOnly = true;

        component.ngOnChanges({
            isVisible: new SimpleChange(true, false, false),
        });

        expect(component.matchSettings.isFriendOnly).toBeFalse();
    });

    it('should synchronize isFriendOnly from MatchService', () => {
        matchServiceMock.data.lobbyData.isFriendOnly = true;

        component.synchronizeSettings();

        expect(component.matchSettings.isFriendOnly).toBeTrue();
    });

    it('should set isFriendOnly to true and play click sound', () => {
        component.matchSettings.isFriendOnly = false;

        component.setFriendOnly(true);

        expect(audioServiceSpy.playEffect).toHaveBeenCalledWith(SoundEffect.Click);
        expect(component.matchSettings.isFriendOnly).toBeTrue();
    });

    it('should set isFriendOnly to false and play click sound', () => {
        component.matchSettings.isFriendOnly = true;

        component.setFriendOnly(false);

        expect(audioServiceSpy.playEffect).toHaveBeenCalledWith(SoundEffect.Click);
        expect(component.matchSettings.isFriendOnly).toBeFalse();
    });

    it('should emit selected settings and play click sound on validation', () => {
        const emitSpy = spyOn(component.settingsSelected, 'emit');
        component.matchSettings = {
            isElementalMode: false,
            isDropInEnabled: false,
            isRapidElimination: false,
            isFriendOnly: true,
        };

        component.onValidateSelection();

        expect(audioServiceSpy.playEffect).toHaveBeenCalledWith(SoundEffect.Click);
        expect(emitSpy).toHaveBeenCalledWith(component.matchSettings);
    });
});
