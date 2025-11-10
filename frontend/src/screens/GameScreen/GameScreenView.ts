import Konva from "konva";
import type { View } from "../../types.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";
import { DetectiveView } from "../DetectiveScreen/DetectiveView.ts";
import { NotebookView } from "../NotebookScreen/NotebookView.ts";

/**
 * GameScreenView - Renders the game UI using Konva
 */
export class GameScreenView implements View {
	private group: Konva.Group;
	private detective: DetectiveView;
	private notebook: NotebookView;
	private onPauseClick: () => void;

	constructor(onPauseClick: () => void) {
		this.group = new Konva.Group({ visible: false });
		this.onPauseClick = onPauseClick;

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

		// Pause button
		const pauseButton = new Konva.Rect({
			x: STAGE_WIDTH - 100,
			y: 20,
			width: 80,
			height: 40,
			fill: "darkred",
			cornerRadius: 8,
			stroke: "maroon",
			strokeWidth: 2,
		});
		const pauseText = new Konva.Text({
			x: STAGE_WIDTH - 60,
			y: 30,
			text: "Pause",
			fontSize: 18,
			fontFamily: "serif",
			fill: "white",
		});
		pauseText.offsetX(pauseText.width() / 2);

		const pauseGroup = new Konva.Group();
		pauseGroup.add(pauseButton);
		pauseGroup.add(pauseText);
		pauseGroup.on("click", this.onPauseClick);
		this.group.add(pauseGroup);

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
