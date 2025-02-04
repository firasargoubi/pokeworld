import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterLink, RouterModule } from '@angular/router';
import { MainHeaderComponent } from './main-header.component';

describe('MainHeaderComponent', () => {
    let component: MainHeaderComponent;
    let fixture: ComponentFixture<MainHeaderComponent>;
    let nativeElement: HTMLElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MainHeaderComponent, RouterModule.forRoot([])],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MainHeaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        nativeElement = fixture.nativeElement;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should display the default title', () => {
        const titleEl = nativeElement.querySelector('#header-title');
        expect(titleEl?.textContent).toContain('<');
    });

    it('should update the title when the input changes', () => {
        component.title = 'New Title';
        fixture.detectChanges();
        const titleEl = nativeElement.querySelector('#header-title');
        expect(titleEl?.textContent).toContain('New Title');
    });

    it('should apply the routerLink input to the title element', () => {
        component.routerLink = '/new-route';
        fixture.detectChanges();

        const titleDebugEl = fixture.debugElement.query(By.directive(RouterLink));
        expect(titleDebugEl).toBeTruthy();

        expect(titleDebugEl.attributes['ng-reflect-router-link']).toEqual('/new-route');
    });

    it('should display the image with the correct default source', () => {
        const imgEl = nativeElement.querySelector('#header-image') as HTMLImageElement;
        expect(imgEl.src).toContain('/assets/images/menu/headers/header-1.png');
    });

    it('should update the image source when the input changes', () => {
        component.imgSrc = '/assets/images/new-image.png';
        fixture.detectChanges();
        const imgEl = nativeElement.querySelector('#header-image') as HTMLImageElement;
        expect(imgEl.src).toContain('/assets/images/new-image.png');
    });
});
