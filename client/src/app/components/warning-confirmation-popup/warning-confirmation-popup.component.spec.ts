import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WarningConfirmationPopupComponent } from './warning-confirmation-popup.component';

describe('WarningConfirmationPopupComponent', () => {
    let component: WarningConfirmationPopupComponent;
    let fixture: ComponentFixture<WarningConfirmationPopupComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [WarningConfirmationPopupComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(WarningConfirmationPopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display correct message', () => {
        const testMessage = 'Test error message';
        component.message = testMessage;
        fixture.detectChanges();

        const paragraph = fixture.nativeElement.querySelector('p');
        expect(paragraph.textContent).toContain(`Erreur : ${testMessage}`);
    });

    it('should emit closed event on button click', () => {
        spyOn(component.closed, 'emit');

        const button = fixture.nativeElement.querySelector('.card-button');
        button.click();

        expect(component.closed.emit).toHaveBeenCalled();
    });
});
