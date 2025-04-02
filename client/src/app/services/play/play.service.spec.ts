import { TestBed } from '@angular/core/testing';
import { MapService } from '@app/services/map/map.service';
import { PlayService } from './play.service';
import { SocketService } from '@app/services/socket/socket.service';
import { MatchService } from '@app/services/match/match.service';
import { MovementService } from '@app/services/movement/movement.service';
import { PlayEvent } from '@common/interfaces/socket-event.enum';
import { Timer } from '@app/classes/timer/timer';
import { MOCK_MATCH_DATAS } from '@common/test-consts/mock-matches';
import { MatchData } from '@common/interfaces/match-data';

describe('PlayService', () => {
    let service: PlayService;
    let socketServiceSpy: jasmine.SpyObj<SocketService>;
    let matchServiceSpy: jasmine.SpyObj<MatchService>;
    let mapServiceSpy: jasmine.SpyObj<MapService>;
    let movementServiceSpy: jasmine.SpyObj<MovementService>;
    let timerSpy: jasmine.SpyObj<Timer>;
    let mockMatchData: MatchData;

    beforeEach(() => {
        mockMatchData = structuredClone(MOCK_MATCH_DATAS[0]);
        socketServiceSpy = jasmine.createSpyObj('SocketService', ['emit']);
        matchServiceSpy = jasmine.createSpyObj('MatchService', ['isState'], {
            data: mockMatchData,
            matchUpdate: { pipe: () => ({ subscribe: () => ({}) }) },
        });
        mapServiceSpy = jasmine.createSpyObj('MapService', [
            'setHoverMoves',
            'setPossibleMoves',
            'setActions',
            'clearOverlays',
            'movePlayer',
            'hasActionOverlay',
            'clearActions',
            'setPlayers',
        ]);
        movementServiceSpy = jasmine.createSpyObj('MovementService', ['getActions', 'getShortestPath']);
        timerSpy = jasmine.createSpyObj('Timer', ['startTimer', 'pauseTimer']);

        TestBed.configureTestingModule({
            providers: [
                { provide: SocketService, useValue: socketServiceSpy },
                { provide: MatchService, useValue: matchServiceSpy },
                { provide: MapService, useValue: mapServiceSpy },
                { provide: MovementService, useValue: movementServiceSpy },
            ],
        });

        service = TestBed.inject(PlayService);
        service.timer = timerSpy;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should end turn emit end turn event', () => {
        service.endTurn();
        expect(socketServiceSpy.emit).toHaveBeenCalledWith(PlayEvent.EndTurn);
    });
});
