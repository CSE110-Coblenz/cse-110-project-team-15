import Phaser from "phaser";

import { NPC } from "./NPC";
import { NPCDialog } from "./NPCDialog";
import { InteractableBlock } from "./InteractableBlock";
import { HintBlocksManager } from "./HintBlocksManager";
import type { HintBlockConfig } from "./HintBlocksManager";
import { DoorCollisionManager } from "./DoorCollisionManager";
import type { DoorCollisionConfig } from "./DoorCollisionManager";
import { DoorPuzzleManager } from "./DoorPuzzleManager";
import type { DoorPuzzle } from "./DoorPuzzleManager";





/**
 * MainScene
 *
 * This Phaser.Scene is basically "the entire in-game experience":
 * - Loads the Tiled map and tileset
 * - Creates tile layers and sets up collision
 * - Creates the player, configures a small hitbox near the feet
 * - Handles camera follow and movement (WASD + arrows)
 * - Spawns an NPC ("Bruce") and manages talk radius + dialog popup
 * - Handles interaction key E for both NPC and doors
 */
export class MainScene extends Phaser.Scene {
    // Dynamic physics sprite that can move around based on velocity.
    private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

    // Arrow key input (up/down/left/right), created from Phaser's helper.
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;

    // (Old fields; NPC is now wrapped in the NPC class, but we keep these around if needed.)
    private npcSprite!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    private npcPrompt!: Phaser.GameObjects.Text;


    // WASD keys for movement.
    private W!: Phaser.Input.Keyboard.Key;
    private A!: Phaser.Input.Keyboard.Key;
    private S!: Phaser.Input.Keyboard.Key;
    private D!: Phaser.Input.Keyboard.Key;

    // Interaction key for NPC.
    private keyE!: Phaser.Input.Keyboard.Key;

    // NPC wrapper class instance (encapsulates sprite, name tag, and prompt).
    private npc?: NPC;


    private readBlock?: InteractableBlock;

    // Whether player is currently inside interaction radius of the NPC.
    private canTalkToNpc = false;
    

    // UI dialog box anchored to the camera (bottom of screen).
    private npcDialog!: NPCDialog;


    private hasSavedQuadraticHint = false;

    private hintBlocksManager!: HintBlocksManager;

    private footstepSound!: Phaser.Sound.BaseSound;

    private doorCollisionManager!: DoorCollisionManager;

    private doorPuzzleManager!: DoorPuzzleManager;

    private unexploredLayers: Record<number, Phaser.Tilemaps.TilemapLayer | null> = {};




    constructor() {
        // This "MainScene" key lets us reference this scene from the Phaser game config.
        super("MainScene");
    }

    preload(): void {
        this.load.audio("footstep", "/assets/footsteps.mp3");

        // Player walking animation frames.
        // The spritesheet is 80x80 per frame, with 3 rows (right / down / up)..
        this.load.spritesheet("player", "/assets/walk.png", {
            frameWidth: 80,
            frameHeight: 80,
        });

        // Tileset image (used by Tiled map).
        this.load.image("tiles", "/assets/mansion-tileset.png");

        // Tiled map JSON exported from Tiled.
        this.load.tilemapTiledJSON("map", "/assets/map.json");

        

        // NPC spritesheet; smaller 32x32 sprite with its own idle animation.
        this.load.spritesheet("npc", "/assets/character3.png", {
            frameWidth: 32,
            frameHeight: 32,
        });
    }

    create(): void {
        // Create the Tilemap instance from the JSON we loaded in preload().
        const map = this.make.tilemap({ key: "map" });

        // Only useful for debugging; logs all the tile layer names from Tiled.
        console.log("Tile layers:", map.getTileLayerNames());

        // Attach the tileset image to the map.
        // "main" must match the tileset name in Tiled. "tiles" is the key from preload().
        const tileset = map.addTilesetImage("main", "tiles");
        if (!tileset) {
            console.error(
                "Tileset not found. Check the name in Tiled and the key 'tiles' in preload()."
            );
            return;
        }

        // --------- BACKGROUND LAYERS (drawn back-to-front) ---------
        // These layers are purely visual layering; they are not collidable.
        const bgBase    = map.createLayer("Background/Background", tileset, 0, 0);
        const wallOvl   = map.createLayer("Background/Wall Overlay", tileset, 0, 0);
        const floorOvl  = map.createLayer("Background/Floor Overlay", tileset, 0, 0);
        const furnBack  = map.createLayer("Background/Furniture Back", tileset, 0, 0);
        const furnFront = map.createLayer("Background/Furniture Front", tileset, 0, 0);
        const front     = map.createLayer("Background/Front", tileset, 0, 0);

        // --------- UNEXPLORED LAYERS (fog-of-war style) ---------
        // These are currently always visible, but the structure lets us toggle them
        // later when we implement "explored vs unexplored" rooms.
        const unexplored1 = map.createLayer("Unexplored/Unexplored1", tileset, 0, 0);
        const unexplored2 = map.createLayer("Unexplored/Unexplored2", tileset, 0, 0);
        const unexplored3 = map.createLayer("Unexplored/Unexplored3", tileset, 0, 0);
        const unexplored4 = map.createLayer("Unexplored/Unexplored4", tileset, 0, 0);
        const unexplored5 = map.createLayer("Unexplored/Unexplored5", tileset, 0, 0);

        // For now everything is visible. Later we can hide/show based on discovered rooms.
        unexplored1!.setVisible(true);
        unexplored2!.setVisible(true);
        unexplored3!.setVisible(true);
        unexplored4!.setVisible(true);
        unexplored5!.setVisible(true);

        //id - unexplored layer dictionary
        this.unexploredLayers = {
            1: unexplored1,
            2: unexplored2,
            3: unexplored3,
            4: unexplored4,
            5: unexplored5,
        };

        // listen door event，close the cover based on doors id
        this.game.events.on("door-unlocked", (doorId: number) => {
            const layer = this.unexploredLayers[doorId];
            if (layer) {
                layer.setVisible(false);  // The room will be uncovered
            }
        });

        // Foreground art that should draw above the player or certain objects.
        const foreground = map.createLayer("Foreground", tileset, 0, 0);

        // --------- COLLISION LAYER ---------
        // This layer is invisible but used for collision logic.
        const collision  = map.createLayer("Player Collision", tileset, 0, 0);
        collision!.setVisible(false);
        // Mark all tiles except tile index -1 (empty) as collidable....
        collision!.setCollisionByExclusion([-1]);

        // ============================================
        // DOOR COLLISION BLOCKS (5 doors)
        // ============================================

        const doorConfigs: DoorCollisionConfig[] = [
            { id: 1, x: 192, y: 368, roomName: "Room 1: Guest Room"},
            { id: 2, x: 384, y: 368, roomName: "Room 2: Unknown" },
            { id: 3, x: 624, y: 512, roomName: "Room 3: Library" },
            { id: 4, x: 928, y: 448, roomName: "Room 4: Office" },
            { id: 5, x: 864, y: 368, roomName: "Room 5: Master Bedroom" },
        ];

        this.doorCollisionManager = new DoorCollisionManager(this, doorConfigs, 40);
        this.npcDialog = new NPCDialog(this);

        // --------------------------------------------
        //  DOOR PUZZLE MANAGER (separate file now)
        // --------------------------------------------
        const doorPuzzles: Record<number, DoorPuzzle> = {
            1: {
                question:
                    "Room 1 – Solve:\n\nx² - 5x + 6 = 0\n\nEnter the SMALLER root:",
                correctAnswers: ["2"],
            },
            2: {
                question:
                    "Room 2 – Solve:\n\nx² + 4x + 4 = 0\n\nEnter the root:",
                correctAnswers: ["-2"],
            },
            3: {
                question:
                    "Room 3 – Solve:\n\nx² - 1 = 0\n\nEnter either root:",
                correctAnswers: ["1", "-1"],
            },
            4: {
                question:
                    "Room 4 – Solve:\n\nx² - x - 6 = 0\n\nEnter the LARGER root:",
                correctAnswers: ["3"],
            },
            5: {
                question:
                    "Room 5 – Solve:\n\n2x² - 8x = 0\n\nEnter the NON-ZERO root:",
                correctAnswers: ["4"],
            },
        };

        this.doorPuzzleManager = new DoorPuzzleManager(
            this,
            this.npcDialog,
            this.doorCollisionManager,
            doorPuzzles
        );


        //listen for attempts so you can log or open puzzles
        this.game.events.on("door-attempt", (doorId: number) => {
            console.log("Door attempt from MainScene:", doorId);
            //trigger puzzle UI, check hints, etc.
        });



        // ============================================
        //  PLAYER SETUP
        // ============================================
        // Spawn the player as a physics-enabled sprite. The frame index 0 is the idle frame.
        this.player = this.physics.add.sprite(200, 200, "player", 0);
        
        // Set a high depth so the player draws above most background layers.
        this.player.setDepth(10);

        // Configure the player's hitbox to be a small rectangle near the feet
        // instead of the full 80x80 sprite. This makes collision feel more precise.
        const body = this.player.body as Phaser.Physics.Arcade.Body;
        const hitWidth = 8;
        const hitHeight = 15;

        // Set a small collision box, then scale the sprite visually.
        body.setSize(hitWidth, hitHeight);
        this.player.setScale(2.0);

        // Center the hitbox horizontally, and push it downward (towards the feet).
        const offsetX = (this.player.width - hitWidth) / 2;
        const offsetY = 34; // Tweak by hand until it "feels" like it's at the feet.
        body.setOffset(offsetX, offsetY);
        

        // Make the camera continuously follow the player as they move.
        this.cameras.main.startFollow(this.player);
        

        // Enable collision between the player and the hidden collision layer.
        this.physics.add.collider(this.player, collision!);


        // ============================================
        //  PLAYER WALKING ANIMATIONS
        // ============================================
        // The spritesheet is laid out in 3 rows of 8 frames:
        // Row 0: walking right
        // Row 1: walking down
        // Row 2: walking up
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

        

        // ============================================
        //  Footstep sound
        // ============================================


        this.footstepSound = this.sound.add("footstep", {
            loop: true,       // footsteps should loop
            volume: 0.3       // adjust to taste
        });


        // ============================================
        //  NPC SETUP
        // ============================================
        // NPC is wrapped in a separate class so MainScene doesn't need to know
        // all the details of name tags / prompts / animations.
        this.npc = new NPC(this, 400, 260);

        // Player can physically bump into the NPC.
        this.physics.add.collider(this.player, this.npc.getSprite());

        // ============================================
        //  INPUT SETUP
        // ============================================
        // Arrow key controls (up/down/left/right).
        this.cursors = this.input.keyboard!.createCursorKeys();

        // WASD controls for players who prefer that layout.
        this.W = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.A = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.S = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.D = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        // E is the main interaction key (talking to NPC, using doors).
        this.keyE = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);


        // --------------------------------------------
        //  interactive blocks manager
        // --------------------------------------------
        // HINT BLOCK CONFIG LIST
        const hintConfigs: HintBlockConfig[] = [
            {
                x: 160,
                y: 320,
                text:
                    "- A quadratic always hides two answers — the roots.\n" +
                    "Find the two numbers that make it equal zero.",
            },
            {
                x: 390,
                y: 190,
                text:
                    "- To factor ax² + bx + c,\n" +
                    "find two numbers that sum to b and multiply to ac.",
            },
            {
                x: 595,
                y: 85,
                text:
                    "- Every quadratic draws a parabola.\nThe lowest point is called the vertex.",
            },
        ];

        // Create manager
        this.hintBlocksManager = new HintBlocksManager(this, this.npcDialog, hintConfigs);

        this.doorCollisionManager.attachPlayer(this.player);

    }

    update(): void {
        // If for some reason cursors weren't created, bail out.
        if (!this.cursors) return;

        // --------------------------------------------
        // RESET NPC INTERACTION STATE EACH FRAME
        // --------------------------------------------
        // We recompute whether we can talk to the NPC based on distance.
        this.canTalkToNpc = false;
        this.canTalkToNpc = false; // (duplicate reset, but harmless)
        if (this.npc) this.npc.hidePrompt(); // Hide the "Press E" prompt by default.

        // --------------------------------------------
        // NPC INTERACTION DETECTION (distance-based)
        // --------------------------------------------
        if (this.npc) {
            const npcSprite = this.npc.getSprite();

            // Compute straight-line distance between player and NPC.
            const dist = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                npcSprite.x, npcSprite.y
            );

            // When the player is within 30 pixels, we consider them "close enough"
            // to talk and show an interaction prompt under the NPC.
            if (dist < 30) {
                this.canTalkToNpc = true;
                this.npc.showPrompt();
            } else {
                this.canTalkToNpc = false;
                this.npc.hidePrompt();
            }
        }

        // --------------------------------------------
        // NPC DIALOG TOGGLING WITH E
        // --------------------------------------------
        // If we are in talk range and the player just pressed E:
        if (this.canTalkToNpc && Phaser.Input.Keyboard.JustDown(this.keyE)) {
            if (!this.npcDialog.isVisible()) {
                // Open dialog with NPC's line. This can later be driven by script.
                this.npcDialog.setText(
                    "Hello, I'm Bruce.\n" +
                    " I'll be straigt foward, he went to this room that's the clothest to us last night,\n" +
                    " you need to figure out the code to get in, I belive you have to solve the math problem coccrect."
                );
                this.npcDialog.show();
            }
            else if (this.npcDialog.isVisible()) {
                // If dialog is already visible and E is pressed again,
                // we close it. So E acts as both "talk" and "close".
                this.npcDialog.hide();
            }
        }


        // --------------------------------------------
        // PLAYER MOVEMENT + ANIMATIONS
        // --------------------------------------------
        const speed = 150;
        let vx = 0;
        let vy = 0;
        let played = false; // tracks if we played any movement animation this frame

        // LEFT movement (Arrow Left or A key).
        if (this.cursors.left?.isDown || this.A.isDown) {
            vx = -speed;
            this.player.setFlipX(true);              // Flip horizontally to face left.
            this.player.play("walk-right", true);    // Reuse "walk-right" animation, but flipped.
            played = true;
        }
        // RIGHT movement (Arrow Right or D key).
        else if (this.cursors.right?.isDown || this.D.isDown) {
            vx = speed;
            this.player.setFlipX(false);             // Unflip so sprite faces right.
            this.player.play("walk-right", true);
            played = true;
        }

        // UP movement (Arrow Up or W key).
        if (this.cursors.up?.isDown || this.W.isDown) {
            vy = -speed;
            this.player.play("walk-up", true);
            played = true;
        }
        // DOWN movement (Arrow Down or S key).
        else if (this.cursors.down?.isDown || this.S.isDown) {
            vy = speed;
            this.player.play("walk-down", true);
            played = true;
        }

        // Apply the resulting velocity to the player's physics body.
        this.player.setVelocity(vx, vy);
        // If the player is moving

        
        const isMoving = vx !== 0 || vy !== 0;

        if (isMoving) {
            if (!this.footstepSound.isPlaying) {
                this.footstepSound.play();
            }
        } else {
            if (this.footstepSound.isPlaying) {
                this.footstepSound.stop();
            }
        }


        // If we didn't play any movement animation this frame, the player is idle.
        if (!played) {
            this.player.setVelocity(0, 0);
            this.player.anims.stop(); // Freeze on current frame (idle).
        }

        if (this.readBlock) {
            this.readBlock.update(this.player, this.keyE);
        }

        this.hintBlocksManager.update(this.player, this.keyE);

        this.doorCollisionManager.update(this.player, this.keyE);



    }

    /**
     * useDoor
     *
     * This method is called when the player presses E while overlapping
     * a door zone. Right now you can decide what to do based on doorId
     * and doorMetaById (for example, load a puzzle, transition rooms,
     * show "door is locked", etc.)
     */
}
