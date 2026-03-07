import { Injectable, inject } from '@angular/core';
import { AppLanguage } from '@common/interfaces/preferences';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
    providedIn: 'root',
})
export class I18nService {
    private readonly translateService: TranslateService = inject(TranslateService);

    initialize(language: AppLanguage): void {
        this.translateService.addLangs([AppLanguage.French, AppLanguage.English]);
        this.translateService.setDefaultLang(AppLanguage.French);
        this.translateService.use(language);
    }

    use(language: AppLanguage): void {
        this.translateService.use(language);
    }

    translate(message: string, params?: Record<string, string | number | boolean>): string {
        return this.translateService.instant(message, params);
    }
}
