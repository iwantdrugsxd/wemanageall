import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function Emotions() {
  const { user } = useAuth();
  const [view, setView] = useState('home'); // home, write, record, history
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showLockPrompt, setShowLockPrompt] = useState(false);
  const [newEntryId, setNewEntryId] = useState(null);
  const [showRelief, setShowRelief] = useState(false);
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [filter, setFilter] = useState('all'); // all, text, voice, locked
  const [showSaveMessage, setShowSaveMessage] = useState(false);

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [playingEntryId, setPlayingEntryId] = useState(null);

  useEffect(() => {
    // Always fetch entries when component mounts or filter changes
    fetchEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  useEffect(() => {
    // Refetch when returning to home view
    if (view === 'home') {
      fetchEntries();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const fetchEntries = async () => {
    try {
      let url = '/api/emotions';
      const params = new URLSearchParams();
      
      if (filter === 'text') {
        params.append('type', 'text');
      } else if (filter === 'voice') {
        params.append('type', 'voice');
      } else if (filter === 'locked') {
        params.append('locked', 'true');
      }
      
      if (params.toString()) {
        url += '?' + params.toString();
      }
      
      const response = await fetch(url, {
        credentials: 'include',
      });
      const data = await response.json();
      setEntries(data.entries || []);
    } catch (error) {
      console.error('Failed to fetch entries:', error);
    }
  };

  const handleSaveText = async () => {
    if (!content.trim()) return;
    
    setSaving(true);
    try {
      const response = await fetch('/api/emotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content: content,
          type: 'text',
          locked: false,
        }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      setSaved(true);
      setNewEntryId(data.entry.id);
      setContent('');
      setShowLockPrompt(true);
      // Show emotional success message
      setShowSaveMessage(true);
      setTimeout(() => setShowSaveMessage(false), 4000);
      // Refresh entries list
      fetchEntries();
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveVoice = async () => {
    if (!audioBlob || !user?.id) return;
    
    setSaving(true);
    try {
      // Upload audio to Supabase Storage
      const fileName = `${user.id}/${Date.now()}.webm`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('unload-recordings')
        .upload(fileName, audioBlob, {
          contentType: 'audio/webm',
        });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        if (uploadError.message.includes('Bucket not found')) {
          alert('Storage bucket not set up. Please run the Supabase setup SQL first.');
        }
        throw uploadError;
      }

      // Save entry to database via Express API
      // Store the file path, server will generate proper URL when fetching
      const response = await fetch('/api/emotions/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          audio_url: fileName, // Store file path, server will generate URL
          duration: recordingTime,
          transcript: null,
          locked: false,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to save recording';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      setSaved(true);
      setNewEntryId(data.entry.id);
      setAudioBlob(null);
      setAudioUrl(null);
      setRecordingTime(0);
      setShowLockPrompt(true);
      // Show emotional success message
      setShowSaveMessage(true);
      setTimeout(() => setShowSaveMessage(false), 4000);
      // Refresh entries list
      fetchEntries();
    } catch (error) {
      console.error('Failed to save recording:', error);
      alert('Failed to save recording. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLockEntry = async (entryId, lock) => {
    try {
      const response = await fetch(`/api/emotions/${entryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ locked: lock }),
      });
      
      if (!response.ok) throw new Error('Failed to update entry');
      
      if (lock) {
        setShowLockPrompt(false);
        setShowRelief(true);
      } else {
        setShowLockPrompt(false);
      }
      // Refresh entries list
      fetchEntries();
    } catch (error) {
      console.error('Failed to lock entry:', error);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    try {
      // Delete from database (server will handle storage cleanup)
      const response = await fetch(`/api/emotions/${entryId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      fetchEntries();
    } catch (error) {
      console.error('Failed to delete entry:', error);
    }
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);
      setSpeechRecognition(recognition);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')} MINUTES : ${secs.toString().padStart(2, '0')} SECONDS`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const day = date.getDate();
    const year = date.getFullYear();
    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase();
    return `${months[date.getMonth()]} ${day}, ${year} • ${time}`;
  };

  const formatTimeOnly = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const getWordCount = (text) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getHumanTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    
    if (diffMins < 1) return `Just now • ${time}`;
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago • ${time}`;
    if (diffHours < 24) {
      if (diffHours === 1) return `An hour ago • ${time}`;
      return `${diffHours} hours ago • ${time}`;
    }
    if (diffDays === 1) return `Yesterday • ${time}`;
    if (diffDays === 2) return `Two days ago • ${time}`;
    if (diffDays < 7) return `${diffDays} days ago • ${time}`;
    if (diffDays < 14) return `Last week • ${time}`;
    
    // Fallback to formatted date for older entries
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${day} • ${time}`;
  };

  // HOME SCREEN
  if (view === 'home' && !showHistory) {
    return (
      <div className="min-h-screen" style={{
        background: 'linear-gradient(to bottom, #FAFAF8 0%, #F2F5F3 100%)'
      }}>
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-h2 text-gray-900 mb-4">
              You don't need to be <span className="italic text-[#3B6E5C]">okay</span> here.
            </h1>
            <p className="text-body text-gray-600 max-w-xl mx-auto">
              This is your private space to let things out. No judgment, no audience.
            </p>
          </div>

          {/* Message Dialog Box */}
          <div className="max-w-3xl mx-auto mb-12">
            <div className="bg-white rounded-2xl border border-[#ECEFF1] shadow-[0_4px_16px_rgba(0,0,0,0.06)] overflow-hidden">
              {/* Text Area or Recording Preview */}
              <div className="relative">
                {audioUrl && !isRecording ? (
                  // Show audio preview after recording
                  <div className="px-6 py-5">
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-3">Recording preview</p>
                      <audio controls src={audioUrl} className="w-full h-10 mb-3" />
                      
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleSaveVoice}
                          disabled={saving}
                          className="px-5 py-2.5 bg-[#1F2933] text-white rounded-lg hover:bg-[#2d3d4d] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium shadow-sm"
                        >
                          {saving ? 'Saving...' : 'Save Recording'}
                        </button>
                        <button
                          onClick={() => {
                            setAudioUrl(null);
                            setAudioBlob(null);
                            setRecordingTime(0);
                          }}
                          className="px-5 py-2.5 bg-white border border-[#ECEFF1] text-[#1F2933] rounded-lg hover:bg-[#FAFAFA] transition-all text-sm font-medium"
                        >
                          Record Again
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="What's on your mind? Let it out here..."
                      className="w-full px-6 py-5 pr-16 min-h-[200px] max-h-[400px] resize-none border-0 focus:outline-none focus:ring-0 text-gray-900 placeholder:text-gray-400 text-lg leading-relaxed font-sans"
                      style={{
                        fontFamily: 'inherit'
                      }}
                    />
                    
                    {/* Action Buttons (ChatGPT style) */}
                    <div className="absolute bottom-4 right-4 flex items-center gap-3">
                      {isRecording ? (
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full border text-black">
                            <div className="w-2 h-2 bg-gray-1000 rounded-full animate-pulse"></div>
                            <span className="text-black text-sm font-medium">
                              {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                            </span>
                          </div>
                          <button
                            onClick={handleStopRecording}
                            className="w-10 h-10 bg-gray-1000 text-white rounded-full flex items-center justify-center hover:text-black transition-colors shadow-lg"
                            title="Stop recording"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <rect x="6" y="6" width="8" height="8" rx="1" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <>
                          {content.trim() && (
                            <button
                              onClick={handleSaveText}
                              disabled={saving || !content.trim()}
                              className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-semibold shadow-md"
                            >
                              {saving ? 'Saving...' : 'Save'}
                            </button>
                          )}
                          <button
                            onClick={handleStartRecording}
                            className="w-10 h-10 bg-[#1F2933] text-white rounded-full flex items-center justify-center hover:bg-[#2d3d4d] transition-all shadow-lg group"
                            title="Record voice message"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
              
              {/* Divider */}
              <div className="h-px bg-[#ECEFF1]"></div>
              
              {/* Footer with Privacy */}
              <div className="px-6 py-4 bg-[#FAFAFA] flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Private by design</span>
                </div>
                <div className="text-xs text-gray-600">
                  Nothing here is shared or analyzed
                </div>
              </div>
            </div>
          </div>

          {/* Recent Unloads Section */}
          {entries.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-h3 text-gray-900">Recent Unloads</h2>
                <button
                  onClick={() => {
                    setShowHistory(true);
                    setView('home');
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors text-sm font-semibold flex items-center gap-2"
                >
                  View all
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Recent Entries List */}
              <div className="space-y-4">
                {entries.slice(0, 5).map((entry) => {
                  const isPlaying = playingEntryId === entry.id;
                  return (
                    <div 
                      key={entry.id} 
                      className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all relative group"
                    >
                      {/* Left indicator */}
                      <div 
                        className={`absolute left-0 top-0 bottom-0 w-2 rounded-l-xl ${
                          entry.type === 'text' ? 'bg-blue-400' : 'bg-green-400'
                        }`}
                      ></div>
                      
                      <div className="flex items-start gap-4 pl-4">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-1">
                          {entry.type === 'text' ? (
                            <div className="text-3xl">📄</div>
                          ) : isPlaying ? (
                            <div className="text-3xl">🔊</div>
                          ) : (
                            <div className="text-3xl">🎙️</div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {isPlaying && entry.type === 'voice' ? (
                            <div>
                              <p className="text-gray-900 font-semibold mb-3 text-lg">Listening to: {entry.transcript || entry.content || 'Voice Entry'}</p>
                              {entry.audio_url && (
                                <div className="mb-2">
                                  <audio 
                                    controls 
                                    src={entry.audio_url} 
                                    className="w-full h-10"
                                    onPlay={() => setPlayingEntryId(entry.id)}
                                    onEnded={() => setPlayingEntryId(null)}
                                    onPause={() => setPlayingEntryId(null)}
                                    onError={(e) => {
                                      console.error('Audio playback error:', e);
                                      console.error('Audio URL:', entry.audio_url);
                                      setPlayingEntryId(null);
                                      const errorMsg = e.target?.error?.message || 'Unknown error';
                                      alert(`Unable to play audio: ${errorMsg}. Please check the console for details.`);
                                    }}
                                    preload="metadata"
                                    crossOrigin="anonymous"
                                  >
                                    <source src={entry.audio_url} type="audio/webm" />
                                    <source src={entry.audio_url} type="audio/mpeg" />
                                    Your browser does not support the audio element.
                                  </audio>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <p className="text-h6 text-gray-900">
                                  {entry.type === 'text' 
                                    ? `Written Entry (~${getWordCount(entry.content)} words)`
                                    : `Voice Entry (${Math.floor((entry.duration || 0) / 60)}:${((entry.duration || 0) % 60).toString().padStart(2, '0')})`
                                  }
                                </p>
                                {entry.locked && (
                                  <span className="text-gray-500 text-sm">🔒</span>
                                )}
                              </div>
                              {/* Voice entries are audio-only now; no transcript snippet shown */}
                              {entry.type === 'text' && entry.content && (
                                <p className="text-body-sm text-gray-800 mb-3 line-clamp-3">
                                  {entry.content}
                                </p>
                              )}
                              <p className="text-caption text-gray-600">{getHumanTime(entry.created_at)}</p>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {entry.type === 'voice' && !isPlaying && entry.audio_url ? (
                            <button
                              onClick={async () => {
                                setPlayingEntryId(entry.id);
                                setTimeout(() => {
                                  const audioElements = document.querySelectorAll('audio');
                                  const targetAudio = Array.from(audioElements).find(
                                    el => el.src === entry.audio_url || el.src.includes(entry.audio_url.split('/').pop())
                                  );
                                  if (targetAudio) {
                                    targetAudio.play().catch(err => {
                                      console.error('Error playing audio:', err);
                                      alert('Unable to play audio. The file may be corrupted or inaccessible.');
                                      setPlayingEntryId(null);
                                    });
                                  }
                                }, 100);
                              }}
                              className="px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 hover:shadow-md transition-all text-body-sm font-semibold"
                            >
                              ▶ Play
                            </button>
                          ) : entry.type === 'text' ? (
                            <button
                              onClick={() => {
                                setSelectedEntry(entry);
                                setView('read');
                              }}
                              className="px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 hover:shadow-md transition-all text-body-sm font-semibold"
                            >
                              Read
                            </button>
                          ) : null}
                          <button
                            onClick={() => {
                              if (confirm('Delete this entry?')) {
                                handleDeleteEntry(entry.id);
                              }
                            }}
                            className="p-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {entries.length > 5 && (
                <div className="mt-8 text-center">
                  <button
                    onClick={() => {
                      setShowHistory(true);
                      setView('home');
                    }}
                    className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-semibold shadow-md"
                  >
                    View all {entries.length} entries →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {entries.length === 0 && (
            <div className="mt-16 text-center max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl p-12 border border-gray-200 shadow-sm">
                <div className="text-6xl mb-6">📝</div>
                <h3 className="text-2xl font-medium text-gray-900 mb-3">No entries yet</h3>
                <p className="text-gray-600 text-lg mb-6">Start by writing or recording your thoughts.</p>
                <p className="text-sm text-gray-500">Your entries will appear here once you save them.</p>
              </div>
            </div>
          )}

          {/* Emotional Success Message */}
          {showSaveMessage && (
            <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-full px-6 py-3 shadow-lg border border-gray-300 z-50 animate-fade-in-up">
              <p className="text-[#1F2933] text-sm font-medium">
                You don't have to carry this alone here.
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-20 pt-8 border-t border-gray-300 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 italic text-sm">
              "The weight of words decreases once they are outside."
            </p>
            <div className="flex items-center gap-6 text-sm">
              <a href="#" className="text-gray-600 hover:text-black transition-colors">SUPPORT</a>
              <a href="#" className="text-gray-600 hover:text-black transition-colors">DATA PRIVACY</a>
              <a href="#" className="text-gray-600 hover:text-black transition-colors">TERMS</a>
            </div>
          </div>
        </div>

        {/* Floating Action Button - Gentler */}
        <button
          className="fixed bottom-8 right-8 w-12 h-12 bg-white text-black rounded-full border border-gray-300 hover:shadow-md transition-all flex items-center justify-center text-xl z-50 opacity-80 hover:opacity-100"
          title="Settings"
          style={{
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}
        >
          🌙
        </button>
      </div>
    );
  }

  // TEXT UNLOAD SCREEN
  if (view === 'write') {
    return (
      <div className="min-h-screen bg-black/10 py-12">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          {/* Top Microcopy */}
          <div className="mb-8 text-center">
            <p className="text-lg text-gray-600 italic">
              You can write nonsense here.<br />
              You don't need to sound strong.
            </p>
          </div>

          {/* Writing Area */}
          <div className="bg-white rounded-3xl p-12 border border-gray-300 mb-8 min-h-[500px]">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder=""
              className="w-full h-full min-h-[400px] bg-transparent border-none resize-none focus:outline-none text-black text-xl leading-relaxed placeholder:text-gray-500"
              autoFocus
            />
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleSaveText}
              disabled={!content.trim() || saving}
              className="px-8 py-3 bg-black text-ofa-cream rounded-xl hover:bg-black disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => {
                if (content.trim()) {
                  handleSaveText().then(() => {
                    setShowLockPrompt(true);
                    setIsLocked(true);
                  });
                }
              }}
              className="px-8 py-3 bg-white border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
            >
              Lock this
            </button>
            <button
              onClick={() => {
                setView('home');
                setContent('');
              }}
              className="px-8 py-3 bg-white border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
            >
              Discard
            </button>
          </div>

          {/* After Save Feedback */}
          {saved && !showLockPrompt && (
            <div className="mt-12 text-center">
              <p className="text-xl text-black mb-6 leading-relaxed">
                Thanks for letting that out.<br />
                You don't have to carry it alone here.
              </p>
              <button
                onClick={() => {
                  setView('home');
                  setSaved(false);
                }}
                className="px-8 py-3 bg-black text-white rounded-xl hover:bg-black/90 transition-colors"
              >
                Back to Unload
              </button>
            </div>
          )}

          {/* Lock Prompt */}
          {showLockPrompt && newEntryId && (
            <div className="mt-12 text-center">
              <p className="text-lg text-gray-600 mb-6">Want to lock this entry?</p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => handleLockEntry(newEntryId, true)}
                  className="px-8 py-3 bg-black text-ofa-cream rounded-xl hover:bg-black transition-colors"
                >
                  Lock it
                </button>
                <button
                  onClick={() => {
                    setShowLockPrompt(false);
                    setShowRelief(true);
                  }}
                  className="px-8 py-3 bg-white border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Leave it unlocked
                </button>
              </div>
            </div>
          )}

          {/* Relief Tools */}
          {showRelief && (
            <div className="mt-12 text-center">
              <p className="text-lg text-gray-600 mb-6">Want a small moment before you move on?</p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <button
                  onClick={() => {
                    setShowRelief(false);
                    setView('home');
                  }}
                  className="px-6 py-2 bg-black/10 text-black rounded-xl hover:bg-black/20 transition-colors"
                >
                  Take 30 seconds
                </button>
                <button
                  onClick={() => {
                    setView('write');
                    setShowRelief(false);
                  }}
                  className="px-6 py-2 bg-black/10 text-black rounded-xl hover:bg-black/20 transition-colors"
                >
                  Write one more line
                </button>
                <button
                  onClick={() => {
                    setShowRelief(false);
                    setView('home');
                  }}
                  className="px-6 py-2 bg-white border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  I'm good
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // VOICE UNLOAD SCREEN - Before Recording
  if (view === 'record' && !isRecording && !audioUrl) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ofa-ink/95 to-ofa-charcoal flex items-center justify-center px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-7xl mb-8">🎙️</div>
          <h2 className="font-display text-4xl text-white mb-6">Say it out loud</h2>
          <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed">
            Sometimes talking is easier than typing.<br />
            This space is private.
          </p>
          <button
            onClick={handleStartRecording}
            className="px-12 py-4 bg-black text-ofa-cream rounded-xl hover:bg-black transition-colors text-lg"
          >
            Start recording
          </button>
        </div>
      </div>
    );
  }

  // VOICE UNLOAD SCREEN - Recording State
  if (view === 'record' && isRecording) {
    const minutes = Math.floor(recordingTime / 60);
    const seconds = recordingTime % 60;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900/90 to-red-950 flex items-center justify-center px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="mb-12">
            <h2 className="font-display text-5xl text-white mb-4">I'm listening.</h2>
            <p className="text-xl text-white/80">Sometimes talking is easier than typing.</p>
          </div>

          {/* Microphone with LIVE badge */}
          <div className="relative mb-12">
            <div className="relative w-48 h-48 mx-auto">
              <div className="absolute inset-0 rounded-full bg-gray-1000/20 animate-ping"></div>
              <div className="absolute inset-0 rounded-full bg-gray-1000/30 animate-pulse"></div>
              <div className="relative w-48 h-48 rounded-full bg-gray-1000/40 flex items-center justify-center">
                <div className="text-6xl">🎙️</div>
              </div>
              <div className="absolute -top-2 -right-2 bg-gray-1000 text-white px-3 py-1 rounded-full text-sm font-bold">
                LIVE
              </div>
            </div>
          </div>

          {/* Timer */}
          <div className="mb-12">
            <div className="flex items-center justify-center gap-2">
              <div className="text-black/50 rounded-xl px-6 py-4 border text-black/50">
                <div className="text-4xl font-mono text-white">{minutes.toString().padStart(2, '0')}</div>
                <div className="text-sm text-white/70 mt-1">MINUTES</div>
              </div>
              <div className="text-black text-4xl font-bold">:</div>
              <div className="text-black/50 rounded-xl px-6 py-4 border text-black/50">
                <div className="text-4xl font-mono text-white">{seconds.toString().padStart(2, '0')}</div>
                <div className="text-sm text-white/70 mt-1">SECONDS</div>
              </div>
            </div>
          </div>

          {/* Stop Button */}
          <button
            onClick={handleStopRecording}
            className="px-12 py-4 bg-gray-1000 text-white rounded-xl hover:text-black transition-colors text-lg flex items-center gap-3 mx-auto"
          >
            <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
              <div className="w-3 h-3 bg-gray-1000 rounded-sm"></div>
            </div>
            <span>Stop Recording</span>
          </button>

          {/* Footer */}
          <div className="mt-16 text-left text-white/60 text-sm">
            <p>Your recording is encrypted and private.</p>
            <p>Quiet Room Atmosphere Active. Version 2.0.4</p>
          </div>
        </div>
      </div>
    );
  }

  // VOICE UNLOAD SCREEN - After Recording Preview
  if (view === 'record' && audioUrl && !isRecording) {
    return (
      <div className="min-h-screen bg-black/10 py-12">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 border border-gray-300 mb-8">
            <div className="text-center mb-6">
              <p className="text-sm text-gray-500 mb-2">
                Recorded — {formatDate(new Date().toISOString())} {formatTimeOnly(new Date().toISOString())}
              </p>
              <audio controls src={audioUrl} className="w-full max-w-md mx-auto" />
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleSaveVoice}
              disabled={saving}
              className="px-8 py-3 bg-black text-ofa-cream rounded-xl hover:bg-black disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Save recording'}
            </button>
            <button
              onClick={() => {
                setAudioUrl(null);
                setAudioBlob(null);
                setRecordingTime(0);
              }}
              className="px-8 py-3 bg-white border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
            >
              Record again
            </button>
            <button
              onClick={() => {
                setView('home');
                setAudioUrl(null);
                setAudioBlob(null);
              }}
              className="px-8 py-3 bg-white border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
            >
              Discard
            </button>
          </div>

          {/* After Save Feedback */}
          {saved && (
            <div className="mt-12 text-center">
              <p className="text-xl text-black mb-6 leading-relaxed">
                You don't have to solve this today.<br />
                You already did something brave — you let it out.
              </p>
              <button
                onClick={() => {
                  setView('home');
                  setSaved(false);
                }}
                className="px-8 py-3 bg-black text-white rounded-xl hover:bg-black/90 transition-colors"
              >
                Back to Unload
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // READ ENTRY VIEW (for text entries)
  if (view === 'read' && selectedEntry && selectedEntry.type === 'text') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8 md:py-12">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => {
                setSelectedEntry(null);
                setView('home');
              }}
              className="text-body-sm text-gray-600 hover:text-gray-900 transition-colors mb-6 flex items-center gap-2 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Unload
            </button>
            <div className="flex items-start justify-between mb-8 pb-6 border-b border-gray-200">
              <div className="flex-1">
                <h1 className="text-h3 text-gray-900 mb-3">Written Entry</h1>
                <div className="flex items-center gap-4 flex-wrap">
                  <p className="text-caption text-gray-600">
                    {formatDate(selectedEntry.created_at)}
                  </p>
                  <span className="text-gray-300">•</span>
                  <p className="text-caption text-gray-600">
                    {getWordCount(selectedEntry.content)} words
                  </p>
                  {selectedEntry.locked && (
                    <>
                      <span className="text-gray-300">•</span>
                      <div className="flex items-center gap-2 text-caption text-gray-600">
                        <span>🔒</span>
                        <span>Locked</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content Card */}
          <div className="bg-white rounded-2xl p-8 md:p-12 border-2 border-gray-200 shadow-lg mb-8">
            <div className="prose prose-lg max-w-none">
              <div className="text-body whitespace-pre-wrap text-gray-900 leading-relaxed">
                {selectedEntry.content}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between flex-wrap gap-4 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-3">
              {!selectedEntry.locked ? (
                <button
                  onClick={() => handleLockEntry(selectedEntry.id, true)}
                  className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-body-sm font-semibold flex items-center gap-2 shadow-md"
                >
                  <span>🔒</span>
                  <span>Lock Entry</span>
                </button>
              ) : (
                <button
                  onClick={() => handleLockEntry(selectedEntry.id, false)}
                  className="px-6 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors text-body-sm font-semibold flex items-center gap-2 border-2 border-gray-300"
                >
                  <span>🔓</span>
                  <span>Unlock Entry</span>
                </button>
              )}
            </div>
            <button
              onClick={() => {
                if (confirm('Delete this entry? This action cannot be undone.')) {
                  handleDeleteEntry(selectedEntry.id);
                  setSelectedEntry(null);
                  setView('home');
                }
              }}
              className="px-6 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-body-sm font-semibold flex items-center gap-2 border-2 border-red-200"
            >
              <span>🗑️</span>
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // HISTORY VIEW
  if (showHistory) {
    const filteredEntries = entries.filter(entry => {
      if (filter === 'all') return true;
      if (filter === 'text') return entry.type === 'text';
      if (filter === 'voice') return entry.type === 'voice';
      if (filter === 'locked') return entry.locked === true;
      return true;
    });

    return (
      <div className="min-h-screen bg-gradient-to-br from-ofa-ink/95 to-ofa-charcoal" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }}>
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => {
                setShowHistory(false);
                setView('home');
              }}
              className="text-white/80 hover:text-white transition-colors mb-4 text-sm"
            >
              ← Back to Unload
            </button>
            <h2 className="font-display text-4xl text-white mb-2">Unload History</h2>
            <p className="text-white/60">A calm space for your past reflections.</p>
            <div className="mt-4">
              <button
                onClick={() => setView('home')}
                className="px-6 py-2 bg-black text-white rounded-xl hover:bg-black/90 transition-colors text-sm"
              >
                + New Unload
              </button>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-3 mb-8 flex-wrap">
            {[
              { id: 'all', label: 'All Entries', icon: '📋' },
              { id: 'text', label: 'Text', icon: '✍️' },
              { id: 'voice', label: 'Voice', icon: '🎙️' },
              { id: 'locked', label: 'Locked', icon: '🔒' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-4 py-2 rounded-xl transition-colors text-sm flex items-center gap-2 ${
                  filter === f.id
                    ? 'bg-black text-white'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                <span>{f.icon}</span>
                <span>{f.label}</span>
              </button>
            ))}
          </div>

          {/* Entries List */}
          <div className="space-y-4">
            {filteredEntries.length === 0 ? (
              <div className="bg-white/10 rounded-3xl p-12 border border-white/20 text-center">
                <p className="text-white/60">No entries found.</p>
              </div>
            ) : (
              filteredEntries.map((entry) => (
                <div key={entry.id} className="bg-white/10 rounded-3xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm text-white/60">
                        🗓️ {formatDate(entry.created_at)} — {formatTimeOnly(entry.created_at)}
                      </span>
                      {entry.type === 'text' ? (
                        <span className="text-sm text-white/80 flex items-center gap-1">
                          <span>✍️</span>
                          <span>Text entry</span>
                        </span>
                      ) : (
                        <span className="text-sm text-white/80 flex items-center gap-1">
                          <span>🎙️</span>
                          <span>Voice entry</span>
                          {entry.duration && (
                            <span className="text-white/60 ml-1">
                              ({Math.floor(entry.duration / 60)}:{(entry.duration % 60).toString().padStart(2, '0')})
                            </span>
                          )}
                        </span>
                      )}
                      {entry.locked && (
                        <span className="text-sm text-white/80 flex items-center gap-1">
                          <span>🔒</span>
                          <span>Locked Entry</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {entry.locked ? (
                          <button
                            onClick={() => {
                              if (confirm('This entry is locked. Confirm to open.')) {
                                setSelectedEntry(entry);
                                setView(entry.type === 'text' ? 'read' : 'home');
                              }
                            }}
                            className="px-4 py-2 bg-black text-white rounded-xl hover:bg-black/90 transition-colors text-sm"
                          >
                            Unlock & View
                          </button>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setSelectedEntry(entry);
                              setView(entry.type === 'text' ? 'read' : 'home');
                            }}
                            className="px-4 py-2 bg-black text-white rounded-xl hover:bg-black/90 transition-colors text-sm"
                          >
                            {entry.type === 'text' ? 'Read Entry' : 'Open Entry'}
                          </button>
                          <button
                            onClick={() => handleLockEntry(entry.id, true)}
                            className="p-2 text-white/60 hover:text-white transition-colors"
                            title="Lock"
                          >
                            🔒
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => {
                          if (confirm('Delete this entry?')) {
                            handleDeleteEntry(entry.id);
                          }
                        }}
                        className="p-2 text-white/60 hover:text-black transition-colors"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {entry.locked ? (
                    <div className="text-center py-8">
                      <div className="text-5xl mb-4">🔒</div>
                      <p className="text-white/60">Content is encrypted</p>
                    </div>
                  ) : (
                    <div className="mt-4">
                      {entry.type === 'text' ? (
                        <div>
                          <p className="text-white/80 line-clamp-3 mb-2">
                            {entry.content}
                          </p>
                          <button
                            onClick={() => {
                              setSelectedEntry(entry);
                              setView('read');
                            }}
                            className="text-white/60 hover:text-white text-sm underline"
                          >
                            Read full entry →
                          </button>
                        </div>
                      ) : (
                        <div className="mt-2 space-y-3">
                          {entry.audio_url ? (
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                              <audio controls src={entry.audio_url} className="w-full" />
                              {entry.duration && (
                                <p className="text-white/60 text-xs mt-2">
                                  Duration: {Math.floor(entry.duration / 60)}:{(entry.duration % 60).toString().padStart(2, '0')}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-white/60 text-sm">Audio file not available</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {filteredEntries.length > 5 && (
            <div className="mt-8 text-center">
              <button className="text-white/60 hover:text-white transition-colors text-sm flex items-center gap-2 mx-auto">
                <span>Show more entries</span>
                <span>↓</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
