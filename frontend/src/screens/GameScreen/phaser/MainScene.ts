// import Phaser from "phaser";
import { DoorsManager } from "./DoorsManager"; 


export class MainScene extends Phaser.Scene {
    private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;

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
    }
 //..
    create(): void {
        const map = this.make.tilemap({ key: "map" });
        //const doors = new DoorsManager(this, map, this.player);

        // listen for door events
        // this.events.on("door-entered", (door) => {
        //     console.log("Entered door:", door);

        //     // Later we can:
        //     // - Switch rooms
        //     // - Fade out/in
        //     // - Move player to new coordinates
        // });

        // Log layer names so we can see what exists
        console.log("Tile layers:", map.getTileLayerNames());

        const tileset = map.addTilesetImage("main", "tiles");
        
        if (!tileset) {
            console.error(
                "Tileset not found. Check the name in Tiled and the key 'tiles' in preload()."
            );
            return;
        }

//
        const bgBase      = map.createLayer("Background/Background", tileset, 0, 0);
        const wallOvl     = map.createLayer("Background/Wall Overlay", tileset, 0, 0);
        const floorOvl    = map.createLayer("Background/Floor Overlay", tileset, 0, 0);
        const furnBack    = map.createLayer("Background/Furniture Back", tileset, 0, 0);
        const furnFront   = map.createLayer("Background/Furniture Front", tileset, 0, 0);
        const front       = map.createLayer("Background/Front", tileset, 0, 0);


        // 🔍 NEW unexplored layers
        const unexplored1 = map.createLayer("Unexplored/Unexplored1", tileset, 0, 0);
        const unexplored2 = map.createLayer("Unexplored/Unexplored2", tileset, 0, 0);
        const unexplored3 = map.createLayer("Unexplored/Unexplored3", tileset, 0, 0);
        const unexplored4 = map.createLayer("Unexplored/Unexplored4", tileset, 0, 0);
        const unexplored5 = map.createLayer("Unexplored/Unexplored5", tileset, 0, 0);

        // make sure they’re visible first.
        unexplored1!.setVisible(true);
        unexplored2!.setVisible(true);
        unexplored3!.setVisible(true);
        unexplored4!.setVisible(true);
        unexplored5!.setVisible(true);

        const foreground  = map.createLayer("Foreground", tileset, 0, 0);
        const collision   = map.createLayer("Player Collision", tileset, 0, 0);
        collision!.setVisible(false);
        collision!.setCollisionByExclusion([-1]);

        // ----- PLAYER -----
        this.player = this.physics.add.sprite(200, 200, "player", 0);

        this.player.setDepth(10);

        const body = this.player.body as Phaser.Physics.Arcade.Body;
        const hitWidth = 8;   
        const hitHeight = 15;  

        body.setSize(hitWidth, hitHeight);
        this.player.setScale(2.0)
        
        const offsetX = (this.player.width - hitWidth) / 2;

        const offsetY = 34; 

        body.setOffset(offsetX, offsetY);


        // Simple camera follow
        this.cameras.main.startFollow(this.player);

        // PHYSICS COLLISION
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
