import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EMPTY_IMAGE } from '@app/consts/images.const';
import { PlayerCardComponent } from './player-card.component';

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
            playerType: 'player',
        };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
