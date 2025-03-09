import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AVATAR_DATA } from '@app/consts/avatars.const';
import { Avatars } from '@app/interfaces/avatars.enum';
import { Player } from '@app/interfaces/player';
import { PlayerCardComponent } from './player-card.component';

describe('PlayerCardComponent', () => {
    let component: PlayerCardComponent;
    let fixture: ComponentFixture<PlayerCardComponent>;

    const mockPlayer: Player = {
        name: 'Player',
        avatar: Avatars.Avatar1,
        life: 4,
        speed: 6,
        attack: 8,
        defense: 5,
        bonusDice: { attack: 'd8', defense: 'd6' },
        movement: 3,
        action: 2,
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
        expect(component.backgroundImageUrl).toBe('../../../assets/images/menu/containers/orange/orange-scrare-body.png');

        component.isViewer = false;
        fixture.detectChanges();
        expect(component.backgroundImageUrl).toBe('../../../assets/images/menu/containers/blue/blue-scrare-body.png');
    });

    it('should return the correct HP bar width', () => {
        component.player.life = 4;
        expect(component.getHpBarWidth()).toBe('55%');

        component.player.life = 6;
        expect(component.getHpBarWidth()).toBe('73%');

        component.player.life = 3;
        expect(component.getHpBarWidth()).toBe('0%');
    });

    it('should display HP text correctly', () => {
        fixture.detectChanges();
        const hpTextElement = fixture.debugElement.query(By.css('.hp-text'));
        expect(hpTextElement.nativeElement.textContent.trim()).toBe(`${mockPlayer.life} /6`);
    });

    it('should display the crown when isOwner is true', () => {
        component.isOwner = true;
        fixture.detectChanges();
        const crownElement = fixture.debugElement.query(By.css('.owner-crown'));
        expect(crownElement).toBeTruthy();
    });

    it('should not display the crown when isOwner is false', () => {
        component.isOwner = false;
        fixture.detectChanges();
        const crownElement = fixture.debugElement.query(By.css('.owner-crown'));
        expect(crownElement).toBeFalsy();
    });
});
