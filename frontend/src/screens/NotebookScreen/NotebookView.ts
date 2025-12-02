import Konva from "konva";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../../src/constants.ts";

export class NotebookView {
    // Notebook elements
    // Notebook elements
    private group: Konva.Group;
    private parentGroup: Konva.Group;
    private pageText: Konva.Text;
    private currentTab: string = "Clues";
    private onTabClick: (tab: string) => void;
    private onToggle: () => void;

    constructor(
        parentGroup: Konva.Group,
        onTabClick: (tab: string) => void,
        onToggle: () => void
    ) {
        // Notebook overlay group
        this.parentGroup = parentGroup;
        this.onTabClick = onTabClick;
        this.onToggle = onToggle;
        this.group = new Konva.Group({ visible: false });
        this.parentGroup.add(this.group);

        // Load and display the notebook image using Konva.Image.fromURL()
        Konva.Image.fromURL("/notebook_icon.png", (image) => {
            image.width(80);
            image.height(80);
            image.x(STAGE_WIDTH / 2 - 380);
            image.y(STAGE_HEIGHT - 80);
            image.on("click", () => this.onToggle());
            this.parentGroup.add(image);
            this.parentGroup.getLayer()?.draw();
        });

        // Notebook background
        const notebookBg = new Konva.Rect({
            x: 100,
            y: 50,
            width: STAGE_WIDTH - 200,
            height: STAGE_HEIGHT - 100,
            fill: "#fffbea",
            stroke: "#8b5a2b",
            strokeWidth: 4,
            shadowColor: "black",
            shadowBlur: 15,
            shadowOpacity: 0.2,
            cornerRadius: 10,
        });
        this.group.add(notebookBg);

        // Tabs for notebook
        const tabs = ["Clues", "Hints", "Lessons"];
        tabs.forEach((tab, i) => {
            const isDefault = i === 0;
            
            const tabRect = new Konva.Rect({
                x: 130 + i * 120,
                y: 60,
                width: 100,
                height: 40,
                fill: isDefault ? "#c5a16b" : "#e9d3a6",
                stroke: "#8b5a2b",
                strokeWidth: 2,
                cornerRadius: 5,
            });
            const tabText = new Konva.Text({
                x: tabRect.x() + 10,
                y: tabRect.y() + 8,
                text: tab,
                fontSize: 18,
                fontFamily: "serif",
                fill: "black",
            });

            // Hover highlight
            tabRect.on("mouseenter", () => {
                document.body.style.cursor = "pointer";
                tabRect.fill("#d8bb8a");
                this.parentGroup.getLayer()?.draw();
            });

            tabRect.on("mouseleave", () => {
                document.body.style.cursor = "default";
                tabRect.fill(tab === this.currentTab ? "#c5a16b" : "#e9d3a6");
                this.parentGroup.getLayer()?.draw();
            });

            tabRect.on("click", () => {
                this.currentTab = tab;
                this.highlightTab(tab);
                this.onTabClick(tab);
            });

            tabText.on("click", () => {
                this.currentTab = tab;
                this.highlightTab(tab);
                this.onTabClick(tab);
            });

            this.group.add(tabRect);
            this.group.add(tabText);
        });

        // Page text
        this.pageText = new Konva.Text({
            x: 150,
            y: 130,
            width: STAGE_WIDTH - 300,
            text: "Notebook - Clues\n\nNo clues found yet.",
            fontSize: 20,
            fontFamily: "serif",
            fill: "black",
            lineHeight: 1.4,
        });
        this.group.add(this.pageText);

        // Close notebook button
        const closeButton = new Konva.Text({
            x: STAGE_WIDTH - 180,
            y: 60,
            text: "X",
            fontSize: 28,
            fill: "darkred",
            fontFamily: "serif",
        });
        closeButton.on("click", () => this.onToggle());
        this.group.add(closeButton);
    }

    updatePage(content: string): void {
        this.pageText.text(content);
        this.parentGroup.getLayer()?.draw();
    }

    setVisible(visible: boolean): void {
        this.group.visible(visible);
        this.parentGroup.getLayer()?.draw();
    }

    isVisible(): boolean {
        return this.group.visible();
    }

    private highlightTab(selected: string): void {
        const allTabs = this.group.find("Rect");

        allTabs.forEach((shape: Konva.Node) => {
            const rect = shape as Konva.Rect;
            const name = rect.name();
            if (name.startsWith("tab-")) {
                const tabName = name.replace("tab-", "");
                rect.fill(tabName === selected ? "#b9915a" : "#e9d3a6");
            }
        });

        this.parentGroup.getLayer()?.draw();
    }
}