import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

const TUTORIAL_ASSETS_ROOT = path.resolve(process.cwd(), 'assets/tutorial');
const ALLOWED_LANGUAGES = new Set(['en', 'fr']);

@Injectable()
export class TutorialImagesService {
    getSharedImagePath(fileName: string): string {
        const sharedRoot = path.resolve(TUTORIAL_ASSETS_ROOT, 'shared');
        return this.resolveAndValidateFilePath(sharedRoot, fileName);
    }

    getLanguageImagePath(language: string, fileName: string): string {
        const normalizedLanguage = language.trim().toLowerCase();
        if (!ALLOWED_LANGUAGES.has(normalizedLanguage)) {
            throw new NotFoundException('Tutorial language not found');
        }

        const languageRoot = path.resolve(TUTORIAL_ASSETS_ROOT, normalizedLanguage);
        return this.resolveAndValidateFilePath(languageRoot, fileName);
    }

    private resolveAndValidateFilePath(rootPath: string, fileName: string): string {
        const resolvedFilePath = path.resolve(rootPath, fileName);
        if (!resolvedFilePath.startsWith(`${rootPath}${path.sep}`) && resolvedFilePath !== rootPath) {
            throw new NotFoundException('Tutorial image not found');
        }

        if (!fs.existsSync(resolvedFilePath) || !fs.statSync(resolvedFilePath).isFile()) {
            throw new NotFoundException('Tutorial image not found');
        }

        return resolvedFilePath;
    }
}
