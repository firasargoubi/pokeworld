import { Component, inject, Input } from '@angular/core';
import { ItemComponent } from '@app/components/item/item.component';
import { AvatarVisualEffect } from '@app/interfaces/map-visual-data';
import { MapService } from '@app/services/map/map.service';
import { MatchService } from '@app/services/match/match.service';
import { PlayService } from '@app/services/play/play.service';
import { OUTSIDE_OF_MAP } from '@common/consts/map-data.const';
import { ItemType } from '@common/interfaces/item-type.enum';
import { Position } from '@common/interfaces/position';

@Component({
    selector: 'app-map',
    standalone: true,
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss'],
    imports: [ItemComponent],
})
export class MapComponent {
    @Input() isEditor: boolean = false;
    mapService: MapService = inject(MapService);
    matchService: MatchService = inject(MatchService);
    avatarVisualEffect = AvatarVisualEffect;
    private playService: PlayService = inject(PlayService);
    private lastHover: Position = structuredClone(OUTSIDE_OF_MAP);

    // constructor() {
    //     this.matchService.matchUpdate.pipe(takeUntilDestroyed()).subscribe(this.conputeAvatarEffect.bind(this));
    // }

    onHover(position: Position) {
        const hoveringLastTile = this.lastHover.x !== position.x || this.lastHover.y !== position.y;
        if (!this.isEditor && hoveringLastTile) {
            this.lastHover = position;
            this.playService.displayMovementPath(position);
        }
    }

    clickTile(position: Position) {
        if (!this.isEditor) {
            this.playService.clickTile(position);
        }
    }

    rightClickTile(event: MouseEvent, position: Position) {
        if (!this.isEditor) {
            event.preventDefault();
            this.playService.rightClickTile(position);
        }
        this.matchService.data.players[this.matchService.selfIndex].position = position;
    }

    // conputeAvatarEffect() {
    //     const tiles = this.mapService.visualMapData.tiles;

    //     for (let i = 0; i < tiles.length; i++) {
    //         for (let j = 0; j < tiles[i].length; j++) {
    //             const tile = tiles[i][j];
    //             if (tile.player) {
    //                 const player = this.matchService.data.players.find((p) => p.position.x === i && p.position.y === j);

    //                 if (player?.items.includes(ItemType.Item6)) {
    //                     if (player.id === this.matchService.selfPlayer.id) {
    //                         tile.player.effect = AvatarVisualEffect.Fade;

    //                         // eslint-disable-next-line no-console
    //                         console.log('Player is Fade');
    //                     } else {
    //                         tile.player.effect = AvatarVisualEffect.Invisible;

    //                         // eslint-disable-next-line no-console
    //                         console.log('Player is invisible');
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // }

    getTileEffect(id: string): AvatarVisualEffect {
        const player = this.matchService.data.players.find((p) => p.id === id);
        if (player?.items.includes(ItemType.Item6)) {
            if (player.id === this.matchService.selfPlayer.id) {
                // eslint-disable-next-line no-console
                console.log('Player is Fade');
                return AvatarVisualEffect.Fade;
            } else {
                // eslint-disable-next-line no-console
                console.log('Player is invisible');
                return AvatarVisualEffect.Invisible;
            }
        }
        return AvatarVisualEffect.None;
    }
}
