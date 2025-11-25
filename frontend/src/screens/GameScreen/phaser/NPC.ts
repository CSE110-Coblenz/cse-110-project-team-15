// GameScreen/phaser/NPC.ts
import Phaser from "phaser";

export class NPC {
    private scene: Phaser.Scene;
    private sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    private prompt: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        this.scene = scene;

        this.ensureAnimations();

        this.sprite = scene.physics.add
            .sprite(x, y, "npc", 0) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

        this.sprite.setScale(1.3);
        this.sprite.setImmovable(true);

        // smaller hitbox
        const body = this.sprite.body as Phaser.Physics.Arcade.Body;
        body.setSize(10, 18);
        body.setOffset(10, 13);

        this.sprite.play("npc-idle-down");

        // 🔹 "Press E" prompt just below the NPC
        const yOffset = this.sprite.displayHeight / 2 + 6;
        this.prompt = scene.add.text(
            x,
            y + yOffset,
            "Press E",
            {
                fontSize: "12px",
                fontFamily: "serif",
                color: "#ffffff",
                backgroundColor: "#00000099", // semi-transparent black
                padding: { x: 4, y: 2 },
            }
        );
        this.prompt.setOrigin(0.5, 0);              // center under NPC
        this.prompt.setDepth(this.sprite.depth + 1);
        this.prompt.setVisible(false);              // hidden by default
    }

    private ensureAnimations() {
        const anims = this.scene.anims;
        if (anims.exists("npc-idle-down")) return;

        anims.create({
            key: "npc-idle-down",
            frames: anims.generateFrameNumbers("npc", { frames: [0, 1] }),
            frameRate: 3,
            repeat: -1,
        });
    }

    getSprite() {
        return this.sprite;
    }

    showPrompt() {
        this.prompt.setVisible(true);
    }

    hidePrompt() {
        this.prompt.setVisible(false);
    }
}