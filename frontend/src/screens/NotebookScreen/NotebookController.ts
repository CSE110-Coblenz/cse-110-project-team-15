import Konva from "konva";
import { NotebookModel } from "./NotebookModel.ts";
import { NotebookView } from "./NotebookView.ts";

export class NotebookController {
    private model: NotebookModel;
    private view: NotebookView;
    
    //adding a listener system
    private visibilityListeners: ((visible:boolean) => void)[] = [];

    constructor(parentGroup: Konva.Group) {
        this.model = new NotebookModel();
        this.view = new NotebookView(
            parentGroup,
            (tab) => this.handleTabClick(tab),
            () => this.toggleNotebook()
        );
        this.updateView();
    }

    /*
     * Allow other code(GameScreenView) to react when the notebook is opened/closed
     */
    public onVisibilityChange(listener: (visible: boolean) => void): void {
        this.visibilityListeners.push(listener);
    }

    /*
     * Handles when a tab is clicked and updates the new view
     */
    private handleTabClick(tab: string): void {
        this.model.setActiveTab(tab);
        this.updateView();
    }

    /*
     * Toggles the notebook visibility
     */
    private toggleNotebook(): void {
        const isVisible = this.view.isVisible();
        const newVisible = !isVisible;
        this.view.setVisible(!isVisible);
        
        for (const listener of this.visibilityListeners) {
            listener(newVisible);
        }
    }

    /*
     * Updates the notebook display the show the correct text for the tab
     */
    private updateView(): void {
        this.view.updatePage(this.model.getContent());
    }
}