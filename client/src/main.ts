import { provideHttpClient } from '@angular/common/http';
import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { Routes, provideRouter, withHashLocation } from '@angular/router';
import { AdminPageComponent } from '@app/pages/admin-page/admin-page.component';
import { AppComponent } from '@app/pages/app/app.component';
import { CombatPageComponent } from '@app/pages/combat-page/combat-page.component';
import { EditPageComponent } from '@app/pages/edit-page/edit-page.component';
import { LobbyPageComponent } from '@app/pages/lobby-page/lobby-page.component';
import { MenuPageComponent } from '@app/pages/menu-page/menu-page.component';
import { PlayPageComponent } from '@app/pages/play-page/play-page.component';
import { JoinPageComponent } from '@app/pages/join-page/join-page.component';
import { DebugPageComponent } from './app/pages/debug-page/debug-page.component';
import { CreatePageComponent } from '@app/pages/create-page/create-page.component';
import { PlayerSelectionPageComponent } from '@app/pages/player-selection-page/player-selection-page.component';
import { environment } from './environments/environment';


if (environment.production) {
    enableProdMode();
}

const routes: Routes = [
    { path: '', component: MenuPageComponent, pathMatch: 'full' },
    { path: 'play', component: PlayPageComponent },
    { path: 'debug', component: DebugPageComponent }, // TODO remove debug page
    { path: 'lobby', component: LobbyPageComponent },
    { path: 'join', component: JoinPageComponent },
    { path: 'admin', component: AdminPageComponent },
    { path: 'create', component: CreatePageComponent },
    { path: 'edit', component: EditPageComponent },
    { path: 'combat', component: CombatPageComponent },
    { path: 'player-selection', component: PlayerSelectionPageComponent },
    { path: '**', redirectTo: '' },
];

bootstrapApplication(AppComponent, {
    providers: [provideHttpClient(), provideRouter(routes, withHashLocation()), provideAnimations()],
});
