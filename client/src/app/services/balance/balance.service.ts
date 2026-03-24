import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiEndpoint } from '@common/interfaces/endpoint.enum';
import { ShopItem } from '@common/interfaces/shop';
import { UserInfo } from '@common/interfaces/user';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class BalanceService {
    private readonly http: HttpClient = inject(HttpClient);
    private readonly baseUrl = environment.serverUrl;

    getShopItems(): Observable<ShopItem[]> {
        return this.http.get<ShopItem[]>(`${this.baseUrl}/${ApiEndpoint.Balance}/items`);
    }

    purchaseItem(userId: string, itemId: string): Observable<UserInfo> {
        return this.http.post<UserInfo>(`${this.baseUrl}/${ApiEndpoint.Balance}/${userId}/purchase`, { itemId });
    }
}
