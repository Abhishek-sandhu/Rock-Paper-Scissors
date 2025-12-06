// UI module
const UI = {
    currentPanel: 'start',

    init: function() {
        this.bindEvents();
        this.loadSettings();
        this.showPanel('start');
    },

    bindEvents: function() {
        // Menu buttons
        document.getElementById('menu-btn').addEventListener('click', () => this.showPanel('menu'));
        document.getElementById('stats-btn').addEventListener('click', () => this.showPanel('stats'));
        document.getElementById('history-btn').addEventListener('click', () => this.showPanel('history'));
        document.getElementById('settings-btn').addEventListener('click', () => this.showPanel('settings'));

        // Let's Start button
        document.getElementById('lets-start-btn').addEventListener('click', () => {
            this.showPanel('menu');
            Sounds.startMusic();
        });

        // Start game
        document.getElementById('start-game-btn').addEventListener('click', () => {
            Game.init();
            this.showPanel('game');
        });

        // Mode selection
        document.querySelectorAll('.mode-option').forEach(option => {
            option.addEventListener('click', () => {
                // Remove selected class from all options
                document.querySelectorAll('.mode-option').forEach(opt => opt.classList.remove('selected'));
                // Add selected class to clicked option
                option.classList.add('selected');
                // Update hidden input
                document.getElementById('mode-select').value = option.dataset.mode;
                Sounds.click();
            });
        });

        // Difficulty selection
        document.querySelectorAll('.difficulty-option').forEach(option => {
            option.addEventListener('click', () => {
                // Remove selected class from all options
                document.querySelectorAll('.difficulty-option').forEach(opt => opt.classList.remove('selected'));
                // Add selected class to clicked option
                option.classList.add('selected');
                // Update hidden input
                document.getElementById('difficulty-select').value = option.dataset.difficulty;
                Sounds.click();
            });
        });

        // Settings
        document.getElementById('save-settings-btn').addEventListener('click', this.saveSettings.bind(this));

        // History
        document.getElementById('clear-history-btn').addEventListener('click', () => {
            Storage.clearHistory();
            this.updateHistory();
        });

        // Sound toggle
        document.getElementById('sound-toggle').addEventListener('change', () => {
            Sounds.toggle();
        });

        // Music toggle
        document.getElementById('music-toggle').addEventListener('change', () => {
            Sounds.toggleMusic();
        });

        // Music volume
        document.getElementById('music-volume').addEventListener('input', (e) => {
            Sounds.updateMusicVolume(parseFloat(e.target.value));
        });
    },

    showPanel: function(panelId) {
        document.querySelectorAll('.panel').forEach(panel => panel.classList.remove('active'));
        document.getElementById(panelId).classList.add('active');
        this.currentPanel = panelId;

        // Handle header visibility
        const header = document.querySelector('header');
        if (panelId === 'start') {
            header.style.display = 'none';
        } else {
            header.style.display = 'block';
        }

        // Adjust music intensity based on panel
        if (panelId === 'start') {
            Sounds.setMusicIntensity(0); // Calm welcome music
        } else if (panelId === 'menu') {
            Sounds.setMusicIntensity(0); // Menu music
        } else if (panelId === 'game') {
            Sounds.setMusicIntensity(1); // Gameplay music
        }

        if (panelId === 'stats') this.updateStats();
        if (panelId === 'history') this.updateHistory();
        if (panelId === 'settings') this.loadSettings();
        if (panelId === 'menu') this.initializeMenuSelections();
    },

    initializeMenuSelections: function() {
        // Set default selections for mode and difficulty
        const modeSelect = document.getElementById('mode-select');
        const difficultySelect = document.getElementById('difficulty-select');

        // Select the appropriate mode option
        document.querySelectorAll('.mode-option').forEach(option => {
            if (option.dataset.mode === modeSelect.value) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });

        // Select the appropriate difficulty option
        document.querySelectorAll('.difficulty-option').forEach(option => {
            if (option.dataset.difficulty === difficultySelect.value) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
    },

    updateStats: function() {
        const stats = Storage.getStats();
        document.getElementById('total-wins').textContent = stats.wins;
        document.getElementById('total-losses').textContent = stats.losses;
        document.getElementById('total-ties').textContent = stats.ties;
        document.getElementById('win-streak').textContent = stats.winStreak;
        document.getElementById('highest-streak').textContent = stats.highestStreak;
        document.getElementById('games-played').textContent = stats.gamesPlayed;
    },

    updateHistory: function() {
        const history = Storage.getHistory();
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '';

        history.forEach((round, index) => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.textContent = `Round ${index + 1}: Player: ${round.player}, Computer: ${round.computer} - ${round.result}`;
            historyList.appendChild(item);
        });
    },

    loadSettings: function() {
        const settings = Storage.getSettings();
        document.getElementById('player-name').value = settings.playerName;
        document.getElementById('theme-select').value = settings.theme;
        document.getElementById('sound-toggle').checked = settings.soundEnabled;
        document.getElementById('music-toggle').checked = settings.musicEnabled;
        document.getElementById('music-volume').value = settings.musicVolume || 0.3;
        this.applyTheme(settings.theme);
    },

    saveSettings: function() {
        const settings = {
            playerName: document.getElementById('player-name').value || 'Player',
            theme: document.getElementById('theme-select').value,
            soundEnabled: document.getElementById('sound-toggle').checked,
            musicEnabled: document.getElementById('music-toggle').checked,
            musicVolume: parseFloat(document.getElementById('music-volume').value)
        };
        Storage.saveSettings(settings);
        this.applyTheme(settings.theme);
        Sounds.soundEnabled = settings.soundEnabled;
        Sounds.musicEnabled = settings.musicEnabled;
        Sounds.updateMusicVolume(settings.musicVolume);
        alert('Settings saved!');
    },

    applyTheme: function(theme) {
        document.body.className = theme;
    },

    updateScoreboard: function(playerScore, computerScore, roundNumber) {
        document.getElementById('player-score').textContent = playerScore;
        document.getElementById('computer-score').textContent = computerScore;
        document.getElementById('round-number').textContent = roundNumber;
    },

    showCountdown: function(count) {
        const countdownEl = document.getElementById('countdown');
        countdownEl.textContent = count;
        countdownEl.classList.add('show');

        // Add slow motion effect for "Shoot!"
        if (count === 'Shoot!') {
            countdownEl.classList.add('slow-motion');
        }
    },

    hideCountdown: function() {
        const countdownEl = document.getElementById('countdown');
        countdownEl.classList.remove('show', 'slow-motion');
    },

    showResult: function(playerChoice, computerChoice, outcome) {
        const playerHand = document.getElementById('player-hand');
        const computerHand = document.getElementById('computer-hand');
        const outcomeEl = document.getElementById('outcome');
        const resultEl = document.getElementById('result');

        const choicesMap = Game.choicesMap;
        playerHand.textContent = choicesMap[playerChoice];
        computerHand.textContent = choicesMap[computerChoice];

        resultEl.classList.add('show');

        setTimeout(() => {
            playerHand.classList.add('shake');
            computerHand.classList.add('shake');
        }, 500);

        setTimeout(() => {
            outcomeEl.textContent = outcome;
            outcomeEl.classList.add('show');

            // Add special effects based on outcome
            if (outcome.includes('Win')) {
                this.showConfetti();
            } else if (outcome.includes('Lose')) {
                this.shakeScreen();
            }
        }, 1000);

        // Reset music intensity after result animation
        setTimeout(() => {
            Sounds.setMusicIntensity(1); // Back to normal gameplay intensity
        }, 3000);
    },

    hideResult: function() {
        const resultEl = document.getElementById('result');
        const outcomeEl = document.getElementById('outcome');
        const playerHand = document.getElementById('player-hand');
        const computerHand = document.getElementById('computer-hand');

        resultEl.classList.remove('show');
        outcomeEl.classList.remove('show');
        playerHand.classList.remove('shake');
        computerHand.classList.remove('shake');
    },

    updateChoices: function(choices) {
        const choicesContainer = document.getElementById('choices');
        choicesContainer.innerHTML = '';

        // Update mode display
        const modeNames = {
            'classic': 'Classic Mode',
            'extended': 'Extended Mode (RPSLS)',
            'best-of-3': 'Best of 3',
            'best-of-5': 'Best of 5',
            'best-of-7': 'Best of 7',
            'time-attack': 'Time Attack',
            'survival': 'Survival Mode'
        };
        document.getElementById('current-mode').textContent = modeNames[Game.mode] || 'Classic Mode';

        choices.forEach(choice => {
            const choiceEl = document.createElement('div');
            choiceEl.className = 'choice';
            choiceEl.dataset.choice = choice;
            choiceEl.setAttribute('role', 'button');
            choiceEl.setAttribute('tabindex', '0');
            choiceEl.setAttribute('aria-label', `Choose ${choice}`);
            choiceEl.innerHTML = `
                <span class="icon" aria-hidden="true">${Game.choicesMap[choice]}</span>
                <span class="text">${choice.charAt(0).toUpperCase() + choice.slice(1)}</span>
            `;
            choiceEl.addEventListener('click', () => this.selectChoice(choice, choiceEl));
            choiceEl.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.selectChoice(choice, choiceEl);
                }
            });
            choiceEl.addEventListener('touchstart', () => {
                choiceEl.classList.add('touch-active');
            });
            choiceEl.addEventListener('touchend', () => {
                choiceEl.classList.remove('touch-active');
                this.selectChoice(choice, choiceEl);
            });
            choicesContainer.appendChild(choiceEl);
        });
    },

    selectChoice: function(choice, choiceEl) {
        if (!Game.gameActive || document.querySelector('.choice.disabled')) return;

        // Clear previous selection
        document.querySelectorAll('.choice').forEach(c => c.classList.remove('selected'));

        // Set new selection
        choiceEl.classList.add('selected');

        // Show selected text
        this.showSelectedChoice(choice);

        // Make the choice in game
        Game.makeChoice(choice);
    },

    showSelectedChoice: function(choice) {
        const selectedText = document.getElementById('selected-text');
        const selectedDisplay = document.getElementById('selected-display');

        selectedText.textContent = `You Selected: ${choice.charAt(0).toUpperCase() + choice.slice(1)}`;
        selectedDisplay.classList.add('show');
    },

    hideSelectedChoice: function() {
        const selectedDisplay = document.getElementById('selected-display');
        const selectedText = document.getElementById('selected-text');

        selectedDisplay.classList.remove('show');
        selectedText.textContent = '';

        // Clear selected state from choices
        document.querySelectorAll('.choice').forEach(c => c.classList.remove('selected'));
    },

    showTimer: function(timeLeft) {
        const timerEl = document.getElementById('timer');
        timerEl.textContent = `Time: ${timeLeft}s`;
        if (timeLeft <= 3) {
            timerEl.style.color = '#ff0000';
        } else {
            timerEl.style.color = '#fff';
        }
    },

    hideTimer: function() {
        document.getElementById('timer').textContent = '';
    },

    showConfetti: function() {
        const container = document.querySelector('.container');
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.animationDelay = Math.random() * 3 + 's';
            confetti.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
            container.appendChild(confetti);

            setTimeout(() => {
                container.removeChild(confetti);
            }, 3000);
        }
    },

    shakeScreen: function() {
        document.body.classList.add('shake');
        setTimeout(() => {
            document.body.classList.remove('shake');
        }, 500);
    }
};