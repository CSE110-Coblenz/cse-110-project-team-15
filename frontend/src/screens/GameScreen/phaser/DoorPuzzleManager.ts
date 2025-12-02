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

    private handleDoorAttempt(doorId: number) {
        const puzzle = this.puzzles[doorId];
        if (!puzzle) {
            console.warn("No puzzle configured for door:", doorId);
            return;
        }

        // Quick testing UI (simple JS prompt)
        const raw = window.prompt(puzzle.question);
        if (raw === null) return; // user canceled

        const answer = raw.trim();

        if (puzzle.correctAnswers.includes(answer)) {
            // Correct → unlock the door
            this.doorCollisionManager.unlockDoor(doorId);

            this.dialog.setText(
                `You solved the problem!\nDoor ${doorId} is now unlocked.`
            );
            this.dialog.show();
        } else {
            // Incorrect
            this.dialog.setText(
                "That answer isn't quite right.\nCheck your hints and try again."
            );
            this.dialog.show();
        }
    }
}
