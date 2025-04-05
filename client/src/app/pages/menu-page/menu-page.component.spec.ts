import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router'; // Utilisation de RouterModule.forRoot([])
import { MenuPageComponent } from './menu-page.component';

describe('MenuPageComponent', () => {
    let component: MenuPageComponent;
    let fixture: ComponentFixture<MenuPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                RouterModule.forRoot([]), // Ajout des routes vides pour fournir les dépendances nécessaires
                MenuPageComponent,
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MenuPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
