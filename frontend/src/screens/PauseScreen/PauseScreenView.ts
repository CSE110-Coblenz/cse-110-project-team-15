import Konva from "konva";
import type { View } from "../../types.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";

/**
 * PauseScreenView - Renders the pause screen
 */
export class PauseScreenView implements View {
    private group: Konva.Group;
    private onContinueClick: () => void; // Callback for continue button
    private onSaveClick: () => void; // Callback for save button
    private onLogoutClick: () => void; // Callback for logout button

    constructor(onContinueClick: () => void, onSaveClick: () => void, onLogoutClick: () => void) {
        this.group = new Konva.Group({ visible: false });
        this.onContinueClick = onContinueClick;
        this.onSaveClick = onSaveClick;
        this.onLogoutClick = onLogoutClick;

        // Pause screen background
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
            y: STAGE_HEIGHT / 2 - 150,
            text: "Game Paused",
            fontSize: 50,
            fontFamily: "serif",
            fill: "darkRed",
            align: "center",
        });
        pausedText.offsetX(pausedText.width() / 2);
        this.group.add(pausedText);

        // Helper to create buttons
        const createButton = (text: string, yOffset: number, onClick: () => void) => {
            const button = new Konva.Rect({
                x: STAGE_WIDTH / 2 - 100,
                y: STAGE_HEIGHT / 2 + yOffset,
                width: 200,
                height: 50,
                fill: "darkred",
                cornerRadius: 10,
                stroke: "maroon",
                strokeWidth: 3,
            });
            const buttonText = new Konva.Text({
                x: STAGE_WIDTH / 2,
                y: STAGE_HEIGHT / 2 + yOffset + 12,
                text: text,
                fontSize: 24,
                fontFamily: "serif",
                fill: "white",
                align: "center",
            });
            buttonText.offsetX(buttonText.width() / 2);

            // Pause buttons group
            const buttonGroup = new Konva.Group();
            buttonGroup.add(button);
            buttonGroup.add(buttonText);
            buttonGroup.on("click", onClick);

            // Hover effects for buttons
            buttonGroup.on("mouseenter", () => {
                document.body.style.cursor = "pointer";
                button.fill("maroon");
                this.group.getLayer()?.draw();
            });
            buttonGroup.on("mouseleave", () => {
                document.body.style.cursor = "default";
                button.fill("darkred");
                this.group.getLayer()?.draw();
            });

            this.group.add(buttonGroup);
        };

        // Create buttons to continue, save, and logout
        createButton("Continue Game", -50, this.onContinueClick);
        createButton("Save Game", 20, this.onSaveClick);
        createButton("Logout", 90, this.onLogoutClick);
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

    /**
	 * Get the Konva group for rendering
	 */
    getGroup(): Konva.Group {
        return this.group;
    }
}