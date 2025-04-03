import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Timer } from '@app/classes/timer/timer';
import { ChatComponent } from '@app/components/chat/chat.component';
import { MapComponent } from '@app/components/map/map.component';
import { DEFAULT_TILE_DESCRIPTION } from '@app/consts/tile-data.const';
import { MapService } from '@app/services/map/map.service';
import { MatchService } from '@app/services/match/match.service';
import { PlayService } from '@app/services/play/play.service';
import { PopupService } from '@app/services/popup/popup.service';
import { ThumbnailService } from '@app/services/thumbnail/thumbnail.service';
import { TileDescriptionService } from '@app/services/tile-description/tile-description.service';
import { PageEndpoint } from '@common/interfaces/endpoint.enum';
import { MOCK_MATCH_DATAS } from '@common/test-consts/mock-matches';
import { MOCK_PLAYER_DATAS } from '@common/test-consts/mock-players';
import { PlayPageComponent } from './play-page.component';

@Component({
    selector: 'app-chat',
    standalone: true,
    template: '',
})
class MockChatComponent {}

@Component({
    selector: 'app-map',
    standalone: true,
    template: '',
})
class MockMapComponent {
    @Input() isEditor: boolean = false;
}

describe('PlayPageComponent', () => {
    let component: PlayPageComponent;
    let fixture: ComponentFixture<PlayPageComponent>;
    let mockTileDescriptionService: jasmine.SpyObj<TileDescriptionService>;
    let mockMatchService: jasmine.SpyObj<MatchService>;
    let mockPlayService: jasmine.SpyObj<PlayService>;
    let mockPopupService: jasmine.SpyObj<PopupService>;
    let mockThumbnailService: jasmine.SpyObj<ThumbnailService>;
    let mockMapService: jasmine.SpyObj<MapService>;
    let mockRouter: jasmine.SpyObj<Router>;
    let mockTimer: jasmine.SpyObj<Timer>;

    beforeEach(() => {
        mockTimer = jasmine.createSpyObj('Timer', ['isStarted']);
        mockTileDescriptionService = jasmine.createSpyObj('TileDescriptionService', ['displayTileDescription', 'hideTileDescription'], {
            tileDescriptionPos: { x: 0, y: 0 },
            tileDescription: structuredClone(DEFAULT_TILE_DESCRIPTION),
        });
        mockMatchService = jasmine.createSpyObj(
            'MatchService',
            ['isInMatch', 'canUseAction', 'canEndTurn', 'getMovementLeft', 'isState', 'leaveMatch', 'isInventoryFull'],
            {
                matchUpdate: { pipe: () => ({ subscribe: () => ({}) }) },
                data: structuredClone(MOCK_MATCH_DATAS[0]),
                selfPlayer: structuredClone(MOCK_PLAYER_DATAS[0]),
            },
        );
        mockPlayService = jasmine.createSpyObj('PlayService', ['changeDebugMode', 'endTurn', 'displayActions'], {
            timer: mockTimer,
        });
        mockPopupService = jasmine.createSpyObj('PopupService', ['showPopup']);
        mockThumbnailService = jasmine.createSpyObj('ThumbnailService', ['getThumbnail']);
        mockMapService = jasmine.createSpyObj('MapService', ['hasActionOverlay', 'clearActions']);
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);

        TestBed.configureTestingModule({
            imports: [PlayPageComponent, MapComponent],
            providers: [
                { provide: TileDescriptionService, useValue: mockTileDescriptionService },
                { provide: MatchService, useValue: mockMatchService },
                { provide: PlayService, useValue: mockPlayService },
                { provide: PopupService, useValue: mockPopupService },
                { provide: ThumbnailService, useValue: mockThumbnailService },
                { provide: MapService, useValue: mockMapService },
                { provide: Router, useValue: mockRouter },
            ],
        }).compileComponents();

        TestBed.overrideComponent(PlayPageComponent, {
            add: { imports: [MockMapComponent, MockChatComponent] },
            remove: { imports: [MapComponent, ChatComponent] },
        });

        fixture = TestBed.createComponent(PlayPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should toggle debug mode d key press', () => {
        const mockEvent = new KeyboardEvent('keydown', { key: 'D' });
        component.onKeyDown(mockEvent);
        expect(mockPlayService.changeDebugMode).toHaveBeenCalled();
    });

    it('should action button clear actions', () => {
        mockMapService.hasActionOverlay.and.returnValue(true);
        component['actionButton']();
        expect(mockMapService.clearActions).toHaveBeenCalled();
    });

    it('should action button display actions', () => {
        component.visualData.canUseAction = true;
        component['actionButton']();
        expect(mockPlayService.displayActions).toHaveBeenCalled();
    });

    it('should end turn button call end turn', () => {
        component.visualData.canEndTurn = true;
        component['endTurnButton']();
        expect(mockPlayService.endTurn).toHaveBeenCalled();
    });

    it('should surrender button call popup service', () => {
        component['surrenderButton']();
        expect(mockPopupService.showPopup).toHaveBeenCalled();
    });

    it('should check for redirect to combat page', () => {
        mockMatchService.data.combatData.playersCombatData[0].playerIndex = 0;
        mockMatchService.selfIndex = 0;
        mockMatchService.isState.and.returnValue(true);
        component['checkForRedirect']();
        expect(mockRouter.navigate).toHaveBeenCalledWith([PageEndpoint.Combat]);
    });

    it('should check for redirect to stats page', () => {
        mockMatchService.isState.and.returnValue(true);
        component['checkForRedirect']();
        expect(mockRouter.navigate).toHaveBeenCalled();
    });

    it('should call displayTileDescription and hideTileDescription', () => {
        const event = new MouseEvent('click');
        component.showTileDescription(event);
        expect(mockTileDescriptionService.displayTileDescription).toHaveBeenCalledWith(event);
        component.hideTileDescription();
        expect(mockTileDescriptionService.hideTileDescription).toHaveBeenCalled();
    });

    it('should ignore repeated key events', () => {
        mockPlayService.changeDebugMode.calls.reset();

        const repeatedKeyEvent = new KeyboardEvent('keydown', {
            key: 'd',
            repeat: true,
        });

        component.onKeyDown(repeatedKeyEvent);

        expect(mockPlayService.changeDebugMode).not.toHaveBeenCalled();
    });
});
