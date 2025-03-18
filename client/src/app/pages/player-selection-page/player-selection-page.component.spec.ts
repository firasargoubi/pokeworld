import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PlayerSelectionService } from '@app/services/player-selection/player-selection.service';
import { PopupService } from '@app/services/popup/popup.service';
import { LobbySocketsService } from '@app/services/sockets/lobby-socket/lobby-sockets.service';
import { Subject } from 'rxjs';
import { PlayerSelectionPageComponent } from './player-selection-page.component';
import { AVATAR_DATA } from '@app/consts/avatar-data.const';
import { Avatar, AvatarStatus } from '@common/interfaces/avatar.enum';
import { DiceType } from '@common/interfaces/dice';
import { StatType } from '@common/interfaces/player';
import { BONUS_POINTS, DEFAULT_ESCAPE_POINTS, DEFAULT_STAT_POINTS } from '@common/consts/player.const';

describe('PlayerSelectionPageComponent', () => {
    let component: PlayerSelectionPageComponent;
    let fixture: ComponentFixture<PlayerSelectionPageComponent>;
    let routerSpy: jasmine.SpyObj<Router>;
    let popupServiceSpy: jasmine.SpyObj<PopupService>;
    let lobbySocketServiceSpy: jasmine.SpyObj<LobbySocketsService>;
    let playerSelectionServiceSpy: jasmine.SpyObj<PlayerSelectionService>;
    let roomLockedSubject: Subject<boolean>;

    beforeEach(async () => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        popupServiceSpy = jasmine.createSpyObj('PopupService', ['showPopup']);
        lobbySocketServiceSpy = jasmine.createSpyObj('LobbySocketsService', ['updatePlayer', 'leaveMatch']);
        playerSelectionServiceSpy = jasmine.createSpyObj(
            'PlayerSelectionService',
            ['getAvatarStatus', 'isAvatarAvailable', 'updatePlayerAvatar', 'resetAvatar', 'setPlayerData', 'joinLobby', 'handleAvatarSelection'],
            {
                avatarData: AVATAR_DATA,
                avatarList: Object.keys(AVATAR_DATA).slice(1) as Avatar[],
                playerData: {
                    name: '',
                    avatar: Avatar.Avatar1,
                    playerStats: {
                        health: 0,
                        speed: 0,
                        attack: 0,
                        defense: 0,
                        attackDice: DiceType.D4,
                        defenseDice: DiceType.D6,
                        escapes: 0,
                    },
                    isConnected: true,
                },
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
                { provide: PlayerSelectionService, useValue: playerSelectionServiceSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PlayerSelectionPageComponent);
        component = fixture.componentInstance;
        playerSelectionServiceSpy.getAvatarStatus.and.returnValue(AvatarStatus.UNSELECTED);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should reset avatar on initialization', () => {
        component.ngOnInit();
        expect(playerSelectionServiceSpy.resetAvatar).toHaveBeenCalled();
    });

    it('should toggle bonus dice', () => {
        const initialAttackDice = component.bonusDice.attack;
        const initialDefenseDice = component.bonusDice.defense;
        component.toggleBonusDice();
        expect(component.bonusDice.attack).toBe(initialDefenseDice);
        expect(component.bonusDice.defense).toBe(initialAttackDice);
    });

    it('should return correct avatar button style', () => {
        playerSelectionServiceSpy.getAvatarStatus.and.returnValue(AvatarStatus.UNSELECTED);
        const style = component.getAvatarBtnStyle(Avatar.Avatar1);
        expect(style).toEqual({ class: AvatarStatus.UNSELECTED });
    });

    it('should show popup if form is invalid', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any  -- Private method
        spyOn<any>(component, 'getWarnings').and.returnValue(['Warning']);
        component.goToLobby();
        expect(popupServiceSpy.showPopup).toHaveBeenCalledWith('Warning');
    });

    it('should navigate to create page', () => {
        component.goToMenu();
        expect(popupServiceSpy.showPopup).toHaveBeenCalled();
    });

    it('should validate form as valid when there are no warnings', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any  -- Private method
        spyOn<any>(component, 'getWarnings').and.returnValue([]);
        expect(component.isFormValid()).toBeTrue();
    });

    it('should validate form as invalid when there are warnings', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any  -- Private method
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
        component['playerSelectionService'].playerData.avatar = Avatar.Default;
        expect(component['getWarnings']()).toContain('Veuillez choisir un avatar');
    });

    it('should check if avatar is chosen', () => {
        component['playerSelectionService'].playerData.avatar = Avatar.Avatar1;
        expect(component['isAvatarChosen']()).toBeTrue();
        component['playerSelectionService'].playerData.avatar = Avatar.Default;
        expect(component['isAvatarChosen']()).toBeFalse();
    });

    it('should return correct avatar button style', () => {
        playerSelectionServiceSpy.getAvatarStatus.and.returnValue(AvatarStatus.UNSELECTED);
        const style = component.getAvatarBtnStyle(Avatar.Avatar1);
        expect(style).toEqual({ class: AvatarStatus.UNSELECTED });
    });

    it('should call getAvatarBtnStyle with correct avatar', () => {
        const avatar = Avatar.Avatar1;
        const spy = spyOn(component, 'getAvatarBtnStyle').and.callThrough();
        component.getAvatarBtnStyle(avatar);
        expect(spy).toHaveBeenCalledWith(avatar);
    });

    it('should return correct avatar data', () => {
        expect(component.avatarData).toEqual(AVATAR_DATA);
    });

    it('should return correct avatar list', () => {
        expect(component.avatarList).toEqual(Object.keys(AVATAR_DATA).slice(1) as Avatar[]);
    });

    it('should return the selected avatar', () => {
        expect(component.selectedAvatar).toBe(Avatar.Avatar1);
    });

    it('should reset avatar on init', () => {
        component.ngOnInit();
        expect(playerSelectionServiceSpy.resetAvatar).toHaveBeenCalled();
    });

    it('should set player data and join lobby when form is valid', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(component, 'getWarnings').and.returnValue([]);
        component.goToLobby();
        expect(playerSelectionServiceSpy.setPlayerData).toHaveBeenCalled();
        expect(playerSelectionServiceSpy.joinLobby).toHaveBeenCalled();
    });

    it('should not join lobby when form is invalid', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(component, 'getWarnings').and.returnValue(['Warning']);
        component.goToLobby();
        expect(playerSelectionServiceSpy.joinLobby).not.toHaveBeenCalled();
    });

    it('should show popup when navigating to menu', () => {
        component.goToMenu();
        expect(popupServiceSpy.showPopup).toHaveBeenCalledWith('Voulez-vous vraiment quitter ?', true, jasmine.any(Function));
    });

    it('should return correct player data', () => {
        component.nameForm.setValue('TestPlayer');
        component.bonusPointsForm.setValue(StatType.Life);
        const playerData = component['getPlayerData']();
        expect(playerData).toEqual({
            name: 'TESTPLAYER',
            avatar: Avatar.Avatar1,
            playerStats: {
                health: DEFAULT_STAT_POINTS + BONUS_POINTS,
                speed: DEFAULT_STAT_POINTS,
                attack: DEFAULT_STAT_POINTS,
                defense: DEFAULT_STAT_POINTS,
                attackDice: DiceType.D4,
                defenseDice: DiceType.D6,
                escapes: DEFAULT_ESCAPE_POINTS,
            },
        });
    });

    it('should return correct bonus stat', () => {
        component.bonusPointsForm.setValue(StatType.Life);
        expect(component['getBonusStat'](StatType.Life)).toBe(DEFAULT_STAT_POINTS + BONUS_POINTS);
        component.bonusPointsForm.setValue(StatType.Speed);
        expect(component['getBonusStat'](StatType.Speed)).toBe(DEFAULT_STAT_POINTS + BONUS_POINTS);
    });

    it('should return correct warnings', () => {
        component.nameForm.setValue('');
        expect(component['getWarnings']()).toContain('Le nom doit contenir entre 3 et 15 caractères');
        component['playerSelectionService'].playerData.avatar = Avatar.Default;
        expect(component['getWarnings']()).toContain('Veuillez choisir un avatar');
    });

    it('should check if avatar is chosen', () => {
        component['playerSelectionService'].playerData.avatar = Avatar.Avatar1;
        expect(component['isAvatarChosen']()).toBeTrue();
        component['playerSelectionService'].playerData.avatar = Avatar.Default;
        expect(component['isAvatarChosen']()).toBeFalse();
    });
});
