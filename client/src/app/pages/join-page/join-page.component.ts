import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatComponent } from '@app/components/chat/chat.component';
import { GameCardComponent } from '@app/components/game-card/game-card.component';
import { HeaderComponent } from '@app/components/header/header.component';
import { PokeballButtonComponent } from '@app/components/pokeball-button/pokeball-button.component';
import { BackgroundMusic, SoundEffect } from '@app/interfaces/sound-service';
import { AudioService } from '@app/services/audio/audio.service';
import { MatchService } from '@app/services/match/match.service';
import { SocketService } from '@app/services/socket/socket.service';
import { MATCH_CODE_LENGTH } from '@common/consts/match-data.const';
import { PageEndpoint } from '@common/interfaces/endpoint.enum';
import { MatchData } from '@common/interfaces/match-data';
import { JoinPageEvent } from '@common/interfaces/socket-event.enum';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-join-page',
    templateUrl: './join-page.component.html',
    styleUrls: ['./join-page.component.scss'],
    imports: [HeaderComponent, FormsModule, ChatComponent, PokeballButtonComponent, GameCardComponent, TranslateModule],
})
export class JoinPageComponent implements OnInit, OnDestroy {
    matchCode: string = '';
    codeLength: number = MATCH_CODE_LENGTH;
    isCodeInputDisplayed: boolean = false;
    availableMaches: MatchData[] = [];
    readonly audioService: AudioService = inject(AudioService);
    readonly clickValue = SoundEffect.Click;
    private isJoiningMatch = false;
    private router: Router = inject(Router);
    private matchService: MatchService = inject(MatchService);
    private readonly socketService: SocketService = inject(SocketService);

    ngOnInit() {
        this.socketService.emit(JoinPageEvent.JoinRoom);
        this.socketService.on(JoinPageEvent.UpdateMatchList, (matches: MatchData[]) => {
            this.availableMaches = matches;
        });
        this.audioService.playBackgroundMusic(BackgroundMusic.Home);
    }

    async joinMatch(matchCode: string) {
        this.isJoiningMatch = true;
        await this.matchService.joinMatch(matchCode);
        this.isJoiningMatch = false;
    }

    async onKeyUp(event: KeyboardEvent) {
        const isJoinKey = event.key === 'Enter';

        if (isJoinKey && !this.isJoiningMatch) {
            const matchCode = this.matchCode;
            this.matchCode = '';
            await this.joinMatch(matchCode);
        }
    }

    navigateToMenu() {
        this.audioService.playEffect(SoundEffect.Click);
        this.router.navigate([PageEndpoint.Menu]);
    }

    toggleCodeInputDisplay(): void {
        this.isCodeInputDisplayed = !this.isCodeInputDisplayed;
    }

    onInputClick(event: MouseEvent): void {
        event.stopPropagation();
        this.audioService.playEffect(SoundEffect.Click);
    }

    ngOnDestroy() {
        this.socketService.emit(JoinPageEvent.LeaveRoom);
        this.socketService.off(JoinPageEvent.UpdateMatchList);
    }
}
