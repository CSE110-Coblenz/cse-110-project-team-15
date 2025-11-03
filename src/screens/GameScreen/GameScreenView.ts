import Konva from "konva";
import type { View } from "../../types.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";

/**
 * GameScreenView - Renders the game UI using Konva
 */
export class GameScreenView implements View {
	private group: Konva.Group;
	private detectiveImage: Konva.Image | null = null;

	// Notebook elements
    private notebookIcon: Konva.Image | null = null;
    private notebookGroup: Konva.Group;
    private pageText: Konva.Text;
    private activeTab = "Clues";

	constructor() {
		this.group = new Konva.Group({ visible: false });

		// Background
		const bg = new Konva.Rect({
			x: 0,
			y: 0,
			width: STAGE_WIDTH,
			height: STAGE_HEIGHT,
			fill: "white", // Parchment color
		});
		this.group.add(bg);

		// Room Label
		const titleText = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: 30,
			text: "Chapter 1: Enter the Mansion",
			fontSize: 28,
			fontFamily: "serif",
			fill: "darkRed",
			align: "center",
		});
		titleText.offsetX(titleText.width() / 2);
		this.group.add(titleText);

		// Load and display the detective image using Konva.Image.fromURL()
		Konva.Image.fromURL("/detective.png", (image) => {
			image.width(100);
			image.height(120);
			image.x(STAGE_WIDTH / 2 - 50);
			image.y(STAGE_HEIGHT / 2 - 60);
			image.draggable(true);

			image.on("dragmove", () => this.keepInBounds(image));

			this.detectiveImage = image;
			this.group.add(image);
			this.group.getLayer()?.draw();
		});

		// Load and display the notebook image using Konva.Image.fromURL()
        Konva.Image.fromURL("/notebook_icon.png", (image) => {
                image.width(60);
                image.height(60);
                image.x(STAGE_WIDTH - 80);
                image.y(STAGE_HEIGHT - 80);
                image.on("click", () => this.toggleNotebook());
                this.notebookIcon = image;
                this.group.add(image);
                this.group.getLayer()?.draw();
        });
        this.notebookGroup = new Konva.Group({ visible: false });
        this.group.add(this.notebookGroup);
    
        // Notebook background (double page)
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
        this.notebookGroup.add(notebookBg);
    
        // --- TABS ---
        const tabs = ["Clues", "Hints", "Equations"];
        tabs.forEach((tab, i) => {
        	const tabRect = new Konva.Rect({
        		x: 130 + i * 120,
        		y: 60,
    			width: 100,
        		height: 40,
        		fill: i === 0 ? "#deb887" : "#f5deb3",
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
    
        	tabRect.on("click", () => this.switchTab(tab));
        	tabText.on("click", () => this.switchTab(tab));
        	this.notebookGroup.add(tabRect);
        	this.notebookGroup.add(tabText);
    	});
    
        // --- PAGE CONTENT AREA ---
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
        this.notebookGroup.add(this.pageText);
    
        // --- CLOSE BUTTON ---
        const closeButton = new Konva.Text({
            x: STAGE_WIDTH - 180,
            y: 60,
            text: "X",
            fontSize: 28,
            fill: "darkred",
            fontFamily: "serif",
        });
		closeButton.on("click", () => this.toggleNotebook());
		this.notebookGroup.add(closeButton);
	}

	/**
     * Toggle notebook visibility
     */
    private toggleNotebook(): void {
        const isVisible = this.notebookGroup.visible();
        this.notebookGroup.visible(!isVisible);
        this.group.getLayer()?.draw();
    }
    
    /**
     * Switch notebook tabs
     */
    private switchTab(tab: string): void {
        this.activeTab = tab;
    
        let content = "";
        switch (tab) {
            case "Clues":
                content = "🕵️‍♂️ Clues\n\n- No clues yet.";
                break;
            case "Hints":
                content = "💡 Hints\n\n- Try exploring the mansion.";
                break;
            case "Equations":
                content = "📘 Equations\n\n- y = mx + b\n- ax² + bx + c = 0";
                break;
        }
    
        this.pageText.text(content);
        this.group.getLayer()?.draw();
    }

	private keepInBounds(image: Konva.Image): void {
		const x = Math.max(0, Math.min(STAGE_WIDTH - image.width(), image.x()));
		const y = Math.max(0, Math.min(STAGE_HEIGHT - image.height(), image.y()));
		image.position({ x, y });
		this.group.getLayer()?.draw();
	}

	/**
	 * Show the screen
	 */
	show(): void {
		this.group.visible(true);
		this.group.getLayer()?.draw();
	}

	/**
	 * Hide the screen
	 */
	hide(): void {
		this.group.visible(false);
		this.group.getLayer()?.draw();
	}

	getGroup(): Konva.Group {
		return this.group;
	}
}
