/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Web Audio API Demon & Hacker Sound Synthesis Engine
class EvilAudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private currentSourceNodes: (AudioNode | OscillatorNode)[] = [];
  public onAmplitudeChange?: (amp: number) => void;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 0.85;
      this.analyser.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.85, this.ctx.currentTime);
    }
  }

  public getAnalyser(): AnalyserNode | null {
    this.initContext();
    return this.analyser;
  }

  public getAudioData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(0);
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }

  public getAverageAmplitude(): number {
    if (!this.analyser) return 0;
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i];
    }
    return sum / (data.length * 255);
  }

  // Play a retro terminal keystroke tick
  public playKeyTick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.analyser) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'square';
    osc.frequency.setValueAtTime(1400 + Math.random() * 800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.03);

    filter.type = 'highpass';
    filter.frequency.value = 800;

    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.035);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.analyser);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  // Create a distortion curve for grit
  private makeDistortionCurve(amount: number = 30): Float32Array {
    const k = typeof amount === 'number' ? amount : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  // Deep Demonic Sub-Rumble generator
  public playDemonicRumble(durationSeconds: number = 2.5) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.analyser) return;

    const t = this.ctx.currentTime;
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    subOsc.type = 'sawtooth';
    subOsc.frequency.setValueAtTime(48, t);
    subOsc.frequency.linearRampToValueAtTime(42, t + durationSeconds);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(120, t);
    filter.frequency.exponentialRampToValueAtTime(80, t + durationSeconds);

    subGain.gain.setValueAtTime(0.01, t);
    subGain.gain.linearRampToValueAtTime(0.35, t + 0.2);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + durationSeconds);

    subOsc.connect(filter);
    filter.connect(subGain);
    subGain.connect(this.analyser);

    subOsc.start(t);
    subOsc.stop(t + durationSeconds);
  }

  // Cyber Glitch Burst
  public playGlitchBurst() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.analyser) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';

    osc.frequency.setValueAtTime(880, t);
    osc.frequency.setValueAtTime(180, t + 0.04);
    osc.frequency.setValueAtTime(1420, t + 0.08);
    osc.frequency.setValueAtTime(70, t + 0.12);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.analyser);
    osc.start(t);
    osc.stop(t + 0.18);
  }

  // Maniacal Evil Laugh Synthesizer
  // Generates rhythmic demonic laugh bursts: "MWA-HA-HA-HA-HA-HA-HAAA" with pitch flutter & formant filters
  public playEvilLaugh(options?: {
    intensity?: number;
    laughCount?: number;
    basePitch?: number;
    speed?: number;
    onBurst?: (index: number, total: number) => void;
    onEnd?: () => void;
  }) {
    if (this.isMuted) {
      if (options?.onEnd) setTimeout(options.onEnd, 1500);
      return;
    }
    this.initContext();
    if (!this.ctx || !this.analyser) return;

    const {
      intensity = 1.0,
      laughCount = 8,
      basePitch = 120, // Low demonic fundamental
      speed = 1.0,
    } = options || {};

    const ctx = this.ctx;
    const now = ctx.currentTime + 0.05;

    // Trigger background demonic sub-bass
    this.playDemonicRumble((laughCount * 0.22) / speed + 0.8);

    const burstDuration = 0.18 / speed;
    const burstGap = 0.22 / speed;

    for (let i = 0; i < laughCount; i++) {
      const burstStart = now + i * burstGap;
      const isIntro = i === 0;
      const isClimax = i === laughCount - 1;

      // Pitch contour: starts menacing, rises slightly during frenzy, then drops deep
      let pitchFactor = 1.0;
      if (isIntro) pitchFactor = 1.15;
      else if (i < 4) pitchFactor = 1.0 + i * 0.06;
      else if (isClimax) pitchFactor = 0.82;
      else pitchFactor = 0.95 - (i - 4) * 0.04;

      const freq = basePitch * pitchFactor;
      const duration = isClimax ? burstDuration * 2.2 : burstDuration;

      // Two oscillators for rich demonic chorus / harsh dissonant interval
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'square';
      lfo.type = 'sine';

      // Pitch vibrato / manic laugh tremolo
      lfo.frequency.setValueAtTime(12 * speed, burstStart);
      lfoGain.gain.setValueAtTime(14 * intensity, burstStart);
      lfo.connect(lfoGain);
      lfoGain.connect(osc1.frequency);
      lfoGain.connect(osc2.frequency);

      // Pitch drop envelope on each "HA"
      osc1.frequency.setValueAtTime(freq * 1.25, burstStart);
      osc1.frequency.exponentialRampToValueAtTime(freq * 0.8, burstStart + duration);

      osc2.frequency.setValueAtTime(freq * 1.24 * 1.5, burstStart); // Demonic 5th harmonic
      osc2.frequency.exponentialRampToValueAtTime(freq * 0.79 * 1.5, burstStart + duration);

      // Vocal Formant Filter (simulating open demonic throat "AH" / "HA")
      const formant1 = ctx.createBiquadFilter();
      formant1.type = 'bandpass';
      formant1.frequency.setValueAtTime(580, burstStart);
      formant1.Q.setValueAtTime(4.0, burstStart);

      const formant2 = ctx.createBiquadFilter();
      formant2.type = 'bandpass';
      formant2.frequency.setValueAtTime(1150, burstStart);
      formant2.Q.setValueAtTime(3.5, burstStart);

      // Distortion waveshaper
      const shaper = ctx.createWaveShaper();
      shaper.curve = this.makeDistortionCurve(35 * intensity) as unknown as Float32Array<ArrayBuffer>;

      // Amplitude envelope
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.001, burstStart);
      gainNode.gain.linearRampToValueAtTime(0.28 * intensity, burstStart + 0.035);
      gainNode.gain.exponentialRampToValueAtTime(0.001, burstStart + duration);

      osc1.connect(formant1);
      osc2.connect(formant2);
      formant1.connect(shaper);
      formant2.connect(shaper);
      shaper.connect(gainNode);
      gainNode.connect(this.analyser);

      osc1.start(burstStart);
      osc2.start(burstStart);
      lfo.start(burstStart);

      osc1.stop(burstStart + duration + 0.02);
      osc2.stop(burstStart + duration + 0.02);
      lfo.stop(burstStart + duration + 0.02);

      // Callback for visual sync
      if (options?.onBurst) {
        setTimeout(() => {
          options.onBurst?.(i, laughCount);
        }, (i * burstGap * 1000) / 1.0);
      }
    }

    const totalTimeMs = ((laughCount * burstGap + burstDuration * 2) * 1000);
    setTimeout(() => {
      options?.onEnd?.();
    }, totalTimeMs);
  }

  // Synthesize Evil Robot / Demon Vocoder Voice as fallback or layer
  public playDemonPhonemes(words: string[], onWord?: (w: string) => void, onDone?: () => void) {
    if (this.isMuted) {
      if (onDone) setTimeout(onDone, words.length * 400);
      return;
    }
    this.initContext();
    if (!this.ctx || !this.analyser) return;

    let timeOffset = 0;
    words.forEach((word, index) => {
      const delay = timeOffset;
      setTimeout(() => {
        if (!this.ctx || !this.analyser) return;
        onWord?.(word);
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        // Low demonic robotic pitch
        const pitches = [65, 58, 52, 70, 60, 48];
        const pitch = pitches[index % pitches.length];
        osc.frequency.setValueAtTime(pitch, t);
        osc.frequency.linearRampToValueAtTime(pitch * 0.95, t + 0.35);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, t);

        gain.gain.setValueAtTime(0.01, t);
        gain.gain.linearRampToValueAtTime(0.3, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.analyser);

        osc.start(t);
        osc.stop(t + 0.4);
      }, delay);
      timeOffset += 420;
    });

    setTimeout(() => {
      onDone?.();
    }, timeOffset + 200);
  }

  // Full evil recitation: Speaks phrase with demonic pitch modulation + follows with evil laugh!
  public speakSinisterPhrase(
    phrase: string = "Enter as hacker",
    options?: {
      pitchShift?: number; // 0.1 to 1.0 (default 0.25)
      rate?: number; // 0.5 to 1.5 (default 0.8)
      withLaughAfter?: boolean;
      onStart?: () => void;
      onWord?: (word: string) => void;
      onEnd?: () => void;
      onLaughStart?: () => void;
    }
  ) {
    this.initContext();
    const {
      pitchShift = 0.25,
      rate = 0.8,
      withLaughAfter = true,
      onStart,
      onWord,
      onEnd,
      onLaughStart,
    } = options || {};

    onStart?.();
    this.playGlitchBurst();
    this.playDemonicRumble(3.0);

    // Check if SpeechSynthesis is available and working
    if ('speechSynthesis' in window && window.speechSynthesis) {
      window.speechSynthesis.cancel(); // Cancel any lingering speech

      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.pitch = pitchShift; // Demonic low pitch
      utterance.rate = rate; // Deliberate menacing speed
      utterance.volume = this.isMuted ? 0 : 1.0;

      // Select deep voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) =>
          v.name.toLowerCase().includes('daniel') ||
          v.name.toLowerCase().includes('uk english male') ||
          v.name.toLowerCase().includes('google uk english male') ||
          v.name.toLowerCase().includes('alex') ||
          v.name.toLowerCase().includes('fred') ||
          v.name.toLowerCase().includes('male')
      );
      if (preferred) {
        utterance.voice = preferred;
      }

      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          const spokenWord = phrase.substring(event.charIndex, event.charIndex + (event.charLength || 6));
          onWord?.(spokenWord.trim());
          this.playKeyTick();
        }
      };

      utterance.onend = () => {
        if (withLaughAfter) {
          onLaughStart?.();
          setTimeout(() => {
            this.playEvilLaugh({
              laughCount: 9,
              intensity: 1.2,
              speed: 1.05,
              onEnd: () => {
                onEnd?.();
              },
            });
          }, 180);
        } else {
          onEnd?.();
        }
      };

      utterance.onerror = () => {
        // Fallback to internal synth if speech synthesis fails
        this.fallbackSpeak(phrase, withLaughAfter, onWord, onLaughStart, onEnd);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      this.fallbackSpeak(phrase, withLaughAfter, onWord, onLaughStart, onEnd);
    }
  }

  private fallbackSpeak(
    phrase: string,
    withLaughAfter: boolean,
    onWord?: (word: string) => void,
    onLaughStart?: () => void,
    onEnd?: () => void
  ) {
    const words = phrase.split(/\s+/);
    this.playDemonPhonemes(words, onWord, () => {
      if (withLaughAfter) {
        onLaughStart?.();
        setTimeout(() => {
          this.playEvilLaugh({
            laughCount: 8,
            intensity: 1.1,
            onEnd: () => {
              onEnd?.();
            },
          });
        }, 150);
      } else {
        onEnd?.();
      }
    });
  }

  public stopAll() {
    if ('speechSynthesis' in window && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    this.currentSourceNodes.forEach((node) => {
      try {
        if ('stop' in node && typeof node.stop === 'function') {
          node.stop();
        }
      } catch {
        // ignore
      }
    });
    this.currentSourceNodes = [];
  }
}

export const evilAudio = new EvilAudioEngine();
