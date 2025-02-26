import { provideHttpClient } from '@angular/common/http';
import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { Routes, provideRouter, withEnabledBlockingInitialNavigation } from '@angular/router';
import { environment } from './environments/environment';
import { AppComponent } from '@app/pages/app/app.component';
import { MenuPageComponent } from '@app/pages/menu-page/menu-page.component';
import { LobbyPageComponent } from '@app/pages/lobby-page/lobby-page.component';
import { AdminPageComponent } from '@app/pages/admin-page/admin-page.component';
import { EditPageComponent } from '@app/pages/edit-page/edit-page.component';
import { CreatePageComponent } from './app/pages/create-page/create-page.component';
import { PlayerSelectionPageComponent } from '@app/pages/player-selection-page/player-selection-page.component';
import { PlayPageComponent } from '@app/pages/play-page/play-page.component';

if (environment.production) {
    enableProdMode();
}

const routes: Routes = [
    { path: '', component: MenuPageComponent, pathMatch: 'full' },
    { path: 'play', component: PlayPageComponent },
    { path: 'lobby', component: LobbyPageComponent },
    { path: 'admin', component: AdminPageComponent },
    { path: 'create', component: CreatePageComponent },
    { path: 'edit', component: EditPageComponent },
    { path: 'player-selection', component: PlayerSelectionPageComponent },
    { path: '**', redirectTo: '' },
];

bootstrapApplication(AppComponent, {
    providers: [provideHttpClient(), provideRouter(routes, withEnabledBlockingInitialNavigation()), provideAnimations()],
});
