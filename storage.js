// Storage module for localStorage
const Storage = {
    // Load data from localStorage
    load: function(key, defaultValue = {}) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error('Error loading from localStorage:', e);
            return defaultValue;
        }
    },

    // Save data to localStorage
    save: function(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error('Error saving to localStorage:', e);
        }
    },

    // Get player stats
    getStats: function() {
        return this.load('rps-stats', {
            wins: 0,
            losses: 0,
            ties: 0,
            winStreak: 0,
            highestStreak: 0,
            gamesPlayed: 0
        });
    },

    // Save player stats
    saveStats: function(stats) {
        this.save('rps-stats', stats);
    },

    // Get settings
    getSettings: function() {
        return this.load('rps-settings', {
            playerName: 'Player',
            theme: 'dark',
            soundEnabled: true
        });
    },

    // Save settings
    saveSettings: function(settings) {
        this.save('rps-settings', settings);
    },

    // Get game history
    getHistory: function() {
        return this.load('rps-history', []);
    },

    // Save game history
    saveHistory: function(history) {
        // Keep only last 10 rounds
        const recentHistory = history.slice(-10);
        this.save('rps-history', recentHistory);
    },

    // Clear history
    clearHistory: function() {
        this.save('rps-history', []);
    }
};