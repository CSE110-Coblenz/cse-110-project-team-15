// screens/GameScreen/phaser/HintBlocksManager.ts
import Phaser from "phaser";
import { InteractableBlock } from "./InteractableBlock";
import { NPCDialog } from "./NPCDialog";

export type HintBlockConfig = {
    x: number;
    y: number;
    text: string;
};

export class HintBlocksManager {
    private scene: Phaser.Scene;
    private dialog: NPCDialog;
    private blocks: { block: InteractableBlock; saved: boolean }[] = [];

    // 🔹 NEW: which block’s dialog is currently open (if any)
    private activeIndex: number | null = null;

    constructor(scene: Phaser.Scene, dialog: NPCDialog, configs: HintBlockConfig[]) {
        this.scene = scene;
        this.dialog = dialog;

        configs.forEach((cfg, index) => {
            this.blocks.push({
                block: new InteractableBlock(
                    scene,
                    cfg.x,
                    cfg.y,
                    () => this.handleInteract(index, cfg.text),
                    "Press E to read"
                ),
                saved: false,
            });
        });
    }

    private handleInteract(index: number, hintText: string) {
        const entry = this.blocks[index];

        if (!this.dialog.isVisible()) {
            this.dialog.setText(hintText);
            this.dialog.show();

            // mark which block opened the dialog
            this.activeIndex = index;

            // store hint in notebook only once per block
            if (!entry.saved) {
                this.scene.game.events.emit("hint-found", hintText);
                entry.saved = true;
            }
        } else {
            // pressing E again closes it
            this.dialog.hide();
            this.activeIndex = null;
        }
    }

    update(
        player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
        keyE: Phaser.Input.Keyboard.Key
    ) {
        const px = player.x;
        const py = player.y;

        this.blocks.forEach((entry, index) => {
            // normal prompt + interaction handling
            entry.block.update(player, keyE);

            // 🔹 if this block's hint is open, auto-close when far away
            if (this.activeIndex === index && this.dialog.isVisible()) {
                const pos = entry.block.getPosition();
                const dist = Phaser.Math.Distance.Between(px, py, pos.x, pos.y);

                // tweak this threshold if you want (currently 10 pixels)
                if (dist > 25) {
                    this.dialog.hide();
                    this.activeIndex = null;
                }
            }
        });
    }
}
