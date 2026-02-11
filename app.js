(() => {
  const $ = (id) => document.getElementById(id);
  const zipfCanvas = $("zipfChart");
  const zipfStatsEl = $("zipfStats");
  const entropyCanvas = $("entropyChart");
  const entropyStatsEl = $("entropyStats");
  const appleMusicSearchEl = $("appleMusicSearch");
  const appleMusicResultsEl = $("appleMusicResults");
  const nowPlayingEl = $("nowPlaying");
  
  // Hidden audio element for playback
  let audioPlayer = null;

  // Apple Music API Configuration (loaded from config.js)
  const APPLE_MUSIC_API_KEY = typeof CONFIG !== 'undefined' ? CONFIG.APPLE_MUSIC_API_KEY : "YOUR_KEY_HERE";

  // Setup high DPI canvas
  function setupCanvas(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    
    return { ctx, width: rect.width, height: rect.height };
  }

  // Initialize canvases
  let zipfSetup = setupCanvas(zipfCanvas);
  let zipfCtx = zipfSetup.ctx;
  
  let entropySetup = setupCanvas(entropyCanvas);
  let entropyCtx = entropySetup.ctx;

  // Educational example canvases
  const languageZipfCanvas = $("languageZipfChart");
  const musicZipfCanvas = $("musicZipfChart");
  const forgettingCurveCanvas = $("forgettingCurveChart");
  
  let languageSetup, musicSetup, forgettingSetup;

  // Re-setup on window resize
  window.addEventListener('resize', () => {
    zipfSetup = setupCanvas(zipfCanvas);
    zipfCtx = zipfSetup.ctx;
    entropySetup = setupCanvas(entropyCanvas);
    entropyCtx = entropySetup.ctx;
    
    // Redraw educational charts
    languageSetup = setupCanvas(languageZipfCanvas);
    musicSetup = setupCanvas(musicZipfCanvas);
    forgettingSetup = setupCanvas(forgettingCurveCanvas);
    drawEducationalCharts();
  });

  // ----- Educational Charts -----
  function drawEducationalCharts() {
    drawLanguageZipf();
    drawMusicZipf();
    drawForgettingCurve();
  }

  function drawLanguageZipf() {
    const { ctx, width: w, height: h } = languageSetup;
    ctx.clearRect(0, 0, w, h);
    
    // Most common English words with frequencies (from corpus analysis)
    const words = [
      { word: "the", count: 7000 },
      { word: "of", count: 3500 },
      { word: "and", count: 2800 },
      { word: "to", count: 2400 },
      { word: "a", count: 2000 },
      { word: "in", count: 1750 },
      { word: "is", count: 1400 },
      { word: "it", count: 1250 },
      { word: "that", count: 1100 },
      { word: "for", count: 1000 }
    ];
    
    const pad = 50;
    const chartW = w - 2 * pad;
    const chartH = h - 2 * pad;
    const maxCount = words[0].count;
    
    // Axes
    ctx.strokeStyle = "#d2d2d7";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, pad);
    ctx.lineTo(pad, h - pad);
    ctx.lineTo(w - pad, h - pad);
    ctx.stroke();
    
    // Labels
    ctx.fillStyle = "#86868b";
    ctx.font = "11px -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Frequency", pad - 5, pad - 10);
    ctx.textAlign = "center";
    ctx.fillText("Word Rank", w / 2, h - 10);
    
    // Draw line
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    words.forEach((d, i) => {
      const x = pad + (i / (words.length - 1)) * chartW;
      const y = h - pad - (d.count / maxCount) * chartH;
      
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    
    // Draw points and labels
    words.forEach((d, i) => {
      const x = pad + (i / (words.length - 1)) * chartW;
      const y = h - pad - (d.count / maxCount) * chartH;
      
      // Point
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Word label
      ctx.fillStyle = "#1d1d1f";
      ctx.font = "10px -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(d.word, x, h - pad + 15);
      
      // Count
      ctx.fillStyle = "#1d1d1f";
      ctx.font = "600 9px -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";
      ctx.fillText(d.count.toString(), x, y - 10);
    });
  }

  function drawMusicZipf() {
    const { ctx, width: w, height: h } = musicSetup;
    ctx.clearRect(0, 0, w, h);
    
    // Typical note distribution in classical music (approximate)
    const notes = [
      { note: "C", count: 1200 },
      { note: "G", count: 900 },
      { note: "D", count: 750 },
      { note: "A", count: 650 },
      { note: "E", count: 550 },
      { note: "F", count: 480 },
      { note: "B", count: 380 },
      { note: "D#", count: 300 },
      { note: "A#", count: 240 },
      { note: "F#", count: 200 }
    ];
    
    const pad = 50;
    const chartW = w - 2 * pad;
    const chartH = h - 2 * pad;
    const maxCount = notes[0].count;
    
    // Axes
    ctx.strokeStyle = "#d2d2d7";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, pad);
    ctx.lineTo(pad, h - pad);
    ctx.lineTo(w - pad, h - pad);
    ctx.stroke();
    
    // Labels
    ctx.fillStyle = "#86868b";
    ctx.font = "11px -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Frequency", pad - 5, pad - 10);
    ctx.textAlign = "center";
    ctx.fillText("Note Rank", w / 2, h - 10);
    
    // Draw line
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    notes.forEach((d, i) => {
      const x = pad + (i / (notes.length - 1)) * chartW;
      const y = h - pad - (d.count / maxCount) * chartH;
      
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    
    // Draw points and labels
    notes.forEach((d, i) => {
      const x = pad + (i / (notes.length - 1)) * chartW;
      const y = h - pad - (d.count / maxCount) * chartH;
      
      // Point
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Note label
      ctx.fillStyle = "#1d1d1f";
      ctx.font = "11px -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(d.note, x, h - pad + 15);
      
      // Count
      ctx.fillStyle = "#1d1d1f";
      ctx.font = "600 9px -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";
      ctx.fillText(d.count.toString(), x, y - 10);
    });
  }

  function drawForgettingCurve() {
    const { ctx, width: w, height: h } = forgettingSetup;
    ctx.clearRect(0, 0, w, h);
    
    const pad = 50;
    const chartW = w - 2 * pad;
    const chartH = h - 2 * pad;
    
    // Axes
    ctx.strokeStyle = "#d2d2d7";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, pad);
    ctx.lineTo(pad, h - pad);
    ctx.lineTo(w - pad, h - pad);
    ctx.stroke();
    
    // Labels
    ctx.fillStyle = "#86868b";
    ctx.font = "11px -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Retention %", pad - 5, pad - 10);
    ctx.textAlign = "center";
    ctx.fillText("Time (days)", w / 2, h - 10);
    
    // Draw forgetting curve: R = e^(-t/S)
    // Where R = retention, t = time, S = strength of memory
    const S = 2; // memory strength parameter
    
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    for (let i = 0; i <= 100; i++) {
      const t = (i / 100) * 30; // 30 days
      const retention = Math.exp(-t / S) * 100;
      const x = pad + (i / 100) * chartW;
      const y = h - pad - (retention / 100) * chartH;
      
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // Time markers
    [0, 1, 2, 7, 14, 30].forEach(day => {
      const x = pad + (day / 30) * chartW;
      const retention = Math.exp(-day / S) * 100;
      const y = h - pad - (retention / 100) * chartH;
      
      // Marker dot
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Day label
      ctx.fillStyle = "#86868b";
      ctx.font = "10px -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(day + "d", x, h - pad + 25);
      
      // Retention percentage
      ctx.fillStyle = "#1d1d1f";
      ctx.font = "600 10px -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";
      ctx.fillText(Math.round(retention) + "%", x, y - 10);
    });
  }

  // Initialize educational charts
  languageSetup = setupCanvas(languageZipfCanvas);
  musicSetup = setupCanvas(musicZipfCanvas);
  forgettingSetup = setupCanvas(forgettingCurveCanvas);
  drawEducationalCharts();

  // ----- Melody Generation (Zipf-based) -----
  const SCALE_NOTES = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5", "D5", "E5"];
  
  function zipfDistribution(n, s = 1.0) {
    // Generate Zipf distribution weights for n items
    const weights = [];
    let sum = 0;
    for (let i = 1; i <= n; i++) {
      const w = 1 / Math.pow(i, s);
      weights.push(w);
      sum += w;
    }
    return weights.map(w => w / sum); // normalize
  }

  function weightedRandom(items, weights) {
    const r = Math.random();
    let cumulative = 0;
    for (let i = 0; i < items.length; i++) {
      cumulative += weights[i];
      if (r <= cumulative) return items[i];
    }
    return items[items.length - 1];
  }

  function generateZipfMelody(length = 24, complexity = 1.0) {
    // Generate melody following Zipf's Law
    // complexity: 1.0 = strong Zipf, 0.5 = weaker Zipf (more uniform)
    const weights = zipfDistribution(SCALE_NOTES.length, complexity);
    const melody = [];
    
    // Generate notes with Zipf distribution
    for (let i = 0; i < length; i++) {
      const note = weightedRandom(SCALE_NOTES, weights);
      
      // Add rhythmic variation
      let duration = 1;
      if (Math.random() < 0.2) duration = 2;
      if (Math.random() < 0.1) duration = 0.5;
      
      // Occasional rests
      if (Math.random() < 0.1) {
        melody.push(`R:${duration}`);
      } else {
        melody.push(duration === 1 ? note : `${note}:${duration}`);
      }
    }
    
    return melody.join(" ");
  }

  function generateSimpleMelody() {
    // Generate a simple ascending/descending melody
    const notes = ["C4", "D4", "E4", "F4", "G4", "A4", "G4", "F4", "E4", "D4", "C4"];
    return notes.join(" ");
  }

  function generateComplexMelody() {
    // Generate complex melody with varied rhythms
    const notes = [];
    notes.push("C4:1", "E4:1", "G4:0.5", "E4:0.5", "F4:1", "D4:1", "E4:1", "C4:1");
    notes.push("D4:0.5", "E4:0.5", "F4:1", "G4:1", "A4:1.5", "B4:0.5", "C5:2");
    notes.push("B4:1", "A4:1", "G4:1", "F4:1", "E4:0.5", "D4:0.5", "E4:1", "C4:1", "D4:1", "C4:2");
    return notes.join(" ");
  }

  // ----- Note parsing -----
  const NOTE_MAP = {
    "C":0, "C#":1, "DB":1, "D":2, "D#":3, "EB":3, "E":4, "F":5, "F#":6, "GB":6,
    "G":7, "G#":8, "AB":8, "A":9, "A#":10, "BB":10, "B":11
  };

  function noteToMidi(token) {
    // token like C4, Db3, F#5
    const m = token.match(/^([A-Ga-g])([#bB]?)(-?\d+)$/);
    if (!m) return null;
    let letter = m[1].toUpperCase();
    let accidental = m[2] ? m[2].replace("b","B").toUpperCase() : "";
    const octave = parseInt(m[3], 10);
    const key = (letter + accidental);
    const semitone = NOTE_MAP[key];
    if (semitone === undefined) return null;
    // MIDI: C4 = 60 (middle C)
    return (octave + 1) * 12 + semitone;
  }

  function midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function parseMelody(text, bpm = 110) {
    const parts = text.trim().split(/\s+/).filter(Boolean);
    const events = [];
    for (const p of parts) {
      const [rawNote, rawDur] = p.split(":");
      const dur = rawDur ? Math.max(0.05, parseFloat(rawDur)) : 1;
      const noteToken = rawNote.trim();
      if (!noteToken) continue;

      if (noteToken.toUpperCase() === "R") {
        events.push({ type: "rest", midi: null, durBeats: dur, label: "R" });
        continue;
      }

      const midi = noteToMidi(noteToken);
      if (midi === null) {
        // Skip invalid tokens but keep user informed
        events.push({ type: "invalid", midi: null, durBeats: dur, label: noteToken });
      } else {
        events.push({ type: "note", midi, durBeats: dur, label: noteToken.toUpperCase() });
      }
    }
    
    const secondsPerBeat = 60 / bpm;
    const eventsT = cumulativeTimes(events.filter(e => e.type !== "invalid"), secondsPerBeat);
    
    return { events, eventsT, bpm };
  }

  function cumulativeTimes(events, secondsPerBeat) {
    let t = 0;
    return events.map(ev => {
      const start = t;
      const dur = ev.durBeats * secondsPerBeat;
      t += dur;
      return { ...ev, startSec: start, durSec: dur, endSec: t };
    });
  }

  function findEventAtTime(eventsT, timeSec) {
    // returns index of event where start <= time < end
    for (let i = 0; i < eventsT.length; i++) {
      if (eventsT[i].startSec <= timeSec && timeSec < eventsT[i].endSec) return i;
    }
    return Math.max(0, eventsT.length - 1);
  }

  // ----- Audio playback -----
  let audio = null;
  let stopFlag = false;

  async function play(eventsT, bpm) {
    stopFlag = false;
    if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();

    const secondsPerBeat = 60 / bpm;

    // Simple synth per note (very minimal)
    const now = audio.currentTime + 0.05;
    for (const ev of eventsT) {
      if (stopFlag) break;

      const start = now + ev.startSec;
      const dur = ev.durSec;

      if (ev.type === "note") {
        const osc = audio.createOscillator();
        const gain = audio.createGain();
        osc.type = "sine";
        osc.frequency.value = midiToFreq(ev.midi);

        // envelope
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.12, start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + Math.max(0.03, dur - 0.02));

        osc.connect(gain).connect(audio.destination);
        osc.start(start);
        osc.stop(start + dur);
      }
      // rests do nothing; invalid do nothing
    }
  }

  function stop() {
    stopFlag = true;
    // We don't hard-stop the AudioContext; scheduled nodes will fade quickly anyway.
  }


  // ----- Zipf's Law Analysis -----
  function analyzeZipf(eventsT) {
    // Count note frequencies
    const noteFreq = {};
    for (const ev of eventsT) {
      if (ev.type === "note") {
        const note = ev.label;
        noteFreq[note] = (noteFreq[note] || 0) + 1;
      }
    }

    // Sort by frequency (descending)
    const sorted = Object.entries(noteFreq)
      .sort((a, b) => b[1] - a[1])
      .map(([note, count], rank) => ({ note, count, rank: rank + 1 }));

    return sorted;
  }

  function drawZipfChart(zipfData) {
    const w = zipfSetup.width;
    const h = zipfSetup.height;
    zipfCtx.clearRect(0, 0, w, h);

    if (zipfData.length === 0) {
      zipfCtx.fillStyle = "#86868b";
      zipfCtx.font = "15px -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";
      zipfCtx.textAlign = "center";
      zipfCtx.fillText("No note data to display", w / 2, h / 2);
      return;
    }

    const pad = 50;
    const chartW = w - 2 * pad;
    const chartH = h - 2 * pad;

    // Axes - subtle gray
    zipfCtx.strokeStyle = "#d2d2d7";
    zipfCtx.lineWidth = 1;
    zipfCtx.beginPath();
    zipfCtx.moveTo(pad, pad);
    zipfCtx.lineTo(pad, h - pad);
    zipfCtx.lineTo(w - pad, h - pad);
    zipfCtx.stroke();

    // Labels - Apple gray
    zipfCtx.fillStyle = "#86868b";
    zipfCtx.font = "12px -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";
    zipfCtx.textAlign = "left";
    zipfCtx.fillText("Frequency", pad - 5, pad - 10);
    zipfCtx.textAlign = "center";
    zipfCtx.fillText("Note Rank", w / 2, h - 15);

    const maxCount = Math.max(...zipfData.map(d => d.count));
    const barWidth = Math.min(60, chartW / zipfData.length - 4);

    // Draw bars with Apple-style gradient
    zipfData.forEach((d, i) => {
      const x = pad + (i + 0.5) * (chartW / zipfData.length) - barWidth / 2;
      const barH = (d.count / maxCount) * chartH;
      const y = h - pad - barH;

      // Bar with gradient (Apple blue)
      const gradient = zipfCtx.createLinearGradient(x, y, x, h - pad);
      gradient.addColorStop(0, '#007aff');
      gradient.addColorStop(1, '#0051d5');
      zipfCtx.fillStyle = gradient;
      zipfCtx.fillRect(x, y, barWidth, barH);

      // Note label
      zipfCtx.fillStyle = "#1d1d1f";
      zipfCtx.font = "11px -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";
      zipfCtx.textAlign = "center";
      zipfCtx.save();
      zipfCtx.translate(x + barWidth / 2, h - pad + 15);
      zipfCtx.rotate(-Math.PI / 4);
      zipfCtx.fillText(d.note, 0, 0);
      zipfCtx.restore();

      // Count label
      zipfCtx.fillStyle = "#1d1d1f";
      zipfCtx.font = "600 11px -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";
      zipfCtx.textAlign = "center";
      zipfCtx.fillText(d.count.toString(), x + barWidth / 2, y - 5);
    });

    // Zipf curve overlay (theoretical) - Apple orange
    if (zipfData.length > 1) {
      zipfCtx.strokeStyle = "rgba(255, 149, 0, 0.8)";
      zipfCtx.lineWidth = 2;
      zipfCtx.setLineDash([4, 4]);
      zipfCtx.beginPath();
      
      const C = zipfData[0].count; // constant for Zipf: f(r) = C / r
      for (let i = 0; i < zipfData.length; i++) {
        const rank = i + 1;
        const theoreticalFreq = C / rank;
        const x = pad + (i + 0.5) * (chartW / zipfData.length);
        const y = h - pad - (theoreticalFreq / maxCount) * chartH;
        
        if (i === 0) zipfCtx.moveTo(x, y);
        else zipfCtx.lineTo(x, y);
      }
      zipfCtx.stroke();
      zipfCtx.setLineDash([]);
    }

    // Legend - Apple style
    zipfCtx.fillStyle = "#86868b";
    zipfCtx.font = "11px -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";
    zipfCtx.textAlign = "left";
    
    // Blue bar legend
    const gradient2 = zipfCtx.createLinearGradient(w - 200, 25, w - 200, 35);
    gradient2.addColorStop(0, '#007aff');
    gradient2.addColorStop(1, '#0051d5');
    zipfCtx.fillStyle = gradient2;
    zipfCtx.fillRect(w - 200, 25, 15, 10);
    zipfCtx.fillStyle = "#86868b";
    zipfCtx.fillText("Actual frequencies", w - 180, 33);
    
    // Orange line legend
    zipfCtx.strokeStyle = "rgba(255, 149, 0, 0.8)";
    zipfCtx.lineWidth = 2;
    zipfCtx.setLineDash([4, 4]);
    zipfCtx.beginPath();
    zipfCtx.moveTo(w - 200, 48);
    zipfCtx.lineTo(w - 185, 48);
    zipfCtx.stroke();
    zipfCtx.setLineDash([]);
    zipfCtx.fillText("Ideal Zipf curve", w - 180, 52);
  }

  function calculateZipfFit(zipfData) {
    if (zipfData.length < 2) return 0;
    
    // Calculate R² for Zipf fit: f(r) = C / r
    const C = zipfData[0].count;
    let ssRes = 0;
    let ssTot = 0;
    const mean = zipfData.reduce((sum, d) => sum + d.count, 0) / zipfData.length;
    
    for (let i = 0; i < zipfData.length; i++) {
      const actual = zipfData[i].count;
      const predicted = C / (i + 1);
      ssRes += Math.pow(actual - predicted, 2);
      ssTot += Math.pow(actual - mean, 2);
    }
    
    return Math.max(0, 1 - (ssRes / ssTot));
  }

  // ----- Entropy Analysis -----
  function calculateEntropy(eventsT) {
    // Calculate Shannon entropy for note distribution
    const noteFreq = {};
    let totalNotes = 0;
    
    for (const ev of eventsT) {
      if (ev.type === "note") {
        const note = ev.label;
        noteFreq[note] = (noteFreq[note] || 0) + 1;
        totalNotes++;
      }
    }
    
    if (totalNotes === 0) return 0;
    
    // Shannon entropy: H = -Σ(p * log2(p))
    let entropy = 0;
    for (const note in noteFreq) {
      const p = noteFreq[note] / totalNotes;
      entropy -= p * Math.log2(p);
    }
    
    return entropy;
  }

  function calculateIntervalEntropy(eventsT) {
    // Calculate entropy based on melodic intervals
    const intervals = {};
    let totalIntervals = 0;
    
    for (let i = 1; i < eventsT.length; i++) {
      if (eventsT[i-1].type === "note" && eventsT[i].type === "note") {
        const interval = eventsT[i].midi - eventsT[i-1].midi;
        intervals[interval] = (intervals[interval] || 0) + 1;
        totalIntervals++;
      }
    }
    
    if (totalIntervals === 0) return 0;
    
    let entropy = 0;
    for (const interval in intervals) {
      const p = intervals[interval] / totalIntervals;
      entropy -= p * Math.log2(p);
    }
    
    return entropy;
  }

  function drawEntropyChart(noteEntropy, intervalEntropy, maxEntropy) {
    const w = entropySetup.width;
    const h = entropySetup.height;
    entropyCtx.clearRect(0, 0, w, h);

    const pad = 60;
    const chartW = w - 2 * pad;
    const chartH = h - 2 * pad;

    // Background
    entropyCtx.fillStyle = "#fafafa";
    entropyCtx.fillRect(0, 0, w, h);

    // Border
    entropyCtx.strokeStyle = "#000";
    entropyCtx.lineWidth = 2;
    entropyCtx.strokeRect(0, 0, w, h);

    // Title
    entropyCtx.fillStyle = "#000";
    entropyCtx.font = "bold 14px Helvetica Neue, Helvetica, Arial, sans-serif";
    entropyCtx.fillText("Entropy Comparison", pad, 30);

    // Bars
    const barWidth = 120;
    const barSpacing = 200;
    const x1 = pad + 100;
    const x2 = x1 + barSpacing;

    // Note Entropy Bar
    const noteBarH = (noteEntropy / maxEntropy) * chartH;
    const noteY = h - pad - noteBarH;
    entropyCtx.fillStyle = "#000";
    entropyCtx.fillRect(x1, noteY, barWidth, noteBarH);

    // Interval Entropy Bar
    const intervalBarH = (intervalEntropy / maxEntropy) * chartH;
    const intervalY = h - pad - intervalBarH;
    entropyCtx.fillStyle = "#666";
    entropyCtx.fillRect(x2, intervalY, barWidth, intervalBarH);

    // Labels
    entropyCtx.fillStyle = "#000";
    entropyCtx.font = "12px Helvetica Neue, Helvetica, Arial, sans-serif";
    entropyCtx.textAlign = "center";
    entropyCtx.fillText("Note Entropy", x1 + barWidth/2, h - pad + 20);
    entropyCtx.fillText("Interval Entropy", x2 + barWidth/2, h - pad + 20);

    // Values
    entropyCtx.font = "bold 16px Helvetica Neue, Helvetica, Arial, sans-serif";
    entropyCtx.fillStyle = "#fff";
    if (noteBarH > 30) {
      entropyCtx.fillText(noteEntropy.toFixed(2), x1 + barWidth/2, noteY + 20);
    }
    if (intervalBarH > 30) {
      entropyCtx.fillStyle = "#fff";
      entropyCtx.fillText(intervalEntropy.toFixed(2), x2 + barWidth/2, intervalY + 20);
    }

    // Max line
    entropyCtx.strokeStyle = "rgba(0, 0, 0, 0.3)";
    entropyCtx.lineWidth = 1;
    entropyCtx.setLineDash([5, 5]);
    entropyCtx.beginPath();
    entropyCtx.moveTo(pad, pad + 40);
    entropyCtx.lineTo(w - pad, pad + 40);
    entropyCtx.stroke();
    entropyCtx.setLineDash([]);

    entropyCtx.fillStyle = "#666";
    entropyCtx.font = "11px Helvetica Neue, Helvetica, Arial, sans-serif";
    entropyCtx.textAlign = "left";
    entropyCtx.fillText(`Max: ${maxEntropy.toFixed(2)}`, pad, pad + 35);

    entropyCtx.textAlign = "left";
  }

  // ----- Audio Analysis (Pitch Detection) -----
  async function analyzeAudioUrl(url, title, artist) {
    nowPlayingEl.innerHTML = `Analyzing: <b>${title}</b> by ${artist}...`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const arrayBuffer = await response.arrayBuffer();
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // Extract melody using pitch detection
      const melody = await extractMelodyFromAudio(audioBuffer);
      
      if (melody.length === 0) {
        nowPlayingEl.innerHTML = `Playing: <b>${title}</b> - No clear melody detected for analysis`;
        return;
      }
      
      const melodyStr = melody.join(" ");
      nowPlayingEl.innerHTML = `Now playing: <b>${title}</b> by ${artist} (Extracted ${melody.length} notes)`;
      
      // Analyze the extracted melody
      analyzeMelody(melodyStr);
      
    } catch (error) {
      nowPlayingEl.innerHTML = `Error analyzing audio: ${error.message}`;
      console.error(error);
    }
  }

  async function extractMelodyFromAudio(audioBuffer) {
    const channelData = audioBuffer.getChannelData(0); // Use first channel
    const sampleRate = audioBuffer.sampleRate;
    
    // Simple pitch detection using autocorrelation
    const hopSize = 2048; // ~46ms at 44.1kHz
    const windowSize = 4096;
    const melody = [];
    
    for (let i = 0; i < channelData.length - windowSize; i += hopSize) {
      const window = channelData.slice(i, i + windowSize);
      const freq = detectPitch(window, sampleRate);
      
      if (freq > 0) {
        const midi = frequencyToMidi(freq);
        const note = midiToNoteName(midi);
        
        // Simple note duration (based on hop size)
        const duration = Math.round((hopSize / sampleRate) * 2) / 2; // Round to 0.5
        
        // Combine consecutive same notes
        if (melody.length > 0) {
          const lastNote = melody[melody.length - 1];
          const [lastNoteName, lastDuration] = lastNote.includes(':') 
            ? lastNote.split(':') 
            : [lastNote, '1'];
          
          if (lastNoteName === note) {
            // Extend duration of last note
            const newDuration = parseFloat(lastDuration) + duration;
            melody[melody.length - 1] = `${note}:${newDuration.toFixed(1)}`;
            continue;
          }
        }
        
        melody.push(duration === 1 ? note : `${note}:${duration}`);
      }
    }
    
    // Limit to reasonable length
    return melody.slice(0, 150);
  }

  function detectPitch(buffer, sampleRate) {
    // Autocorrelation-based pitch detection
    const SIZE = buffer.length;
    const MAX_SAMPLES = Math.floor(SIZE / 2);
    let best_offset = -1;
    let best_correlation = 0;
    let rms = 0;
    
    // Calculate RMS (volume)
    for (let i = 0; i < SIZE; i++) {
      const val = buffer[i];
      rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);
    
    // Not enough signal
    if (rms < 0.01) return -1;
    
    // Autocorrelation
    let lastCorrelation = 1;
    for (let offset = 1; offset < MAX_SAMPLES; offset++) {
      let correlation = 0;
      
      for (let i = 0; i < MAX_SAMPLES; i++) {
        correlation += Math.abs(buffer[i] - buffer[i + offset]);
      }
      
      correlation = 1 - (correlation / MAX_SAMPLES);
      
      if (correlation > 0.9 && correlation > lastCorrelation) {
        const foundGoodCorrelation = correlation > best_correlation;
        if (foundGoodCorrelation) {
          best_correlation = correlation;
          best_offset = offset;
        }
      }
      
      lastCorrelation = correlation;
    }
    
    if (best_correlation > 0.01 && best_offset !== -1) {
      const frequency = sampleRate / best_offset;
      return frequency;
    }
    
    return -1;
  }

  function frequencyToMidi(freq) {
    return Math.round(12 * Math.log2(freq / 440) + 69);
  }

  function midiToNoteName(midi) {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midi / 12) - 1;
    const noteName = noteNames[midi % 12];
    return `${noteName}${octave}`;
  }

  // ----- Apple Music API Integration -----
  async function searchAppleMusic(query) {
    appleMusicResultsEl.innerHTML = "Searching Apple Music...";
    
    try {
      const response = await fetch(
        `https://api.music.apple.com/v1/catalog/us/search?term=${encodeURIComponent(query)}&types=songs&limit=3`,
        {
          headers: {
            'Authorization': `Bearer ${APPLE_MUSIC_API_KEY}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      const songs = data.results?.songs?.data || [];
      
      if (songs.length === 0) {
        appleMusicResultsEl.innerHTML = "<p>No results found. Try a different search term.</p>";
        return;
      }
      
      // Display results
      let html = '<div style="margin-top: 12px;"><b>Results:</b></div>';
      songs.forEach((song, index) => {
        const title = song.attributes.name;
        const artist = song.attributes.artistName;
        const album = song.attributes.albumName;
        const previewUrl = song.attributes.previews?.[0]?.url;
        const artwork = song.attributes.artwork?.url.replace('{w}', '60').replace('{h}', '60');
        
        html += `
          <div style="padding: 12px; margin: 8px 0; border: 2px solid #000; background: #fff; display: flex; gap: 12px; align-items: center;">
            ${artwork ? `<img src="${artwork}" alt="Album art" style="width: 60px; height: 60px; border: 2px solid #000;" />` : ''}
            <div style="flex: 1;">
              <div style="font-weight: 700;">${title}</div>
              <div style="font-size: 13px; color: #666; margin: 4px 0;">${artist} - ${album}</div>
              ${previewUrl ? 
                `<button class="secondary apple-preview-btn" data-url="${previewUrl}" data-title="${title}" data-artist="${artist}" style="margin-top: 8px;">Play & Analyze</button>` :
                `<div style="font-size: 12px; color: #999;">No preview available</div>`
              }
            </div>
          </div>
        `;
      });
      
      appleMusicResultsEl.innerHTML = html;
      
      // Add click handlers for preview buttons
      document.querySelectorAll('.apple-preview-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const url = btn.dataset.url;
          const title = btn.dataset.title;
          const artist = btn.dataset.artist;
          
          // Play preview in hidden audio element
          if (!audioPlayer) {
            audioPlayer = new Audio();
          }
          audioPlayer.src = url;
          audioPlayer.play();
          
          nowPlayingEl.innerHTML = `Playing: <b>${title}</b> by ${artist}`;
          
          // Analyze the audio in background
          await analyzeAudioUrl(url, title, artist);
        });
      });
      
    } catch (error) {
      appleMusicResultsEl.innerHTML = `<p style="color: red;">Error: ${error.message}. Check your API key.</p>`;
      console.error(error);
    }
  }


  // Helper function to analyze a melody string
  function analyzeMelody(melodyStr, bpm = 110) {
    const result = parseMelody(melodyStr, bpm);
    
    // Zipf analysis
    const zipfData = analyzeZipf(result.eventsT);
    drawZipfChart(zipfData);
    
    if (zipfData.length > 0) {
      const zipfFit = calculateZipfFit(zipfData);
      const uniqueNotes = zipfData.length;
      const totalNotes = result.eventsT.filter(e => e.type === "note").length;
      const topNote = zipfData[0];
      const topNotePercent = ((topNote.count / totalNotes) * 100).toFixed(1);
      
      zipfStatsEl.innerHTML = `
        <b>Zipf's Law Analysis:</b>
        Unique notes: ${uniqueNotes} • Total notes: ${totalNotes} • 
        Most frequent: <b>${topNote.note}</b> (${topNote.count} times, ${topNotePercent}%) • 
        Zipf fit (R²): <b>${zipfFit.toFixed(3)}</b> ${zipfFit > 0.7 ? 'Strong Zipf pattern' : zipfFit > 0.4 ? 'Moderate Zipf pattern' : 'Weak Zipf pattern'}
      `;
    } else {
      zipfStatsEl.textContent = "No notes to analyze.";
    }
    
    // Entropy analysis
    const noteEntropy = calculateEntropy(result.eventsT);
    const intervalEntropy = calculateIntervalEntropy(result.eventsT);
    const uniqueNotes = zipfData.length;
    const maxPossibleEntropy = uniqueNotes > 0 ? Math.log2(uniqueNotes) : 0;
    
    drawEntropyChart(noteEntropy, intervalEntropy, Math.max(maxPossibleEntropy, 5));
    
    if (result.eventsT.filter(e => e.type === "note").length > 0) {
      const normalizedEntropy = maxPossibleEntropy > 0 ? (noteEntropy / maxPossibleEntropy * 100).toFixed(1) : 0;
      
      let complexityLevel = "Low";
      if (normalizedEntropy > 80) complexityLevel = "Very High";
      else if (normalizedEntropy > 60) complexityLevel = "High";
      else if (normalizedEntropy > 40) complexityLevel = "Medium";
      
      entropyStatsEl.innerHTML = `
        <b>Entropy Analysis:</b>
        Note Entropy: <b>${noteEntropy.toFixed(2)} bits</b> (${normalizedEntropy}% of max) • 
        Interval Entropy: <b>${intervalEntropy.toFixed(2)} bits</b> • 
        Complexity: <b>${complexityLevel}</b>
        <br/>
        <i>Higher entropy = more unpredictable/complex melody. Lower entropy = more repetitive/simple melody.</i>
      `;
    } else {
      entropyStatsEl.textContent = "No notes to analyze.";
    }
    
    return result;
  }

  // Apple Music search
  $("searchAppleMusic").addEventListener("click", () => {
    const query = appleMusicSearchEl.value.trim();
    if (query) {
      searchAppleMusic(query);
    } else {
      appleMusicResultsEl.innerHTML = "<p>Please enter a search term</p>";
    }
  });

  // Enter key support for Apple Music search
  appleMusicSearchEl.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      $("searchAppleMusic").click();
    }
  });

  // Expandable section toggle functionality
  const faqToggle = $("zipfFaqToggle");
  const faqAnswer = $("zipfFaqAnswer");
  const faqIcon = faqToggle.querySelector(".expand-icon");

  faqToggle.addEventListener("click", () => {
    faqAnswer.classList.toggle("open");
    faqIcon.classList.toggle("open");
    
    // If opening, set up scroll observer for parallax
    if (faqAnswer.classList.contains("open")) {
      setTimeout(() => {
        setupScrollParallax();
      }, 100);
    }
  });

  // Scroll-based parallax for charts
  function setupScrollParallax() {
    const chartItems = document.querySelectorAll('.chart-item, .chart-full');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: '0px 0px -100px 0px'
    });

    chartItems.forEach(item => {
      observer.observe(item);
    });
  }

})();
