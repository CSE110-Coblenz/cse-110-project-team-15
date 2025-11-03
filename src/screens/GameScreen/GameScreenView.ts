import Konva from "konva";
import type { View } from "../../types.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";

/**
 * GameScreenView - Renders the game UI using Konva
 */
export class GameScreenView implements View {
	private group: Konva.Group;
	private detectiveImage: Konva.Image | null = null;

	constructor() {
		this.group = new Konva.Group({ visible: false });

		// Background
		const bg = new Konva.Rect({
			x: 0,
			y: 0,
			width: STAGE_WIDTH,
			height: STAGE_HEIGHT,
			fill: "f0e6d2", // Parchment color
		});
		this.group.add(bg);

		// Room Label
		const titleText = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: 30,
			text: "Chapter 1: Enter the Mansion",
			fontSize: 28,
			fontFamily: "serif",
			fill: "darkRed",
			align: "center",
		});
		titleText.offsetX(titleText.width() / 2);
		this.group.add(titleText);

		// Load and display the detective image using Konva.Image.fromURL()
		Konva.Image.fromURL("/detective.png", (image) => {
			image.width(100);
			image.height(120);
	
			image.on("click", onLemonClick);
			this.detectiveImage = image;
			this.group.add(this.detectiveImage);
		})
	}

	/**
	 * Show the screen
	 */
	show(): void {
		this.group.visible(true);
		this.group.getLayer()?.draw();
	}

	/**
	 * Hide the screen
	 */
	hide(): void {
		this.group.visible(false);
		this.group.getLayer()?.draw();
	}

	getGroup(): Konva.Group {
		return this.group;
	}
}
