# 🎵 Musicoology: Melody Analysis Tool

An interactive web application that demonstrates **3-part phrasing**, **Golden Ratio positioning**, and **Zipf's Law** in musical melodies.

## 🎯 Key Concepts Demonstrated

### 1. **3-Part Phrasing (Ternary Form)**
Many natural melodies follow a three-part structure:
- **Statement** (First third): Introduces the main theme
- **Development** (Middle third): Explores and develops the theme, often building to a climax
- **Resolution** (Final third): Returns and resolves the melody

### 2. **Golden Ratio (φ ≈ 0.618)**
The golden ratio appears in many musical compositions, with climactic moments often occurring around 61.8% of the way through the piece. This creates a natural sense of balance and aesthetic appeal.

### 3. **Zipf's Law in Melody**
Zipf's Law states that in many natural phenomena, the frequency of an element is inversely proportional to its rank. In melodies:
- A few notes appear very frequently (the "tonic" and dominant notes)
- Most notes appear rarely
- The distribution follows: `f(r) = C / r` where `r` is rank and `C` is a constant

This creates natural-sounding melodies with clear tonal centers.

## ✨ Features

### 🎹 Melody Input
- Manual input using space-separated note notation (e.g., `C4 D4 E4`)
- Support for durations (e.g., `C4:2` for 2 beats)
- Support for rests (e.g., `R` or `R:2`)
- Sharps and flats (e.g., `C#4`, `Db4`)

### 🎲 Melody Generation
- **Random Zipf-based Generator**: Creates melodies that naturally follow Zipf's Law
- **Simple Melody**: Generates a clear 3-part structure with ascending/descending patterns
- **Complex Melody**: Creates varied rhythms with a clear golden ratio peak

### 🎼 Famous Melody Presets
- Ode to Joy (Beethoven)
- Twinkle Twinkle Little Star
- Mary Had a Little Lamb
- Frère Jacques
- And more!

### 📊 Visual Analysis

#### Timeline Visualization
- Shows the melody as a timeline with note bars
- Marks the 1/3, 2/3, and golden ratio (0.618) positions
- Highlights the note occurring at the golden ratio point
- Color-codes notes, rests, and invalid tokens

#### Zipf's Law Chart
- Bar chart showing note frequency distribution
- Compares actual frequencies (blue bars) to ideal Zipf curve (red dashed line)
- Calculates R² fit score to measure how well the melody follows Zipf's Law
- Shows the most frequent note and its percentage

### 🔊 Audio Playback
- Real-time synthesis using Web Audio API
- Adjustable BPM (30-240)
- Simple sine wave synthesis with envelope shaping

## 🚀 Usage

1. **Open `index.html`** in a modern web browser
2. **Try the generators** or **select a famous melody** preset
3. **Click "Analyze"** to see the 3-part structure and Zipf distribution
4. **Click "Play"** to hear the melody
5. **Experiment** by editing the melody manually

## 📈 Understanding the Analysis

### 3-Part Phrasing Stats
- Shows how the melody is divided into thirds by event count
- Indicates which notes fall into Statement, Development, and Resolution sections

### Golden Ratio Analysis
- Identifies which note occurs at the 0.618 position
- Suggests placing your "peak" note near this marker for aesthetic appeal

### Zipf's Law Metrics
- **Unique notes**: Number of different notes used
- **Total notes**: Total number of note events (excluding rests)
- **Most frequent note**: The note that appears most often
- **Zipf fit (R²)**: How well the distribution matches ideal Zipf's Law
  - R² > 0.7: Strong Zipf pattern ✓
  - R² 0.4-0.7: Moderate Zipf pattern ~
  - R² < 0.4: Weak Zipf pattern ✗

## 🎓 Educational Insights

### Why 3-Part Phrasing?
This structure mirrors natural human perception and storytelling:
- **Beginning**: Set the scene
- **Middle**: Create tension and interest
- **End**: Provide resolution and closure

### Why Golden Ratio?
The golden ratio (φ) appears throughout nature and art. In music, placing the climax at ~61.8% creates:
- Asymmetric balance (not at the exact middle)
- Natural build-up and resolution
- Aesthetic satisfaction

### Why Zipf's Law?
Melodies that follow Zipf's Law:
- Have a clear tonal center (the most frequent note)
- Sound more "natural" and memorable
- Balance repetition with variety
- Are easier to sing and remember

## 🔧 Technical Details

- **Pure HTML/CSS/JavaScript** - No dependencies!
- **Modular structure** - JavaScript separated into `app.js`
- **Web Audio API** for synthesis
- **Canvas API** for visualizations
- **Algorithmic melody generation** using weighted random selection
- **Statistical analysis** (R² calculation for Zipf fit)

## 🎨 Note Format

```
C4          // C in octave 4 (middle C)
C4:2        // C for 2 beats
C#4         // C sharp
Db4         // D flat
R           // Rest (1 beat)
R:2         // Rest (2 beats)
```

## 📝 Example Melodies

### Simple Scale (Weak Zipf)
```
C4 D4 E4 F4 G4 A4 B4 C5
```

### Repetitive Theme (Strong Zipf)
```
C4 C4 C4 E4 C4 C4 G4 C4 E4 C4 F4 C4
```

### Complex with Golden Peak
```
C4:1 E4:1 G4:0.5 E4:0.5 F4:1 D4:1 E4:1 C4:1 D4:0.5 E4:0.5 F4:1 G4:1 A4:1.5 B4:0.5 C5:2 B4:1 A4:1 G4:1 F4:1 E4:0.5 D4:0.5 E4:1 C4:1 D4:1 C4:2
```

## 🌟 Try It!

Generate a random melody and observe:
1. How the 3 sections feel different
2. Where the golden ratio marker falls
3. Which notes dominate (Zipf's Law)
4. How the R² score reflects the melody's structure

## 📚 Further Reading

- [Golden Ratio in Music](https://en.wikipedia.org/wiki/Golden_ratio#Music)
- [Zipf's Law](https://en.wikipedia.org/wiki/Zipf%27s_law)
- [Musical Form](https://en.wikipedia.org/wiki/Musical_form)
- [Ternary Form](https://en.wikipedia.org/wiki/Ternary_form)

## 🤝 Contributing

Feel free to experiment with:
- Different melody generation algorithms
- Additional famous melody presets
- Enhanced visualization styles
- More sophisticated audio synthesis
- Integration with MIDI or other music APIs

---

**Made with ❤️ for music theory enthusiasts and data scientists alike!**
