// DoorInteractionManager.ts
import Phaser from "phaser";

export interface DoorData {
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
    targetDoorId?: number;
    targetRoomId?: number;
    doorType?: string;
}

export default class DoorInteractionManager {
    private scene: Phaser.Scene;
    private player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    private interactKey: Phaser.Input.Keyboard.Key;

    private doors: DoorData[] = [];
    private zones: Phaser.GameObjects.Zone[] = [];
    private prompts: Phaser.GameObjects.Text[] = [];

    private unlockedDoorIds = new Set<number>(); // 🔓 track unlocked doors

    constructor(
        scene: Phaser.Scene,
        player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
        map: Phaser.Tilemaps.Tilemap
    ) {
        this.scene = scene;
        this.player = player;

        this.interactKey = this.scene.input!.keyboard!.addKey(
            Phaser.Input.Keyboard.KeyCodes.E
        );


        this.loadDoorsFromMap(map);
    }

    // --------------------------------------------
    // Load doors from Tiled object layers
    // --------------------------------------------
    private loadDoorsFromMap(map: Phaser.Tilemaps.Tilemap) {
        const getProp = (obj: any, name: string) =>
            obj.properties?.find((p: any) => p.name === name)?.value;

        const doorLayers = map.objects.filter(layer =>
            layer.name.toLowerCase().includes("doors")
        );

        doorLayers.forEach(layer => {
            layer.objects.forEach(obj => {
                const doorId = getProp(obj, "id");

                const data: DoorData = {
                    id: doorId,
                    x: obj.x ?? 0,
                    y: obj.y ?? 0,
                    width: obj.width ?? 32,
                    height: obj.height ?? 32,
                    targetDoorId: getProp(obj, "targetDoorId"),
                    targetRoomId: getProp(obj, "targetRoomId"),
                    doorType: getProp(obj, "doorType"),
                };

                this.doors.push(data);

                // Create physics zone
                const zone = this.scene.add.zone(
                    data.x + data.width / 2,
                    data.y + data.height / 2,
                    data.width,
                    data.height
                );
                this.scene.physics.add.existing(zone, true);

                const prompt = this.scene.add
                    .text(
                        data.x + data.width / 2,
                        data.y - 10,
                        "Press E to interact",
                        {
                            fontSize: "12px",
                            color: "#ffffff",
                            backgroundColor: "#00000099",
                            padding: { x: 4, y: 2 },
                        }
                    )
                    .setOrigin(0.5)
                    .setDepth(999)
                    .setVisible(false);

                this.zones.push(zone);
                this.prompts.push(prompt);
            });
        });

        console.log("Loaded doors:", this.doors);
    }

    // --------------------------------------------
    // Unlock a specific door by its ID
    // --------------------------------------------
    unlockDoor(doorId: number) {
        this.unlockedDoorIds.add(doorId);
        console.log(`Door ${doorId} unlocked!`);
    }

    // --------------------------------------------
    // Update loop (called by MainScene)
    // --------------------------------------------
    update() {
        this.doors.forEach((door, i) => {
            const zone = this.zones[i];
            const prompt = this.prompts[i];

            const unlocked = this.unlockedDoorIds.has(door.id);

            if (!unlocked) {
                prompt.setVisible(false);
                return;
            }

            const dist = Phaser.Math.Distance.Between(
                this.player.x,
                this.player.y,
                zone.x,
                zone.y
            );

            const inRange = dist < 32;

            prompt.setVisible(inRange);

            if (inRange && Phaser.Input.Keyboard.JustDown(this.interactKey)) {
                console.log(`Interacted with door ${door.id}`);

                // Send event to MainScene for puzzle / transition logic
                this.scene.events.emit("door-interacted", door);
            }
        });
    }
}

