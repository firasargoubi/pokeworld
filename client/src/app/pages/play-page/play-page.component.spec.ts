import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MapComponent } from '@app/components/map/map.component';
import { DEFAULT_TILE_DESCRIPTION } from '@app/consts/default-tile-description.const';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { MapService } from '@app/services/map/map.service';
import { MatchDataService } from '@app/services/match-data/match-data.service';
import { PopupService } from '@app/services/popup/popup.service';
import { CoreSocketService } from '@app/services/sockets/core-socket/core-socket.service';
import { PlaySocketsService } from '@app/services/sockets/play-socket/play-sockets.service';
import { ThumbnailService } from '@app/services/thumbnail/thumbnail.service';
import { TileDescriptionService } from '@app/services/tile-description/tile-description.service';
import { TimerService } from '@app/services/timer/timer.service';
import { PageEndpoint } from '@common/interfaces/endpoint.enum';
import { MapSize } from '@common/interfaces/map-data';
import { TurnPhase } from '@common/interfaces/match';
import { MOCK_GAME_DATAS } from '@common/test-consts/mock-games';
import { MOCK_MATCH_DATAS } from '@common/test-consts/mock-matches';
import { BehaviorSubject } from 'rxjs';
import { PlayPageComponent } from './play-page.component';

describe('PlayPageComponent', () => {
    let component: PlayPageComponent;
    let fixture: ComponentFixture<PlayPageComponent>;

    let mockThumbnailService: jasmine.SpyObj<ThumbnailService>;
    let mockMapService: jasmine.SpyObj<MapService>;
    let mockTimerService: jasmine.SpyObj<TimerService>;
    let mockGameDataService: jasmine.SpyObj<GameDataService>;
    let mockMatchDataService: jasmine.SpyObj<MatchDataService>;
    let mockCoreSocketService: jasmine.SpyObj<CoreSocketService>;
    let mockPopupService: jasmine.SpyObj<PopupService>;
    let mockRouter: jasmine.SpyObj<Router>;
    let mockPlaySocketsService: jasmine.SpyObj<PlaySocketsService>;
    let connectionStatusSubject: BehaviorSubject<boolean>;
    let mockTileDescriptionService: jasmine.SpyObj<TileDescriptionService>;

    beforeEach(() => {
        mockTimerService = jasmine.createSpyObj('TimerService', ['startTimer']);
        mockGameDataService = jasmine.createSpyObj('GameDataService', ['getMapSize'], { gameData: structuredClone(MOCK_GAME_DATAS[2]) });
        mockPopupService = jasmine.createSpyObj('PopupService', ['showPopup', 'clearMessages', 'keepMessages']);
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);
        mockTileDescriptionService = jasmine.createSpyObj('TileDescriptionService', ['displayTileDescription', 'hideTileDescription'], {
            showTileDescription: false,
            tileDescription: DEFAULT_TILE_DESCRIPTION,
            tileDescriptionPos: { x: 0, y: 0 },
            isPlayerDescription: false,
        });
        mockMapService = jasmine.createSpyObj('MapService', ['getTileImage', 'hasActionOverlay', 'clearActions', 'clearOverlays'], {
            visualMapData: { size: MapSize.Small },
        });
        mockThumbnailService = jasmine.createSpyObj('ThumbnailService', ['getThumbnail']);
        mockMatchDataService = jasmine.createSpyObj('MatchDataService', ['startMatch'], {
            matchData: structuredClone(MOCK_MATCH_DATAS[2]),
            selfIndex: 0,
            matchUpdate: new BehaviorSubject(null),
        });
        mockPlaySocketsService = jasmine.createSpyObj('PlaySocketsService', [
            'setHoverMoves',
            'clickTile',
            'changeDebugMode',
            'displayActions',
            'endTurn',
            'leaveMatch',
        ]);

        connectionStatusSubject = new BehaviorSubject<boolean>(true);
        mockCoreSocketService = jasmine.createSpyObj('CoreSocketService', ['emit'], {
            connectionStatus: connectionStatusSubject.asObservable(),
        });

        TestBed.configureTestingModule({
            imports: [PlayPageComponent, MapComponent],
            providers: [
                { provide: ThumbnailService, useValue: mockThumbnailService },
                { provide: MapService, useValue: mockMapService },
                { provide: TimerService, useValue: mockTimerService },
                { provide: GameDataService, useValue: mockGameDataService },
                { provide: MatchDataService, useValue: mockMatchDataService },
                { provide: CoreSocketService, useValue: mockCoreSocketService },
                { provide: PopupService, useValue: mockPopupService },
                { provide: Router, useValue: mockRouter },
                { provide: PlaySocketsService, useValue: mockPlaySocketsService },
                { provide: TileDescriptionService, useValue: mockTileDescriptionService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(PlayPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should verify socket connection and do nothing if connected', () => {
        connectionStatusSubject.next(true);

        expect(mockPopupService.showPopup).not.toHaveBeenCalled();
        expect(mockPopupService.keepMessages).not.toHaveBeenCalled();
        expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should show popup, keep messages, and navigate if socket disconnects', () => {
        connectionStatusSubject.next(false);
        expect(mockPopupService.keepMessages).not.toHaveBeenCalled();
        expect(mockRouter.navigate).toHaveBeenCalledWith([PageEndpoint.Menu]);
    });

    it('should return selfIndex from matchDataService', () => {
        const expectedSelfIndex = 0;
        expect(component.selfIndex).toBe(expectedSelfIndex);
        expect(component.selfIndex).toBe(mockMatchDataService.selfIndex);
    });

    it('should toggle debug mode on "d" or "D" key press', () => {
        const debugSpy = mockPlaySocketsService.changeDebugMode;

        const eventD = new KeyboardEvent('keydown', { key: 'd' });
        component.onKeyDown(eventD);
        expect(debugSpy).toHaveBeenCalledTimes(1);

        const eventUpperD = new KeyboardEvent('keydown', { key: 'D' });
        component.onKeyDown(eventUpperD);
        expect(debugSpy).toHaveBeenCalledTimes(2);

        const eventX = new KeyboardEvent('keydown', { key: 'x' });
        component.onKeyDown(eventX);
        expect(debugSpy).toHaveBeenCalledTimes(2);

        const eventRepeat = new KeyboardEvent('keydown', { key: 'd', repeat: true });
        component.onKeyDown(eventRepeat);
        expect(debugSpy).toHaveBeenCalledTimes(2);
    });

    it('should handle useAction based on conditions', () => {
        mockMapService.hasActionOverlay.and.returnValue(true);
        component.useAction();
        expect(mockMapService.clearActions).toHaveBeenCalled();
        expect(mockPlaySocketsService.displayActions).not.toHaveBeenCalled();
        mockMapService.hasActionOverlay.and.returnValue(false);

        mockMatchDataService.matchData.activePlayer = 0;
        mockMatchDataService.matchData.phase = TurnPhase.Turn;
        mockMatchDataService.matchData.players[0].currentStats.hasAction = true;
        component.useAction();
        expect(mockPlaySocketsService.displayActions).toHaveBeenCalled();
        expect(mockMapService.clearActions).toHaveBeenCalledTimes(1);

        mockMatchDataService.matchData.players[0].currentStats.hasAction = false;
        component.useAction();
        expect(mockPlaySocketsService.displayActions).toHaveBeenCalledTimes(1);
    });

    it('should end turn if canEndTurn is true', () => {
        mockMatchDataService.matchData.activePlayer = 0;
        mockMatchDataService.matchData.phase = TurnPhase.Turn;
        component.endTurn();
        expect(mockPlaySocketsService.endTurn).toHaveBeenCalled();
        mockMatchDataService.matchData.phase = TurnPhase.PreTurn;
        component.endTurn();
        expect(mockPlaySocketsService.endTurn).toHaveBeenCalledTimes(1);
    });

    it('should show surrender popup with leaveMatch callback', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- private method
        spyOn<any>(component, 'leaveMatch');
        component.surrender();
        expect(mockPopupService.showPopup).toHaveBeenCalledWith('Voulez-vous vraiment abandonner ?', true, jasmine.any(Function));
    });

    it('should leave match and navigate to home', () => {
        component['leaveMatch']();
        expect(mockPlaySocketsService.leaveMatch).toHaveBeenCalled();
        expect(mockRouter.navigate).toHaveBeenCalledWith([PageEndpoint.Menu]);
    });

    it('should call displayTileDescription and hideTileDescription', () => {
        const event = new MouseEvent('click');
        component.showTileDescription(event);
        expect(mockTileDescriptionService.displayTileDescription).toHaveBeenCalledWith(event);
        component.hideTileDescription();
        expect(mockTileDescriptionService.hideTileDescription).toHaveBeenCalled();
    });

    it('should ignore repeated key events', () => {
        mockPlaySocketsService.changeDebugMode.calls.reset();

        const repeatedKeyEvent = new KeyboardEvent('keydown', {
            key: 'd',
            repeat: true,
        });

        component.onKeyDown(repeatedKeyEvent);

        expect(mockPlaySocketsService.changeDebugMode).not.toHaveBeenCalled();
    });
});
