/**
 * NotebookModel - Manages notebook state
 */
export class NotebookModel {
    private clues: string[] = [];
    private hints: string[] = [];
    private lessons: string[] = [];
    private activeTab: string = "Clues";

    /*
     * Updates which tab is currently active
     */
    setActiveTab(tab: string): void {
        this.activeTab = tab;
    }

    /*
     * Gets all text related strings associated with the tab it's in
     */
    getContent(): string {
        if (this.activeTab == "Clues") {
            if (this.clues.length > 0) {
                return this.clues.join("\n");
            }
            else {
                return "No clues yet.";
            }
        }

        if (this.activeTab == "Hints") {
            if (this.hints.length > 0) {
                return this.hints.join("\n");
            }
            else {
                return "No hints yet.";
            }
        }

        if (this.activeTab == "Lessons") {
            if (this.lessons.length > 0) {
                return this.lessons.join("\n");
            }
            else {
                return "No lessons learned yet.";
            }
        }

        return "";
    }

    /* 
     * Add a clue to the notebook
     */
    addClue(clue: string): void {
        this.clues.push(clue);
    }

    /* 
     * Add a hint to the notebook
     */
    addHint(hint: string): void {
        this.hints.push(hint);
    }

    /* 
     * Add a lesson learned to the notebook
     */
    addLessonLearned(lessonLearned: string): void {
        this.lessons.push(lessonLearned);
    }

    /* 
     * Get the current state of the notebook for saving
     */
    getState(): { clues: string[]; hints: string[]; lessons: string[] } {
        return {
            clues: [...this.clues],
            hints: [...this.hints],
            lessons: [...this.lessons],
        };
    }

    /**
     * Set the notebook state from a saved state
     */
    setState(state: { clues: string[]; hints: string[]; lessons: string[] }): void {
        this.clues = state.clues || [];
        this.hints = state.hints || [];
        this.lessons = state.lessons || [];
    }
}