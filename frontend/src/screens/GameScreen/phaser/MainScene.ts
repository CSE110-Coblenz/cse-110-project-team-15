// import Phaser from "phaser";

// import Phaser from "phaser";
import { NPC } from "./NPC";   // 👈 add this



export class MainScene extends Phaser.Scene {
    private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;

    private npcSprite!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    private npcPrompt!: Phaser.GameObjects.Text;

    // 🔑 door-related fields
    private doorsById!: Map<number, Phaser.GameObjects.Zone>;
    private doorMetaById!: Map<number, { room: number }>;
    private doorZones!: Phaser.Physics.Arcade.StaticGroup;
    private currentDoorId: number | null = null;
    private W!: Phaser.Input.Keyboard.Key;
    private A!: Phaser.Input.Keyboard.Key;
    private S!: Phaser.Input.Keyboard.Key;
    private D!: Phaser.Input.Keyboard.Key;
    private keyE!: Phaser.Input.Keyboard.Key;
    private npc?: NPC;
    private canTalkToNpc = false;


    constructor() {
        super("MainScene");
    }

    preload(): void {
        this.load.spritesheet("player", "/assets/walk.png", {
            frameWidth: 80,
            frameHeight: 80,
        });

        this.load.image("tiles", "/assets/mansion-tileset.png");
        this.load.tilemapTiledJSON("map", "/assets/map.json");
        this.load.spritesheet("npc", "/assets/character3.png", {
            frameWidth: 32,
            frameHeight: 32,
        });
    }

    create(): void {
        const map = this.make.tilemap({ key: "map" });

        console.log("Tile layers:", map.getTileLayerNames());

        const tileset = map.addTilesetImage("main", "tiles");
        if (!tileset) {
            console.error(
                "Tileset not found. Check the name in Tiled and the key 'tiles' in preload()."
            );
            return;
        }

        const bgBase    = map.createLayer("Background/Background", tileset, 0, 0);
        const wallOvl   = map.createLayer("Background/Wall Overlay", tileset, 0, 0);
        const floorOvl  = map.createLayer("Background/Floor Overlay", tileset, 0, 0);
        const furnBack  = map.createLayer("Background/Furniture Back", tileset, 0, 0);
        const furnFront = map.createLayer("Background/Furniture Front", tileset, 0, 0);
        const front     = map.createLayer("Background/Front", tileset, 0, 0);

        // 🔍 NEW unexplored layers
        const unexplored1 = map.createLayer("Unexplored/Unexplored1", tileset, 0, 0);
        const unexplored2 = map.createLayer("Unexplored/Unexplored2", tileset, 0, 0);
        const unexplored3 = map.createLayer("Unexplored/Unexplored3", tileset, 0, 0);
        const unexplored4 = map.createLayer("Unexplored/Unexplored4", tileset, 0, 0);
        const unexplored5 = map.createLayer("Unexplored/Unexplored5", tileset, 0, 0);

        unexplored1!.setVisible(true);
        unexplored2!.setVisible(true);
        unexplored3!.setVisible(true);
        unexplored4!.setVisible(true);
        unexplored5!.setVisible(true);

        const foreground = map.createLayer("Foreground", tileset, 0, 0);
        const collision  = map.createLayer("Player Collision", tileset, 0, 0);
        collision!.setVisible(false);
        collision!.setCollisionByExclusion([-1]);

        // ============================================
        // DOOR LOGIC – read objects from Tiled.
        // ============================================
        const roomsDoorsLayers = [
            map.getObjectLayer("Rooms/1/doors"),
            map.getObjectLayer("Rooms/2/doors"),
            map.getObjectLayer("Rooms/3/doors"),
            map.getObjectLayer("Rooms/4/doors"),
            map.getObjectLayer("Rooms/5/doors"),
            map.getObjectLayer("Rooms/6/doors"),
        ];

        this.doorsById    = new Map<number, Phaser.GameObjects.Zone>();
        this.doorMetaById = new Map<number, { room: number }>();
        this.doorZones    = this.physics.add.staticGroup();

        roomsDoorsLayers.forEach((layer, roomIndex) => {
            if (!layer) return;
            const roomNumber = roomIndex + 1;

            layer.objects.forEach((obj: any) => {
                const doorId = obj.properties?.find(
                    (p: any) => p.name === "doorId"
                )?.value;
                if (doorId == null) return;

                // invisible physics zone at door position
                const zone = this.add.zone(
                    obj.x,
                    obj.y,
                    obj.width || 32,
                    obj.height || 32
                );
                this.physics.add.existing(zone, true); // static body

                (zone as any).setData("doorId", doorId);

                this.doorZones.add(zone);
                this.doorsById.set(doorId, zone as Phaser.GameObjects.Zone);
                this.doorMetaById.set(doorId, { room: roomNumber });
            });
        });




        // ----- PLAYER -----
        this.player = this.physics.add.sprite(200, 200, "player", 0);
        this.player.setDepth(10);

        const body = this.player.body as Phaser.Physics.Arcade.Body;
        const hitWidth = 8;
        const hitHeight = 15;

        body.setSize(hitWidth, hitHeight);
        this.player.setScale(2.0);

        const offsetX = (this.player.width - hitWidth) / 2;
        const offsetY = 34;
        body.setOffset(offsetX, offsetY);

        // Camera follow
        this.cameras.main.startFollow(this.player);

        // Tile collision
        this.physics.add.collider(this.player, collision!);

        // ----- BASIC WALK ANIMS -----
        this.anims.create({
            key: "walk-right",
            frames: this.anims.generateFrameNumbers("player", { start: 0, end: 7 }),
            frameRate: 8,
            repeat: -1,
        });

        this.anims.create({
            key: "walk-down",
            frames: this.anims.generateFrameNumbers("player", { start: 8, end: 15 }),
            frameRate: 8,
            repeat: -1,
        });

        this.anims.create({
            key: "walk-up",
            frames: this.anims.generateFrameNumbers("player", { start: 16, end: 23 }),
            frameRate: 8,
            repeat: -1,
        });

        // ----- NPC (after player exists) -----
        this.npc = new NPC(this, 400, 260);
        this.physics.add.collider(this.player, this.npc.getSprite());


        // Input
        this.cursors = this.input.keyboard!.createCursorKeys();
        this.W = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.A = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.S = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.D = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyE = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    }


    update(): void {
        if (!this.cursors) return;

        // reset interaction state
        this.canTalkToNpc = false;
        if (this.npc) this.npc.hidePrompt();

        // --- NPC interaction detection ---
            if (this.npc) {
                const npcSprite = this.npc.getSprite();

                const dist = Phaser.Math.Distance.Between(
                    this.player.x, this.player.y,
                    npcSprite.x, npcSprite.y
                );

                // 50–70 pixels feels good
                if (dist < 60) {
                    this.canTalkToNpc = true;
                    this.npc.showPrompt();
                } else {
                    this.canTalkToNpc = false;
                    this.npc.hidePrompt();
                }
            }


        // ---- door detection ----
        this.currentDoorId = null;
        this.physics.overlap(
            this.player,
            this.doorZones,
            (_player, zone) => {
                this.currentDoorId = (zone as any).getData("doorId");
            }
        );

        if (
            this.currentDoorId !== null &&
            Phaser.Input.Keyboard.JustDown(this.keyE)
        ) {
            this.useDoor(this.currentDoorId);
        }

        // ---- movement ----
        const speed = 150;
        let vx = 0;
        let vy = 0;
        let played = false;

        // LEFT
        if (this.cursors.left?.isDown || this.A.isDown) {
            vx = -speed;
            this.player.setFlipX(true);
            this.player.play("walk-right", true);
            played = true;
        }
        // RIGHT
        else if (this.cursors.right?.isDown || this.D.isDown) {
            vx = speed;
            this.player.setFlipX(false);
            this.player.play("walk-right", true);
            played = true;
        }

        // UP
        if (this.cursors.up?.isDown || this.W.isDown) {
            vy = -speed;
            this.player.play("walk-up", true);
            played = true;
        }
        // DOWN
        else if (this.cursors.down?.isDown || this.S.isDown) {
            vy = speed;
            this.player.play("walk-down", true);
            played = true;
        }

        this.player.setVelocity(vx, vy);

        if (!played) {
            this.player.setVelocity(0, 0);
            this.player.anims.stop();
        }
    }
}
