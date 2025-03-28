import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemDropPopupComponent } from './item-drop-popup.component';

describe('ItemDropPopupComponent', () => {
    let component: ItemDropPopupComponent;
    let fixture: ComponentFixture<ItemDropPopupComponent>;

    beforeEach(() => {
        fixture = TestBed.createComponent(ItemDropPopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
