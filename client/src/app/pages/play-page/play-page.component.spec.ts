import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MapComponent } from '@app/components/map/map.component';
import { MOCK_GAMES } from '@app/consts/tests/mock-games';
import { MOCK_MATCH_DATAS } from '@app/consts/tests/mock-matches';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { MapService } from '@app/services/map/map.service';
import { MatchDataService } from '@app/services/match-data/match-data.service';
import { PopupService } from '@app/services/popup/popup.service';
import { CoreSocketService } from '@app/services/sockets/core-socket/core-socket.service';
import { PlaySocketsService } from '@app/services/sockets/play-socket/play-sockets.service';
import { ThumbnailService } from '@app/services/thumbnail/thumbnail.service';
import { TimerService } from '@app/services/timer/timer.service';
import { MapSize } from '@common/map-size.enum';
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

    beforeEach(() => {
        mockTimerService = jasmine.createSpyObj('TimerService', ['startTimer']);
        mockGameDataService = jasmine.createSpyObj('GameDataService', ['getMapSize'], { gameData: structuredClone(MOCK_GAMES[2]) });
        mockPopupService = jasmine.createSpyObj('PopupService', ['showPopup', 'clearMessages', 'keepMessages']);
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);
        mockMapService = jasmine.createSpyObj('MapService', ['getTileImage', 'hasActionOverlay', 'clearActions'], {
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
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PlayPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
