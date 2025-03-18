import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderComponent } from '@app/components/header/header.component';
import { PlayerSelectionService } from '@app/services/player-selection/player-selection.service';
import { LobbySocketsService } from '@app/services/sockets/lobby-socket/lobby-sockets.service';
import { CODE_LENGTH } from '@common/consts/match.const';
import { PageEndpoint } from '@common/interfaces/endpoint.enum';

@Component({
    selector: 'app-join-page',
    templateUrl: './join-page.component.html',
    styleUrls: ['./join-page.component.scss'],
    imports: [HeaderComponent, FormsModule],
})
export class JoinPageComponent {
    gameCode: string = '';
    codeLength: number = CODE_LENGTH;
    private router: Router = inject(Router);
    private lobbySocketService: LobbySocketsService = inject(LobbySocketsService);
    private playerSelectionService: PlayerSelectionService = inject(PlayerSelectionService);

    joinMatch(event: KeyboardEvent) {
        const isJoinKey = event.key === 'Enter';

        if (isJoinKey) {
            this.lobbySocketService.joinMatch(this.gameCode).subscribe((joinStatus) => {
                if (joinStatus) {
                    this.playerSelectionService.matchCode = this.gameCode;
                    this.router.navigate([PageEndpoint.PlayerSelection]);
                }
            });
        }
    }

    navigateToMenu() {
        this.router.navigate([PageEndpoint.Menu]);
    }
}
