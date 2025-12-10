import type { Group } from "konva/lib/Group";

/**
 * Type definitions for the Application
 * 
 * Defines the core interfaces and abstract classes for screen management.
 * Includes Screen, View, ScreenController, and ScreenSwitcher.
 * Key concept: These types lead the MVC architecture of the application.
 */

/**
 * View interface
 * 
 * Represents a screen's visual component 
 */
export interface View {
	 // Returns the Konva Group representing this view
	getGroup(): Group;
	
	// Makes the view visible
	show(): void; 
	
	// Hides the view
	hide(): void; 
}

/**
 * Screen types: Defines the different screens available in the application.
 */
export type Screen =
	| { type: "menu" } // Main menu screen
	| { type: "game" } // Gameplay screen
	| { type: "pause"} // Pause screen
	| { type: "login" }; // Login screen

/**
 * ScreenController abstract class
 * 
 * Base class for all screen controllers, providing common functionality.
 * Each specific screen controller extends this class.
 * Key concept: Enforces encapsulation of screen logic.
 */
export abstract class ScreenController {
	// Returns the View associated with this controller
	abstract getView(): View;

	// Shows the view
	show(): void {
		this.getView().show();
	}

	// Hides the view
	hide(): void {
		this.getView().hide();
	}
}

/**
 * ScreenSwitcher interface
 * 
 * Defines the method to switch between different screens.
 * Key concept: Centralized screen management.
 */
export interface ScreenSwitcher {
	// Switches to the specified screen
	switchToScreen(screen: Screen): void;
}
