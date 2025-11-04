import Konva from "konva";
import { STAGE_WIDTH, STAGE_HEIGHT, SPEED} from "../../constants.ts";

export class DetectiveView {
    private sprite: Konva.Image | null = null;
    private group: Konva.Group;
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

    // Function to move around the sprite
    private updatePosition(): void {
        if (!this.sprite) return;

    }

    // Function to keep the sprite within the bounds of the screen
    private keepInBounds(image: Konva.Image): void {
		const x = Math.max(0, Math.min(STAGE_WIDTH - image.width(), image.x()));
		const y = Math.max(0, Math.min(STAGE_HEIGHT - image.height(), image.y()));
		image.position({ x, y });
		this.group.getLayer()?.draw();
	}
}