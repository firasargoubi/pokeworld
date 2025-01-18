import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LobbyPageComponent } from './lobby-page.component';
import { RouterModule } from '@angular/router';

describe('LobbyPageComponent', () => {
    let component: LobbyPageComponent;
    let fixture: ComponentFixture<LobbyPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [LobbyPageComponent, RouterModule.forRoot([])],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LobbyPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
