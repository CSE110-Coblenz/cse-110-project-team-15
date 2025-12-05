// screens/GameScreen/phaser/DoorCollisionManager.ts
import Phaser from "phaser";

export type DoorCollisionConfig = {
    id: number;           // door id (1..5)
    x: number;
    y: number;
    roomName: string;     // e.g. "Room 1", "Library", etc.
};

type DoorEntry = {
    id: number;
    roomName: string;
    rect: Phaser.GameObjects.Rectangle;
    label: Phaser.GameObjects.Text;
    locked: boolean;
    collider?: Phaser.Physics.Arcade.Collider;
};

export class DoorCollisionManager {
    private scene: Phaser.Scene;
    private doors: DoorEntry[] = [];
    private proximityRadius: number;

    constructor(
        scene: Phaser.Scene,
        configs: DoorCollisionConfig[],
        proximityRadius: number = 25
    ) {
        this.scene = scene;
        this.proximityRadius = proximityRadius;

        configs.forEach((cfg) => {
            // Create collision rectangle
            // Using alpha 0.3 for debugging - change to 0 for production
            const rect = scene.add.rectangle(cfg.x, cfg.y, 32, 16, 0xff0000, 0);
            rect.setOrigin(0.5, 1);
            rect.setDepth(5);

            // IMPORTANT: Add physics body as a STATIC body
            scene.physics.add.existing(rect, true);

            // Static bodies are immovable by default, just ensure it's enabled
            const body = rect.body as Phaser.Physics.Arcade.StaticBody;
            body.enable = true;

            // Popup label above the door
            const labelText =
                `${cfg.roomName}\n` +
                `Press E to solve the problem\nand unlock the door`;

            const label = scene.add.text(cfg.x, cfg.y - 24, labelText, {
                fontSize: "12px",
                fontFamily: "serif",
                color: "#ffffff",
                backgroundColor: "#000000cc",
                align: "center",
                padding: { x: 6, y: 4 },
                wordWrap: { width: 160 },
            });
            label.setOrigin(0.5, 1);
            label.setDepth(999);
            label.setVisible(false);

            this.doors.push({
                id: cfg.id,
                roomName: cfg.roomName,
                rect,
                label,
                locked: true,
            });
        });
    }

    /**
     * Call this once from MainScene.create(), AFTER the player is created.
     * This creates colliders between the player and each locked door.
     */
    public attachPlayer(
        player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
    ) {
        this.doors.forEach((door) => {
            // Create a collider between player and the door rectangle
            door.collider = this.scene.physics.add.collider(
                player,
                door.rect,
                () => {
                    // Optional: callback when collision happens
                    console.log(`Colliding with door ${door.id}`);
                },
                undefined,
                this
            );
        });
    }

    /**
     * Call this every frame from MainScene.update().
     * Handles proximity check, label visibility, and E key interaction.
     */
    public update(
        player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
        keyE: Phaser.Input.Keyboard.Key
    ) {
        for (const door of this.doors) {
            const dist = Phaser.Math.Distance.Between(
                player.x,
                player.y,
                door.rect.x,
                door.rect.y
            );

            // Only show prompt / allow interaction while the door is locked.
            const inRange = dist <= this.proximityRadius && door.locked;

            door.label.setVisible(inRange);
            if (inRange) {
                if (Phaser.Input.Keyboard.JustDown(keyE)) {
                    // Fire an event so DoorPuzzleManager / MainScene can react.
                    this.scene.game.events.emit("door-attempt", door.id);
                    console.log("Attempting to unlock door", door.id, door.roomName);
                }
            }
        }
    }

    /** Called when the puzzle for this door is solved */
    public unlockDoor(doorId: number) {
        const door = this.doors.find((d) => d.id === doorId);
        if (door) {
            door.locked = false;
            door.label.setVisible(false);

            // Disable the collider so the player can walk through now.
            if (door.collider) {
                door.collider.destroy();
                door.collider = undefined;
            }

            // Disable the physics body entirely
            const body = door.rect.body as Phaser.Physics.Arcade.StaticBody;
            body.enable = false;

            // Optionally hide the debug rectangle
            door.rect.setVisible(false);

            this.scene.game.events.emit("door-unlocked", doorId);
        }
    }
}