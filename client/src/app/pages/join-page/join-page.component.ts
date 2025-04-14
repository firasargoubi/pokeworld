import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderComponent } from '@app/components/header/header.component';
import { MatchService } from '@app/services/match/match.service';
import { MATCH_CODE_LENGTH } from '@common/consts/match-data.const';
import { PageEndpoint } from '@common/interfaces/endpoint.enum';

@Component({
    selector: 'app-join-page',
    templateUrl: './join-page.component.html',
    styleUrls: ['./join-page.component.scss'],
    imports: [HeaderComponent, FormsModule],
})
export class JoinPageComponent {
    matchCode: string = '';
    codeLength: number = MATCH_CODE_LENGTH;
    private isJoiningMatch = false;
    private router: Router = inject(Router);
    private matchService: MatchService = inject(MatchService);

    async joinMatch(event: KeyboardEvent) {
        const isJoinKey = event.key === 'Enter';

        if (isJoinKey && !this.isJoiningMatch) {
            const matchCode = this.matchCode;
            this.matchCode = '';
            this.isJoiningMatch = true;
            await this.matchService.joinMatch(matchCode);
            this.isJoiningMatch = false;
        }
    }

    navigateToMenu() {
        this.router.navigate([PageEndpoint.Menu]);
    }
}
