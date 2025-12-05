// screens/GameScreen/phaser/DoorPuzzleManager.ts
import Phaser from "phaser";
import { DoorCollisionManager } from "./DoorCollisionManager";
import { NPCDialog } from "./NPCDialog";

export type DoorPuzzle = {
    question: string;
    correctAnswers: string[];
};

export class DoorPuzzleManager {
    private scene: Phaser.Scene;
    private dialog: NPCDialog;
    private doorCollisionManager: DoorCollisionManager;

    // All puzzles keyed by doorId
    private puzzles: Record<number, DoorPuzzle> = {};

    // Track which doors have already been solved
    private solvedDoors = new Set<number>();

    constructor(
        scene: Phaser.Scene,
        dialog: NPCDialog,
        doorCollisionManager: DoorCollisionManager,
        puzzles: Record<number, DoorPuzzle>
    ) {
        this.scene = scene;
        this.dialog = dialog;
        this.doorCollisionManager = doorCollisionManager;
        this.puzzles = puzzles;

        // Listen for door attempts from DoorCollisionManager
        this.scene.game.events.on("door-attempt", (doorId: number) => {
            this.handleDoorAttempt(doorId);
        });
    }
    
    private showTimedDialog(text: string, durationMs: number = 3000) {
        this.dialog.setText(text);
        this.dialog.show();

        this.scene.time.delayedCall(
            durationMs,
            () => {
                if (this.dialog.isVisible()) {
                    this.dialog.hide();
                }
            },
            [],
            this
        );
    }



    private handleDoorAttempt(doorId: number) {
        const puzzle = this.puzzles[doorId];
        if (!puzzle) {
            console.warn("No puzzle configured for door:", doorId);
            return;
        }

        // If this door has already been solved, do nothing.
        if (this.solvedDoors.has(doorId)) {
            return;
        }

        const raw = window.prompt(puzzle.question);
        if (raw === null) return; // user cancelled

        const answer = raw.trim();

        if (puzzle.correctAnswers.includes(answer)) {
            // ✅ Correct: mark solved & unlock
            this.solvedDoors.add(doorId);
            this.doorCollisionManager.unlockDoor(doorId);

            this.showTimedDialog(
                `You solved the problem!\nDoor ${doorId} is now unlocked.`,
                3000
            );
        } else {
            // ❌ Incorrect: show error for 3s, then auto-hide
            this.showTimedDialog(
                "That answer isn't quite right.\nCheck your hints and try again.",
                3000
            );
        }
    }

    

}
