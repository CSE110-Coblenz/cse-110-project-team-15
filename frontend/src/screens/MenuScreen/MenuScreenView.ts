import Konva from "konva";
import type { View } from "../../types.ts";
import { STAGE_HEIGHT, STAGE_WIDTH } from "../../constants.ts";

/**
 * MenuScreenView - Renders the menu screen
 */
export class MenuScreenView implements View {
	private group: Konva.Group;

	constructor(onStartClick: () => void) {
		this.group = new Konva.Group({ visible: true });

		// Menu screen background
		Konva.Image.fromURL("/menuscreen_icon.jpg", (image) => {
			image.width(STAGE_WIDTH);
			image.height(STAGE_HEIGHT);
			image.x(0);
			image.y(0);

			this.group.add(image);
			image.moveToBottom()
			this.group.getLayer()?.draw();
		});

		// Background banner behind title
		const titleBg = new Konva.Rect({
    		x: STAGE_WIDTH / 2 - 387.5,
    		y: 130,
    		width: 775,
    		height: 100,
    		fill: "white",
			opacity: 0.6,
    		cornerRadius: 20,
		});
		this.group.add(titleBg);

		// Title text
		const title = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: 150,
			text: "Manner's Murder: An Algebraic Mystery",
			fontSize: 45,
			fontFamily: "serif",
			fill: "darkred",
			stroke: "maroon",
			strokeWidth: 2,
			align: "center",
		});
		// Center the text using offsetX
		title.offsetX(title.width() / 2);
		this.group.add(title);

		// Start button
		const startButton = new Konva.Rect({
			x: STAGE_WIDTH / 2 - 100,
			y: 300,
			width: 200,
			height: 60,
			fill: "darkred",
			cornerRadius: 10,
			stroke: "maroon",
			strokeWidth: 3,
		});
		const startText = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: 315,
			text: "Start Game",
			fontSize: 24,
			fontFamily: "serif",
			fill: "white",
			align: "center",
		});
		startText.offsetX(startText.width() / 2);

		// Start button group
		const startButtonGroup = new Konva.Group();
		startButtonGroup.add(startButton);
		startButtonGroup.add(startText);
		startButtonGroup.on("click", onStartClick);
		this.group.add(startButtonGroup);

		// Start button hover effects
		startButtonGroup.on("mouseenter", () => {
    	document.body.style.cursor = "pointer";
    	startButton.fill("maroon"); // darker red
    	this.group.getLayer()?.draw();
		});

		startButtonGroup.on("mouseleave", () => {
    	document.body.style.cursor = "default";
    	startButton.fill("darkred");
    	this.group.getLayer()?.draw();
		});
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
