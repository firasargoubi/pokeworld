import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { GAME_CARD_ROW_LENGTHS, TABLET_BREAKPOINT } from '@app/consts/ui.const';
import { AudioService } from '@app/services/audio/audio.service';
import { ThumbnailService } from '@app/services/thumbnail/thumbnail.service';
import { MapSize } from '@common/interfaces/map-data';
import { MOCK_GAME_DATAS } from '@common/test-consts/mock-games';
import { GameCardComponent } from './game-card.component';

describe('GameCardComponent', () => {
    let component: GameCardComponent;
    let fixture: ComponentFixture<GameCardComponent>;
    let thumbnailServiceSpy: jasmine.SpyObj<ThumbnailService>;
    let mockAudioService: jasmine.SpyObj<AudioService>;

    beforeEach(async () => {
        thumbnailServiceSpy = jasmine.createSpyObj('ThumbnailService', ['getThumbnail']);
        thumbnailServiceSpy.getThumbnail.and.returnValue(Promise.resolve('data:image/png;base64,mockthumbnail'));
        mockAudioService = jasmine.createSpyObj('AudioService', ['playEffect', 'preloadEffectsForPage']);

        await TestBed.configureTestingModule({
            imports: [GameCardComponent],
            providers: [
                { provide: ThumbnailService, useValue: thumbnailServiceSpy },
                { provide: AudioService, useValue: mockAudioService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(GameCardComponent);
        component = fixture.componentInstance;
        component.game = structuredClone(MOCK_GAME_DATAS[0]);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit edit event when onEdit is called', () => {
        spyOn(component.edit, 'emit');
        component.onEdit();
        expect(component.edit.emit).toHaveBeenCalledWith(MOCK_GAME_DATAS[0]._id);
    });

    it('should emit delete event when onDelete is confirmed', () => {
        spyOn(window, 'confirm').and.returnValue(true);
        spyOn(component.delete, 'emit');
        component.onDelete();
        expect(component.delete.emit).toHaveBeenCalledWith(MOCK_GAME_DATAS[0]._id);
    });

    it('should toggle visibility and emit event when onToggleVisibility is called', () => {
        spyOn(component.toggleVisibility, 'emit');
        component.onToggleVisibility();
        expect(component.toggleVisibility.emit).toHaveBeenCalledWith({ id: MOCK_GAME_DATAS[0]._id, isVisible: MOCK_GAME_DATAS[0].isVisible });
        expect(component.game.isVisible).toBeFalse();
    });

    it('should emit join event when onJoin is called', () => {
        spyOn(component.join, 'emit');
        component.onJoin();
        expect(component.join.emit).toHaveBeenCalledWith(MOCK_GAME_DATAS[0]._id);
    });

    it('should set isHovered to true onMouseEnter', () => {
        component.onMouseEnter();
        expect(component.isHovered).toBeTrue();
    });

    it('should set isHovered to false onMouseLeave', () => {
        component.onMouseLeave();
        expect(component.isHovered).toBeFalse();
    });

    it('should format date correctly', () => {
        const testDate = new Date('2023-06-15T14:30:00Z');
        const resultDate = component.formatDate(testDate);
        const expectedDate = testDate.toLocaleDateString() + ' ' + testDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        expect(resultDate).toBe(expectedDate);
    });

    it('should apply correct class for game mode', () => {
        fixture.detectChanges();
        const modeElement = fixture.debugElement.query(By.css('.mode-name'));
        expect(modeElement.nativeElement.textContent.trim()).toBe(MOCK_GAME_DATAS[0].mapData.gameMode);
    });

    it('should set thumbnailUrl on ngOnInit', async () => {
        const mockThumbnailUrl = 'data:image/png;base64,mockthumbnail';
        thumbnailServiceSpy.getThumbnail.and.returnValue(Promise.resolve(mockThumbnailUrl));

        spyOn(window, 'requestIdleCallback').and.callFake((cb: IdleRequestCallback) => {
            cb({ didTimeout: true } as IdleDeadline);
            return 0;
        });

        component.ngAfterViewInit();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(thumbnailServiceSpy.getThumbnail).toHaveBeenCalledWith(component.game.mapData, true);
        expect(component.thumbnailUrl).toBe(mockThumbnailUrl);
    });

    it('should return correct card color based on map size', () => {
        component.game.mapData.size = MapSize.Small;
        expect(component['getCardColor']()).toBe('blue-card');

        component.game.mapData.size = MapSize.Medium;
        expect(component['getCardColor']()).toBe('green-card');

        component.game.mapData.size = MapSize.Large;
        expect(component['getCardColor']()).toBe('pink-card');
    });

    it('should correctly identify last item in row for desktop', () => {
        spyOnProperty(window, 'innerWidth', 'get').and.returnValue(TABLET_BREAKPOINT);
        const desktopRowLength = GAME_CARD_ROW_LENGTHS.desktop;

        component.index = desktopRowLength - 1;
        expect(component.isAtRowEnd()).toBe(true);

        component.index = desktopRowLength * 2 - 1;
        expect(component.isAtRowEnd()).toBe(true);

        component.index = 0;
        expect(component.isAtRowEnd()).toBe(false);

        component.index = 1;
        expect(component.isAtRowEnd()).toBe(false);

        component.index = desktopRowLength;
        expect(component.isAtRowEnd()).toBe(false);
    });

    it('should correctly identify last item in row for tablet', () => {
        spyOnProperty(window, 'innerWidth', 'get').and.returnValue(TABLET_BREAKPOINT - 1);
        const tabletRowLength = GAME_CARD_ROW_LENGTHS.tablet;

        component.index = tabletRowLength - 1;
        expect(component.isAtRowEnd()).toBe(true);

        component.index = tabletRowLength * 2 - 1;
        expect(component.isAtRowEnd()).toBe(true);

        component.index = 0;
        expect(component.isAtRowEnd()).toBe(false);

        component.index = tabletRowLength;
        expect(component.isAtRowEnd()).toBe(false);
    });
});
