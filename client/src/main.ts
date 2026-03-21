import { provideHttpClient } from '@angular/common/http';
import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { Routes, provideRouter, withHashLocation } from '@angular/router';
import { authGuard } from '@app/guards/auth/auth.guard';
import { AdminPageComponent } from '@app/pages/admin-page/admin-page.component';
import { AppComponent } from '@app/pages/app/app.component';
import { CharacterPageComponent } from '@app/pages/character-page/character-page.component';
import { CombatPageComponent } from '@app/pages/combat-page/combat-page.component';
import { CreatePageComponent } from '@app/pages/create-page/create-page.component';
import { EditPageComponent } from '@app/pages/edit-page/edit-page.component';
import { JoinPageComponent } from '@app/pages/join-page/join-page.component';
import { LobbyPageComponent } from '@app/pages/lobby-page/lobby-page.component';
import { MenuPageComponent } from '@app/pages/menu-page/menu-page.component';
import { PlayPageComponent } from '@app/pages/play-page/play-page.component';
import { StatPageComponent } from '@app/pages/stat-page/stat-page.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader, provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { environment } from './environments/environment';

if (environment.production) {
    enableProdMode();
}

const routes: Routes = [
    { path: '', component: MenuPageComponent, pathMatch: 'full' },
    { path: 'play', component: PlayPageComponent, canActivate: [authGuard] },
    { path: 'lobby', component: LobbyPageComponent, canActivate: [authGuard] },
    { path: 'join', component: JoinPageComponent, canActivate: [authGuard] },
    { path: 'admin', component: AdminPageComponent, canActivate: [authGuard] },
    { path: 'create', component: CreatePageComponent, canActivate: [authGuard] },
    { path: 'edit', component: EditPageComponent, canActivate: [authGuard] },
    { path: 'combat', component: CombatPageComponent, canActivate: [authGuard] },
    { path: 'stat', component: StatPageComponent, canActivate: [authGuard] },
    { path: 'character', component: CharacterPageComponent, canActivate: [authGuard] },
    { path: '**', redirectTo: '' },
];

bootstrapApplication(AppComponent, {
    providers: [
        provideHttpClient(),
        ...provideTranslateHttpLoader({
            prefix: './assets/i18n/',
            suffix: '.json',
        }),
        provideRouter(routes, withHashLocation()),
        provideAnimations(),
        importProvidersFrom(
            TranslateModule.forRoot({
                defaultLanguage: 'fr',
                loader: {
                    provide: TranslateLoader,
                    useClass: TranslateHttpLoader,
                },
            }),
        ),
    ],
});
