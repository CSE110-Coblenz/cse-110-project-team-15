import Konva from "konva";
import type { View } from "../../types.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";

/**
 * PauseScreenView - Renders the pause screen
 */
export class PauseScreenView implements View {
    private group: Konva.Group;
    private onContinueClick: () => void;

    constructor(onContinueClick: () => void) {
            this.group = new Konva.Group({ visible: false });
            this.onContinueClick = onContinueClick;

            
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