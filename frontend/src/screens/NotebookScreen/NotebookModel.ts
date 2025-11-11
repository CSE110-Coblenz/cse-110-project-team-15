export class NotebookModel {
    private clues: string[] = [];
    private hints: string[] = [];
    private equations: string[] = [];
    private activeTab: string = "Clues";

    /*
     * Updates which tab is currently active
     */
    setActiveTab(tab: string): void {
        this.activeTab = tab;
    }

    /*
     * Gets the current active tab name
     */
    getActiveTab(): string {
        return this.activeTab;
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
        
        if (this.activeTab == "Lessons Learned") {
            if (this.equations.length > 0) {
                return this.equations.join("\n");
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
        this.equations.push(lessonLearned);
    }

} 