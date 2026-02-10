(() => {
  const $ = (id) => document.getElementById(id);
  const melodyEl = $("melody");
  const bpmEl = $("bpm");
  const statsEl = $("stats");
  const zipfCanvas = $("zipfChart");
  const zipfCtx = zipfCanvas.getContext("2d");
  const zipfStatsEl = $("zipfStats");
  const entropyCanvas = $("entropyChart");
  const entropyCtx = entropyCanvas.getContext("2d");
  const entropyStatsEl = $("entropyStats");
  const audioFileEl = $("audioFile");
  const audioUrlEl = $("audioUrl");
  const audioStatusEl = $("audioStatus");

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

  function parseMelody(text) {
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
    return events;
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

  // ----- Analyze action -----
  function analyze() {
    const bpm = Math.max(30, Math.min(240, parseFloat(bpmEl.value || "110")));
    bpmEl.value = bpm;

    const events = parseMelody(melodyEl.value);
    const invalid = events.filter(e => e.type === "invalid").map(e => e.label);
    const secondsPerBeat = 60 / bpm;
    const eventsT = cumulativeTimes(events.filter(e => e.type !== "invalid"), secondsPerBeat);

    const total = eventsT.length ? eventsT[eventsT.length - 1].endSec : 0;
    const n = eventsT.length;

    statsEl.innerHTML = `
      Events: ${n} (excluding invalid tokens) • 
      Total duration: ${total.toFixed(2)}s @ ${bpm} BPM
      ${invalid.length ? `<br/><b>Ignored invalid tokens:</b> ${invalid.join(", ")}` : ""}
    `;

    // Zipf analysis
    const zipfData = analyzeZipf(eventsT);
    drawZipfChart(zipfData);
    
    if (zipfData.length > 0) {
      const zipfFit = calculateZipfFit(zipfData);
      const uniqueNotes = zipfData.length;
      const totalNotes = eventsT.filter(e => e.type === "note").length;
      const topNote = zipfData[0];
      const topNotePercent = ((topNote.count / totalNotes) * 100).toFixed(1);
      
      zipfStatsEl.innerHTML = `
        <b>Zipf's Law Analysis:</b>
        Unique notes: ${uniqueNotes} • Total notes: ${totalNotes} • 
        Most frequent: <b>${topNote.note}</b> (${topNote.count} times, ${topNotePercent}%) • 
        Zipf fit (R²): <b>${zipfFit.toFixed(3)}</b> ${zipfFit > 0.7 ? '✓ Strong Zipf pattern!' : zipfFit > 0.4 ? '~ Moderate Zipf pattern' : '✗ Weak Zipf pattern'}
      `;
    } else {
      zipfStatsEl.textContent = "No notes to analyze.";
    }

    // Entropy analysis
    const noteEntropy = calculateEntropy(eventsT);
    const intervalEntropy = calculateIntervalEntropy(eventsT);
    const uniqueNotes = zipfData.length;
    const maxPossibleEntropy = uniqueNotes > 0 ? Math.log2(uniqueNotes) : 0;
    
    drawEntropyChart(noteEntropy, intervalEntropy, Math.max(maxPossibleEntropy, 5));
    
    if (eventsT.filter(e => e.type === "note").length > 0) {
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

    return { eventsT, bpm };
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
    const w = zipfCanvas.width;
    const h = zipfCanvas.height;
    zipfCtx.clearRect(0, 0, w, h);

    if (zipfData.length === 0) {
      zipfCtx.fillStyle = "#999";
      zipfCtx.font = "14px system-ui";
      zipfCtx.fillText("No note data to display", 20, h / 2);
      return;
    }

    const pad = 60;
    const chartW = w - 2 * pad;
    const chartH = h - 2 * pad;

    // Background
    zipfCtx.fillStyle = "#fff";
    zipfCtx.fillRect(0, 0, w, h);

    // Axes
    zipfCtx.strokeStyle = "#333";
    zipfCtx.lineWidth = 2;
    zipfCtx.beginPath();
    zipfCtx.moveTo(pad, pad);
    zipfCtx.lineTo(pad, h - pad);
    zipfCtx.lineTo(w - pad, h - pad);
    zipfCtx.stroke();

    // Labels
    zipfCtx.fillStyle = "#333";
    zipfCtx.font = "12px system-ui";
    zipfCtx.fillText("Frequency", 10, 30);
    zipfCtx.fillText("Note Rank", w / 2 - 30, h - 20);

    const maxCount = Math.max(...zipfData.map(d => d.count));
    const barWidth = Math.min(60, chartW / zipfData.length - 4);

    // Draw bars
    zipfData.forEach((d, i) => {
      const x = pad + (i + 0.5) * (chartW / zipfData.length) - barWidth / 2;
      const barH = (d.count / maxCount) * chartH;
      const y = h - pad - barH;

      // Bar
      zipfCtx.fillStyle = `hsl(${200 - i * 20}, 70%, 60%)`;
      zipfCtx.fillRect(x, y, barWidth, barH);

      // Note label
      zipfCtx.fillStyle = "#333";
      zipfCtx.font = "11px system-ui";
      zipfCtx.save();
      zipfCtx.translate(x + barWidth / 2, h - pad + 15);
      zipfCtx.rotate(-Math.PI / 4);
      zipfCtx.fillText(d.note, 0, 0);
      zipfCtx.restore();

      // Count label
      zipfCtx.fillStyle = "#000";
      zipfCtx.font = "bold 12px system-ui";
      zipfCtx.fillText(d.count.toString(), x + barWidth / 2 - 8, y - 5);
    });

    // Zipf curve overlay (theoretical)
    if (zipfData.length > 1) {
      zipfCtx.strokeStyle = "rgba(255, 0, 0, 0.6)";
      zipfCtx.lineWidth = 2;
      zipfCtx.setLineDash([5, 5]);
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

    // Legend
    zipfCtx.fillStyle = "#666";
    zipfCtx.font = "11px system-ui";
    zipfCtx.fillText("Blue bars: Actual frequencies", w - 200, 30);
    zipfCtx.strokeStyle = "rgba(255, 0, 0, 0.6)";
    zipfCtx.lineWidth = 2;
    zipfCtx.setLineDash([5, 5]);
    zipfCtx.beginPath();
    zipfCtx.moveTo(w - 200, 45);
    zipfCtx.lineTo(w - 150, 45);
    zipfCtx.stroke();
    zipfCtx.setLineDash([]);
    zipfCtx.fillText("Red line: Ideal Zipf curve", w - 145, 48);
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
    const w = entropyCanvas.width;
    const h = entropyCanvas.height;
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
  async function analyzeAudioFile(file) {
    audioStatusEl.textContent = "Loading audio...";
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      audioStatusEl.textContent = "Analyzing pitches... This may take a moment.";
      
      // Extract melody using pitch detection
      const melody = await extractMelodyFromAudio(audioBuffer, audioContext);
      
      if (melody.length === 0) {
        audioStatusEl.textContent = "❌ No clear melody detected. Try a simpler monophonic recording.";
        return;
      }
      
      melodyEl.value = melody.join(" ");
      audioStatusEl.textContent = `✅ Extracted ${melody.length} notes from audio!`;
      last = analyze();
      
    } catch (error) {
      audioStatusEl.textContent = `❌ Error: ${error.message}`;
      console.error(error);
    }
  }

  async function extractMelodyFromAudio(audioBuffer, audioContext) {
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
    return melody.slice(0, 100);
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

  async function loadAudioFromUrl(url) {
    audioStatusEl.textContent = "Fetching audio from URL...";
    
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const blob = await response.blob();
      const file = new File([blob], "audio", { type: blob.type });
      await analyzeAudioFile(file);
      
    } catch (error) {
      audioStatusEl.textContent = `❌ Error loading URL: ${error.message}. Check CORS and URL validity.`;
      console.error(error);
    }
  }

  // Hook up UI
  let last = analyze();
  $("analyze").addEventListener("click", () => { last = analyze(); });
  $("play").addEventListener("click", async () => {
    last = analyze();
    if (last.eventsT.length) await play(last.eventsT, last.bpm);
  });
  $("stop").addEventListener("click", () => stop());

  // Melody generation buttons
  $("generateMelody").addEventListener("click", () => {
    melodyEl.value = generateZipfMelody(32, 1.2);
    last = analyze();
  });

  $("generateSimple").addEventListener("click", () => {
    melodyEl.value = generateSimpleMelody();
    last = analyze();
  });

  $("generateComplex").addEventListener("click", () => {
    melodyEl.value = generateComplexMelody();
    last = analyze();
  });

  // Melody presets
  document.querySelectorAll(".melody-preset").forEach(preset => {
    preset.addEventListener("click", () => {
      melodyEl.value = preset.dataset.melody;
      last = analyze();
    });
  });

  // Audio file upload
  audioFileEl.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      analyzeAudioFile(file);
    }
  });

  // Audio URL loading
  $("loadAudio").addEventListener("click", () => {
    const url = audioUrlEl.value.trim();
    if (url) {
      loadAudioFromUrl(url);
    } else {
      audioStatusEl.textContent = "Please enter a URL";
    }
  });

  // re-analyze when editing (lightly debounced)
  let t = null;
  melodyEl.addEventListener("input", () => {
    clearTimeout(t);
    t = setTimeout(() => { last = analyze(); }, 250);
  });
})();
