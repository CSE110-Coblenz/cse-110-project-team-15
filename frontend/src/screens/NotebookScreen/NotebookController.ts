import Konva from "konva";
import { NotebookModel } from "./NotebookModel.ts";
import { NotebookView } from "./NotebookView.ts";

/**
 * NotebookController - Handles notebook interactions
 */
export class NotebookController {
    private model: NotebookModel;
    private view: NotebookView;

    // Adding a listener system to notify when notebook is opened/closed
    private visibilityListeners: ((visible: boolean) => void)[] = [];

    constructor(parentGroup: Konva.Group) {
        this.model = new NotebookModel();
        this.view = new NotebookView(
            parentGroup,
            (tab) => this.handleTabClick(tab),
            () => this.toggleNotebook()
        );
        this.updateView(); // Initialize view with current model content
    }
    
    /**
     * Add a hint to the notebook
     */
    public addHint(hint: string): void {
        this.model.addHint(hint);
        this.updateView();
    }

    /**
     * Allow other code (GameScreenView) to react when the notebook is opened/closed
     */
    public onVisibilityChange(listener: (visible: boolean) => void): void {
        this.visibilityListeners.push(listener);
    }

    /**
     * Handles when a tab is clicked and updates the new view
     */
    private handleTabClick(tab: string): void {
        this.model.setActiveTab(tab);
        this.updateView();
    }

    /**
     * Toggles the notebook visibility
     */
    private toggleNotebook(): void {
        const isVisible = this.view.isVisible(); // Get current visibility
        const newVisible = !isVisible; // Determine new visibility state
        this.view.setVisible(!isVisible); // Toggle visibility in the view

        // Notify all listeners about the visibility change
        for (const listener of this.visibilityListeners) {
            listener(newVisible);
        }
    }

    /**
     * Updates the notebook display the show the correct text for the tab
     */
    private updateView(): void {
        this.view.updatePage(this.model.getContent());
    }

    /* 
     * Get the current notebook state for saving
     */
    getNotebookState(): { clues: string[]; hints: string[]; lessons: string[] } {
        return this.model.getState();
    }

    /**
     * Set the notebook state from a saved state
     */
    setNotebookState(state: { clues: string[]; hints: string[]; lessons: string[] }): void {
        this.model.setState(state);
        this.updateView();
    }
}