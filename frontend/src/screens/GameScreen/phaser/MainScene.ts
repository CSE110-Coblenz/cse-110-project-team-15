// import Phaser from "phaser";

export class MainScene extends Phaser.Scene {
    private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;

    constructor() {
        super("MainScene");
    }

    preload(): void {
        // 1) Player spritesheet
        //    File: public/assets/walk.png  → URL: /assets/walk.png
        this.load.spritesheet("player", "/assets/walk.png", {
            frameWidth: 80,
            frameHeight: 80,
        });

        // 2) Tileset image
        //    File: public/assets/mansion-tileset.png → URL: /assets/mansion-tileset.png
        this.load.image("tiles", "/assets/mansion-tileset.png");

        // 3) Tilemap JSON
        //    File: public/assets/map.json → URL: /assets/map.json
        this.load.tilemapTiledJSON("map", "/assets/map.json");
    }

    create(): void {
        // ----- TILEMAP -----
        const map = this.make.tilemap({ key: "map" });

        // Log layer names so you can see what exists
        console.log("Tile layers:", map.getTileLayerNames());

        // IMPORTANT:
        // First arg MUST be the tileset name as shown in Tiled’s Tilesets panel.
        // Change "main" here to whatever your tileset is actually called.
        const tileset = map.addTilesetImage("main", "tiles");
        
        if (!tileset) {
            console.error(
                "Tileset not found. Check the name in Tiled and the key 'tiles' in preload()."
            );
            return;
        }


        // Take the FIRST tile layer from the map and just draw that.
        // This avoids issues with wrong layer names temporarily.
        const tileLayerNames = map.getTileLayerNames();
        if (tileLayerNames.length === 0) {
            console.error("No tile layers found in map.json");
        } else {
            const firstLayerName = tileLayerNames[0];
            console.log("Using tile layer:", firstLayerName);
            map.createLayer(firstLayerName, tileset, 0, 0);
        }

        // ----- PLAYER -----
        this.player = this.physics.add.sprite(100, 100, "player", 0);
        this.player.setCollideWorldBounds(true);
        this.player.setDepth(10);

        const body = this.player.body as Phaser.Physics.Arcade.Body;
        body.setSize(36, 22, true);
        body.setOffset(22, 58);

        // Simple camera follow
        this.cameras.main.startFollow(this.player);

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

        this.cursors = this.input.keyboard!.createCursorKeys();
    }

    update(): void {
        if (!this.cursors) return;

        const speed = 150;
        let vx = 0;
        let vy = 0;
        let played = false;

        if (this.cursors.left?.isDown) {
            vx = -speed;
            this.player.setFlipX(true);
            this.player.play("walk-right", true);
            played = true;
        } else if (this.cursors.right?.isDown) {
            vx = speed;
            this.player.setFlipX(false);
            this.player.play("walk-right", true);
            played = true;
        }

        if (this.cursors.up?.isDown) {
            vy = -speed;
            this.player.play("walk-up", true);
            played = true;
        } else if (this.cursors.down?.isDown) {
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
