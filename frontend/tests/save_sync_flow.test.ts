import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GameScreenController } from "../src/screens/GameScreen/GameScreenController";
import { api } from "../src/api";

// Mock dependencies
vi.mock("../src/api");
vi.mock("../src/screens/GameScreen/GameScreenView", () => {
    return {
        GameScreenView: class {
            constructor() { }
            show = vi.fn();
            hide = vi.fn();
            getMainScene = vi.fn().mockReturnValue({
                getPlayerState: vi.fn().mockReturnValue({ x: 100, y: 200 }),
            });
            getNotebookController = vi.fn().mockReturnValue({
                getNotebookState: vi.fn().mockReturnValue({ clues: [], hints: [], lessons: [] }),
            });
            getGroup = vi.fn().mockReturnValue({});
        },
    };
});

describe("Save and Sync Flow", () => {
    let controller: GameScreenController;
    let screenSwitcherMock: any;

    beforeEach(() => {
        vi.useFakeTimers();
        // Mock window.alert
        globalThis.alert = vi.fn();
        screenSwitcherMock = { switchToScreen: vi.fn() };
        controller = new GameScreenController(screenSwitcherMock);
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    it("should start auto-save when game starts", () => {
        controller.startGame();

        // Fast-forward time
        vi.advanceTimersByTime(60000);

        expect(api.saveGame).toHaveBeenCalled();
    });

    it("should stop auto-save when hidden", () => {
        controller.startGame();
        controller.hide();

        vi.advanceTimersByTime(60000);

        // Should not be called after hide
        // Note: The first interval might have been scheduled but cleared.
        // We need to ensure no calls happen AFTER hide.
        // Since we mock api.saveGame, we can check call count.
        expect(api.saveGame).not.toHaveBeenCalled();
    });

    it("should save game silently", async () => {
        await controller.saveGame(true);

        expect(api.saveGame).toHaveBeenCalled();
        expect(globalThis.alert).not.toHaveBeenCalled();
    });

    it("should save game with alert", async () => {
        await controller.saveGame(false);

        expect(api.saveGame).toHaveBeenCalled();
        expect(globalThis.alert).toHaveBeenCalledWith("Game Saved!");
    });
});
