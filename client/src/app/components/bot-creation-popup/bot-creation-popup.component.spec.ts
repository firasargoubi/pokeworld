import { NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PokeballButtonComponent } from '@app/components/pokeball-button/pokeball-button.component';
import { AudioService } from '@app/services/audio/audio.service';
import { PlayerType } from '@common/interfaces/player-data';
import { TranslateModule } from '@ngx-translate/core';
import { CreateBotPopupComponent } from './bot-creation-popup.component';

describe('CreateBotPopupComponent', () => {
    let component: CreateBotPopupComponent;
    let fixture: ComponentFixture<CreateBotPopupComponent>;
    let mockAudioService: jasmine.SpyObj<AudioService>;

    beforeEach(async () => {
        mockAudioService = jasmine.createSpyObj('AudioService', ['playEffect', 'preloadEffectsForPage']);

        await TestBed.configureTestingModule({
            imports: [CreateBotPopupComponent, NgClass, PokeballButtonComponent, TranslateModule.forRoot()],
            providers: [
                { provide: AudioService, useValue: mockAudioService },
                { provide: HttpClient, useValue: HttpClient },
            ],
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
