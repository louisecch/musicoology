# Apple Music API Setup Guide

## Overview

The app now supports searching Apple Music and analyzing song previews using your Apple Music API key.

## How to Get Your Apple Music API Key

### Step 1: Apple Developer Account
1. Go to [developer.apple.com](https://developer.apple.com/)
2. Sign in with your Apple ID
3. Enroll in the Apple Developer Program (if not already enrolled)

### Step 2: Create MusicKit Identifier
1. Navigate to **Certificates, Identifiers & Profiles**
2. Click **Identifiers** → **+** (plus button)
3. Select **Music IDs** → Continue
4. Enter a description (e.g., "Melody Analysis App")
5. Click **Continue** → **Register**

### Step 3: Create a MusicKit Key
1. Go to **Keys** section
2. Click **+** (plus button)
3. Enter a key name (e.g., "Melody Analysis Key")
4. Check **MusicKit**
5. Click **Continue** → **Register**
6. **Download the .p8 key file** (you can only download once!)

### Step 4: Generate Developer Token
You need to create a JWT (JSON Web Token) using:
- Your **Team ID** (found in your account)
- Your **Key ID** (from the key you created)
- Your **Private Key** (.p8 file)

**Option A: Use Apple's Token Generator Tool**
- Use Apple's official MusicKit token generator
- Or use the Swift/Node.js examples in Apple's documentation

**Option B: Use Online JWT Generator**
1. Go to [jwt.io](https://jwt.io)
2. Use algorithm: ES256
3. Add payload:
```json
{
  "iss": "YOUR_TEAM_ID",
  "iat": 1234567890,
  "exp": 1234567890
}
```
4. Add your private key
5. Generate token

### Step 5: Add Your Token to the App

1. Open `config.js` in this directory
2. Replace `YOUR_APPLE_MUSIC_DEVELOPER_TOKEN_HERE` with your actual token:

```javascript
const CONFIG = {
  APPLE_MUSIC_API_KEY: "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9..."
};
```

3. Save the file
4. Refresh the app in your browser

## Using the App

### Search for Songs
1. Enter a song name in the "Search Apple Music" field
2. Click **Search**
3. Browse results
4. Click **Analyze Preview** on any song
5. The app will:
   - Download the 30-second preview
   - Detect pitches using autocorrelation
   - Extract melody notes
   - Analyze Zipf's Law and Entropy

### Example Searches
- "Canon in D Pachelbel"
- "Twinkle Twinkle Little Star"
- "Beethoven Symphony No 5"
- "Mozart Eine Kleine Nachtmusik"

## Important Notes

### Preview Limitations
- **30 seconds only**: Apple Music previews are limited
- **Quality**: Previews are lower quality than full tracks
- **Availability**: Not all songs have previews
- **Monophonic works best**: Complex polyphonic music is harder to analyze

### CORS Issues
Apple Music preview URLs should work without CORS issues, but if you encounter problems:
- The app runs client-side, so some restrictions may apply
- Consider running a local server instead of opening the file directly

### Rate Limits
- Apple Music API has rate limits
- Don't make too many requests in quick succession
- Cache results when possible

## Troubleshooting

### "Error: API Error: 401"
- Your token is invalid or expired
- Regenerate your developer token
- Make sure you're using the correct Team ID and Key ID

### "Error: API Error: 403"
- Your token doesn't have MusicKit permissions
- Make sure you selected MusicKit when creating the key
- Verify your Apple Developer Program enrollment

### "No preview available"
- Not all songs have preview URLs
- Try a different song or version

### "No clear melody detected"
- The song might be too complex (multiple instruments)
- Try a simpler, monophonic recording
- Adjust the pitch detection threshold (requires code modification)

## Alternative: Use Your Own Audio Files

If you have your own Apple Music subscription:
1. **Download songs** (via Apple Music app)
2. **Convert to MP3/WAV** if needed
3. **Upload via "Upload Audio File"** button
4. Analyze directly without API

## Security Note

**DO NOT commit your API key to public repositories!**

Add `config.js` to `.gitignore`:
```
echo "config.js" >> .gitignore
```

Or use environment variables in production.

## Resources

- [Apple Music API Documentation](https://developer.apple.com/documentation/applemusicapi)
- [MusicKit Documentation](https://developer.apple.com/documentation/musickit)
- [JWT Token Generation](https://developer.apple.com/documentation/applemusicapi/generating_developer_tokens)

---

**Ready to analyze real songs from Apple Music! 🎵**
