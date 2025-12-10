import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { GameScreenView } from "./GameScreenView.ts";
import { api } from "../../api.ts";

/**
 * GameScreenController - Coordinates game logic between Model and View
 */
export class GameScreenController extends ScreenController {
	private view: GameScreenView;
	private screenSwitcher: ScreenSwitcher;
	private saveInterval: any; // Store interval ID for auto-save

	constructor(screenSwitcher: ScreenSwitcher) {
		super(); // Call the ScreenController constructor
		this.screenSwitcher = screenSwitcher;
		this.view = new GameScreenView(() => this.handlePauseClick());
	}

	/**
	 * Start the game
	 */
	startGame(): void {
		this.view.show();
		this.startAutoSave();
	}

	/**
	 * Pause the game
	 */
	private handlePauseClick(): void {
		this.screenSwitcher.switchToScreen({ type: "pause" });
	}

	/**
	 * Save the current game state
	 * @param silent If true, suppresses the success alert
	 */
	async saveGame(silent: boolean = false): Promise<void> {
		const mainScene = this.view.getMainScene(); // Get the Phaser main scene
		const notebook = this.view.getNotebookController(); // Get the Notebook controller

		// Make sure both mainScene and notebook are available
		if (!mainScene || !notebook) {
			console.error("Cannot save game: Scene or Notebook not ready");
			return;
		}

		// Gather game state data
		const playerState = mainScene.getPlayerState();
		const notebookState = notebook.getNotebookState();

		// Make the game state object
		const gameState = {
			location: { room: "Start", x: playerState.x, y: playerState.y },
			notebook: notebookState,
			access: {},
			npc: [],
		};

		// Save the game state using API
		try {
			await api.saveGame(gameState);
			console.log("Game saved successfully");
			if (!silent) {
				alert("Game Saved!");
			}
		} catch (err) {
			console.error("Failed to save game:", err);
			if (!silent) {
				alert("Failed to save game.");
			}
		}
	}

	/**
	 * Start auto-save interval
	 */
	private startAutoSave(): void {
		if (this.saveInterval) return;
		// Auto-save every 60 seconds
		this.saveInterval = setInterval(() => {
			this.saveGame(true);
		}, 60000);
	}

	/**
	 * Stop auto-save interval
	 */
	private stopAutoSave(): void {
		if (this.saveInterval) {
			clearInterval(this.saveInterval);
			this.saveInterval = undefined;
		}
	}

	/**
	 * Hide the screen and stop auto-save
	 */
	hide(): void {
		this.stopAutoSave();
		super.hide();
	}

	/**
	 * Load the game state from the server
	 */
	async loadGame(): Promise<void> {
		try {
			const data = await api.syncGame();
			if (!data) {
				console.log("No saved game found. Starting fresh.");
				return;
			}
			console.log("Game loaded:", data);

			// Apply loaded state to the game
			const mainScene = this.view.getMainScene();
			const notebook = this.view.getNotebookController();

			// Set player location
			if (mainScene && data.location) {
				mainScene.setPlayerState({ x: data.location.x, y: data.location.y });
			}

			// Set notebook state
			if (notebook && data.notebook) {
				notebook.setNotebookState(data.notebook as { clues: string[]; hints: string[]; lessons: string[] });
			}
		} catch (err) {
			console.error("Failed to load game:", err);
		}
	}

	/**
     * Get the Game view for UI rendering
     */
	getView(): GameScreenView {
		return this.view;
	}
}
