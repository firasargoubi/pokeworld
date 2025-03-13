import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderComponent } from '@app/components/header/header.component';
import { CODE_LENGTH } from '@app/consts/join.const';
import { LobbySocketsService } from '@app/services/sockets/lobby-socket/lobby-sockets.service';

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

    joinGame(event: KeyboardEvent) {
        const isJoinKey = event.key === 'Enter';
        if (isJoinKey) {
            this.lobbySocketService.joinGame(this.gameCode).subscribe((joinStatus) => {
                if (joinStatus) {
                    this.router.navigate(['/player-selection']);
                }
            });
        }
    }

    navigateToMenu() {
        this.router.navigate(['/']);
    }
}
