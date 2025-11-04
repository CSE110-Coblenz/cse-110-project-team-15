import Konva from "konva";
import type { View } from "../../types.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";
import { DetectiveView } from "./DetectiveView.ts";
import { NotebookView } from "./NotebookView.ts";

/**
 * GameScreenView - Renders the game UI using Konva
 */
export class GameScreenView implements View {
	private group: Konva.Group;
	private detective: DetectiveView;
	private notebook: NotebookView;

	constructor() {
		this.group = new Konva.Group({ visible: false });

		// Background
		const bg = new Konva.Rect({
			x: 0,
			y: 0,
			width: STAGE_WIDTH,
			height: STAGE_HEIGHT,
			fill: "white", // Parchment color
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

		this.detective = new DetectiveView(this.group);
		this.notebook = new NotebookView(this.group);
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
