import Konva from "konva";
import type { View } from "../../types.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";

/**
 * LoginScreenView - renders a simple login form overlayed on the canvas
 */
export class LoginScreenView implements View {
    private group: Konva.Group; // Konva container for elements
    private overlayEl: HTMLDivElement | null = null; // HTML overlay for login

    constructor(
        // Callbacks for login, guest, and register actions
        onLogin: (user: string, pass: string) => void,
        onGuest: () => void,
        onRegister: (user: string, pass: string) => void
    ) {
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

        // Title text
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
        this.createHtmlForm(onLogin, onGuest, onRegister);
    }

    // Create an HTML form overlay for login
    private createHtmlForm(
        onLogin: (u: string, p: string) => void,
        onGuest: () => void,
        onRegister: (u: string, p: string) => void
    ) {
        const container = document.getElementById("container");
        if (!container) return;

        // Ensure the Konva container can position children
        container.style.position = container.style.position || "relative";

        // The overlay that covers the entire canvas (transparent overlay)
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

        // The login card (centered box)
        const card = document.createElement("div");
        card.style.width = "420px";
        card.style.padding = "24px";
        card.style.borderRadius = "16px";
        card.style.background = "rgba(255, 255, 255, 0.85)";
        card.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.3)";
        card.style.border = "2px solid maroon";
        card.style.fontFamily = "serif";

        // Heading for the login card (displayed at the top)
        const heading = document.createElement("h2");
        heading.textContent = "Log in or Play as Guest";
        heading.style.marginBottom = "12px";
        heading.style.color = "darkred";
        heading.style.textAlign = "center";
        heading.style.fontFamily = "serif";
        card.appendChild(heading);

        // Message area for errors and info (displays feedback to the user)
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

        // Stop propagation so Phaser doesn't catch WASD keys
        userInput.addEventListener("keydown", (e) => e.stopPropagation());
        card.appendChild(userInput);

        // Password input styled like parchment UI
        const passInput = document.createElement("input");
        passInput.placeholder = "Password";
        passInput.type = "password"; // Hides password
        passInput.style.width = "100%";
        passInput.style.marginBottom = "12px";
        passInput.style.padding = "10px";
        passInput.style.border = "2px solid maroon";
        passInput.style.borderRadius = "8px";
        passInput.style.fontFamily = "serif";

        // Stop propagation so Phaser doesn't catch WASD keys
        passInput.addEventListener("keydown", (e) => e.stopPropagation());
        card.appendChild(passInput);

        // Buttons row
        const btnRow = document.createElement("div");
        btnRow.style.display = "flex";
        btnRow.style.gap = "8px";

        // Login button
        const loginBtn = document.createElement("button");
        loginBtn.textContent = "Log in";
        loginBtn.style.flex = "1";
        this.styleButton(loginBtn);
        loginBtn.onclick = () => {
            msg.textContent = "";
            onLogin(userInput.value, passInput.value); // Call login handler
        };
         btnRow.appendChild(loginBtn);

        // Guest button
        const guestBtn = document.createElement("button");
        guestBtn.textContent = "Play as Guest";
        guestBtn.style.flex = "1";
        this.styleButton(guestBtn);
        guestBtn.onclick = () => onGuest(); // Call guest handler
        btnRow.appendChild(guestBtn);

        // Register button
        const registerBtn = document.createElement("button");
        registerBtn.textContent = "Register";
        registerBtn.style.flex = "1";
        this.styleButton(registerBtn);
        registerBtn.onclick = () => {
            msg.textContent = "";
            onRegister(userInput.value, passInput.value); // Call register handler
        };
        btnRow.appendChild(registerBtn);

        card.appendChild(btnRow); // Append buttons row to card
        overlay.appendChild(card); // Append card to overlay
        container.appendChild(overlay); // Append overlay to container

        this.overlayEl = overlay;
    }

    /** 
     * Apply consistent menu-style button theming 
     */
    private styleButton(btn: HTMLButtonElement) {
        btn.style.background = "darkred";
        btn.style.color = "white";
        btn.style.border = "2px solid maroon";
        btn.style.borderRadius = "8px";
        btn.style.padding = "10px";
        btn.style.cursor = "pointer";
        btn.style.fontFamily = "serif";
        btn.style.fontSize = "15px";

        // Button hover effect
        btn.onmouseenter = () => (btn.style.background = "maroon");
        btn.onmouseleave = () => (btn.style.background = "darkred");
    }

    /** 
     * Show error or info messages inside the account login card 
     */
    showMessage(text: string) {
        if (!this.overlayEl) return;
        const msg = this.overlayEl.querySelector("div");
        if (msg) msg.textContent = text;
    }

    /** 
     * Show the login screen
     */
    show(): void {
        this.group.visible(true);
        this.group.getLayer()?.draw();
        if (this.overlayEl) this.overlayEl.style.display = "flex";
    }

    /** 
     * Hide the login screen
     */
    hide(): void {
        this.group.visible(false);
        this.group.getLayer()?.draw();
        if (this.overlayEl) this.overlayEl.style.display = "none";
    }

    /** 
     * Get the Konva group for rendering
     */
    getGroup(): Konva.Group {
        return this.group;
    }
}
