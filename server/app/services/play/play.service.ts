import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { MatchService } from '@app/services/match/match.service';
import { PlayGateway } from '@app/gateways/play/play.gateway';

@Injectable()
export class PlayService {
    @Inject(forwardRef(() => PlayGateway)) private readonly playGateway: PlayGateway;
    @Inject(MatchService) private readonly matchService: MatchService;

    endTurn(playerId: string) {
        // eslint-disable-next-line no-console
        console.log('PlayService.endTurn()', playerId);
    }
}
