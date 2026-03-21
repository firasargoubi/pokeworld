import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SocketService } from '@app/services/socket/socket.service';
import { UserService } from '@app/services/user/user.service';
import { PageEndpoint } from '@common/interfaces/endpoint.enum';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [RouterOutlet],
})
export class AppComponent implements OnInit {
    private readonly socketService = inject(SocketService);
    private readonly userService = inject(UserService);
    private readonly router = inject(Router);

    ngOnInit(): void {
        const handleDisconnect = () => {
            this.userService.setUser(null);
            this.router.navigate([PageEndpoint.Menu]);
        };
        this.socketService.on('disconnect', handleDisconnect);
    }
}
