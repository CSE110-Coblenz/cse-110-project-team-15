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
    collider?: Phaser.Physics.Arcade.Collider;   // NEW: collider to block player
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
            // Invisible collision block (32x16)
            const rect = scene.add.rectangle(cfg.x, cfg.y, 32, 16, 0xff0000, 0);
            // For debugging, change alpha from 0 to 0.3 to see them
            rect.setOrigin(0.5, 1);
            rect.setDepth(5);

            // Give it a static physics body (but we’ll hook collision later)
            scene.physics.add.existing(rect, true); // static body

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
     * This actually makes locked doors block the player.
     */
    public attachPlayer(
        player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
    ) {
        this.doors.forEach((door) => {
            const body = door.rect.body as Phaser.Physics.Arcade.Body;
            body.setImmovable(true);
            body.enable = true;

            // Create a collider between player and the door rectangle.
            door.collider = this.scene.physics.add.collider(player, door.rect);
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

            const body = door.rect.body as Phaser.Physics.Arcade.Body;
            body.enable = false; // no more collision checks for this door
        }
    }
}
