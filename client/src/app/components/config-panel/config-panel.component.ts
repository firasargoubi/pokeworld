import { Component, Input, signal, WritableSignal } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { GameData } from '@common/game-data';

@Component({
    selector: 'app-config-panel',
    imports: [ReactiveFormsModule],
    templateUrl: './config-panel.component.html',
    styleUrl: './config-panel.component.scss',
})
export class ConfigPanelComponent {
    @Input() gameData: GameData;
    configForm = new FormGroup({
        name: new FormControl('', [Validators.required]), // Initialize with empty string
        description: new FormControl('', [Validators.required]), // Initialize with empty string
    });

    isSubmitted: WritableSignal<boolean> = signal(false);

    handleSubmission() {
        this.isSubmitted.set(true);
        const isFormValid = this.configForm.hasError('required');
        const isMapValid = true; // temp
        if (isFormValid && isMapValid) {
            const currentName = this.configForm.get('name')?.value;
            const currentDescription = this.configForm.get('description')?.value;
            if (currentName) {
                this.gameData.name = currentName;
            }
            if (currentDescription) {
                this.gameData.description = currentDescription;
            }

            // save game in DB
        }
    }

    isWarningNecessary(field: string) {
        return this.configForm.get(field)?.hasError('required') && this.isSubmitted();
    }
}
