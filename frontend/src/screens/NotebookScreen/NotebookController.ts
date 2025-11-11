import Konva from "konva";
import { NotebookModel } from "./NotebookModel.ts";
import { NotebookView } from "./NotebookView.ts";

export class NotebookController {
    private model: NotebookModel;
    private view: NotebookView;

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
        this.view.setVisible(!isVisible);
    }

    /*
     * Updates the notebook display the show the correct text for the tab
     */
    private updateView(): void {
        this.view.updatePage(this.model.getContent());
    }
}