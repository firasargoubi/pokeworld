import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AVATAR_DATA } from '@app/consts/avatars.const';
import { Avatars } from '@app/interfaces/avatars.enum';
import { Player } from '@common/player';
import { PlayerCardComponent } from './player-card.component';

describe('PlayerCardComponent', () => {
    let component: PlayerCardComponent;
    let fixture: ComponentFixture<PlayerCardComponent>;

    const mockPlayer: Player = {
        id: '1',
        name: 'Player',
        avatar: Avatars.Avatar3,
        playerStats: {
            health: 6,
            speed: 5,
            attack: 10,
            defense: 4,
            attackDice: 'd6',
            defenseDice: 'd4',
        },
        currentStats: {
            health: 6,
            items: [],
            position: { x: 0, y: 0 },
            speed: 5,
            action: 2,
        },
        isAdmin: true,
        isConnected: true,
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PlayerCardComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(PlayerCardComponent);
        component = fixture.componentInstance;
        component.player = { ...mockPlayer };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display the correct player name', () => {
        const playerNameElement = fixture.debugElement.query(By.css('.player-name'));
        expect(playerNameElement.nativeElement.textContent.trim()).toBe(mockPlayer.name);
    });

    it('should return correct avatar URL', () => {
        expect(component.avatarUrl).toBe(AVATAR_DATA[mockPlayer.avatar]?.image || 'assets/avatars/default.png');
    });

    it('should return the correct background image based on isViewer', () => {
        component.isViewer = true;
        fixture.detectChanges();
        expect(component.backgroundImageUrl).toBe('../../../assets/images/menu/containers/player-card/orange-container.png');

        component.isViewer = false;
        fixture.detectChanges();
        expect(component.backgroundImageUrl).toBe('../../../assets/images/menu/containers/player-card/dark-blue-container.png');
    });

    it('should return the correct HP bar width', () => {
        component.player.playerStats.health = 4;
        expect(component.getHpBarWidth()).toBe('55%');

        component.player.playerStats.health = 6;
        expect(component.getHpBarWidth()).toBe('74%');

        component.player.playerStats.health = 3;
        expect(component.getHpBarWidth()).toBe('0%');
    });

    it('should display HP text correctly', () => {
        fixture.detectChanges();
        const hpTextElement = fixture.debugElement.query(By.css('.hp-text'));
        expect(hpTextElement.nativeElement.textContent.trim()).toBe(`${mockPlayer.playerStats.health}/ 6`);
    });

    it('should display the crown when isAdmin is true', () => {
        component.player.isAdmin = true;
        fixture.detectChanges();
        const crownElement = fixture.debugElement.query(By.css('.owner-crown'));
        expect(crownElement).toBeTruthy();
    });

    it('should not display the crown when isOwner is false', () => {
        component.player.isAdmin = false;
        fixture.detectChanges();
        const crownElement = fixture.debugElement.query(By.css('.owner-crown'));
        expect(crownElement).toBeFalsy();
    });
});
