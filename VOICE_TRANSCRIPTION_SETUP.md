# Voice Transcription Setup Guide

## Overview

This feature uses **OpenAI Whisper** to automatically transcribe voice recordings into text with high accuracy (93-97%).

## Setup Steps

### 1. Add OpenAI API Key

Add your OpenAI API key to your `.env` file:

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

Get your API key from: https://platform.openai.com/api-keys

### 2. Run Database Migration

Run the migration to add the `transcript` field to the `unload_entries` table:

**For Supabase:**
1. Go to your Supabase SQL Editor
2. Run the SQL from `server/db/migrate_add_transcript.sql`

**For Local PostgreSQL:**
```bash
psql -U postgres -d ofa_db -f server/db/migrate_add_transcript.sql
```

### 3. Install Dependencies

The OpenAI package is already in `package.json`. If you need to reinstall:

```bash
npm install
```

### 4. Test the Feature

1. Navigate to `/emotions` (Unload page)
2. Click the microphone button to start recording
3. Speak your worries/thoughts
4. Stop recording
5. The system will automatically transcribe your audio
6. You'll see the transcribed text before saving
7. Click "Save Recording" to save both audio and transcript

## How It Works

### Flow

```
User records voice
   ↓
Audio saved to Supabase Storage
   ↓
Frontend calls /api/emotions/transcribe
   ↓
Backend downloads audio from Supabase
   ↓
OpenAI Whisper transcribes audio
   ↓
Text is cleaned and returned
   ↓
Frontend shows transcript preview
   ↓
User saves → Both audio and transcript saved to database
```

### Features

- **Automatic Transcription**: Happens automatically after recording stops
- **High Accuracy**: Uses OpenAI Whisper (93-97% accuracy)
- **Text Preview**: See transcribed text before saving
- **Both Saved**: Audio file and transcript are both saved
- **Searchable**: Transcripts are stored in database for future search

### API Endpoints

- **POST `/api/emotions/transcribe`**: Transcribe audio file
  - Body: `{ audio_url: string }`
  - Returns: `{ success: true, transcript: string }`

- **POST `/api/emotions/voice`**: Save voice entry with transcript
  - Body: `{ audio_url: string, duration: number, transcript: string, locked: boolean }`
  - Returns: `{ success: true, entry: {...} }`

## Database Schema

The `unload_entries` table now includes:

```sql
transcript TEXT  -- Transcribed text from voice recordings
```

## Cost Considerations

- OpenAI Whisper API pricing: ~$0.006 per minute of audio
- Example: 5 minutes of audio = ~$0.03
- Consider implementing rate limiting for production

## Privacy

- Audio files are stored in Supabase Storage (private bucket)
- Transcripts are stored in your database
- Users can delete both audio and transcript
- All data is user-specific and private

## Troubleshooting

### "OpenAI API key not configured"
- Make sure `OPENAI_API_KEY` is in your `.env` file
- Restart your server after adding the key

### "Failed to download audio file"
- Check Supabase storage bucket permissions
- Verify the audio URL is accessible

### "Failed to transcribe audio"
- Check your OpenAI API key is valid
- Verify you have credits in your OpenAI account
- Check audio file format (should be webm/wav)

### Transcription not showing
- Check browser console for errors
- Verify the transcript field was added to database
- Check network tab for API responses

## Future Enhancements

- [ ] Support for multiple languages
- [ ] Edit transcript before saving
- [ ] Search transcripts
- [ ] Export transcripts
- [ ] Batch transcription for old recordings





