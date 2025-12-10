import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { PauseScreenView } from "./PauseScreenView.ts";

/**
 * PauseScreenController - Handles pause screen interactions
 */
export class PauseScreenController extends ScreenController {
    private view: PauseScreenView;
    private screenSwitcher: ScreenSwitcher;

    constructor(screenSwitcher: ScreenSwitcher, onSave: () => void, onLogout: () => void) {
        super(); // Call the ScreenController constructor
        this.screenSwitcher = screenSwitcher;
        this.view = new PauseScreenView(
            () => this.handleContinueClick(),
            onSave,
            onLogout
        );
    }

    /**
     * Handle continue game button click
     */
    private handleContinueClick(): void {
        this.screenSwitcher.switchToScreen({ type: "game" });
    }

    /**
     * Get the Pause view for UI rendering
     */
    getView(): PauseScreenView {
        return this.view;
    }
}