import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { GameScreenView } from "./GameScreenView.ts";

/**
 * GameScreenController - Coordinates game logic between Model and View
 */
export class GameScreenController extends ScreenController {
	private view: GameScreenView;
	private screenSwitcher: ScreenSwitcher;

	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.view = new GameScreenView(() => this.handlePauseClick());
	}

	/**
	 * Start the game
	 */
	startGame(): void {
		this.view.show();
	}

	/**
	 * Get the view group
	 */
	getView(): GameScreenView {
		return this.view;
	}

	/**
	 * Pause the game
	 */
	private handlePauseClick(): void {
		this.screenSwitcher.switchToScreen({type: "pause"});
	}
}
