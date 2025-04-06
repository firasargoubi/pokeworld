import { NgClass } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PokeballButtonComponent } from '@app/components/pokeball-button/pokeball-button.component';
import { PlayerType } from '@common/interfaces/player-data';
import { CreateBotPopupComponent } from './bot-creation-popup.component';

describe('CreateBotPopupComponent', () => {
    let component: CreateBotPopupComponent;
    let fixture: ComponentFixture<CreateBotPopupComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CreateBotPopupComponent, NgClass, PokeballButtonComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(CreateBotPopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize selectedProfile to null', () => {
        const playerType = PlayerType.BotDefensive;
        component.onProfileSelection(playerType);
        expect(component.selectedProfile).toEqual(playerType);
    });

    it('should emit event when on valider selection is called', () => {
        spyOn(component.botTypeSelected, 'emit');
        component.onValiderSelection();
        expect(component.botTypeSelected.emit).toHaveBeenCalled();
    });
});
