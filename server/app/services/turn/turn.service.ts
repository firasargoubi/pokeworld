import { Inject, Injectable } from '@nestjs/common';
import { MatchService } from '@app/services/match/match.service';

@Injectable()
export class TurnService {
    @Inject(MatchService) private readonly matchService: MatchService;

    endTurn(playerId: string) {
        // eslint-disable-next-line no-console
        console.log('TurnService.endTurn', playerId);
    }
}
