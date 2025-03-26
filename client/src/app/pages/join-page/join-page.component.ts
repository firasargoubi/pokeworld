import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderComponent } from '@app/components/header/header.component';
import { MatchService } from '@app/services/match/match.service';
import { CODE_LENGTH } from '@common/consts/match-data.const';
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
    private matchService: MatchService = inject(MatchService);

    joinMatch(event: KeyboardEvent) {
        const isJoinKey = event.key === 'Enter';

        if (isJoinKey) {
            this.matchService.joinMatch(this.gameCode);
        }
    }

    navigateToMenu() {
        this.router.navigate([PageEndpoint.Menu]);
    }
}
