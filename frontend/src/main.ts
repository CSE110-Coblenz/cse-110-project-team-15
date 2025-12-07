import Konva from "konva";
import type { ScreenSwitcher, Screen } from "./types.ts";
import { MenuScreenController } from "./screens/MenuScreen/MenuScreenController.ts";
import { LoginScreenController } from "./screens/LoginScreen/LoginScreenController.ts";
import { GameScreenController } from "./screens/GameScreen/GameScreenController.ts";
import { PauseScreenController } from "./screens/PauseScreen/PauseScreenController.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "./constants.ts";
import { api } from "./api.ts";

/**
 * Main Application - Coordinates all screens
 *
 * This class demonstrates screen management using Konva Groups.
 * Each screen (Menu, Game, Results) has its own Konva.Group that can be
 * shown or hidden independently.
 *
 * Key concept: All screens are added to the same layer, but only one is
 * visible at a time. This is managed by the switchToScreen() method.
 */
class App implements ScreenSwitcher {
	private stage: Konva.Stage;
	private layer: Konva.Layer;

	private menuController: MenuScreenController;
	private gameController: GameScreenController;
	private pauseController: PauseScreenController;
	private loginController: LoginScreenController;

	constructor(container: string) {
		// Initialize Konva stage (the main canvas)
		this.stage = new Konva.Stage({
			container,
			width: STAGE_WIDTH,
			height: STAGE_HEIGHT,
		});

		// Create a layer (screens will be added to this layer)
		this.layer = new Konva.Layer();
		this.stage.add(this.layer);

		// Initialize all screen controllers
		// Each controller manages a Model, View, and handles user interactions
		this.menuController = new MenuScreenController(
			this,
			() => this.gameController.loadGame()
		);
		this.loginController = new LoginScreenController(this);
		this.gameController = new GameScreenController(this);
		this.pauseController = new PauseScreenController(
			this,
			() => this.gameController.saveGame(),
			() => this.handleLogout()
		);

		// Add all screen groups to the layer
		// All screens exist simultaneously but only one is visible at a time
		this.layer.add(this.loginController.getView().getGroup());
		this.layer.add(this.menuController.getView().getGroup());
		this.layer.add(this.gameController.getView().getGroup());
		this.layer.add(this.pauseController.getView().getGroup());

		// Draw the layer (render everything to the canvas)
		this.layer.draw();

		// Start with login screen visible
		this.loginController.getView().show();
	}

	/**
	 * Handle user logout
	 */
	async handleLogout(): Promise<void> {
		try {
			await this.gameController.saveGame(true); // Silent save
			await api.logout();
			this.switchToScreen({ type: "login" });
		} catch (err) {
			console.error("Logout failed:", err);
			this.switchToScreen({ type: "login" });
		}
	}

	/**
	 * Switch to a different screen
	 *
	 * This method implements screen management by:
	 * 1. Hiding all screens (setting their Groups to invisible)
	 * 2. Showing only the requested screen
	 *
	 * This pattern ensures only one screen is visible at a time.
	 */
	switchToScreen(screen: Screen): void {
		// Hide all screens first by setting their Groups to invisible
		this.menuController.hide();
		this.gameController.hide();
		this.pauseController.hide();
		this.loginController.hide();

		// Show the requested screen based on the screen type
		switch (screen.type) {
			case "login":
				this.loginController.show();
				break;
			case "menu":
				this.menuController.show();
				// Load game data when entering the menu (after login)
				this.gameController.loadGame();
				break;

			case "game":
				// Start the game (which also shows the game screen)
				this.gameController.startGame();
				break;
			case "pause":
				this.pauseController.show();
				break;
		}
	}
}

// Initialize the application
new App("container");
