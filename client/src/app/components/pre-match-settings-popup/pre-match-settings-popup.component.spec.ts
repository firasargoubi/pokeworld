import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SoundEffect } from '@app/interfaces/sound-service';
import { AudioService } from '@app/services/audio/audio.service';
import { MatchService } from '@app/services/match/match.service';
import { UserService } from '@app/services/user/user.service';
import { TranslateModule } from '@ngx-translate/core';
import { PreMatchSettingsPopupComponent } from './pre-match-settings-popup.component';

describe('PreMatchSettingsPopupComponent', () => {
    let component: PreMatchSettingsPopupComponent;
    let fixture: ComponentFixture<PreMatchSettingsPopupComponent>;

    let audioServiceSpy: jasmine.SpyObj<AudioService>;
    let matchServiceMock: {
        data: {
            lobbyData: { isFriendOnly: boolean; entryFee: number };
        };
    };
    let userServiceMock: {
        currentUser: { balance: number } | null;
    };

    beforeEach(async () => {
        audioServiceSpy = jasmine.createSpyObj('AudioService', ['playEffect']);
        matchServiceMock = {
            data: {
                lobbyData: { isFriendOnly: false, entryFee: 0 },
            },
        };
        userServiceMock = {
            currentUser: { balance: 10 },
        };

        await TestBed.configureTestingModule({
            imports: [PreMatchSettingsPopupComponent, TranslateModule.forRoot()],
            providers: [
                { provide: AudioService, useValue: audioServiceSpy },
                { provide: MatchService, useValue: matchServiceMock },
                { provide: UserService, useValue: userServiceMock },
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
        matchServiceMock.data.lobbyData.entryFee = 7;

        component.ngOnChanges({
            isVisible: new SimpleChange(false, true, false),
        });

        expect(component.matchSettings.isFriendOnly).toBeTrue();
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(component.matchSettings.entryFee).toBe(7);
    });

    it('should clamp synchronized entry fee to current user balance', () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        matchServiceMock.data.lobbyData.entryFee = 14;

        component.synchronizeSettings();

        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(component.matchSettings.entryFee).toBe(10);
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
        matchServiceMock.data.lobbyData.entryFee = 5;

        component.synchronizeSettings();

        expect(component.matchSettings.isFriendOnly).toBeTrue();
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(component.matchSettings.entryFee).toBe(5);
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

    it('should set entry fee from numeric and invalid values', () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        component.setEntryFee(12);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(component.matchSettings.entryFee).toBe(10);
    });

    it('should increment and decrement entry fee within balance and zero bounds', () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        component.matchSettings.entryFee = 9;

        component.incrementEntryFee();
        component.decrementEntryFee();
        component.decrementEntryFee();
        component.decrementEntryFee();

        expect(audioServiceSpy.playEffect).toHaveBeenCalledWith(SoundEffect.Click);
        expect(component.matchSettings.entryFee).toBe(0);
    });

    it('should emit selected settings and play click sound on validation', () => {
        const emitSpy = spyOn(component.settingsSelected, 'emit');
        component.matchSettings = {
            isElementalMode: false,
            isDropInEnabled: false,
            isRapidElimination: false,
            entryFee: 4,
            isFriendOnly: true,
        };

        component.onValidateSelection();

        expect(audioServiceSpy.playEffect).toHaveBeenCalledWith(SoundEffect.Click);
        expect(emitSpy).toHaveBeenCalledWith(component.matchSettings);
    });
});
