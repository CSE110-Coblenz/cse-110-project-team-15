import Konva from "konva";
import type { View } from "../../types.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";

/**
 * LoginScreenView - renders a simple login form overlayed on the canvas
 */
export class LoginScreenView implements View {
    private group: Konva.Group;
    private containerEl: HTMLElement | null = null;
    private overlayEl: HTMLDivElement | null = null;

    constructor(onLogin: (user: string, pass: string) => void, onGuest: () => void) {
        this.group = new Konva.Group({ visible: true });

        // Background (image or solid)
        const bg = new Konva.Rect({
            x: 0,
            y: 0,
            width: STAGE_WIDTH,
            height: STAGE_HEIGHT,
            fill: "#fffbea",
        });
        this.group.add(bg);

        const title = new Konva.Text({
            x: STAGE_WIDTH / 2,
            y: 80,
            text: "Welcome to Manner's Murder",
            fontSize: 40,
            fontFamily: "serif",
            fill: "darkred",
            align: "center",
        });
        title.offsetX(title.width() / 2);
        this.group.add(title);

        // Create HTML overlay form
        this.createHtmlForm(onLogin, onGuest);
    }

    // Create an HTML form overlay for login
    private createHtmlForm(onLogin: (u: string, p: string) => void, onGuest: () => void) {
        const container = document.getElementById("container");
        if (!container) return;

        // Ensure the Konva container can position children
        container.style.position = container.style.position || "relative";

        const overlay = document.createElement("div");
        overlay.style.position = "absolute";
        overlay.style.left = "0";
        overlay.style.top = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.display = "flex";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.pointerEvents = "auto";
        overlay.style.zIndex = "100";

        // The card itself
        const card = document.createElement("div");
        card.style.width = "420px";
        card.style.padding = "24px";
        card.style.borderRadius = "16px";
        card.style.background = "rgba(255, 255, 255, 0.85)";
        card.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.3)";
        card.style.border = "2px solid maroon";
        card.style.fontFamily = "serif";

        const heading = document.createElement("h2");
        heading.textContent = "Log in or Play as Guest";
        heading.style.marginBottom = "12px";
        heading.style.color = "darkred";
        heading.style.textAlign = "center";
        heading.style.fontFamily = "serif";
        card.appendChild(heading);

        const msg = document.createElement("div");
        msg.style.color = "darkred";
        msg.style.minHeight = "20px";
        msg.style.marginBottom = "8px";
        msg.style.fontFamily = "serif";
        card.appendChild(msg);

        // Inputs styled like parchment UI
        const userInput = document.createElement("input");
        userInput.placeholder = "Username";
        userInput.style.width = "100%";
        userInput.style.marginBottom = "8px";
        userInput.style.padding = "10px";
        userInput.style.border = "2px solid maroon";
        userInput.style.borderRadius = "8px";
        userInput.style.fontFamily = "serif";
        card.appendChild(userInput);

        const passInput = document.createElement("input");
        passInput.placeholder = "Password";
        passInput.type = "password";
        passInput.style.width = "100%";
        passInput.style.marginBottom = "12px";
        passInput.style.padding = "10px";
        passInput.style.border = "2px solid maroon";
        passInput.style.borderRadius = "8px";
        passInput.style.fontFamily = "serif";
        card.appendChild(passInput);

        // Buttons row
        const btnRow = document.createElement("div");
        btnRow.style.display = "flex";
        btnRow.style.gap = "8px";

        const loginBtn = document.createElement("button");
        loginBtn.textContent = "Log in";
        loginBtn.style.flex = "1";
        this.styleButton(loginBtn);
        loginBtn.onclick = () => {
            msg.textContent = "";
            onLogin(userInput.value, passInput.value);
        };

        const guestBtn = document.createElement("button");
        guestBtn.textContent = "Play as Guest";
        guestBtn.style.flex = "1";
        this.styleButton(guestBtn);
        guestBtn.onclick = () => onGuest();

        btnRow.appendChild(loginBtn);
        btnRow.appendChild(guestBtn);
        card.appendChild(btnRow);

        overlay.appendChild(card);
        container.appendChild(overlay);

        this.overlayEl = overlay;
    }

    /** Apply consistent menu-style button theming */
    private styleButton(btn: HTMLButtonElement) {
        btn.style.background = "darkred";
        btn.style.color = "white";
        btn.style.border = "2px solid maroon";
        btn.style.borderRadius = "8px";
        btn.style.padding = "10px";
        btn.style.cursor = "pointer";
        btn.style.fontFamily = "serif";
        btn.style.fontSize = "15px";

        // Hover effect
        btn.onmouseenter = () => (btn.style.background = "maroon");
        btn.onmouseleave = () => (btn.style.background = "darkred");
    }

    /** Show error or info messages inside the card */
    showMessage(text: string) {
        if (!this.overlayEl) return;
        const msg = this.overlayEl.querySelector("div");
        if (msg) msg.textContent = text;
    }

    show(): void {
        this.group.visible(true);
        this.group.getLayer()?.draw();
        if (this.overlayEl) this.overlayEl.style.display = "flex";
    }

    hide(): void {
        this.group.visible(false);
        this.group.getLayer()?.draw();
        if (this.overlayEl) this.overlayEl.style.display = "none";
    }

    getGroup(): Konva.Group {
        return this.group;
    }
}
