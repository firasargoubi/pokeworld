import { Component } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PokeballButtonComponent } from './pokeball-button.component';

@Component({
    template: '<app-pokeball-button [buttonContent]="testContent" [delay]="delay"></app-pokeball-button>',
    imports: [PokeballButtonComponent],
    standalone: true,
})
class TestHostComponent {
    testContent = 'Test Button';
    delay = '300';
}

describe('PokeballButtonComponent', () => {
    let component: PokeballButtonComponent;
    let fixture: ComponentFixture<TestHostComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PokeballButtonComponent, TestHostComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TestHostComponent);
        component = fixture.debugElement.query(By.css('app-pokeball-button')).componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should display "Test Button" as the button content', () => {
        expect(component.buttonContent).toBe('Test Button');
    });

    it('should have the default image source', () => {
        expect(component.imageSrc).toBe(component.defaultImageSrc);
    });

    it('should change imageSrc to pressedImageSrc on onMouseDown', () => {
        component.onMouseDown();
        expect(component.imageSrc).toBe(component.pressedImageSrc);
    });

    it('should keep imageSrc as pressedImageSrc before the delay', fakeAsync(() => {
        component.delay = 300;
        component.onMouseDown();
        tick(component.delay / 2);
        expect(component.imageSrc).toBe(component.pressedImageSrc);
    }));
});
