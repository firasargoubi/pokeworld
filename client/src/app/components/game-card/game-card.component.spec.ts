import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ThumbnailService } from '@app/services/thumbnail/thumbnail.service';
import { GameCardComponent } from './game-card.component';
import { MOCK_GAMES } from '@app/consts/tests/mock-games.spec';

describe('GameCardComponent', () => {
    let component: GameCardComponent;
    let fixture: ComponentFixture<GameCardComponent>;
    let thumbnailServiceSpy: jasmine.SpyObj<ThumbnailService>;

    beforeEach(async () => {
        const thumbnailSpy = jasmine.createSpyObj('ThumbnailService', ['getThumbnail']);
        thumbnailSpy.getThumbnail.and.returnValue(Promise.resolve('data:image/png;base64,mockthumbnail'));

        await TestBed.configureTestingModule({
            imports: [GameCardComponent],
            providers: [{ provide: ThumbnailService, useValue: thumbnailSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(GameCardComponent);
        component = fixture.componentInstance;
        component.game = structuredClone(MOCK_GAMES[0]);
        thumbnailServiceSpy = TestBed.inject(ThumbnailService) as jasmine.SpyObj<ThumbnailService>;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit edit event when onEdit is called', () => {
        spyOn(component.edit, 'emit');
        component.onEdit();
        expect(component.edit.emit).toHaveBeenCalledWith(MOCK_GAMES[0]._id);
    });

    it('should emit delete event when onDelete is confirmed', () => {
        spyOn(window, 'confirm').and.returnValue(true);
        spyOn(component.delete, 'emit');
        component.onDelete();
        expect(component.delete.emit).toHaveBeenCalledWith(MOCK_GAMES[0]._id);
    });

    it('should not emit delete event when onDelete is canceled', () => {
        spyOn(window, 'confirm').and.returnValue(false);
        spyOn(component.delete, 'emit');
        component.onDelete();
        expect(component.delete.emit).not.toHaveBeenCalled();
    });

    it('should toggle visibility and emit event when onToggleVisibility is called', () => {
        spyOn(component.toggleVisibility, 'emit');
        component.onToggleVisibility();
        expect(component.toggleVisibility.emit).toHaveBeenCalledWith({ id: MOCK_GAMES[0]._id, isVisible: !MOCK_GAMES[0].isVisible });
        expect(component.game.isVisible).toBeFalse();
    });

    it('should emit join event when onJoin is called', () => {
        spyOn(component.join, 'emit');
        component.onJoin();
        expect(component.join.emit).toHaveBeenCalledWith(MOCK_GAMES[0]._id);
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
        expect(modeElement.nativeElement.textContent.trim()).toBe(MOCK_GAMES[0].mapData.gameMode);
    });

    it('should display edition-buttons only when isAdminView is true', () => {
        component.isAdminView = true;
        fixture.detectChanges();

        let editionIcons = fixture.debugElement.query(By.css('.edition-buttons'));
        expect(editionIcons).toBeTruthy();

        component.isAdminView = false;
        fixture.detectChanges();

        editionIcons = fixture.debugElement.query(By.css('.edition-buttons'));
        expect(editionIcons).toBeFalsy();
    });

    it('should set thumbnailUrl on ngOnInit', async () => {
        const mockThumbnailUrl = 'data:image/png;base64,mockthumbnail';
        thumbnailServiceSpy.getThumbnail.and.returnValue(Promise.resolve(mockThumbnailUrl));

        await component.ngOnInit();
        fixture.detectChanges();

        expect(thumbnailServiceSpy.getThumbnail).toHaveBeenCalledWith(component.game.mapData);
        expect(component.thumbnailUrl).toBe(mockThumbnailUrl);
    });
});
