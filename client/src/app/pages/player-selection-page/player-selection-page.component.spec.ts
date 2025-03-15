import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AVATAR_DATA } from '@app/consts/avatars.const';
import { BONUS_POINTS, DEFAULT_STAT_POINTS } from '@app/consts/default-player.const';
import { StatType } from '@app/interfaces/player-stats.enum';
import { AvatarSelectionService } from '@app/services/avatar-selection/avatar-selection.service';
import { PopupService } from '@app/services/popup/popup.service';
import { LobbySocketsService } from '@app/services/sockets/lobby-socket/lobby-sockets.service';
import { AvatarStatus } from '@common/avatar-status.enum';
import { Avatars } from '@common/avatars.enum';
import { Subject } from 'rxjs';
import { PlayerSelectionPageComponent } from './player-selection-page.component';

describe('PlayerSelectionPageComponent', () => {
    let component: PlayerSelectionPageComponent;
    let fixture: ComponentFixture<PlayerSelectionPageComponent>;
    let routerSpy: jasmine.SpyObj<Router>;
    let popupServiceSpy: jasmine.SpyObj<PopupService>;
    let lobbySocketServiceSpy: jasmine.SpyObj<LobbySocketsService>;
    let avatarSelectionServiceSpy: jasmine.SpyObj<AvatarSelectionService>;
    let roomLockedSubject: Subject<boolean>;

    beforeEach(async () => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        popupServiceSpy = jasmine.createSpyObj('PopupService', ['showPopup']);
        lobbySocketServiceSpy = jasmine.createSpyObj('LobbySocketsService', ['updatePlayer', 'leaveMatch']);
        avatarSelectionServiceSpy = jasmine.createSpyObj(
            'AvatarSelectionService',
            ['getAvatarStatus', 'isAvatarAvailable', 'updatePlayerAvatar', 'resetAvatar'],
            {
                avatarData: AVATAR_DATA,
                avatarList: Object.keys(AVATAR_DATA).slice(1) as Avatars[],
            },
        );

        roomLockedSubject = new Subject<boolean>();
        Object.defineProperty(lobbySocketServiceSpy, 'roomLocked$', { get: () => roomLockedSubject.asObservable() });

        await TestBed.configureTestingModule({
            imports: [ReactiveFormsModule],
            providers: [
                { provide: Router, useValue: routerSpy },
                { provide: PopupService, useValue: popupServiceSpy },
                { provide: LobbySocketsService, useValue: lobbySocketServiceSpy },
                { provide: AvatarSelectionService, useValue: avatarSelectionServiceSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PlayerSelectionPageComponent);
        component = fixture.componentInstance;
        avatarSelectionServiceSpy.getAvatarStatus.and.returnValue(AvatarStatus.UNSELECTED);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should toggle bonus dice', () => {
        const initialAttackDice = component.bonusDice.attack;
        const initialDefenseDice = component.bonusDice.defense;
        component.toggleBonusDice();
        expect(component.bonusDice.attack).toBe(initialDefenseDice);
        expect(component.bonusDice.defense).toBe(initialAttackDice);
    });

    it('should return correct avatar button style', () => {
        avatarSelectionServiceSpy.getAvatarStatus.and.returnValue(AvatarStatus.UNSELECTED);
        const style = component.getAvatarBtnStyle(Avatars.Avatar1);
        expect(style).toEqual({ class: AvatarStatus.UNSELECTED });
    });

    it('should handle avatar selection', () => {
        avatarSelectionServiceSpy.isAvatarAvailable.and.returnValue(true);
        component.handleAvatarSelection(Avatars.Avatar1);
        expect(avatarSelectionServiceSpy.updatePlayerAvatar).toHaveBeenCalledWith(Avatars.Avatar1);
        expect(avatarSelectionServiceSpy.selectedAvatar).toBe(Avatars.Avatar1);
    });

    it('should show popup if form is invalid', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(component, 'getWarnings').and.returnValue(['Warning']);
        component.goToLobby();
        expect(popupServiceSpy.showPopup).toHaveBeenCalledWith('Warning');
    });

    it('should navigate to create page', () => {
        component.goToMenu();
        expect(lobbySocketServiceSpy.leaveMatch).toHaveBeenCalled();
        expect(avatarSelectionServiceSpy.resetAvatar).toHaveBeenCalled();
    });

    it('should validate form as valid when there are no warnings', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(component, 'getWarnings').and.returnValue([]);
        expect(component.isFormValid()).toBeTrue();
    });

    it('should validate form as invalid when there are warnings', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(component, 'getWarnings').and.returnValue(['Warning']);
        expect(component.isFormValid()).toBeFalse();
    });

    it('should return correct bonus stat', () => {
        component.bonusPointsForm.setValue(StatType.Life);
        expect(component['getBonusStat'](StatType.Life)).toBe(DEFAULT_STAT_POINTS + BONUS_POINTS);
        expect(component['getBonusStat'](StatType.Speed)).toBe(DEFAULT_STAT_POINTS);
    });

    it('should return correct warnings', () => {
        component.nameForm.setValue('');
        expect(component['getWarnings']()).toContain('Le nom doit contenir entre 3 et 15 caractères');
        component['avatarSelectionService'].selectedAvatar = Avatars.Default;
        expect(component['getWarnings']()).toContain('Veuillez choisir un avatar');
    });

    it('should check if avatar is chosen', () => {
        component['avatarSelectionService'].selectedAvatar = Avatars.Avatar1;
        expect(component['isAvatarChosen']()).toBeTrue();
        component['avatarSelectionService'].selectedAvatar = Avatars.Default;
        expect(component['isAvatarChosen']()).toBeFalse();
    });

    it('should return correct avatar button style', () => {
        avatarSelectionServiceSpy.getAvatarStatus.and.returnValue(AvatarStatus.UNSELECTED);
        const style = component.getAvatarBtnStyle(Avatars.Avatar1);
        expect(style).toEqual({ class: AvatarStatus.UNSELECTED });
    });

    it('should call getAvatarBtnStyle with correct avatar', () => {
        const avatar = Avatars.Avatar1;
        const spy = spyOn(component, 'getAvatarBtnStyle').and.callThrough();
        component.getAvatarBtnStyle(avatar);
        expect(spy).toHaveBeenCalledWith(avatar);
    });

    it('should return correct avatar data', () => {
        expect(component.avatarData).toEqual(AVATAR_DATA);
    });

    it('should return correct avatar list', () => {
        expect(component.avatarList).toEqual(Object.keys(AVATAR_DATA).slice(1) as Avatars[]);
    });
});
