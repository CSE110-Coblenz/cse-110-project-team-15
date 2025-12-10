import Konva from "konva";
import Phaser from "phaser";
import type { View } from "../../types.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";
import { NotebookController } from "../NotebookScreen/NotebookController.ts";
import { MainScene } from "./phaser/MainScene.ts";

/**
 * GameScreenView - Renders the game UI using Konva and Phaser3
 */
export class GameScreenView implements View {
	private group: Konva.Group;
	private notebook!: NotebookController;
	private onPauseClick: () => void; // Callback for pause button

	// Hold a reference to the Phaser game & its container
	private phaserGame!: Phaser.Game;
	private phaserContainer?: HTMLDivElement;

	constructor(onPauseClick: () => void) {
		this.group = new Konva.Group({ visible: false });
		this.onPauseClick = onPauseClick; // Set the callback to pause the game

		// Game screen background
		const bg = new Konva.Rect({
			x: 0,
			y: 0,
			width: STAGE_WIDTH,
			height: STAGE_HEIGHT,
			fill: "#fffbea", // Parchment color
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

		// Pause button group
		const pauseGroup = new Konva.Group();
		pauseGroup.add(pauseButton);
		pauseGroup.add(pauseText);
		pauseGroup.on("click", this.onPauseClick);
		this.group.add(pauseGroup);

		// Pause button hover effects
		pauseGroup.on("mouseenter", () => {
			document.body.style.cursor = "pointer";
			pauseButton.fill("maroon");
			this.group.getLayer()?.draw();
		});
		pauseGroup.on("mouseleave", () => {
			document.body.style.cursor = "default";
			pauseButton.fill("darkred");
			this.group.getLayer()?.draw();
		});

		// Find the root container that Konva is using
		const root = document.getElementById("container")

		if (root) {
			// Create a div for phaser
			const phaserDiv = document.createElement("div");
			phaserDiv.id = "phaser-container";
			phaserDiv.style.display = "none";
			document.body.appendChild(phaserDiv);

			this.phaserContainer = phaserDiv;

			// Phaser window setup
			this.phaserGame = new Phaser.Game({
				type: Phaser.AUTO,
				width: 600,
				height: 450,
				parent: phaserDiv,
				scene: [MainScene],
				physics: {
					default: "arcade",
					arcade: {
						debug: false,
						gravity: {x:0, y:0}
					},
				},
			});

			// Notebook setup 
			this.notebook = new NotebookController(this.group);

			// Hook phaser hint events -> notebook
			if (this.phaserGame) {
				this.phaserGame.events.on("hint-found", (hint: string) => {
					this.notebook.addHint(hint);
				});
			}

			// Hook notebook visibility -> phaser visibility
			this.notebook.onVisibilityChange((visible) => {
				if (visible) {
					this.phaserContainer!.style.display = "none";
					this.phaserGame!.scene.pause("MainScene");
				} else {
					this.phaserContainer!.style.display = "block";
					this.phaserGame!.scene.resume("MainScene");
				}
			});
		}
	}

	/**
	 * Show the screen
	 */
	show(): void {
		this.group.visible(true);
		this.group.getLayer()?.draw();

		if (this.phaserContainer) {
			this.phaserContainer.style.display = "block";
		}
	}

	/**
	 * Hide the screen
	 */
	hide(): void {
		this.group.visible(false);
		this.group.getLayer()?.draw();

		// Hide phaser container
		if (this.phaserContainer) {
			this.phaserContainer.style.display = "none";
		}
	}

	/** 
     * Get the Konva group for rendering
     */
	getGroup(): Konva.Group {
		return this.group;
	}

	/**
	 * Get the Notebook controller
	 */
	getNotebookController(): NotebookController {
		return this.notebook;
	}

	/**
	 * Get the Phaser main scene
	 */
	getMainScene(): MainScene | undefined {
		if (this.phaserGame && this.phaserGame.scene) {
			return this.phaserGame.scene.getScene("MainScene") as MainScene;
		}
		return undefined;
	}
}
