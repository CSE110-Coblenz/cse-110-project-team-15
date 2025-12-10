/**
 * GameScreenModel - Manages game state
 */
export class GameScreenModel {
	private score = 0;

	/**
	 * Reset game state for a new game
	 */
	reset(): void {
		this.score = 0;
	}

	/**
	 * Increment score
	 */
	incrementScore(): void {
		this.score++;
	}

	/**
	 * Get current score
	 */
	getScore(): number {
		return this.score;
	}
}
