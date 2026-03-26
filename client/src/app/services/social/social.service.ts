import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { PopupMessage } from '@app/consts/popup-message.const';
import { Popup, PopupColor } from '@app/interfaces/popup';
import { SocialAction } from '@app/interfaces/social';
import { PopupService } from '@app/services/popup/popup.service';
import { ApiEndpoint } from '@common/interfaces/endpoint.enum';
import { RelationshipType, SocialListItem, SocialListTab } from '@common/interfaces/social';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class SocialService {
    isLoading = signal<boolean>(false);

    readonly relationshipType = RelationshipType;
    readonly searchQuery = signal<string>('');
    readonly activeTab = signal<SocialListTab>(SocialListTab.Search);
    readonly relationshipsToDisplay = signal<SocialListItem[]>([]);

    private readonly currentUserId = signal<string | null>(null);
    private readonly popupService: PopupService = inject(PopupService);
    private readonly http: HttpClient = inject(HttpClient);
    private readonly baseUrl = environment.serverUrl;
    private relationshipLatestRequestId = 0;

    initialize(userId: string): void {
        this.currentUserId.set(userId);
        this.loadRelationshipList();
    }

    setActiveTab(tab: SocialListTab): void {
        this.activeTab.set(tab);
        this.loadRelationshipList();
    }

    setSearchQuery(query: string): void {
        this.searchQuery.set((query ?? '').trim());
        this.loadRelationshipList();
    }

    sendFriendRequest(userId: string): void {
        this.performAction(SocialAction.SendFriendRequest, userId);
    }

    acceptFriendRequest(userId: string): void {
        this.performAction(SocialAction.AcceptFriendRequest, userId);
    }

    declineFriendRequest(userId: string): void {
        this.performAction(SocialAction.DeclineFriendRequest, userId);
    }

    removeFriend(userId: string): void {
        this.performAction(SocialAction.RemoveFriend, userId);
    }

    blockUser(userId: string): void {
        const confirmBlockPopup: Popup = {
            message: PopupMessage.ConfirmBlockUser,
            hasCloseButton: true,
            isConfirmation: true,
            popupColor: PopupColor.Orange,
            action: () => this.performAction(SocialAction.BlockUser, userId),
        };
        this.popupService.showPopup(confirmBlockPopup);
    }

    unblockUser(userId: string): void {
        this.performAction(SocialAction.UnblockUser, userId);
    }

    private loadRelationshipList(): void {
        const userId = this.currentUserId();
        if (!userId) return;

        const thisRequestId = ++this.relationshipLatestRequestId;
        this.isLoading.set(true);

        this.http
            .get<SocialListItem[]>(`${this.baseUrl}/${ApiEndpoint.Social}/list/${userId}`, {
                params: {
                    tab: this.activeTab(),
                    q: this.searchQuery(),
                },
            })
            .subscribe({
                next: (relationships) => {
                    if (thisRequestId !== this.relationshipLatestRequestId) return;
                    this.relationshipsToDisplay.set(relationships);
                    this.isLoading.set(false);
                },
                error: () => {
                    if (thisRequestId !== this.relationshipLatestRequestId) return;
                    this.relationshipsToDisplay.set([]);
                    this.isLoading.set(false);
                },
            });
    }

    private performAction(action: SocialAction, targetUserId: string): void {
        const userId = this.currentUserId();
        if (!userId || !targetUserId || userId === targetUserId) return;

        this.http
            .post<void>(`${this.baseUrl}/${ApiEndpoint.Social}/${action}`, {
                userId,
                targetUserId,
            })
            .subscribe({
                next: () => this.loadRelationshipList(),
            });
    }
}
