import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { MenuScreenView } from "./MenuScreenView.ts";

/**
 * MenuScreenController - Handles menu interactions
 */
export class MenuScreenController extends ScreenController {
	private view: MenuScreenView;
	private screenSwitcher: ScreenSwitcher;
	private onStartGame: () => void;

	constructor(screenSwitcher: ScreenSwitcher, onStartGame: () => void) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.onStartGame = onStartGame;
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
	 * Get the view
	 */
	getView(): MenuScreenView {
		return this.view;
	}
}
