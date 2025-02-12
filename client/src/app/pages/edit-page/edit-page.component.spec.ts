// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { FormsModule } from '@angular/forms';
// import { HeaderComponent } from '@app/components/header/header.component';
// import { ItemComponent } from '@app/components/item/item.component';
// import { MapComponent } from '@app/components/map/map.component';
// import { MOCK_GAMES } from '@app/consts/tests/mock-games.spec';
// import { EditorService } from '@app/services/editor/editor.service';
// import { GameDataService } from '@app/services/game-data/game-data.service';
// import { EditPageComponent } from './edit-page.component';
// import { MapService } from '@app/services/map/map.service';
// import { map } from 'rxjs';

// describe('EditPageComponent', () => {
//     let component: EditPageComponent;
//     let fixture: ComponentFixture<EditPageComponent>;
//     let editorServiceSpy: jasmine.SpyObj<EditorService>;
//     let gameDataServiceSpy: jasmine.SpyObj<GameDataService>;
//     let mapServiceSpy: jasmine.SpyObj<MapService>;

//     beforeEach(async () => {
//         editorServiceSpy = jasmine.createSpyObj('EditorService', ['editorData', 'redirectToAdminPage']);
//         gameDataServiceSpy = jasmine.createSpyObj('GameDataService', [
//             'createNewGame',
//             'setGameData',
//             'editTile',
//             'addItem',
//             'removeItem',
//             'getItemCount',
//             'getName',
//             'getDescription',
//             'getMapSize',
//             'getMapSizeString',
//             'getGameMode',
//             'getGameModeString',
//             'getItem',
//             'getTileFromPosition',
//             'getTile',
//             'isOutOfBound',
//             'isMapValid',
//         ]);
//         mapServiceSpy = jasmine.createSpyObj('MapService', ['getTileSize', 'getTileSizeString', 'getTileType', 'getTileTypeString']);

//         gameDataServiceSpy.gameData = structuredClone(MOCK_GAMES[0]);

//         mapServiceSpy.gameDataService = gameDataServiceSpy;

//         await TestBed.configureTestingModule({
//             imports: [FormsModule, EditPageComponent, HeaderComponent, MapComponent, ItemComponent],
//             providers: [
//                 { provide: EditorService, useValue: editorServiceSpy },
//                 { provide: GameDataService, useValue: gameDataServiceSpy },
//             ],
//         }).compileComponents();
//     });

//     beforeEach(() => {
//         fixture = TestBed.createComponent(EditPageComponent);
//         component = fixture.componentInstance;
//         fixture.detectChanges();
//     });

//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });
// });
