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
            fill: "#f2f2f2",
        });
        this.group.add(bg);

        const title = new Konva.Text({
            x: STAGE_WIDTH / 2,
            y: 80,
            text: "Welcome to Manner's Murder",
            fontSize: 36,
            fontFamily: "serif",
            fill: "darkred",
            align: "center",
        });
        title.offsetX(title.width() / 2);
        this.group.add(title);

        // create HTML overlay form
        this.createHtmlForm(onLogin, onGuest);
    }

    private createHtmlForm(onLogin: (u: string, p: string) => void, onGuest: () => void) {
        const container = document.getElementById("container");
        if (!container) return;
        this.containerEl = container;

        const overlay = document.createElement("div");
        overlay.style.position = "absolute";
        overlay.style.left = container.getBoundingClientRect().left + "px";
        overlay.style.top = container.getBoundingClientRect().top + "px";
        overlay.style.width = STAGE_WIDTH + "px";
        overlay.style.height = STAGE_HEIGHT + "px";
        overlay.style.display = "flex";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.pointerEvents = "auto";

        const card = document.createElement("div");
        card.style.width = "420px";
        card.style.padding = "20px";
        card.style.borderRadius = "10px";
        card.style.background = "rgba(255,255,255,0.95)";
        card.style.boxShadow = "0 6px 18px rgba(0,0,0,0.2)";

        const heading = document.createElement("h2");
        heading.textContent = "Log in or Play as Guest";
        heading.style.marginBottom = "12px";
        card.appendChild(heading);

        const msg = document.createElement("div");
        msg.style.color = "#b22222";
        msg.style.minHeight = "20px";
        msg.style.marginBottom = "8px";
        card.appendChild(msg);

        const userInput = document.createElement("input");
        userInput.placeholder = "Username";
        userInput.style.width = "100%";
        userInput.style.marginBottom = "8px";
        userInput.style.padding = "8px";
        card.appendChild(userInput);

        const passInput = document.createElement("input");
        passInput.placeholder = "Password";
        passInput.type = "password";
        passInput.style.width = "100%";
        passInput.style.marginBottom = "12px";
        passInput.style.padding = "8px";
        card.appendChild(passInput);

        const btnRow = document.createElement("div");
        btnRow.style.display = "flex";
        btnRow.style.gap = "8px";

        const loginBtn = document.createElement("button");
        loginBtn.textContent = "Log in";
        loginBtn.style.flex = "1";
        loginBtn.onclick = () => {
            msg.textContent = "";
            onLogin(userInput.value, passInput.value);
        };

        const guestBtn = document.createElement("button");
        guestBtn.textContent = "Play as Guest";
        guestBtn.style.flex = "1";
        guestBtn.onclick = () => {
            onGuest();
        };

        btnRow.appendChild(loginBtn);
        btnRow.appendChild(guestBtn);
        card.appendChild(btnRow);

        overlay.appendChild(card);
        overlay.style.zIndex = "100";

        // make overlay initially visible
        container.style.position = container.style.position || "relative";
        container.appendChild(overlay);

        this.overlayEl = overlay;
    }

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
