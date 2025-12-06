// Sounds module
const Sounds = {
    audioContext: null,
    soundEnabled: true,
    backgroundMusic: null,
    musicEnabled: true,
    musicVolume: 0.3,
    audioContextStarted: false,

    init: function() {
        // Create AudioContext but don't start it yet
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const settings = Storage.getSettings();
        this.soundEnabled = settings.soundEnabled !== false;
        this.musicEnabled = settings.musicEnabled !== false;
        this.musicVolume = settings.musicVolume || 0.3;

        // Add user gesture listener to start AudioContext
        this.addUserGestureListener();
    },

    addUserGestureListener: function() {
        const startAudioContext = () => {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume().then(() => {
                    this.audioContextStarted = true;
                    console.log('AudioContext started');
                    // Start music if enabled
                    if (this.musicEnabled) {
                        this.createAmbientMusic();
                    }
                });
            }
            // Remove listeners after first gesture
            document.removeEventListener('click', startAudioContext);
            document.removeEventListener('touchstart', startAudioContext);
            document.removeEventListener('keydown', startAudioContext);
        };

        document.addEventListener('click', startAudioContext);
        document.addEventListener('touchstart', startAudioContext);
        document.addEventListener('keydown', startAudioContext);
    },

    initBackgroundMusic: function() {
        // Don't start music automatically - wait for user gesture
        if (this.audioContextStarted && this.musicEnabled && !this.backgroundMusic) {
            this.createAmbientMusic();
        }
    },

    createAmbientMusic: function() {
        if (!this.audioContext || !this.audioContextStarted || !this.musicEnabled || this.backgroundMusic) return;

        // Create sophisticated gaming background music
        const oscillators = [];
        const gains = [];
        const filters = [];

        // Define musical scales and progressions for gaming feel
        const scale = [220, 247, 262, 294, 330, 349, 392, 440]; // A minor scale
        const progression = [0, 3, 4, 3]; // i - III - iv - III progression

        // Create multiple layers for rich sound
        this.createMelodyLayer(oscillators, gains, filters, scale, progression);
        this.createHarmonyLayer(oscillators, gains, filters, scale);
        this.createBassLayer(oscillators, gains, filters, scale);
        this.createAmbientLayer(oscillators, gains, filters);

        // Start all oscillators
        oscillators.forEach(osc => {
            try {
                osc.start();
            } catch (e) {
                console.warn('Failed to start oscillator:', e);
            }
        });

        this.backgroundMusic = { oscillators, gains, filters };
    },

    createMelodyLayer: function(oscillators, gains, filters, scale, progression) {
        // Main melody with arpeggios
        const melodyOsc = this.audioContext.createOscillator();
        const melodyGain = this.audioContext.createGain();
        const melodyFilter = this.audioContext.createBiquadFilter();

        melodyOsc.frequency.value = scale[0];
        melodyOsc.type = 'sawtooth';
        melodyGain.gain.value = this.musicVolume * 0.15;
        melodyFilter.type = 'lowpass';
        melodyFilter.frequency.value = 800;

        melodyOsc.connect(melodyFilter);
        melodyFilter.connect(melodyGain);
        melodyGain.connect(this.audioContext.destination);

        // Create arpeggio pattern
        let noteIndex = 0;
        const arpeggio = [0, 2, 4, 2, 0, 2, 4, 2, 0, 2, 4, 2, 0, 2, 4, 2];
        setInterval(() => {
            if (this.musicEnabled && melodyOsc) {
                const chordRoot = progression[Math.floor(noteIndex / 4) % progression.length];
                const note = arpeggio[noteIndex % arpeggio.length];
                melodyOsc.frequency.setValueAtTime(scale[(chordRoot + note) % scale.length], this.audioContext.currentTime);
                noteIndex++;
            }
        }, 150); // Fast arpeggio

        oscillators.push(melodyOsc);
        gains.push(melodyGain);
        filters.push(melodyFilter);
    },

    createHarmonyLayer: function(oscillators, gains, filters, scale) {
        // Harmony layer with pads
        const harmonyOsc1 = this.audioContext.createOscillator();
        const harmonyOsc2 = this.audioContext.createOscillator();
        const harmonyGain = this.audioContext.createGain();
        const harmonyFilter = this.audioContext.createBiquadFilter();

        harmonyOsc1.frequency.value = scale[0] * 0.5; // Octave lower
        harmonyOsc2.frequency.value = scale[4] * 0.5; // Third
        harmonyOsc1.type = 'triangle';
        harmonyOsc2.type = 'triangle';

        harmonyGain.gain.value = this.musicVolume * 0.1;
        harmonyFilter.type = 'lowpass';
        harmonyFilter.frequency.value = 600;

        harmonyOsc1.connect(harmonyFilter);
        harmonyOsc2.connect(harmonyFilter);
        harmonyFilter.connect(harmonyGain);
        harmonyGain.connect(this.audioContext.destination);

        // Slow chord changes
        let chordIndex = 0;
        const chords = [[0, 4], [3, 7], [4, 1], [3, 7]]; // Chord progressions
        setInterval(() => {
            if (this.musicEnabled) {
                const chord = chords[chordIndex % chords.length];
                harmonyOsc1.frequency.setValueAtTime(scale[chord[0]] * 0.5, this.audioContext.currentTime);
                harmonyOsc2.frequency.setValueAtTime(scale[chord[1]] * 0.5, this.audioContext.currentTime);
                chordIndex++;
            }
        }, 4000); // Change chords every 4 seconds

        oscillators.push(harmonyOsc1, harmonyOsc2);
        gains.push(harmonyGain);
        filters.push(harmonyFilter);
    },

    createBassLayer: function(oscillators, gains, filters, scale) {
        // Bass line
        const bassOsc = this.audioContext.createOscillator();
        const bassGain = this.audioContext.createGain();
        const bassFilter = this.audioContext.createBiquadFilter();

        bassOsc.frequency.value = scale[0] * 0.25; // Two octaves lower
        bassOsc.type = 'square';
        bassGain.gain.value = this.musicVolume * 0.12;
        bassFilter.type = 'lowpass';
        bassFilter.frequency.value = 300;

        bassOsc.connect(bassFilter);
        bassFilter.connect(bassGain);
        bassGain.connect(this.audioContext.destination);

        // Simple bass pattern
        const bassPattern = [0, 0, 0, 0, 3, 3, 3, 3]; // Root and third
        let bassIndex = 0;
        setInterval(() => {
            if (this.musicEnabled) {
                bassOsc.frequency.setValueAtTime(scale[bassPattern[bassIndex % bassPattern.length]] * 0.25, this.audioContext.currentTime);
                bassIndex++;
            }
        }, 500); // Half note rhythm

        oscillators.push(bassOsc);
        gains.push(bassGain);
        filters.push(bassFilter);
    },

    createAmbientLayer: function(oscillators, gains, filters) {
        // Ambient texture with subtle effects
        const ambientOsc = this.audioContext.createOscillator();
        const ambientGain = this.audioContext.createGain();
        const ambientFilter = this.audioContext.createBiquadFilter();

        ambientOsc.frequency.value = 55; // Very low frequency for texture
        ambientOsc.type = 'sine';
        ambientGain.gain.value = this.musicVolume * 0.08;
        ambientFilter.type = 'highpass';
        ambientFilter.frequency.value = 40;

        ambientOsc.connect(ambientFilter);
        ambientFilter.connect(ambientGain);
        ambientGain.connect(this.audioContext.destination);

        // Slow modulation for atmosphere
        const lfo = this.audioContext.createOscillator();
        const lfoGain = this.audioContext.createGain();
        lfo.frequency.value = 0.1; // Very slow modulation
        lfoGain.gain.value = 20; // Modulate filter frequency

        lfo.connect(lfoGain);
        lfoGain.connect(ambientFilter.frequency);
        lfo.start();

        oscillators.push(ambientOsc, lfo);
        gains.push(ambientGain, lfoGain);
        filters.push(ambientFilter);
    },

    stopBackgroundMusic: function() {
        if (this.backgroundMusic) {
            this.backgroundMusic.oscillators.forEach(osc => {
                try {
                    osc.stop();
                } catch (e) {
                    // Oscillator might already be stopped
                }
            });
            this.backgroundMusic = null;
        }
    },

    updateMusicVolume: function(volume) {
        this.musicVolume = volume;
        if (this.backgroundMusic) {
            this.backgroundMusic.gains.forEach(gain => {
                // Adjust relative volumes based on layer type
                const baseVolume = gain.gain.value / this.musicVolume;
                gain.gain.value = volume * baseVolume;
            });
        }
        // Save to settings
        const settings = Storage.getSettings();
        settings.musicVolume = volume;
        Storage.saveSettings(settings);
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
    },

    // Toggle background music
    toggleMusic: function() {
        this.musicEnabled = !this.musicEnabled;
        if (this.musicEnabled) {
            this.createAmbientMusic();
        } else {
            this.stopBackgroundMusic();
        }
        // Save to settings
        const settings = Storage.getSettings();
        settings.musicEnabled = this.musicEnabled;
        Storage.saveSettings(settings);
    },

    // Start background music (called when game starts)
    startMusic: function() {
        if (this.musicEnabled && !this.backgroundMusic && this.audioContextStarted) {
            this.createAmbientMusic();
        }
    },

    // Stop background music (called when game ends or user leaves)
    stopMusic: function() {
        this.stopBackgroundMusic();
    },

    // Adjust music intensity based on game state
    setMusicIntensity: function(intensity) {
        // intensity: 0 = menu, 1 = gameplay, 2 = intense moments
        if (this.backgroundMusic) {
            const intensityMultiplier = [0.7, 1.0, 1.3][intensity] || 1.0;
            this.backgroundMusic.gains.forEach((gain, index) => {
                // Different layers respond differently to intensity
                const layerMultipliers = [1.2, 0.8, 1.5, 0.6]; // melody, harmony, bass, ambient
                const baseVolume = this.musicVolume * layerMultipliers[index % layerMultipliers.length];
                gain.gain.value = baseVolume * intensityMultiplier;
            });
        }
    },

    // Special music for win/lose moments
    playVictoryMusic: function() {
        if (!this.musicEnabled) return;
        // Create a short victory fanfare
        this.playSound(523, 0.2, 'square'); // C5
        setTimeout(() => this.playSound(659, 0.2, 'square'), 150); // E5
        setTimeout(() => this.playSound(784, 0.3, 'square'), 300); // G5
    },

    playDefeatMusic: function() {
        if (!this.musicEnabled) return;
        // Create a short defeat sound
        this.playSound(392, 0.3, 'sawtooth'); // G4
        setTimeout(() => this.playSound(349, 0.3, 'sawtooth'), 150); // F4
        setTimeout(() => this.playSound(294, 0.4, 'sawtooth'), 300); // D4
    }
};