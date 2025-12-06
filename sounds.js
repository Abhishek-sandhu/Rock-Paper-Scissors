// Sounds module
const Sounds = {
    audioContext: null,
    soundEnabled: true,

    init: function() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.soundEnabled = Storage.getSettings().soundEnabled;
    },

    // Play sound with frequency, duration, type
    playSound: function(frequency, duration, type = 'sine') {
        if (!this.soundEnabled || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    },

    // Sound effects
    click: function() {
        this.playSound(800, 0.1, 'square');
    },

    countdown: function() {
        this.playSound(600, 0.2);
    },

    win: function() {
        this.playSound(800, 0.3);
        setTimeout(() => this.playSound(1000, 0.3), 150);
    },

    lose: function() {
        this.playSound(400, 0.3);
        setTimeout(() => this.playSound(300, 0.3), 150);
    },

    draw: function() {
        this.playSound(500, 0.3);
    },

    // Toggle sound
    toggle: function() {
        this.soundEnabled = !this.soundEnabled;
        const settings = Storage.getSettings();
        settings.soundEnabled = this.soundEnabled;
        Storage.saveSettings(settings);
    }
};