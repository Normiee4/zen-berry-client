import type { AlarmSound } from "@/store/timer-store";

export const AUDIO_FILES: Record<Exclude<AlarmSound, "none">, string> = {
  bell: "/audio/bell_alarm.mp3",
  chime: "/audio/chime_alarm.mp3",
  digital: "/audio/digital_alarm.mp3",
  lofi: "/audio/lofi_alarm.mp3",
};

const ALARM_DURATIONS: Record<Exclude<AlarmSound, "none">, number> = {
  bell: 6000,
  chime: 4000,
  digital: 4000,
  lofi: 9000,
};

class AudioManager {
  private ctx: AudioContext | null = null;
  private buffers = new Map<string, AudioBuffer>();
  private currentSource: AudioBufferSourceNode | null = null;
  private currentStopTimeout: ReturnType<typeof setTimeout> | null = null;
  private _isPlaying = false;
  private initPromise: Promise<void> | null = null;
  private _keepAliveSource: AudioBufferSourceNode | null = null;
  private queuedSound: AlarmSound | null = null;

  init(): Promise<void> {
    if (this.initPromise) return this.initPromise;
    this.initPromise = this.initInternal();
    return this.initPromise;
  }

  private async initInternal(): Promise<void> {
    try {
      this.ctx = new AudioContext();

      const entries = Object.entries(AUDIO_FILES) as [Exclude<AlarmSound, "none">, string][];
      await Promise.allSettled(
        entries.map(async ([name, url]) => {
          try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.ctx!.decodeAudioData(arrayBuffer);
            this.buffers.set(name, audioBuffer);
          } catch {
            // individual sound failure is non-fatal
          }
        }),
      );

      this.ctx.onstatechange = () => {
        if (this.ctx?.state === "suspended") {
          this.registerUnlockHandler();
        }
      };

      if (this.ctx.state === "suspended") {
        this.registerUnlockHandler();
      }
    } catch {
      this.ctx = null;
    }
  }

  private registerUnlockHandler(): void {
    const unlock = () => {
      this.ctx?.resume();
      if (this.queuedSound) {
        const sound = this.queuedSound;
        this.queuedSound = null;
        this.playInternal(sound);
      }
      document.removeEventListener("pointerdown", unlock);
      document.removeEventListener("keydown", unlock);
    };
    document.addEventListener("pointerdown", unlock, { once: true });
    document.addEventListener("keydown", unlock, { once: true });
  }

  startKeepAlive(): void {
    if (!this.ctx || this._keepAliveSource) return;
    try {
      const buffer = this.ctx.createBuffer(1, 1, this.ctx.sampleRate);
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(this.ctx.destination);
      source.start();
      this._keepAliveSource = source;
    } catch {
      // keepalive failure is non-fatal
    }
  }

  stopKeepAlive(): void {
    if (!this._keepAliveSource) return;
    try {
      this._keepAliveSource.stop();
    } catch {
      // already ended
    }
    this._keepAliveSource = null;
  }

  play(sound: AlarmSound): void {
    if (sound === "none" || this._isPlaying || !this.ctx) return;

    const buffer = this.buffers.get(sound);
    if (!buffer) return;

    if (this.ctx.state === "suspended") {
      this.queuedSound = sound;
      this.ctx.resume().then(() => {
        if (this.ctx?.state === "running" && this.queuedSound === sound) {
          this.queuedSound = null;
          this.playInternal(sound);
        }
      }).catch(() => {
        // kept queued for gesture handler
      });
      return;
    }

    this.playInternal(sound);
  }

  private playInternal(sound: AlarmSound): void {
    if (sound === "none") return;

    const buffer = this.buffers.get(sound);
    if (!buffer) return;

    const duration = ALARM_DURATIONS[sound as Exclude<AlarmSound, "none">] ?? 4000;
    this._isPlaying = true;

    try {
      const source = this.ctx!.createBufferSource();
      source.buffer = buffer;

      const gain = this.ctx!.createGain();
      gain.gain.value = 0.5;

      source.connect(gain).connect(this.ctx!.destination);
      source.start();
      this.currentSource = source;

      this.currentStopTimeout = setTimeout(() => {
        try {
          source.stop();
        } catch {
          // already ended
        }
        if (this.currentSource === source) {
          this.currentSource = null;
        }
        this._isPlaying = false;
      }, duration);

      source.onended = () => {
        if (this.currentStopTimeout) {
          clearTimeout(this.currentStopTimeout);
          this.currentStopTimeout = null;
        }
        if (this.currentSource === source) {
          this.currentSource = null;
        }
        this._isPlaying = false;
      };
    } catch {
      this._isPlaying = false;
    }
  }

  preview(sound: AlarmSound, durationMs: number = 3000): void {
    if (sound === "none" || !this.ctx) return;
    this.stop();

    const buffer = this.buffers.get(sound);
    if (!buffer) return;

    this._isPlaying = true;

    try {
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;

      const gain = this.ctx.createGain();
      gain.gain.value = 0.3;

      source.connect(gain).connect(this.ctx.destination);
      source.start();
      this.currentSource = source;

      this.currentStopTimeout = setTimeout(() => {
        try {
          source.stop();
        } catch {
          // already ended
        }
        if (this.currentSource === source) {
          this.currentSource = null;
        }
        this._isPlaying = false;
      }, durationMs);

      source.onended = () => {
        if (this.currentStopTimeout) {
          clearTimeout(this.currentStopTimeout);
          this.currentStopTimeout = null;
        }
        if (this.currentSource === source) {
          this.currentSource = null;
        }
        this._isPlaying = false;
      };
    } catch {
      this._isPlaying = false;
    }
  }

  stop(): void {
    if (this.currentStopTimeout) {
      clearTimeout(this.currentStopTimeout);
      this.currentStopTimeout = null;
    }
    if (this.currentSource) {
      try {
        this.currentSource.stop();
      } catch {
        // already ended
      }
      this.currentSource = null;
    }
    this._isPlaying = false;
  }

  getIsPlaying(): boolean {
    return this._isPlaying;
  }
}

export const audioManager = new AudioManager();
