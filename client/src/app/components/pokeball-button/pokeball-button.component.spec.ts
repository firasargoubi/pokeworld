import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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
        expect(component.pokeballImageSrc).toBe(component.defaultPokeballImageSrc);
        expect(component.borderImageSrc).toBe(component.defaultBorderImageSrc);
        expect(component.contentImageSrc).toBe(component.defaultContentImageSrc);
    });

    it('should change imageSrc to pressedImageSrc on onMouseDown', () => {
        component.onMouseDown();
        expect(component.pokeballImageSrc).toBe(component.pressedPokeballImageSrc);
        expect(component.borderImageSrc).toBe(component.pressedBorderImageSrc);
        expect(component.contentImageSrc).toBe(component.pressedContentImageSrc);
    });

    it('should restore images after the specified delay', (done) => {
        const verificationTimeout = 150;
        component.delay = 100;
        component.onMouseUp();

        setTimeout(() => {
            expect(component.pokeballImageSrc).toBe(component.defaultPokeballImageSrc);
            expect(component.borderImageSrc).toBe(component.defaultBorderImageSrc);
            expect(component.contentImageSrc).toBe(component.defaultContentImageSrc);
            done();
        }, verificationTimeout);
    });

    it('should call onClickAction if defined when mouse is released', (done) => {
        const verificationTimeout = 50;
        component.delay = 100;
        component.onClickAction = jasmine.createSpy('onClickAction');

        component.onMouseUp();

        setTimeout(() => {
            expect(component.onClickAction).toHaveBeenCalled();
            done();
        }, component.delay + verificationTimeout);
    });

    it('should not throw an error if onClickAction is undefined', (done) => {
        const verificationTimeout = 50;
        component.delay = 100;
        component.onClickAction = undefined;
        expect(() => component.onMouseUp()).not.toThrow();
        setTimeout(() => {
            done();
        }, component.delay + verificationTimeout);
    });
});
