import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-board',
    standalone: true,
    templateUrl: './board.component.html',
    styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit {
    @Input() cells: string[][];
    size: number;
    images: string[][];

    ngOnInit(): void {
        if (!this.cells || this.cells.length === 0 || this.cells.some((row) => row.length !== this.cells.length)) {
            this.cells = [['grass']];
        }

        this.size = this.cells.length;
        this.images = Array.from({ length: this.size }, () => Array(this.size).fill(''));

        this.updateImages();
    }

    updateImages(): void {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                this.updateImage(i, j);
            }
        }
    }

    updateImage(i: number, j: number): void {
        this.images[i][j] = `assets/tileset/${this.cells[i][j]}.png`;
    }
}
