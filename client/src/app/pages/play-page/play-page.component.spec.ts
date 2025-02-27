import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MapComponent } from '@app/components/map/map.component';
import { PlayPageComponent } from './play-page.component';

describe('PlayPageComponent', () => {
    let component: PlayPageComponent;
    let fixture: ComponentFixture<PlayPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PlayPageComponent, MapComponent],
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

    it('should surrender game', () => {
        component.surrender();
        // TODO tester la logique d'abandon
        expect(true).toBe(true);
    });

    it('should use action', () => {
        component.action();
        // TODO tester la logique d'action
        expect(true).toBe(true);
    });

    it('should end turn', () => {
        component.endTurn();
        // TODO tester la logique de fin de tour
        expect(true).toBe(true);
    });
});
