import { Component, inject } from '@angular/core';
import { MapComponent } from '@app/components/map/map.component';
import { EMPTY_IMAGE } from '@app/consts/images.const';
import { MatchVisualData } from '@app/interfaces/match-visual-data';
import { GameDataService } from '@app/services/game-data/game-data.service';
import { ThumbnailService } from '@app/services/thumbnail/thumbnail.service';
import { CommonModule } from '@angular/common';
import { GameMode } from '@common/game-mode.enum';
import { ItemType } from '@common/item-type.enum';
import { MapSize } from '@common/map-size.enum';
import { TileType } from '@common/tile-type.enum';
import { AVATAR_DATA } from '@app/consts/avatars.const';
import { Avatars } from '@app/interfaces/avatars.enum';

@Component({
    selector: 'app-play-page',
    templateUrl: './play-page.component.html',
    styleUrls: ['./play-page.component.scss'],
    imports: [MapComponent, CommonModule],
})
export class PlayPageComponent {
    matchVisualData: MatchVisualData;

    constructor() {
        inject(GameDataService).setGameData({
            _id: '',
            name: '',
            description: '',
            lastEdited: new Date(),
            isVisible: false,
            mapData: {
                items: {
                    [ItemType.Item1]: [],
                    [ItemType.Item2]: [],
                    [ItemType.Item3]: [],
                    [ItemType.Item4]: [],
                    [ItemType.Item5]: [],
                    [ItemType.Item6]: [],
                    [ItemType.Random]: [],
                    [ItemType.Spawn]: [],
                    [ItemType.Flag]: [],
                },
                tiles: [
                    [
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Path,
                        TileType.Grass,
                    ],
                    [
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Bush,
                        TileType.Bush,
                        TileType.Path,
                        TileType.Grass,
                    ],
                    [
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Bush,
                        TileType.Bush,
                        TileType.Bush,
                        TileType.Path,
                        TileType.Grass,
                    ],
                    [
                        TileType.Water,
                        TileType.Water,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Bush,
                        TileType.Bush,
                        TileType.Path,
                        TileType.Bush,
                    ],
                    [
                        TileType.Grass,
                        TileType.Water,
                        TileType.Water,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Path,
                        TileType.Grass,
                    ],
                    [
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Water,
                        TileType.Water,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Water,
                        TileType.Bridge,
                        TileType.Water,
                    ],
                    [
                        TileType.Path,
                        TileType.Path,
                        TileType.Path,
                        TileType.Water,
                        TileType.Water,
                        TileType.Water,
                        TileType.Water,
                        TileType.Water,
                        TileType.Path,
                        TileType.Grass,
                    ],
                    [
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Path,
                        TileType.Path,
                        TileType.Path,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Path,
                        TileType.Grass,
                    ],
                    [
                        TileType.Bush,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Path,
                        TileType.Path,
                        TileType.Path,
                        TileType.Path,
                        TileType.Path,
                        TileType.Grass,
                    ],
                    [
                        TileType.Bush,
                        TileType.Bush,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Grass,
                        TileType.Grass,
                    ],
                ],
                size: MapSize.Small,
                gameMode: GameMode.FFA,
            },
        });

        this.matchVisualData = {
            isCTF: false,
            currentTimer: 22,
            maxTimer: 30,
            currentPlayerTurn: 1,
            backgroundUrl: EMPTY_IMAGE,
            players: [
                {
                    name: 'Selim',
                    avatarUrl: AVATAR_DATA[Avatars.Avatar1].imageCentered,
                    fightsWon: 2,
                    hasFlag: false,
                    isAdmin: true,
                    isBot: false,
                    hasLeft: false,
                },
                {
                    name: 'Aziz',
                    avatarUrl: AVATAR_DATA[Avatars.Avatar2].imageCentered,
                    fightsWon: 0,
                    hasFlag: false,
                    isAdmin: false,
                    isBot: false,
                    hasLeft: false,
                },
                {
                    name: 'Samer',
                    avatarUrl: AVATAR_DATA[Avatars.Avatar3].imageCentered,
                    fightsWon: 1,
                    hasFlag: false,
                    isAdmin: false,
                    isBot: false,
                    hasLeft: false,
                },
                {
                    name: 'ABCDEFGHIJKLMOPQRSTUVWXY',
                    avatarUrl: AVATAR_DATA[Avatars.Avatar4].imageCentered,
                    fightsWon: 0,
                    hasFlag: false,
                    isAdmin: false,
                    isBot: false,
                    hasLeft: false,
                },
                {
                    name: 'Mathieu',
                    avatarUrl: AVATAR_DATA[Avatars.Avatar5].imageCentered,
                    fightsWon: 0,
                    hasFlag: false,
                    isAdmin: false,
                    isBot: false,
                    hasLeft: true,
                },
                {
                    name: 'Omar',
                    avatarUrl: AVATAR_DATA[Avatars.Avatar6].imageCentered,
                    fightsWon: 0,
                    hasFlag: false,
                    isAdmin: false,
                    isBot: true,
                    hasLeft: false,
                },
            ],
        };

        this.delayedContructor();
    }

    async delayedContructor() {
        this.matchVisualData.backgroundUrl = await inject(ThumbnailService).getThumbnail(inject(GameDataService).gameData.mapData, false);
    }

    surrenderGame() {
        // TODO ajouter un popup de confirmation et la logique d'abandon
        window.console.log('Le joueur abandonne la partie');
    }
}
