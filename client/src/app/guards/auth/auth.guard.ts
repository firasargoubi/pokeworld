import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SocketService } from '@app/services/socket/socket.service';
import { UserService } from '@app/services/user/user.service';
import { PageEndpoint } from '@common/interfaces/endpoint.enum';

export const authGuard: CanActivateFn = () => {
    const userService = inject(UserService);
    const socketService = inject(SocketService);
    const router = inject(Router);

    if (userService.isAuthenticated() && socketService.isConnected()) {
        return true;
    }

    return router.createUrlTree([PageEndpoint.Menu]);
};
