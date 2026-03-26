import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SocialAction } from '@app/interfaces/social';
import { ApiEndpoint } from '@common/interfaces/endpoint.enum';
import { SocialListItem, SocialListTab } from '@common/interfaces/social';
import { environment } from 'src/environments/environment';
import { PopupService } from '@app/services/popup/popup.service';
import { SocialService } from './social.service';

describe('SocialService', () => {
    let service: SocialService;
    let httpMock: HttpTestingController;
    let popupServiceSpy: jasmine.SpyObj<PopupService>;

    const mockUserId = 'user-123';
    const targetUserId = 'target-456';
    const baseUrl = environment.serverUrl;

    beforeEach(() => {
        popupServiceSpy = jasmine.createSpyObj<PopupService>('PopupService', ['showPopup']);

        TestBed.configureTestingModule({
            providers: [SocialService, provideHttpClient(), provideHttpClientTesting(), { provide: PopupService, useValue: popupServiceSpy }],
        });
        service = TestBed.inject(SocialService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('initialize should set currentUserId and load relationships', () => {
        service.initialize(mockUserId);

        expect(service['currentUserId']()).toBe(mockUserId);
        expect(service.isLoading()).toBeTrue();

        const req = httpMock.expectOne(
            (request) =>
                request.url === `${baseUrl}/${ApiEndpoint.Social}/list/${mockUserId}` &&
                request.params.get('tab') === SocialListTab.Search &&
                request.params.get('q') === '',
        );
        expect(req.request.method).toBe('GET');

        const mockResponse: SocialListItem[] = [];
        req.flush(mockResponse);

        expect(service.relationshipsToDisplay()).toEqual(mockResponse);
        expect(service.isLoading()).toBeFalse();
    });

    it('setActiveTab should update signal and reload list', () => {
        service.initialize(mockUserId);
        httpMock.expectOne(() => true).flush([]);

        service.setActiveTab(SocialListTab.Friends);

        expect(service.activeTab()).toBe(SocialListTab.Friends);
        const req = httpMock.expectOne((request) => request.params.get('tab') === SocialListTab.Friends);
        req.flush([]);
    });

    it('setSearchQuery should trim query, update signal and reload list', () => {
        service.initialize(mockUserId);
        httpMock.expectOne(() => true).flush([]);

        service.setSearchQuery('   Firas   ');

        expect(service.searchQuery()).toBe('Firas');
        const req = httpMock.expectOne((request) => request.params.get('q') === 'Firas');
        req.flush([]);
    });

    it('performAction should send POST request and reload list on success', () => {
        service.initialize(mockUserId);
        httpMock.expectOne(() => true).flush([]);

        service.sendFriendRequest(targetUserId);

        const postReq = httpMock.expectOne(`${baseUrl}/${ApiEndpoint.Social}/${SocialAction.SendFriendRequest}`);
        expect(postReq.request.method).toBe('POST');
        expect(postReq.request.body).toEqual({ userId: mockUserId, targetUserId });

        postReq.flush(null);

        const getReq = httpMock.expectOne(() => true);
        expect(getReq.request.method).toBe('GET');
        getReq.flush([]);
    });

    it('loadRelationshipList should handle HTTP errors gracefully', () => {
        service.initialize(mockUserId);
        const req = httpMock.expectOne(() => true);

        req.flush('Error', { status: 500, statusText: 'Internal Server Error' });

        expect(service.relationshipsToDisplay()).toEqual([]);
        expect(service.isLoading()).toBeFalse();
    });
});
