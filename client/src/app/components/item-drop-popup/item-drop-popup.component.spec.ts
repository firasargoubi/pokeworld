import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayService } from '@app/services/play/play.service';
import { ItemType } from '@common/interfaces/item-type.enum';
import { TranslateModule } from '@ngx-translate/core';
import { ItemDropPopupComponent } from './item-drop-popup.component';

describe('ItemDropPopupComponent', () => {
    let component: ItemDropPopupComponent;
    let fixture: ComponentFixture<ItemDropPopupComponent>;
    let playServiceMock: jasmine.SpyObj<PlayService>;

    beforeEach(() => {
        playServiceMock = jasmine.createSpyObj('PlayService', ['dropItem']);

        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot()],
            providers: [
                { provide: PlayService, useValue: playServiceMock },
                { provide: HttpClient, useValue: HttpClient },
            ],
        });

        fixture = TestBed.createComponent(ItemDropPopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call playService.dropItem with the selected item when validateChoise is called', () => {
        const testItems = [ItemType.Item1, ItemType.Item2];
        component.inventoryItems = testItems;
        component.selectedItem = 1;

        component.validateChoise();

        expect(playServiceMock.dropItem).toHaveBeenCalledWith(testItems[1]);
    });
});
