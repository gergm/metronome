class Metronome {
    constructor(tempo = 120) {
        this.audioContext = null;
        this.notesInQueue = [];         // notes that have been put into the web audio and may or 
        // may not have been played yet {note, time}
        this.currentBeatInBar = 0;
        this.beatsPerBar = 8;
        this.tempo = tempo;
        this.lookahead = 25;          // How frequently to call scheduling function (in milliseconds)
        this.scheduleAheadTime = 0.1;   // How far ahead to schedule audio (sec)
        this.nextNoteTime = 0.0;     // when the next note is due
        this.isRunning = false;
        this.intervalID = null;
        this.rhythmPattern = 'Simple';
    }

    nextNote() {
        // Advance current note and time by an eighth note (quaver if you're posh)
        // Notice this picks up the CURRENT tempo value to calculate beat length.
        var secondsPerBeat = 60.0 / (2 * this.tempo);
        this.nextNoteTime += secondsPerBeat; // Add beat length to last beat time

        this.currentBeatInBar++;    // Advance the beat number, wrap to zero
        if (this.currentBeatInBar == this.beatsPerBar) {
            this.currentBeatInBar = 0;
        }
    }

    scheduleNote(beatNumber, time) {
        // push the note on the queue, even if we're not playing.
        this.notesInQueue.push({ note: beatNumber, time: time });

        // create an oscillator
        const osc = this.audioContext.createOscillator();
        const envelope = this.audioContext.createGain();

        osc.frequency.value = (beatNumber % this.beatsPerBar == 0) ? 1000 : 800;
        envelope.gain.value = 1;
        envelope.gain.exponentialRampToValueAtTime(1, time + 0.001);
        envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.02);

        osc.connect(envelope);
        envelope.connect(this.audioContext.destination);

        // sound the beat
        osc.start(time);
        osc.stop(time + 0.03);

        // display the beat
        var beatCount = (this.currentBeatInBar / 2) + 1;
        switch (beatCount) {
            case 1.5:
                beatCount = '1 &';
                break;
            case 2.5:
                beatCount = '2 &';
                break;
            case 3.5:
                beatCount = '3 &';
                break;
            case 4.5:
                beatCount = '4 &';
                break;
            default:
                break;
        }
        var beatElement = document.getElementById('beat');
        setTimeout(function () {
            beat.textContent = beatCount;
            if (beatCount == 1) {
                beatElement.style.color = '#FF0000';
            } else {
                beatElement.style.color = '#FFFFFF';
            }
        }, time);
    }

    scheduler() {
        // while there are notes that will need to play before the next interval, schedule them and 
        // advance the pointer.
        while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
            switch (metronome.rhythmPattern) {
                case 'Simple':
                    if (this.currentBeatInBar % 2 == 0) {
                        this.scheduleNote(this.currentBeatInBar, this.nextNoteTime);
                    }
                    break;
                case 'Double':
                    this.scheduleNote(this.currentBeatInBar, this.nextNoteTime);
                    break;
                case 'Country':
                    if (this.currentBeatInBar % 2 == 0 ||
                        this.currentBeatInBar == 3 || 
                        this.currentBeatInBar == 7) {
                        this.scheduleNote(this.currentBeatInBar, this.nextNoteTime);
                    }
                    break;
                case 'Folk':
                    if (this.currentBeatInBar % 2 == 0 ||
                        this.currentBeatInBar == 5 || 
                        this.currentBeatInBar == 7) {
                        this.scheduleNote(this.currentBeatInBar, this.nextNoteTime);
                    }
                    break;
                case 'General':
                    if ( this.currentBeatInBar != 4&&
                        this.currentBeatInBar % 2 == 0 ||
                        this.currentBeatInBar == 3 ||
                        this.currentBeatInBar == 5 || 
                        this.currentBeatInBar == 7) {
                        console.log(`*** scheduling beat ${this.currentBeatInBar}`)
                        this.scheduleNote(this.currentBeatInBar, this.nextNoteTime);
                    }
                    break;
                default:
                    console.log('no schedule for complex patterns');
            }
            this.nextNote();
        }
    }

    start() {
        if (this.isRunning) return;

        if (this.audioContext == null) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        this.isRunning = true;

        this.currentBeatInBar = 0;
        this.nextNoteTime = this.audioContext.currentTime + 0.05;

        this.intervalID = setInterval(() => this.scheduler(), this.lookahead);
    }

    stop() {
        this.isRunning = false;

        clearInterval(this.intervalID);
    }

    startStop() {
        if (this.isRunning) {
            this.stop();
        }
        else {
            this.start();
        }
    }
}