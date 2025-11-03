import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { GameScreenModel } from "./GameScreenModel.ts";
import { GameScreenView } from "./GameScreenView.ts";
import { GAME_DURATION } from "../../constants.ts";

/**
 * GameScreenController - Coordinates game logic between Model and View
 */
export class GameScreenController extends ScreenController {
	private view: GameScreenView;
	private screenSwitcher: ScreenSwitcher;

	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.view = new GameScreenView();
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
}
