// screens/GameScreen/phaser/InteractableBlock.ts
import Phaser from "phaser";

export class InteractableBlock {
    private rect: Phaser.GameObjects.Rectangle;
    private prompt: Phaser.GameObjects.Text;
    private onInteract: () => void;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        onInteract: () => void,
        promptText: string = "Press E to read"
    ) {
        this.onInteract = onInteract;

        this.rect = scene.add.rectangle(x, y, 24, 24, 0x3a86ff, 1);
        this.rect.setOrigin(0.5);
        this.rect.setDepth(5);

        this.prompt = scene.add.text(x, y - 20, promptText, {
            fontSize: "12px",
            fontFamily: "serif",
            color: "#ffffff",
            backgroundColor: "#00000099",
            padding: { x: 4, y: 2 },
        });
        this.prompt.setOrigin(0.5, 1);
        this.prompt.setDepth(999);
        this.prompt.setVisible(false);
    }

    update(
        player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
        interactKey: Phaser.Input.Keyboard.Key
    ) {
        const dist = Phaser.Math.Distance.Between(
            player.x,
            player.y,
            this.rect.x,
            this.rect.y
        );
        const inRange = dist < 32;

        this.prompt.setVisible(inRange);

        if (inRange && Phaser.Input.Keyboard.JustDown(interactKey)) {
            this.onInteract();
        }
    }
    //expose position so manager can compute distance
    public getPosition(): { x: number; y: number } {
        return { x: this.rect.x, y: this.rect.y };
    }
}
