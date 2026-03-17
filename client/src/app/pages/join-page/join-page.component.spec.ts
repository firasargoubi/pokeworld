import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatComponent } from '@app/components/chat/chat.component';
import { HeaderComponent } from '@app/components/header/header.component';
import { AudioService } from '@app/services/audio/audio.service';
import { MatchService } from '@app/services/match/match.service';
import { PageEndpoint } from '@common/interfaces/endpoint.enum';
import { TranslateModule } from '@ngx-translate/core';
import { JoinPageComponent } from './join-page.component';

@Component({
    selector: 'app-chat',
    standalone: true,
    template: '',
})
class MockChatComponent {}

describe('JoinPageComponent', () => {
    let component: JoinPageComponent;
    let fixture: ComponentFixture<JoinPageComponent>;
    let routerSpy: jasmine.SpyObj<Router>;
    let matchServiceSpy: jasmine.SpyObj<MatchService>;
    let mockAudioService: jasmine.SpyObj<AudioService>;

    beforeEach(async () => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        matchServiceSpy = jasmine.createSpyObj('MatchService', ['joinMatch']);
        mockAudioService = jasmine.createSpyObj('AudioService', ['playEffect', 'playBackgroundMusic', 'preloadEffectsForPage', 'playCombatEffect']);

        await TestBed.configureTestingModule({
            imports: [FormsModule, HeaderComponent, TranslateModule.forRoot()],
            providers: [
                { provide: Router, useValue: routerSpy },
                { provide: MatchService, useValue: matchServiceSpy },
                { provide: AudioService, useValue: mockAudioService },
            ],
        }).compileComponents();

        TestBed.overrideComponent(JoinPageComponent, {
            add: { imports: [MockChatComponent] },
            remove: { imports: [ChatComponent] },
        });

        fixture = TestBed.createComponent(JoinPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should join match on enter key press when input code is provided', () => {
        const inputCode = 'TEST123';
        component.matchCode = inputCode;
        const mockEvent = new KeyboardEvent('Enter', { key: 'Enter' });
        component.onKeyUp(mockEvent);
        expect(matchServiceSpy.joinMatch).toHaveBeenCalledWith(inputCode);
    });

    it('should navigate to menu when navigateToMenu is called', () => {
        component.navigateToMenu();
        expect(routerSpy.navigate).toHaveBeenCalledWith([PageEndpoint.Menu]);
    });
});
