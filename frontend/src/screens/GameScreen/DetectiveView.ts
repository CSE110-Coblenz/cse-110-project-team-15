import Konva from "konva";
import { STAGE_WIDTH, STAGE_HEIGHT, SPEED} from "../../../src/constants.ts";

export class DetectiveView {
    private sprite: Konva.Image | null = null;
    private group: Konva.Group;
    private speed = SPEED;
    private keysPressed: Set<string> = new Set();

    constructor(group: Konva.Group) {
        this.group = group;

        // Load and display the detective sprite using Konva.Image.fromURL()
        Konva.Image.fromURL("/detective.png", (image) => {
            image.width(100);
            image.height(120);
            image.x(STAGE_WIDTH / 2 - 50);
            image.y(STAGE_HEIGHT / 2 - 60);
       
            this.sprite = image;
            this.group.add(image);
            this.group.getLayer()?.draw();
        });  
    }

    // Method to move around the sprite
    private updatePosition(): void {
        if (!this.sprite) return;

        let dx = 0;
        let dy = 0;

        if (this.keysPressed.has("w")) {
            dy += this.speed;
        }
        if (this.keysPressed.has("s")) {
            dy -= this.speed;
        }
        if (this.keysPressed.has("a")) {
            dx -= this.speed;
        }
        if (this.keysPressed.has("d")) {
            dx += this.speed;
        }

        if (dx != 0 || dy != 0) {
            this.sprite.x(this.sprite.x() + dx);
            this.sprite.y(this.sprite.y() + dy);
            this.keepInBounds(this.sprite);
        }
    }

    // Method to keep the sprite within the bounds of the screen
    private keepInBounds(image: Konva.Image): void {
		const x = Math.max(0, Math.min(STAGE_WIDTH - image.width(), image.x()));
		const y = Math.max(0, Math.min(STAGE_HEIGHT - image.height(), image.y()));
		image.position({ x, y });
		this.group.getLayer()?.draw();
	}
}