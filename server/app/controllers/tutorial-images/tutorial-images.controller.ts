import { TutorialImagesService } from '@app/services/tutorial-images/tutorial-images.service';
import { Controller, Get, HttpStatus, Param, Res } from '@nestjs/common';
import { ApiExcludeController, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

const TUTORIAL_CACHE_CONTROL = 'public, max-age=2592000, immutable';

@ApiExcludeController()
@ApiTags('tutorial-images')
@Controller('assets/images/menu/tutorial')
export class TutorialImagesController {
    constructor(private readonly tutorialImagesService: TutorialImagesService) {}

    @Get('shared/:fileName')
    async getSharedTutorialImage(@Param('fileName') fileName: string, @Res() response: Response): Promise<void> {
        const resolvedFilePath = this.tutorialImagesService.getSharedImagePath(fileName);

        response.status(HttpStatus.OK).setHeader('Cache-Control', TUTORIAL_CACHE_CONTROL);
        response.sendFile(resolvedFilePath);
    }

    @Get(':language/:fileName')
    async getTutorialImage(@Param('language') language: string, @Param('fileName') fileName: string, @Res() response: Response): Promise<void> {
        const resolvedFilePath = this.tutorialImagesService.getLanguageImagePath(language, fileName);

        response.status(HttpStatus.OK).setHeader('Cache-Control', TUTORIAL_CACHE_CONTROL);
        response.sendFile(resolvedFilePath);
    }
}
