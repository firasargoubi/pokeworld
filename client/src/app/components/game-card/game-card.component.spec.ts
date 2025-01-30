import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { GameMode } from '@common/game-mode.enum';
import { ItemType } from '@common/item-type.enum';
import { MapSize } from '@common/map-size.enum';
import { GameCardComponent } from './game-card.component';

describe('GameCardComponent', () => {
    let component: GameCardComponent;
    let fixture: ComponentFixture<GameCardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [GameCardComponent, FormsModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameCardComponent);
        component = fixture.componentInstance;
        component.game = {
            _id: '1',
            name: 'Test Game',
            description: 'Test Description',
            lastEdited: new Date(),
            isVisible: true,
            mapData: {
                tiles: [],
                items: {
                    [ItemType.Item1]: [],
                    [ItemType.Item2]: [],
                    [ItemType.Item3]: [],
                    [ItemType.Item4]: [],
                    [ItemType.Item5]: [],
                    [ItemType.Item6]: [],
                    [ItemType.Random]: [],
                    [ItemType.Spawn]: [],
                    [ItemType.Flag]: [],
                },
                size: MapSize.Small,
                gameMode: GameMode.FFA,
            },
            thumbnail: 'path/to/thumbnail.png',
        };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit edit event when onEdit is called', () => {
        spyOn(component.edit, 'emit');
        component.onEdit();
        expect(component.edit.emit).toHaveBeenCalledWith(component.game._id);
    });

    it('should emit delete event when onDelete is called', () => {
        spyOn(component.delete, 'emit');
        component.onDelete();
        expect(component.delete.emit).toHaveBeenCalledWith(component.game._id);
    });

    it('should emit toggleVisibility event when onToggleVisibility is called', () => {
        spyOn(component.toggleVisibility, 'emit');
        component.onToggleVisibility();
        expect(component.toggleVisibility.emit).toHaveBeenCalledWith({ id: component.game._id, isVisible: true });
    });

    it('should emit join event when onJoin is called', () => {
        spyOn(component.join, 'emit');
        component.onJoin();
        expect(component.join.emit).toHaveBeenCalledWith(component.game._id);
    });

    it('should show admin controls when isAdminView is true', () => {
        component.isAdminView = true;
        fixture.detectChanges();

        const editButton = fixture.debugElement.query(By.css('#edition-icons img:nth-of-type(1)')).nativeElement;
        const deleteButton = fixture.debugElement.query(By.css('#edition-icons img:nth-of-type(2)')).nativeElement;
        const visibilityCheckbox = fixture.debugElement.query(By.css('#edition-icons img:nth-of-type(3)')).nativeElement;

        expect(editButton).toBeTruthy();
        expect(deleteButton).toBeTruthy();
        expect(visibilityCheckbox).toBeTruthy();
    });

    it('should show play button when isAdminView is false', () => {
        component.isAdminView = false;
        fixture.detectChanges();

        const playButton = fixture.debugElement.query(By.css('button')).nativeElement;
        expect(playButton.textContent).toContain('Play');
    });

    it('should emit true when mouse is hovering the component', () => {
        const thumbnailHoverSpy = spyOn(component.thumbnailHover, 'emit');
        component.onMouseEnter();
        expect(thumbnailHoverSpy).toHaveBeenCalledWith(true);
    });

    it('should emit false when mouse is not hovering the component', () => {
        const thumbnailHoverSpy = spyOn(component.thumbnailHover, 'emit');
        component.onMouseLeave();
        expect(thumbnailHoverSpy).toHaveBeenCalledWith(false);
    });
});
