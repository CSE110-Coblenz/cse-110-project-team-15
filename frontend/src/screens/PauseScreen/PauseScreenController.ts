import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { PauseScreenView } from "./PauseScreenView.ts";

/**
 * PauseScreenController - Handles pause scren interactions
 */
export class PauseScreenController extends ScreenController {
    private view: PauseScreenView;
    private screenSwitcher: ScreenSwitcher;

    constructor(screenSwitcher: ScreenSwitcher) {
            super();
            this.screenSwitcher = screenSwitcher;
            this.view = new PauseScreenView();
    }

    /**
     * Get the view group
     */
    getView(): PauseScreenView {
        return this.view;
    }
}