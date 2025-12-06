// Game module
const Game = {
    // Game state
    mode: 'classic',
    difficulty: 'easy',
    playerScore: 0,
    computerScore: 0,
    roundNumber: 1,
    playerChoice: '',
    computerChoice: '',
    gameActive: false,
    timer: null,
    timeLeft: 10,
    maxRounds: null,
    choices: ['rock', 'paper', 'scissors'],
    choicesMap: {
        rock: '🪨',
        paper: '📄',
        scissors: '✂️',
        lizard: '🦎',
        spock: '🖖'
    },
    playerHistory: [], // For AI difficulty

    init: function() {
        this.mode = document.getElementById('mode-select').value;
        this.difficulty = document.getElementById('difficulty-select').value;
        this.resetGame();
        this.setupMode();
        UI.updateChoices(this.choices);
        this.gameActive = true;
        // Start background music when game begins
        Sounds.startMusic();
        Sounds.setMusicIntensity(1); // Gameplay intensity
    },

    setupMode: function() {
        if (this.mode === 'extended') {
            this.choices = ['rock', 'paper', 'scissors', 'lizard', 'spock'];
        } else {
            this.choices = ['rock', 'paper', 'scissors'];
        }

        if (this.mode.startsWith('best-of-')) {
            this.maxRounds = parseInt(this.mode.split('-')[2]);
        } else if (this.mode === 'survival') {
            this.maxRounds = Infinity;
        } else {
            this.maxRounds = null;
        }

        if (this.mode === 'time-attack') {
            UI.showTimer(this.timeLeft);
        } else {
            UI.hideTimer();
        }

        // Update choices display
        UI.updateChoices(this.choices);
    },

    resetGame: function() {
        this.playerScore = 0;
        this.computerScore = 0;
        this.roundNumber = 1;
        this.playerHistory = [];
        UI.updateScoreboard(0, 0, 1);
        UI.hideResult();
        UI.hideCountdown();
        UI.hideTimer();
        UI.hideSelectedChoice();
        if (this.timer) clearInterval(this.timer);
    },

    makeChoice: function(choice) {
        if (!this.gameActive || document.querySelector('.choice.disabled')) return;
        this.playerChoice = choice;
        this.playerHistory.push(choice);
        Sounds.click();

        // Disable all choices during animation
        document.querySelectorAll('.choice').forEach(c => c.classList.add('disabled'));

        this.startRound();
    },

    startRound: function() {
        this.gameActive = false;
        this.computerChoice = this.getComputerChoice();
        this.startCountdown();
    },

    getComputerChoice: function() {
        if (this.difficulty === 'easy') {
            return this.choices[Math.floor(Math.random() * this.choices.length)];
        } else if (this.difficulty === 'medium') {
            // Predict based on last round
            if (this.playerHistory.length > 0) {
                const lastChoice = this.playerHistory[this.playerHistory.length - 1];
                const counter = this.getCounter(lastChoice);
                // 70% chance to counter, 30% random
                return Math.random() < 0.7 ? counter : this.choices[Math.floor(Math.random() * this.choices.length)];
            }
        } else if (this.difficulty === 'hard') {
            // Counter most used weapon
            const mostUsed = this.getMostUsedChoice();
            return this.getCounter(mostUsed);
        }
        return this.choices[Math.floor(Math.random() * this.choices.length)];
    },

    getMostUsedChoice: function() {
        if (this.playerHistory.length === 0) return this.choices[0];
        const counts = {};
        this.playerHistory.forEach(choice => {
            counts[choice] = (counts[choice] || 0) + 1;
        });
        return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    },

    getCounter: function(choice) {
        const counters = {
            rock: ['paper', 'spock'],
            paper: ['scissors', 'lizard'],
            scissors: ['rock', 'spock'],
            lizard: ['rock', 'scissors'],
            spock: ['paper', 'lizard']
        };
        const possibleCounters = counters[choice] || [this.choices[0]];
        return possibleCounters[Math.floor(Math.random() * possibleCounters.length)];
    },

    startCountdown: function() {
        let count = 3;
        UI.showCountdown(count);
        Sounds.countdown();

        const interval = setInterval(() => {
            count--;
            if (count > 0) {
                UI.showCountdown(count);
                Sounds.countdown();
            } else {
                UI.showCountdown('Shoot!');
                clearInterval(interval);
                setTimeout(() => {
                    UI.hideCountdown();
                    this.showResult();
                }, 1000);
            }
        }, 1000);
    },

    showResult: function() {
        const winner = this.getWinner(this.playerChoice, this.computerChoice);
        let outcomeText = '';
        let result = '';

        if (winner === 'player') {
            this.playerScore++;
            outcomeText = 'You Win!';
            result = 'Win';
            Sounds.win();
            Sounds.playVictoryMusic();
            Sounds.setMusicIntensity(2); // Intense victory moment
        } else if (winner === 'computer') {
            this.computerScore++;
            outcomeText = 'You Lose!';
            result = 'Lose';
            Sounds.lose();
            Sounds.playDefeatMusic();
            Sounds.setMusicIntensity(2); // Intense defeat moment
        } else {
            outcomeText = 'Draw!';
            result = 'Draw';
            Sounds.draw();
            Sounds.setMusicIntensity(1); // Back to normal gameplay
        }

        UI.updateScoreboard(this.playerScore, this.computerScore, this.roundNumber);
        UI.showResult(this.playerChoice, this.computerChoice, outcomeText);

        // Save to history
        const history = Storage.getHistory();
        history.push({
            player: this.playerChoice,
            computer: this.computerChoice,
            result: result
        });
        Storage.saveHistory(history);

        // Update stats
        this.updateStats(result);

        // Check game end
        setTimeout(() => {
            if (this.checkGameEnd()) {
                this.endGame();
            } else {
                this.nextRound();
            }
        }, 3000);
    },

    getWinner: function(player, computer) {
        if (player === computer) return 'draw';

        const wins = {
            rock: ['scissors', 'lizard'],
            paper: ['rock', 'spock'],
            scissors: ['paper', 'lizard'],
            lizard: ['spock', 'paper'],
            spock: ['scissors', 'rock']
        };

        return wins[player] && wins[player].includes(computer) ? 'player' : 'computer';
    },

    updateStats: function(result) {
        const stats = Storage.getStats();
        if (result === 'Win') {
            stats.wins++;
            stats.winStreak++;
            if (stats.winStreak > stats.highestStreak) {
                stats.highestStreak = stats.winStreak;
            }
        } else if (result === 'Lose') {
            stats.losses++;
            stats.winStreak = 0;
        } else {
            stats.ties++;
        }
        stats.gamesPlayed++;
        Storage.saveStats(stats);
    },

    checkGameEnd: function() {
        if (this.mode.startsWith('best-of-')) {
            const target = Math.ceil(this.maxRounds / 2);
            return this.playerScore >= target || this.computerScore >= target;
        } else if (this.mode === 'survival') {
            return this.computerScore >= 1; // Lose once = game over
        }
        return false;
    },

    endGame: function() {
        const winner = this.playerScore > this.computerScore ? 'Player' : 'Computer';
        alert(`Game Over! ${winner} wins!`);
        this.resetGame();
        UI.showPanel('menu');
    },

    nextRound: function() {
        this.roundNumber++;
        UI.updateScoreboard(this.playerScore, this.computerScore, this.roundNumber);
        UI.hideResult();
        UI.hideSelectedChoice();

        // Re-enable choices
        document.querySelectorAll('.choice').forEach(c => c.classList.remove('disabled'));

        this.gameActive = true;

        if (this.mode === 'time-attack') {
            this.startTimer();
        }
    },

    startTimer: function() {
        this.timeLeft = 10;
        UI.showTimer(this.timeLeft);
        this.timer = setInterval(() => {
            this.timeLeft--;
            UI.showTimer(this.timeLeft);
            if (this.timeLeft <= 0) {
                clearInterval(this.timer);
                // Auto choose random for player
                const randomChoice = this.choices[Math.floor(Math.random() * this.choices.length)];
                this.makeChoice(randomChoice);
            }
        }, 1000);
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    Storage; // Ensure Storage is loaded
    Sounds.init();
    UI.init();
});