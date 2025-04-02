import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerCardComponent } from './player-card.component';
import { EMPTY_IMAGE } from '@app/consts/images.const';

describe('PlayerCardComponent', () => {
    let component: PlayerCardComponent;
    let fixture: ComponentFixture<PlayerCardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PlayerCardComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(PlayerCardComponent);
        component = fixture.componentInstance;
        component.player = {
            isConnected: true,
            name: 'Bob',
            isHost: true,
            isSelf: true,
            avatarImage: EMPTY_IMAGE,
            health: 6,
            id: '1234',
        };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
