import Phaser from "phaser";

/**
 * NPC
 *
 * This class wraps everything related to a single NPC character:
 * - The physics sprite itself (for collision with the player)
 * - A small hitbox near the feet (so collision feels natural)
 * - A permanent name tag above the head ("Bruce")
 * - A "Press E" interaction prompt under the sprite
 *
 * MainScene doesn't need to know how these are built; it just calls:
 *   - npc.getSprite() for collisions
 *   - npc.showPrompt()/npc.hidePrompt() when the player is in range
 */
export class NPC {
    // Reference to the Phaser.Scene so we can create sprites and text.
    private scene: Phaser.Scene;

    // The physics-enabled NPC sprite (for collision + animations).
    private sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

    // "Press E" text prompt that appears below the NPC when player is close.
    private prompt: Phaser.GameObjects.Text;

    // Always-visible name tag that floats above the NPC's head.
    private nameTag: Phaser.GameObjects.Text;

    /**
     * @param scene The scene this NPC belongs to.
     * @param x     Initial x-position in world coordinates.
     * @param y     Initial y-position in world coordinates.
     */
    constructor(scene: Phaser.Scene, x: number, y: number) {
        this.scene = scene;

        // Make sure the idle animation exists globally before creating the sprite.
        this.ensureAnimations();

        // Create a physics sprite using the "npc" spritesheet.
        // The `as` cast lets us treat it as a dynamic-body sprite type.
        this.sprite = scene.physics.add
            .sprite(x, y, "npc", 0) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

        // Slightly increase visual size so the NPC doesn't look tiny compared to the player.
        this.sprite.setScale(1.3);

        // NPC doesn't move when colliding with the player (player bounces off).
        this.sprite.setImmovable(true);

        // -----------------------------------------------
        // HITBOX TUNING – smaller box around the feet
        // -----------------------------------------------
        const body = this.sprite.body as Phaser.Physics.Arcade.Body;

        // Use a small hitbox so the player can overlap the upper part of the sprite
        // without immediately colliding. Makes spacing feel better.
        body.setSize(10, 18);

        // Offset the hitbox downwards and slightly to the side so it lines up
        // with the feet. These numbers were tweaked manually.
        body.setOffset(10, 13);

        // Start the NPC in a looping idle-down animation (simple breathing/bobbing).
        this.sprite.play("npc-idle-down");

        // ============================================
        // 👤 NAME TAG — always visible above NPC
        // ============================================

        // Vertical offset above the sprite's top to place the name tag.
        // Use displayHeight so the scale is taken into account.
        const nameOffsetY = -(this.sprite.displayHeight / 2) - 12;

        // Create a text label that always shows the NPC's name.
        this.nameTag = scene.add.text(
            x,
            y + nameOffsetY,
            "Bruce", // Hard-coded name for now
            {
                fontSize: "10px",
                fontFamily: "serif",
                color: "#ffffff",
                backgroundColor: "#00000088", // semi-transparent black behind text
                padding: { x: 4, y: 1 },
            }
        );

        // Origin (0.5, 1) => centered horizontally, "bottom" anchored at this point.
        // So the label sits right above the head.
        this.nameTag.setOrigin(0.5, 1);

        // Draw it slightly above the sprite (depth + 2) so it’s never hidden.
        this.nameTag.setDepth(this.sprite.depth + 2);

        // ============================================
        // 🔹 "Press E" PROMPT — appears below NPC
        // ============================================

        // Offset below the bottom of the sprite for the "Press E" label.
        const yOffset = this.sprite.displayHeight / 2 + 6;

        // Instruction text that tells the player they can interact.
        this.prompt = scene.add.text(
            x,
            y + yOffset,
            "Press E",
            {
                fontSize: "12px",
                fontFamily: "serif",
                color: "#ffffff",
                backgroundColor: "#00000099", // slightly more opaque background
                padding: { x: 4, y: 2 },
            }
        );

        // Origin (0.5, 0) => centered horizontally, anchored at top of text box.
        this.prompt.setOrigin(0.5, 0);

        // Draw it above some backgrounds but under the name tag.
        this.prompt.setDepth(this.sprite.depth + 1);

        // Hidden by default; MainScene calls showPrompt() when player is close.
        this.prompt.setVisible(false);
    }

    /**
     * ensureAnimations
     *
     * Creates the NPC's idle animation once, if it doesn't already exist.
     * This avoids re-registering the same animation every time we create an NPC.
     */
    private ensureAnimations() {
        const anims = this.scene.anims;

        // If the "npc-idle-down" animation already exists globally, do nothing.
        if (anims.exists("npc-idle-down")) return;

        // Otherwise, define it. Uses frames [0, 1] from the "npc" spritesheet
        // in a slow loop, giving a simple idle bob.
        anims.create({
            key: "npc-idle-down",
            frames: anims.generateFrameNumbers("npc", { frames: [0, 1] }),
            frameRate: 3,
            repeat: -1,
        });
    }

    /**
     * getSprite
     *
     * Exposes the underlying physics sprite to the scene, mainly for:
     * - Adding colliders between player and NPC
     * - Reading current position if needed
     */
    getSprite() {
        return this.sprite;
    }

    /**
     * showPrompt
     *
     * Makes the "Press E" text visible. Called by MainScene
     * when the player is within the talk radius.
     */
    showPrompt() {
        this.prompt.setVisible(true);
    }

    /**
     * hidePrompt
     *
     * Hides the "Press E" text. Called when the player walks away.
     */
    hidePrompt() {
        this.prompt.setVisible(false);
    }
}
