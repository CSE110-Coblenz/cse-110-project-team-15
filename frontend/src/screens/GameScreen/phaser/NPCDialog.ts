import Phaser from "phaser";

/**
 * NPCDialog
 *
 * This class is responsible for the bottom-of-screen dialog UI:
 * - A semi-transparent black rectangle background
 * - A close "X" button in the top-right
 * - A text area with word wrapping
 *
 * It is implemented as a Phaser Container:
 * - Positioned relative to the *camera* (not the world)
 * - Uses setScrollFactor(0) so it doesn't move as the player walks
 *
 * MainScene doesn't have to worry about layout; it just calls:
 *   dialog.setText("...");
 *   dialog.show();
 *   dialog.hide();
 */
export class NPCDialog {
    // Scene that owns this UI.

    // A container that groups the background, close button, and text.
    private container: Phaser.GameObjects.Container;

    // The text object that actually displays dialog content.
    private textObj: Phaser.GameObjects.Text;

    // Simple boolean mirror of visibility state.
    private visible = false;

    constructor(scene: Phaser.Scene) {
        // Grab the main camera so we can position the dialog relative to its size.
        const cam = scene.cameras.main;

        // Fixed size for the dialog background.
        const bgWidth = 400;
        const bgHeight = 120;

        // Margin from the bottom of the screen.
        const margin = 24;

        // ------------------------------------------------
        // CONTAINER – anchored to the camera, not the map
        // ------------------------------------------------
        // Position the container so that:
        //  - It is centered horizontally
        //  - It sits 'margin' pixels above the bottom of the camera view
        this.container = scene.add.container(
            (cam.width - bgWidth) / 2,      // x: horizontal center
            cam.height - bgHeight - margin  // y: near bottom
        );

        // This is critical: scroll factor 0 makes the dialog stay in place
        // even when the camera moves around the world.
        this.container.setScrollFactor(0);

        // Large depth value so the dialog appears above almost everything else.
        this.container.setDepth(2000);

        // ------------------------------------------------
        // BACKGROUND RECTANGLE
        // ------------------------------------------------
        // Drawn at (0,0) inside the container, so container's position is its top-left.
        const bg = scene.add.rectangle(0, 0, bgWidth, bgHeight, 0x000000, 0.85);
        bg.setOrigin(0, 0); // top-left corner anchored at container's x,y

        // ------------------------------------------------
        // CLOSE BUTTON ("X" in the top-right)
        // ------------------------------------------------
        const closeBtn = scene.add.text(bgWidth - 18, 6, "E", {
            fontSize: "18px",
            fontFamily: "serif",
            color: "#ffffff",
        });

        // Make it clickable; useHandCursor = pointer cursor on hover.
        closeBtn.setInteractive({ useHandCursor: true });

        // Clicking the X just calls hide() on this dialog object.
        closeBtn.on("pointerdown", () => this.hide());

        // ------------------------------------------------
        // TEXT OBJECT – main dialog content
        // ------------------------------------------------
        this.textObj = scene.add.text(
            12,   // x offset inside the dialog
            32,   // y offset (leave room for title / close button)
            "Hello, I'm Bruce.\nThis is the dialog window.",
            {
                fontSize: "16px",
                fontFamily: "serif",
                color: "#ffffff",
                wordWrap: { width: bgWidth - 24 }, // wrap text inside the box
                lineSpacing: 4,
            }
        );

        // Add all pieces to the container so we can show/hide them together.
        this.container.add([bg, closeBtn, this.textObj]);

        // Start hidden. MainScene controls when it appears.
        this.container.setVisible(false);
    }

    /**
     * setText
     *
     * Updates the dialog message. This is called before show().
     * We rely on Phaser's built-in word wrapping and line spacing.
     */
    setText(message: string) {
        this.textObj.setText(message);
    }

    /**
     * show
     *
     * Marks the dialog as visible and shows the container.
     * Called when the player first talks to the NPC (Press E near Bruce).
     */
    show() {
        this.visible = true;
        this.container.setVisible(true);
    }

    /**
     * hide
     *
     * Hides the dialog UI and updates the internal flag.
     * Called either when:
     *   - The player hits E again in MainScene, or
     *   - The user clicks the "X" button.
     */
    hide() {
        this.visible = false;
        this.container.setVisible(false);
    }

    /**
     * isVisible
     *
     * Simple getter used by MainScene to check whether dialog is open,
     * so it can decide if E should open or close the dialog.
     */
    isVisible() {
        return this.visible;
    }
}
