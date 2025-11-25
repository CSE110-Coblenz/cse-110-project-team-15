// DoorsManager.ts
import Phaser from "phaser";

export interface DoorData {
    id: number;
    name: string;
    room: string;
    targetRoom: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

export class DoorsManager {
    private scene: Phaser.Scene;
    private player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

    private doorZones: Phaser.GameObjects.Zone[] = [];
    private doorData: DoorData[] = [];

    constructor(
        scene: Phaser.Scene,
        map: Phaser.Tilemaps.Tilemap,
        player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
    ) {
        this.scene = scene;
        this.player = player;

        this.loadDoors(map);
    }

    private loadDoors(map: Phaser.Tilemaps.Tilemap) {
        // Search ALL object layers for doors
        const objectLayers = map.objects;

        objectLayers.forEach(layer => {
            if (layer.name.toLowerCase().includes("doors")) {
                layer.objects.forEach(obj => {

                    const data: DoorData = {
                        id: obj.id,
                        name: obj.name ?? "",
                        room: layer.name,
                        targetRoom: obj.properties?.find(p => p.name === "targetRoom")?.value ?? "",
                        x: obj.x ?? 0,
                        y: obj.y ?? 0,
                        width: obj.width ?? 32,
                        height: obj.height ?? 32
                    };

                    this.doorData.push(data);

                    // Create a physics zone
                    const zone = this.scene.add.zone(
                        data.x + data.width / 2,
                        data.y + data.height / 2,
                        data.width,
                        data.height
                    );

                    this.scene.physics.world.enable(zone);
                    (zone.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
                    (zone.body as Phaser.Physics.Arcade.Body).setImmovable(true);

                    this.doorZones.push(zone);

                    // setup overlap detection
                    this.scene.physics.add.overlap(this.player, zone, () => {
                        this.onDoorEnter(data);
                    });
                });
            }
        });

        console.log("Doors loaded:", this.doorData);
    }

    private onDoorEnter(door: DoorData) {
        console.log("Door entered:", door);

        // Emit event so MainScene can handle transitions
        this.scene.events.emit("door-entered", door);
    }
}
