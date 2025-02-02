import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { GameData } from '@common/game-data';
import { GameMode } from '@common/game-mode.enum';
import { MapSize } from '@common/map-size.enum';
import { GameCardComponent } from './game-card.component';

describe('GameCardComponent', () => {
    let component: GameCardComponent;
    let fixture: ComponentFixture<GameCardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [GameCardComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameCardComponent);
        component = fixture.componentInstance;

        component.game = {
            _id: '1',
            name: 'Test Game',
            description: 'A test game description',
            mapData: { size: MapSize.Medium, gameMode: GameMode.FFA },
            thumbnail: 'test-thumbnail.jpg',
            lastEdited: new Date(),
            isVisible: true,
        } as GameData;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit edit event when onEdit is called', () => {
        spyOn(component.edit, 'emit');
        component.onEdit();
        expect(component.edit.emit).toHaveBeenCalledWith('1');
    });

    it('should emit delete event when onDelete is confirmed', () => {
        spyOn(window, 'confirm').and.returnValue(true);
        spyOn(component.delete, 'emit');
        component.onDelete();
        expect(component.delete.emit).toHaveBeenCalledWith('1');
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
        expect(component.toggleVisibility.emit).toHaveBeenCalledWith({ id: '1', isVisible: true });
        expect(component.game.isVisible).toBeFalse();
    });

    it('should emit join event when onJoin is called', () => {
        spyOn(component.join, 'emit');
        component.onJoin();
        expect(component.join.emit).toHaveBeenCalledWith('1');
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
        const testDate = '2023-06-15T14:30:00Z';
        const formattedDate = component.formatDate(testDate);
        expect(formattedDate).toBe('15/06/2023 10:30');
    });

    it('should apply correct class for game mode', () => {
        fixture.detectChanges();
        const modeElement = fixture.debugElement.query(By.css('.mode-name'));
        expect(modeElement.nativeElement.textContent.trim()).toBe(GameMode.FFA);
    });

    it('should display edition-icons only when isAdminView is true', () => {
        component.isAdminView = true;
        fixture.detectChanges();

        let editionIcons = fixture.debugElement.query(By.css('.edition-icons'));
        expect(editionIcons).toBeTruthy();

        component.isAdminView = false;
        fixture.detectChanges();

        editionIcons = fixture.debugElement.query(By.css('.edition-icons'));
        expect(editionIcons).toBeFalsy();
    });
});
