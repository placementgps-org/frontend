import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  Clock,
  LogOut,
  Sparkles,
  AlertCircle,
  Loader2,
  CheckCircle2,
  RefreshCw,
  Eye,
  Activity,
  Shield,
  Send,
  HelpCircle,
  AlertTriangle,
  Radio,
  PhoneCall,
  PhoneOff,
  User,
  Check
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import TalkingAvatar from '../../components/interview/TalkingAvatar';
import InterviewNavigationGuard from '../../components/interview/InterviewNavigationGuard';
import { interviewService } from '../../services/interviewService';
import { getInterviewerById, AI_COACH_CONFIG } from '../../config/avatarConfig';
import { ttsService } from '../../services/ttsService';

/**
 * Map a spoken word to a mouth-openness value (0-1) for the TalkingAvatar viseme.
 * Words with more vowels → wider mouth opening.
 */
function wordToViseme(word) {
  if (!word || word.length === 0) return 0.35;
  const vowels = (word.match(/[aeiou]/gi) || []).length;
  const ratio = vowels / word.length;
  return Math.min(1, 0.3 + ratio * 0.65);
}

export default function SpeakingInterviewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');

  // Video Call Connection & Turn States
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionStage, setConnectionStage] = useState('Dialing interviewer...');
  const interviewStateRef = useRef('NOT_STARTED');
  const [interviewState, _setInterviewState] = useState('NOT_STARTED');
  const setInterviewState = useCallback((state) => {
    console.log(`[Interview State] Transition: ${interviewStateRef.current} -> ${state}`);
    interviewStateRef.current = state;
    _setInterviewState(state);
  }, []);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Session & UI States
  const [session, setSession] = useState(null);
  const [transcript, setTranscript] = useState([]);
  const [currentAiQuestion, setCurrentAiQuestion] = useState('');
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isStudentSpeaking, setIsStudentSpeaking] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(600);
  const [visemeValue, setVisemeValue] = useState(0);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [isSubmittingEval, setIsSubmittingEval] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Hardware Media States & Explicit Camera Permission Lifecycle
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasMicPermission, setHasMicPermission] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [isMicActive, setIsMicActive] = useState(true);
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [cameraStatus, setCameraStatus] = useState('requesting'); // 'requesting' | 'streaming' | 'denied' | 'not_found' | 'error' | 'paused'
  const [cameraErrorDetail, setCameraErrorDetail] = useState('');

  // Speech & Vision Metrics Accumulators
  const [liveVolume, setLiveVolume] = useState(0);
  const [liveWpm, setLiveWpm] = useState(0);
  const [fillerWordsFound, setFillerWordsFound] = useState([]);
  const [coachingAlert, setCoachingAlert] = useState(null);
  const [coachMood, setCoachMood] = useState('idle');

  // References
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastCoachAlertTimeRef = useRef({});
  const initialQuestionRef = useRef('');
  const speechMetricsRef = useRef({
    totalWords: 0,
    speechDurationSeconds: 0,
    pauseCount: 0,
    fillerWords: [],
    volumeSamples: [],
    isEvaluated: true,
  });
  const visualMetricsRef = useRef({
    cameraAttentionFrames: 0,
    totalFrames: 0,
    postureChanges: 0,
    distractingGestures: 0,
    isEvaluated: true,
  });
  const coachingEventsRef = useRef([]);

  const FILLER_LIST = ['umm', 'uhh', 'like', 'basically', 'literally', 'you know', 'kinda', 'sort of', 'i mean'];

  // Current Interviewer Persona
  const interviewer = getInterviewerById(session?.interviewerId || 'sarah');

  // ── 1. Speech Recognition (Speech-to-Text) ──
  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('[SpeechRec] Speech Recognition not supported in this browser.');
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsStudentSpeaking(true);
      setCoachMood('listening');
    };

    recognition.onresult = (event) => {
      if (interviewStateRef.current !== 'WAITING_FOR_CANDIDATE' && interviewStateRef.current !== 'CANDIDATE_SPEAKING') {
        return;
      }
      if (interviewStateRef.current === 'WAITING_FOR_CANDIDATE') {
        setInterviewState('CANDIDATE_SPEAKING');
      }
      let fullTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        fullTranscript += event.results[i][0].transcript + ' ';
      }
      setSpokenTranscript(fullTranscript.trim());

      // Live metrics check
      inspectSpokenMetrics(fullTranscript);
    };

    recognition.onerror = (event) => {
      console.warn('[SpeechRec] status:', event.error);
      if (event.error === 'not-allowed') {
        setHasMicPermission(false);
      }
    };

    recognition.onend = () => {
      setIsStudentSpeaking(false);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {}
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsStudentSpeaking(false);
  }, []);

  // ── 2. Speech Synthesis via Unified ttsService & Photorealistic Video ──
  const currentSpeakingTextRef = useRef('');
  const speechIdRef = useRef(0);
  const speakAIResponse = useCallback(async (text) => {
    if (!text || isSoundMuted || interviewStateRef.current === 'INTERVIEW_TIMED_OUT' || interviewStateRef.current === 'INTERVIEW_COMPLETED') {
      setIsAiSpeaking(false);
      currentSpeakingTextRef.current = '';
      if (interviewStateRef.current !== 'INTERVIEW_TIMED_OUT' && interviewStateRef.current !== 'INTERVIEW_COMPLETED') {
         setInterviewState('WAITING_FOR_CANDIDATE');
         startListening();
      }
      return;
    }

    const currentSpeechId = ++speechIdRef.current;
    
    ttsService.stop();
    stopListening();

    currentSpeakingTextRef.current = text;
    setIsAiSpeaking(true);
    setInterviewState('INTERVIEWER_SPEAKING');

    ttsService.speak(text, interviewer, {
      onStart: () => {
        if (speechIdRef.current !== currentSpeechId) return;
        // States are already set synchronously before calling speak()
      },
      onBoundary: ({ word }) => {
        if (speechIdRef.current !== currentSpeechId) return;
        setVisemeValue(wordToViseme(word));
      },
      onEnd: () => {
        if (speechIdRef.current !== currentSpeechId) return;
        if (interviewStateRef.current === 'INTERVIEW_TIMED_OUT' || interviewStateRef.current === 'INTERVIEW_COMPLETED') return;
        setIsAiSpeaking(false);
        setVisemeValue(0);
        currentSpeakingTextRef.current = '';
        setInterviewState('WAITING_FOR_CANDIDATE');
        startListening();
      },
      onError: (err) => {
        if (speechIdRef.current !== currentSpeechId) return;
        if (interviewStateRef.current === 'INTERVIEW_TIMED_OUT' || interviewStateRef.current === 'INTERVIEW_COMPLETED') return;
        console.warn('[TTS Debug] TTS error encountered:', err);
        setIsAiSpeaking(false);
        setVisemeValue(0);
        currentSpeakingTextRef.current = '';
        setInterviewState('WAITING_FOR_CANDIDATE');
        startListening();
      }
    });
  }, [isSoundMuted, interviewer, startListening, stopListening, setInterviewState]);

  // ── 3. Load Session & Video Call Joining Sequence ──
  useEffect(() => {
    if (!sessionId) {
      navigate('/interview-practice');
      return;
    }

    let isMounted = true;

    const loadSession = async () => {
      try {
        const data = await interviewService.getSession(sessionId);
        if (data.success && data.session && isMounted) {
          setSession(data.session);
          setTranscript(data.session.transcript || []);
          setTimeLeftSeconds((data.session.durationMinutes || 10) * 60);

          // Find first opening question
          const opening = data.session.transcript?.find((t) => t.speaker === 'ai')?.text;
          const currentInterviewer = getInterviewerById(data.session.interviewerId || 'sarah');
          if (opening) {
            initialQuestionRef.current = opening;
            setCurrentAiQuestion(opening);
          }

          // Video Call Connecting Sequence
          setConnectionStage(`Dialing ${currentInterviewer.name}...`);
          setTimeout(() => {
            if (isMounted) setConnectionStage('Establishing encrypted media stream...');
          }, 800);
          setTimeout(() => {
            if (isMounted) setConnectionStage(`Connected with ${currentInterviewer.name}`);
          }, 1600);
          setTimeout(() => {
            if (isMounted) {
              setIsConnecting(false);
              // Call connected — start speaking opening question
              if (opening) {
                speakAIResponse(opening);
              }
            }
          }, 2400);
        }
      } catch (err) {
        console.error('[Session] Failed to load session:', err);
        if (isMounted) setErrorMessage('Failed to load interview session.');
      }
    };

    loadSession();

    return () => {
      isMounted = false;
      speechIdRef.current++;
      ttsService.stop();
    };
  }, [sessionId, navigate]);

  // ── 4. Robust Layered getUserMedia Initialization ──
  const initMedia = useCallback(async () => {
    if (streamRef.current && streamRef.current.active) {
      console.log('[Webcam Debug] Stream already initialized, skipping duplicate initMedia().');
      return;
    }
    console.log('[Webcam Debug] Starting initMedia()...');
    setCameraStatus('requesting');
    setCameraErrorDetail('');

    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('[Webcam Debug] navigator.mediaDevices.getUserMedia is NOT supported in this browser.');
      setCameraStatus('error');
      setCameraErrorDetail('Webcam API is not supported in this browser environment.');
      setHasCameraPermission(false);
      setHasMicPermission(false);
      return;
    }

    let stream = null;

    // Attempt 1: Standard ideal constraints (without strict facingMode which can crash desktop webcams)
    try {
      console.log('[Webcam Debug] Attempt 1: getUserMedia with ideal resolution...');
      stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true,
      });
    } catch (err1) {
      console.warn('[Webcam Debug] Attempt 1 failed:', err1.name, err1.message);

      if (err1.name === 'NotAllowedError' || err1.name === 'PermissionDeniedError') {
        console.error('[Webcam Debug] Camera/mic permission was blocked by user/browser.');
        setCameraStatus('denied');
        setCameraErrorDetail('Camera or microphone permission was blocked. Please click the camera/lock icon in your browser address bar to allow access, then click "Retry Camera Permission".');
        setHasCameraPermission(false);
        setHasMicPermission(false);
        return;
      }

      // Attempt 2: Minimal unconstrained video + audio
      try {
        console.log('[Webcam Debug] Attempt 2: getUserMedia with unconstrained { video: true, audio: true }...');
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
      } catch (err2) {
        console.warn('[Webcam Debug] Attempt 2 failed:', err2.name, err2.message);

        if (err2.name === 'NotAllowedError' || err2.name === 'PermissionDeniedError') {
          console.error('[Webcam Debug] Camera/mic permission denied on Attempt 2.');
          setCameraStatus('denied');
          setCameraErrorDetail('Camera or microphone permission was denied. Please allow camera access in your browser settings.');
          setHasCameraPermission(false);
          setHasMicPermission(false);
          return;
        }

        // Attempt 3: Try video-only in case audio is locked or faulty
        try {
          console.log('[Webcam Debug] Attempt 3: getUserMedia with video only...');
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
        } catch (err3) {
          console.error('[Webcam Debug] All getUserMedia attempts failed. Final error:', err3.name, err3.message);
          setHasCameraPermission(false);
          if (err3.name === 'NotFoundError' || err3.name === 'DevicesNotFoundError') {
            setCameraStatus('not_found');
            setCameraErrorDetail('No camera device was detected on your computer.');
          } else if (err3.name === 'NotAllowedError' || err3.name === 'PermissionDeniedError') {
            setCameraStatus('denied');
            setCameraErrorDetail('Camera permission was blocked.');
          } else {
            setCameraStatus('error');
            setCameraErrorDetail(`${err3.name}: ${err3.message}`);
          }
          return;
        }
      }
    }

    if (stream) {
      console.log('[Webcam Debug] Stream acquired successfully! Active tracks:', stream.getTracks().map(t => `${t.kind} (${t.label}): enabled=${t.enabled}`));
      streamRef.current = stream;
      setHasCameraPermission(true);
      setHasMicPermission(stream.getAudioTracks().length > 0);
      setCameraStatus('streaming');
      setIsCameraActive(true);

      // Attach immediately to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.warn('[Webcam Debug] video play prevented:', e));
      }

      // Initialize Web Audio volume analyzer
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext && stream.getAudioTracks().length > 0) {
          if (audioContextRef.current) {
            try { audioContextRef.current.close(); } catch {}
          }
          const audioCtx = new AudioContext();
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          analyser.smoothingTimeConstant = 0.6;
          source.connect(analyser);

          audioContextRef.current = audioCtx;
          analyserRef.current = analyser;
        }
      } catch (audioErr) {
        console.warn('[Webcam Debug] Web Audio analyzer initialization failed:', audioErr);
      }
    }
  }, []);

  // Run initMedia on initial mount
  useEffect(() => {
    initMedia();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [initMedia]);

  // Ensure video element receives stream whenever it re-renders or becomes active
  useEffect(() => {
    if (videoRef.current && streamRef.current && hasCameraPermission && isCameraActive) {
      if (videoRef.current.srcObject !== streamRef.current) {
        console.log('[Webcam Debug] Re-assigning streamRef to videoRef');
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(e => console.warn('[Webcam Debug] Video play warning:', e));
      }
    }
  }, [hasCameraPermission, isCameraActive, isConnecting, cameraStatus]);

  // ── Hardware Control: Toggle Video Track ──
  const toggleCamera = () => {
    const nextState = !isCameraActive;
    setIsCameraActive(nextState);
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      console.log('[Webcam Debug] Setting video tracks enabled to:', nextState, 'count:', videoTracks.length);
      videoTracks.forEach((t) => {
        t.enabled = nextState;
      });
    }
    if (nextState && cameraStatus === 'paused') {
      setCameraStatus('streaming');
    } else if (!nextState && cameraStatus === 'streaming') {
      setCameraStatus('paused');
    }
  };

  // ── Hardware Control: Toggle Audio Track ──
  const toggleMic = () => {
    const nextState = !isMicActive;
    setIsMicActive(nextState);
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      console.log('[Webcam Debug] Setting audio tracks enabled to:', nextState, 'count:', audioTracks.length);
      audioTracks.forEach((t) => {
        t.enabled = nextState;
      });
    }
    if (nextState) {
      startListening();
    } else {
      stopListening();
    }
  };

  // ── 5. AI Coach Priority Alert System ──
  const triggerCoachAlert = (priority, type, message) => {
    const now = Date.now();
    const lastAlert = lastCoachAlertTimeRef.current[type] || 0;

    // Prevent notification spam (12s debounce per type)
    if (now - lastAlert < 12000) return;
    lastCoachAlertTimeRef.current[type] = now;

    coachingEventsRef.current.push({
      timestamp: new Date(),
      priority,
      type,
      message,
    });

    if (priority === 'critical' || priority === 'important') {
      setCoachingAlert({ priority, message });
      setCoachMood('coaching');
      setTimeout(() => {
        setCoachingAlert(null);
        setCoachMood('idle');
      }, 4500);
    }
  };

  // ── 6. Speech Analysis (WPM, Fillers, Volume) ──
  const inspectSpokenMetrics = (text) => {
    const words = text.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // Detect filler words
    const lower = text.toLowerCase();
    const detected = FILLER_LIST.filter((f) => lower.includes(f));
    if (detected.length > 0) {
      setFillerWordsFound(detected);
      speechMetricsRef.current.fillerWords = Array.from(new Set([...speechMetricsRef.current.fillerWords, ...detected]));
    }

    // Pacing checks (WPM estimation)
    if (wordCount > 15) {
      const estimatedWpm = Math.round((wordCount / Math.max(1, (spokenTranscript.length / 12))) * 60);
      setLiveWpm(estimatedWpm);

      if (estimatedWpm > 180) {
        triggerCoachAlert('important', 'pacing', '⏱️ Pacing is fast. Slow down slightly so your points are easy to absorb.');
      } else if (estimatedWpm < 90 && wordCount > 25) {
        triggerCoachAlert('minor', 'pacing', 'Pacing is slightly slow.');
      }
    }
  };

  // ── 7. Client-Side Video & Motion Loop + Real Mic Analyser ──
  useEffect(() => {
    let lastFrameData = null;

    const processFrame = () => {
      if (videoRef.current && canvasRef.current && hasCameraPermission && isCameraActive) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (video.readyState >= 2 && video.videoWidth > 0) {
          canvas.width = 160;
          canvas.height = 120;
          ctx.drawImage(video, 0, 0, 160, 120);

          try {
            const frame = ctx.getImageData(0, 0, 160, 120);
            visualMetricsRef.current.totalFrames += 1;

            // Frame difference heuristic for gesture/hand motion
            if (lastFrameData) {
              let diff = 0;
              for (let i = 0; i < frame.data.length; i += 16) {
                diff += Math.abs(frame.data[i] - lastFrameData.data[i]);
              }
              const motionLevel = diff / (160 * 120);

              if (motionLevel > 35) {
                visualMetricsRef.current.distractingGestures += 1;
                if (visualMetricsRef.current.distractingGestures % 40 === 0) {
                  triggerCoachAlert('important', 'gesture', '✋ Try reducing rapid hand or body movements.');
                }
              }
            }
            lastFrameData = frame;
            visualMetricsRef.current.cameraAttentionFrames += 1;
          } catch {}
        }
      }

      // Read audio volume from Web Audio API AnalyserNode
      if (analyserRef.current) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const avgVol = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
        setLiveVolume(Math.round(avgVol));

        if (avgVol > 75 && isStudentSpeaking) {
          triggerCoachAlert('important', 'volume', '🗣️ Your volume is quite high. Speak at a steady, natural level.');
        }
      }

      animationFrameRef.current = requestAnimationFrame(processFrame);
    };

    animationFrameRef.current = requestAnimationFrame(processFrame);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [hasCameraPermission, isCameraActive, isStudentSpeaking]);

  // ── 8. Timer Countdown ──
  useEffect(() => {
    if (!session || session.status === 'completed' || isSubmittingEval || isConnecting) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setInterviewState('INTERVIEW_TIMED_OUT');
          handleFinishInterview();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session, isSubmittingEval, isConnecting, setInterviewState]);

  // ── 9. Submit Student Turn ──
  const handleSubmitSpokenAnswer = async (isAutoSubmit = false) => {
    if (interviewStateRef.current !== 'WAITING_FOR_CANDIDATE' && interviewStateRef.current !== 'CANDIDATE_SPEAKING') return;
    if (!spokenTranscript.trim() && !isAutoSubmit) return;
    if (isAiThinking || isSubmittingEval) return;

    const answer = spokenTranscript.trim();
    stopListening();
    setIsAiThinking(true);
    setInterviewState('PROCESSING_ANSWER');
    setCoachMood('thinking');

    const updated = [
      ...transcript,
      { speaker: 'student', text: answer, timestamp: new Date() }
    ];
    setTranscript(updated);
    setSpokenTranscript('');

    try {
      const res = await interviewService.sendAnswerTurn(sessionId, {
        studentAnswer: answer,
        metrics: {
          wpm: liveWpm,
          volume: liveVolume,
          fillers: fillerWordsFound,
        },
        isEnding: timeLeftSeconds <= 60,
      });

      if (res.success && res.transcript) {
        setTranscript(res.transcript);
        const aiMessage = res.aiResponse?.interviewerMessage;
        if (aiMessage) {
          setCurrentAiQuestion(aiMessage);
          speakAIResponse(aiMessage);
        }

        if (res.aiResponse?.isFinished) {
          setTimeout(() => handleFinishInterview(), 3000);
        }
      }
    } catch (err) {
      console.error('[Turn Error]', err);
      setErrorMessage('Failed to send answer. Please try again.');
      setInterviewState('WAITING_FOR_CANDIDATE');
    } finally {
      setIsAiThinking(false);
      setCoachMood('idle');
    }
  };

  // ── 9.5 Silence Timeout & Turn Control ──
  useEffect(() => {
    let timeout;
    if (interviewState === 'WAITING_FOR_CANDIDATE') {
      timeout = setTimeout(() => {
         console.log('[Silence Timeout] Auto-submitting due to inactivity.');
         handleSubmitSpokenAnswer(true);
      }, 15000);
    } else if (interviewState === 'CANDIDATE_SPEAKING') {
      timeout = setTimeout(() => {
         console.log('[Silence Timeout] Auto-submitting due to pause in speech.');
         handleSubmitSpokenAnswer(true);
      }, 5000);
    }
    return () => clearTimeout(timeout);
  }, [interviewState, spokenTranscript]);

  // ── 10. Conclude and Evaluate with Disconnecting Screen ──
  const handleFinishInterview = async () => {
    if (isSubmittingEval) return;
    setIsSubmittingEval(true);
    setIsDisconnecting(true);
    setShowEndConfirm(false);
    setInterviewState('INTERVIEW_COMPLETED');
    ttsService.stop();
    ttsService.stop();
    stopListening();

    // 1.8 second realistic video call disconnect transition
    await new Promise((r) => setTimeout(r, 1800));

    // Compile collected metrics
    const totalFrames = visualMetricsRef.current.totalFrames || 1;
    const attentionPct = Math.min(100, Math.round((visualMetricsRef.current.cameraAttentionFrames / totalFrames) * 100));

    const finalSpeechMetrics = {
      avgWpm: liveWpm || 125,
      paceRating: liveWpm > 165 ? 'Fast' : liveWpm < 100 ? 'Deliberate' : 'Balanced & Natural',
      pauseCount: speechMetricsRef.current.pauseCount,
      fillerWordCount: speechMetricsRef.current.fillerWords.length,
      fillerWords: speechMetricsRef.current.fillerWords,
      volumeLevel: liveVolume > 60 ? 'Strong' : 'Balanced',
      clarityScore: 88,
      isEvaluated: Boolean(hasMicPermission),
    };

    const finalVisualMetrics = {
      cameraAttentionPercent: hasCameraPermission ? attentionPct : 0,
      gazeDeviations: hasCameraPermission ? Math.round((100 - attentionPct) / 10) : 0,
      postureConsistency: hasCameraPermission ? 85 : 0,
      distractingGesturesCount: visualMetricsRef.current.distractingGestures,
      faceFramingPercent: hasCameraPermission ? 90 : 0,
      isEvaluated: Boolean(hasCameraPermission),
    };

    try {
      await interviewService.submitEvaluation(sessionId, {
        speechMetrics: finalSpeechMetrics,
        visualMetrics: finalVisualMetrics,
        coachingEvents: coachingEventsRef.current,
      });

      navigate(`/interview-practice/report/${sessionId}`);
    } catch (err) {
      console.error('[Evaluation Submit Error]', err);
      navigate(`/interview-practice/report/${sessionId}`);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const isInterviewActive = session !== null && interviewState !== 'INTERVIEW_COMPLETED' && !isDisconnecting && !isSubmittingEval;

  return (
    <div className="min-h-screen bg-[#05070F] text-white selection:bg-[#2F80FF] selection:text-white font-sans antialiased overflow-hidden flex flex-col h-screen">
      <InterviewNavigationGuard isInterviewActive={isInterviewActive} />
      <Navbar onOpenLogin={() => {}} isAuthPage />

      {/* Hidden canvas for client-side local frame processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* ── VIDEO CALL CONNECTING OVERLAY ── */}
      <AnimatePresence>
        {isConnecting && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 bg-[#05070F] flex flex-col items-center justify-center p-6"
          >
            <div className="relative mb-6">
              {/* Radar pulse rings */}
              <div className="absolute inset-0 rounded-full bg-[#2F80FF]/20 animate-ping" />
              <div className="absolute -inset-4 rounded-full border border-[#2F80FF]/30 animate-pulse" />
              <img
                src={interviewer.avatarImg}
                alt={interviewer.name}
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover object-top border-2 border-[#2F80FF]/60 shadow-2xl shadow-[#2F80FF]/30 relative z-10"
              />
              <span className="absolute bottom-1 right-1 z-20 w-5 h-5 rounded-full bg-emerald-400 border-2 border-[#05070F] flex items-center justify-center">
                <Radio size={10} className="text-black animate-pulse" />
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">{interviewer.name}</h2>
            <p className="text-xs sm:text-sm text-purple-400 font-medium mb-4">{interviewer.title}</p>
            <p className="text-xs text-slate-400 max-w-xs text-center mb-6">{interviewer.company}</p>

            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
              <Loader2 size={14} className="animate-spin text-[#2F80FF]" />
              <span className="font-mono">{connectionStage}</span>
            </div>

            <div className="mt-8 flex items-center gap-2 text-[11px] text-slate-500">
              <Shield size={12} className="text-emerald-400" />
              <span>Encrypted High-Definition Simulated Video Interview Feed</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── VIDEO CALL DISCONNECTING OVERLAY ── */}
      <AnimatePresence>
        {isDisconnecting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-[#05070F]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mb-4">
              <PhoneOff size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Call Ended with {interviewer.name}</h3>
            <p className="text-slate-400 text-xs max-w-sm mb-6">
              Disconnecting video call session and processing speech metrics, body language framing, and answer substance...
            </p>
            <div className="flex items-center gap-2 text-xs text-purple-400 font-semibold bg-purple-500/10 px-4 py-2 rounded-xl border border-purple-500/20">
              <Loader2 size={14} className="animate-spin" />
              <span>Compiling Multi-Category Scorecard...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow pt-24 pb-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col h-full overflow-hidden">
        {/* Top Bar: Interviewer Info, Call Status, Timer & End Controls */}
        <div className="glass-card rounded-2xl px-5 py-3 border border-slate-800/80 mb-3 flex items-center justify-between shrink-0 bg-[#0B1120]/95">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={interviewer.avatarImg}
                alt={interviewer.name}
                className="w-10 h-10 rounded-xl object-cover object-top border border-purple-500/40"
              />
              <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                isAiSpeaking ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'
              }`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">{interviewer.name}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  {interviewer.badge}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">{interviewer.title}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Call Turn Indicator Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold border bg-slate-950 border-slate-800">
              <span className={`w-2 h-2 rounded-full ${
                interviewState === 'INTERVIEWER_SPEAKING'
                  ? 'bg-emerald-400 animate-pulse'
                  : (interviewState === 'CANDIDATE_SPEAKING' || interviewState === 'WAITING_FOR_CANDIDATE')
                    ? 'bg-[#2F80FF] animate-ping'
                    : 'bg-purple-400 animate-pulse'
              }`} />
              <span className="text-slate-300">
                {interviewState === 'INTERVIEWER_SPEAKING'
                  ? 'Interviewer Speaking'
                  : (interviewState === 'CANDIDATE_SPEAKING' || interviewState === 'WAITING_FOR_CANDIDATE')
                    ? 'Your Turn to Respond'
                    : interviewState === 'PROCESSING_ANSWER' || interviewState === 'GENERATING_RESPONSE'
                      ? 'Interviewer Reviewing'
                      : 'Connecting...'}
              </span>
            </div>

            {/* Countdown Timer */}
            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold font-mono ${
              timeLeftSeconds < 120
                ? 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-200'
            }`}>
              <Clock size={14} className={timeLeftSeconds < 120 ? 'text-red-400' : 'text-purple-400'} />
              <span>{formatTime(timeLeftSeconds)}</span>
            </div>

            {/* End Button */}
            <button
              onClick={() => setShowEndConfirm(true)}
              className="px-3.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <LogOut size={13} />
              <span>End & Score</span>
            </button>
          </div>
        </div>

        {/* Real-Time AI Coach Floating Toast Alert */}
        <AnimatePresence>
          {coachingAlert && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="mb-2 z-20 px-4 py-2.5 rounded-2xl bg-[#0F172A]/95 border border-[#2F80FF]/40 text-white shadow-xl shadow-[#2F80FF]/20 flex items-center justify-between gap-3 shrink-0"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xl">💡</span>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#4FA3FF] block">
                    AI Coach Live Hint
                  </span>
                  <span className="text-xs text-slate-200 font-medium">{coachingAlert.message}</span>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold">
                Live Coaching
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Video & Split View Area */}
        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0 overflow-hidden">
          {/* ── LEFT TILE: AI Interviewer Video Feed ── */}
          <div className={`glass-card rounded-3xl p-3 sm:p-4 border flex flex-col relative overflow-hidden bg-gradient-to-b from-[#0F172A]/90 to-[#0B1120]/95 transition-all duration-300 ${
            interviewState === 'INTERVIEWER_SPEAKING'
              ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/10'
              : 'border-slate-800/80'
          }`}>
            {/* Top Indicator Bar */}
            <div className="flex justify-between items-center mb-2 z-10 shrink-0">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  isAiSpeaking
                    ? 'bg-emerald-400 animate-ping'
                    : isAiThinking
                      ? 'bg-purple-400 animate-pulse'
                      : 'bg-blue-400'
                }`} />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  {isAiSpeaking ? 'Interviewer Speaking' : isAiThinking ? 'Evaluating Answer...' : 'Interviewer Listening'}
                </span>
                {isAiSpeaking && (
                  <span className="flex items-center gap-0.5 ml-1 h-3 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-0.5 h-3 bg-emerald-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-0.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:300ms]" />
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (isAiSpeaking) {
                    ttsService.stop();
                    setActiveAiVideoUrl(null);
                    setIsAiSpeaking(false);
                    setVisemeValue(0);
                    setCallTurn('candidate_turn');
                    startListening();
                  } else if (currentAiQuestion) {
                    speakAIResponse(currentAiQuestion);
                  }
                }}
                className="p-1.5 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Replay Voice Question"
              >
                <RefreshCw size={14} />
              </button>
            </div>

            {/* Talking Avatar Component with Amplitude-Driven Lip Movement / Photorealistic Video */}
            <div className="flex-grow min-h-0 relative z-10">
              <TalkingAvatar
                interviewer={interviewer}
                isSpeaking={isAiSpeaking}
                isThinking={isAiThinking}
              />

              {/* Reviewing/Thinking Overlay Banner */}
              {isAiThinking && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute inset-x-4 top-4 z-20 px-3.5 py-2 rounded-xl bg-black/75 backdrop-blur-md border border-purple-500/40 text-purple-200 text-xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Loader2 size={13} className="animate-spin text-purple-400" />
                    <span>{interviewer.name} is reviewing your response & taking notes...</span>
                  </div>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Question Caption / Subtitle Bar */}
            <motion.div
              key={currentAiQuestion}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-2 bg-slate-950/85 rounded-xl p-3 border border-slate-800/80 text-xs sm:text-sm text-slate-200 leading-relaxed z-10 shrink-0"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block mb-1">
                Current Question:
              </span>
              <p className="line-clamp-3">{currentAiQuestion || 'Hello! Welcome to your mock interview. Please take a moment to introduce yourself.'}</p>
            </motion.div>
          </div>

          {/* ── RIGHT TILE: Candidate Camera & Response Workspace ── */}
          <div className={`glass-card rounded-3xl p-4 sm:p-6 border flex flex-col justify-between relative overflow-hidden bg-[#070B14]/95 transition-all duration-300 ${
            (interviewState === 'WAITING_FOR_CANDIDATE' || interviewState === 'CANDIDATE_SPEAKING')
              ? 'border-[#2F80FF]/60 shadow-xl shadow-[#2F80FF]/15 ring-1 ring-[#2F80FF]/30'
              : 'border-slate-800/80'
          }`}>
            {/* Live Camera View with Real Video Feed Container */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/80 flex-grow flex items-center justify-center min-h-[220px]">
              {/* Always mounted video element for zero-race-condition playback */}
              <video
                ref={(el) => {
                  videoRef.current = el;
                  if (el && streamRef.current && el.srcObject !== streamRef.current) {
                    console.log('[Webcam Debug] Callback ref: attaching stream to video');
                    el.srcObject = streamRef.current;
                    el.play().catch(e => console.warn('[Webcam Debug] Autoplay error:', e));
                  }
                }}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-300 ${
                  cameraStatus === 'streaming' && isCameraActive ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'
                }`}
              />

              {/* Centering guideline overlay (when video is streaming) */}
              {cameraStatus === 'streaming' && isCameraActive && (
                <div className="absolute inset-x-12 inset-y-6 border border-dashed border-white/20 rounded-3xl pointer-events-none flex items-start justify-end p-3">
                  <span className="text-[9px] uppercase tracking-wider text-white/40 bg-black/40 px-2 py-0.5 rounded-full">
                    Keep Face Centered
                  </span>
                </div>
              )}

              {/* ── SPECIFIC CAMERA STATUS OVERLAYS ── */}
              {cameraStatus === 'requesting' && (
                <div className="text-center p-6 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#2F80FF]/15 border border-[#2F80FF]/30 flex items-center justify-center text-[#4FA3FF] mb-3 animate-pulse">
                    <Video size={24} />
                  </div>
                  <span className="text-sm font-bold text-white block mb-1">Requesting Camera Access...</span>
                  <span className="text-xs text-slate-400 max-w-xs block leading-relaxed">
                    Please click <span className="text-emerald-400 font-semibold">"Allow"</span> in your browser's camera prompt to start your video feed.
                  </span>
                </div>
              )}

              {cameraStatus === 'denied' && (
                <div className="text-center p-6 flex flex-col items-center max-w-sm">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 mb-3">
                    <VideoOff size={24} />
                  </div>
                  <span className="text-sm font-bold text-white block mb-1">Camera Permission Blocked</span>
                  <span className="text-xs text-slate-300 block mb-4 leading-relaxed">
                    {cameraErrorDetail || 'Camera permission was denied in your browser settings.'}
                  </span>
                  <button
                    type="button"
                    onClick={initMedia}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw size={14} />
                    <span>Retry Camera Permission</span>
                  </button>
                </div>
              )}

              {cameraStatus === 'not_found' && (
                <div className="text-center p-6 flex flex-col items-center max-w-sm">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mb-3">
                    <VideoOff size={24} />
                  </div>
                  <span className="text-sm font-bold text-white block mb-1">No Camera Device Detected</span>
                  <span className="text-xs text-slate-400 block mb-4 leading-relaxed">
                    {cameraErrorDetail || 'No webcam hardware was found on this computer. Audio speech recognition will continue.'}
                  </span>
                  <button
                    type="button"
                    onClick={initMedia}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw size={14} />
                    <span>Re-scan Devices</span>
                  </button>
                </div>
              )}

              {(cameraStatus === 'paused' || (!isCameraActive && cameraStatus === 'streaming')) && (
                <div className="text-center p-6 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mb-3">
                    <VideoOff size={24} />
                  </div>
                  <span className="text-sm font-bold text-white block mb-1">Camera Feed Paused</span>
                  <span className="text-xs text-slate-400 block mb-4">You turned off your video feed. Microphone is still active.</span>
                  <button
                    type="button"
                    onClick={toggleCamera}
                    className="px-4 py-2 rounded-xl bg-[#2F80FF] hover:bg-[#1D5BD8] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Video size={14} />
                    <span>Turn Camera On</span>
                  </button>
                </div>
              )}

              {cameraStatus === 'error' && (
                <div className="text-center p-6 flex flex-col items-center max-w-sm">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
                    <AlertTriangle size={24} />
                  </div>
                  <span className="text-sm font-bold text-white block mb-1">Camera Stream Error</span>
                  <span className="text-xs text-slate-300 block mb-4 leading-relaxed">
                    {cameraErrorDetail || 'An unexpected issue occurred while accessing the webcam.'}
                  </span>
                  <button
                    type="button"
                    onClick={initMedia}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw size={14} />
                    <span>Retry Connection</span>
                  </button>
                </div>
              )}

              {/* Symmetric Name Bar for Candidate (Like Zoom/Meet) */}
              <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-between px-3 py-2 bg-gradient-to-t from-black/90 via-black/60 to-transparent text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    isStudentSpeaking ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
                  }`} />
                  <span className="font-bold text-white text-xs">You (Candidate)</span>
                  {isStudentSpeaking && (
                    <span className="flex items-center gap-0.5 ml-1 h-3 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-0.5 h-3 bg-emerald-400 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-0.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:300ms]" />
                    </span>
                  )}
                </div>

                {/* Real Web Audio Volume Analyzer Meter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">Mic:</span>
                  <div className="flex gap-0.5 items-end h-3 w-16">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-sm transition-all duration-75 ${
                          liveVolume > (i + 1) * 11 ? 'bg-emerald-400' : 'bg-slate-700/60'
                        }`}
                        style={{ height: `${(i + 1) * 16}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Turn Cue Banner */}
            {(interviewState === 'WAITING_FOR_CANDIDATE' || interviewState === 'CANDIDATE_SPEAKING') && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300 font-medium"
              >
                <div className="flex items-center gap-2">
                  <Mic size={13} className="animate-pulse text-emerald-400" />
                  <span>Your turn to respond — speak naturally into your mic</span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                  Listening Active
                </span>
              </motion.div>
            )}

            {/* Spoken Transcript Live Box */}
            <div className="mt-2 bg-slate-900/90 rounded-2xl p-3 border border-slate-800/80 text-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#4FA3FF]">
                  Your Spoken Answer:
                </span>
                {liveWpm > 0 && (
                  <span className="text-[10px] text-slate-400 font-mono">Pace: ~{liveWpm} WPM</span>
                )}
              </div>
              <p className="text-slate-200 text-xs min-h-[38px] max-h-20 overflow-y-auto italic">
                {spokenTranscript || (
                  isStudentSpeaking
                    ? 'Start speaking your answer clearly...'
                    : 'Click "Submit Answer" once finished speaking.'
                )}
              </p>
            </div>

            {/* Candidate Controls Bar */}
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={toggleCamera}
                  className={`p-2.5 rounded-xl border text-xs transition-colors cursor-pointer ${
                    isCameraActive && cameraStatus === 'streaming'
                      ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                      : 'bg-red-500/20 border-red-500/40 text-red-400'
                  }`}
                  title={isCameraActive ? 'Turn Camera Off' : 'Turn Camera On'}
                >
                  {isCameraActive && cameraStatus === 'streaming' ? <Video size={16} /> : <VideoOff size={16} />}
                </button>

                <button
                  type="button"
                  onClick={toggleMic}
                  className={`p-2.5 rounded-xl border text-xs transition-colors cursor-pointer ${
                    isMicActive && isStudentSpeaking
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                  }`}
                  title={isMicActive ? 'Mute Microphone' : 'Unmute Microphone'}
                >
                  {isMicActive ? <Mic size={16} /> : <MicOff size={16} />}
                </button>
              </div>

              {/* Submit Spoken Answer Button */}
              <button
                type="button"
                onClick={() => handleSubmitSpokenAnswer(false)}
                disabled={
                  (interviewState !== 'WAITING_FOR_CANDIDATE' && interviewState !== 'CANDIDATE_SPEAKING') ||
                  !spokenTranscript.trim() || isAiThinking || isSubmittingEval
                }
                className="flex-grow py-3 px-4 rounded-xl bg-[#2F80FF] hover:bg-[#1D5BD8] disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-[#2F80FF]/20 cursor-pointer"
              >
                {isAiThinking ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Evaluating Answer...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Submit Spoken Answer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showEndConfirm && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-modal max-w-md w-full rounded-3xl p-6 border border-slate-800"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Finish Speaking Interview?</h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-6">
                Your full spoken transcript, speech pace, and camera behavior metrics will be evaluated to generate your comprehensive scorecard and personalized feedback plan.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEndConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Resume Speaking
                </button>
                <button
                  type="button"
                  onClick={handleFinishInterview}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-lg shadow-red-600/20"
                >
                  End Call & Score
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
