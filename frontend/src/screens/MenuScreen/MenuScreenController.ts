import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { MenuScreenView } from "./MenuScreenView.ts";

/**
 * MenuScreenController - Handles menu interactions
 */
export class MenuScreenController extends ScreenController {
	private view: MenuScreenView;
	private screenSwitcher: ScreenSwitcher;
	private onStartGame: () => void; // Callback to start the game

	constructor(screenSwitcher: ScreenSwitcher, onStartGame: () => void) {
		super(); // Call the ScreenController constructor
		this.screenSwitcher = screenSwitcher;
		this.onStartGame = onStartGame; // Set the callback to start the game

		// Initialize the view with the start button callback
		this.view = new MenuScreenView(() => this.handleStartClick());
	}

	/**
	 * Handle start button click
	 */
	private handleStartClick(): void {
		this.onStartGame();
		this.screenSwitcher.switchToScreen({ type: "game" });
	}

	/**
     * Get the Menu view for UI rendering
     */
	getView(): MenuScreenView {
		return this.view;
	}
}
