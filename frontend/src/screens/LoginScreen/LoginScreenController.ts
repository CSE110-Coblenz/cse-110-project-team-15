import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { LoginScreenView } from "./LoginScreenView.ts";
import { api } from "../../api.ts";

/**
 * LoginScreenController - Handles login interactions
 */
export class LoginScreenController extends ScreenController {
    private view: LoginScreenView;
    private screenSwitcher: ScreenSwitcher;

    constructor(screenSwitcher: ScreenSwitcher) {
        super(); // Call ScreenController constructor
        this.screenSwitcher = screenSwitcher;
        
        // Initialize the view with callbacks for login, guest, and register
        this.view = new LoginScreenView(
            (username: string, password: string) => this.handleLogin(username, password),
            () => this.handleGuest(),
            (username: string, password: string) => this.handleRegister(username, password)
        );
    }

    /**
     * Handles user registration
     */
    private async handleRegister(user: string, pass: string): Promise<void> {
        try {
            const res = await api.register(user, pass);
            if (res.ok) {
                this.view.showMessage("Registration successful! Please log in.");
            } else {
                this.view.showMessage(res.message || "Registration failed");
            }
        } catch (e) {
            this.view.showMessage("Network error during registration");
        }
    }

    /**
     * Handles user login, authenticating with backend
     */
    private async handleLogin(user: string, pass: string): Promise<void> {
        try {
            const res = await api.login(user, pass);
            if (res.ok) {
                // Proceed to menu on success
                this.screenSwitcher.switchToScreen({ type: "menu" });
            } else {
                // Show error on view
                this.view.showMessage(res.message || "Login failed");
            }
        } catch (e) {
            this.view.showMessage("Network error during login");
        }
    }

    /**
     * Handles guest login (no backend session)
     */
    private handleGuest(): void {
        // Play as guest: no backend session. Warn user saves will not persist.
        this.view.showMessage("Playing as guest — progress will not be saved to your account.");
        // A short delay then switch to menu
        setTimeout(() => this.screenSwitcher.switchToScreen({ type: "menu" }), 3000);
    }

    /**
     * Get the Login view for UI rendering
     */
    getView(): LoginScreenView {
        return this.view;
    }
}
