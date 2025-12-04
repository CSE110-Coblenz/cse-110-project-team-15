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

            // Background
            const bg = new Konva.Rect({
                x: 0,
                y: 0,
                width: STAGE_WIDTH,
                height: STAGE_HEIGHT,
                fill: "#fffbea",
            });
            this.group.add(bg);

            // "Paused" text
            const pausedText = new Konva.Text({
                x: STAGE_WIDTH / 2,
                y: STAGE_HEIGHT / 2 - 100,
                text: "Game Paused",
                fontSize: 50,
                fontFamily: "serif",
                fill: "darkRed",
                align: "center",
            });
            pausedText.offsetX(pausedText.width() / 2);
            this.group.add(pausedText);

            // Continue button
            const continueButton = new Konva.Rect({
                x: STAGE_WIDTH / 2 - 100,
                y: STAGE_HEIGHT / 2,
                width: 200,
                height: 60,
                fill: "darkred",
                cornerRadius: 10,
                stroke: "maroon",
                strokeWidth: 3,
            });
            const continueText = new Konva.Text({
                x: STAGE_WIDTH / 2,
                y: STAGE_HEIGHT / 2 + 15,
                text: "Continue Game",
                fontSize: 26,
                fontFamily: "serif",
                fill: "white",
                align: "center",
            });
            continueText.offsetX(continueText.width() / 2);

            // Continue group
            const continueGroup = new Konva.Group();
            continueGroup.add(continueButton);
            continueGroup.add(continueText);
            continueGroup.on("click", this.onContinueClick);
            this.group.add(continueGroup);

            // Continue button hover effects
            continueGroup.on("mouseenter", () => {
                document.body.style.cursor = "pointer";
                continueButton.fill("maroon");
                this.group.getLayer()?.draw();
            });
            continueGroup.on("mouseleave", () => {
                document.body.style.cursor = "default";
                continueButton.fill("darkred");
                this.group.getLayer()?.draw();
            });
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