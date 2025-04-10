import { Component, computed, inject, OnInit, signal, Signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ChatComponent } from '@app/components/chat/chat.component';
import { HeaderComponent } from '@app/components/header/header.component';
import { Order, PlayerStatData } from '@app/interfaces/stat-data';
import { PlayerStatType } from '@app/interfaces/stat-type.enum';
import { MatchService } from '@app/services/match/match.service';
import { StatService } from '@app/services/stat/stat.service';
import { GameMode } from '@common/interfaces/map-data';

@Component({
    selector: 'app-stat-page',
    templateUrl: './stat-page.component.html',
    styleUrls: ['./stat-page.component.scss'],
    imports: [HeaderComponent, FormsModule, ChatComponent, DatePipe],
})
export class StatPageComponent implements OnInit {
    sortingOrder: WritableSignal<Order> = signal(Order.ASCENDING);
    sortingStat: WritableSignal<PlayerStatType> = signal(PlayerStatType.Combats);
    playerStatList: Signal<PlayerStatData[]> = computed(() => {
        this.statService.sortPlayerStatsBy(this.sortingStat(), this.sortingOrder());
        return this.statService.playerStats;
    });
    playerStatTypes: PlayerStatType[] = Object.values(PlayerStatType);
    statService: StatService = inject(StatService);

    private matchService: MatchService = inject(MatchService);

    ngOnInit(): void {
        this.statService.initializeData();
    }

    updateSortingStat(statType: PlayerStatType): void {
        this.sortingStat.set(statType);
    }

    toggleOrder(): void {
        const isAscending = this.sortingOrder() === Order.ASCENDING;
        const inverseOrder = isAscending ? Order.DESCENDING : Order.ASCENDING;
        this.sortingOrder.set(inverseOrder);
    }

    navigateToMenu(): void {
        this.matchService.leaveMatch();
    }

    isModeCTF(): boolean {
        return this.matchService.data.gameData.mapData.gameMode === GameMode.CTF;
    }
}
