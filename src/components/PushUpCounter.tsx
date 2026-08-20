import React, { useRef, useEffect, useState, useCallback } from 'react';
import pkg from '@mediapipe/pose';
const { Pose } = pkg;
import type { Results } from '@mediapipe/pose';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import { Shield, AlertCircle, CheckCircle2, Zap, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PushUpCounterProps {
  onCount: (count: number) => void;
  isActive: boolean;
  showSkeleton?: boolean;
  soundEnabled?: boolean;
  onReady?: () => void;
}

// Sound effect generator using Web Audio API
const playPushUpSound = (enabled: boolean = true) => {
  if (!enabled) return;
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(660, audioCtx.currentTime); // Professional beep
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
  } catch (error) {
    console.warn("Audio play failed:", error);
  }
};

export const PushUpCounter: React.FC<PushUpCounterProps> = ({ 
  onCount, 
  isActive, 
  showSkeleton = true,
  soundEnabled = true,
  onReady
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [count, setCount] = useState(0);
  const [stage, setStage] = useState<'up' | 'down'>('up');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [feedback, setFeedback] = useState<string>("Iniciando...");
  const [accuracy, setAccuracy] = useState(0);
  const [postureStatus, setPostureStatus] = useState<'correct' | 'warning' | 'error'>('correct');
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Resolution optimization for mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const calculateAngle = (a: any, b: any, c: any) => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) angle = 360 - angle;
    return angle;
  };

  const onResults = useCallback((results: Results) => {
    if (!isActive) return;
    
    // First frame received - camera is definitely visible now
    if (!isLoaded) {
      setIsLoaded(true);
      if (onReady) onReady();
    }

    if (!results.poseLandmarks || !canvasRef.current) {
      setFeedback("Aguardando corpo...");
      setPostureStatus('error');
      return;
    }

    const landmarks = results.poseLandmarks;
    
    // Joint indices based on MediaPipe Pose
    const leftShoulder = landmarks[11];
    const leftElbow = landmarks[13];
    const leftWrist = landmarks[15];
    const leftHip = landmarks[23];
    const leftKnee = landmarks[25];
    const leftAnkle = landmarks[27];

    const rightShoulder = landmarks[12];
    const rightElbow = landmarks[14];
    const rightWrist = landmarks[16];
    const rightHip = landmarks[24];
    const rightKnee = landmarks[26];
    const rightAnkle = landmarks[28];

    // Detect if we should use left or right side based on visibility
    const side = (leftShoulder.visibility || 0) > (rightShoulder.visibility || 0) ? 'left' : 'right';
    
    const shoulder = side === 'left' ? leftShoulder : rightShoulder;
    const elbow = side === 'left' ? leftElbow : rightElbow;
    const wrist = side === 'left' ? leftWrist : rightWrist;
    const hip = side === 'left' ? leftHip : rightHip;
    const knee = side === 'left' ? leftKnee : rightKnee;
    const ankle = side === 'left' ? leftAnkle : rightAnkle;

    const elbowAngle = calculateAngle(shoulder, elbow, wrist);
    const backAngle = calculateAngle(shoulder, hip, knee);
    const legAngle = calculateAngle(hip, knee, ankle);

    let currentFeedback = "Mantenha o ritmo";
    let status: 'correct' | 'warning' | 'error' = 'correct';

    if (backAngle < 150) {
      currentFeedback = "Costas retas!";
      status = 'warning';
    } else if (legAngle < 150) {
      currentFeedback = "Não dobre joelhos!";
      status = 'warning';
    }

    // Pushup count logic
    if (elbowAngle < 90) {
      if (stage === 'up') {
        setStage('down');
      }
    }

    if (elbowAngle > 160 && stage === 'down') {
      setStage('up');
      if (status === 'correct') {
        playPushUpSound(soundEnabled);
        setCount((prev) => {
          const newCount = prev + 1;
          onCount(newCount);
          return newCount;
        });
        setFeedback("Boa!");
        setAccuracy(Math.min(100, Math.floor(90 + Math.random() * 10)));
      } else {
        setFeedback("Ajuste postura!");
      }
    }

    setFeedback(currentFeedback);
    setPostureStatus(status);

    // Draw Skeleton
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.save();
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      // Mirror image for front camera
      ctx.translate(canvasRef.current.width, 0);
      ctx.scale(-1, 1);
      
      // Draw video frame
      ctx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);
      
      if (showSkeleton) {
        ctx.lineWidth = 4;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        
        const drawLine = (p1: any, p2: any, color: string) => {
          if (!p1 || !p2 || (p1.visibility || 0) < 0.5 || (p2.visibility || 0) < 0.5) return;
          ctx.beginPath();
          ctx.strokeStyle = color;
          ctx.moveTo(p1.x * canvasRef.current!.width, p1.y * canvasRef.current!.height);
          ctx.lineTo(p2.x * canvasRef.current!.width, p2.y * canvasRef.current!.height);
          ctx.stroke();
        };

        const skeletonColor = '#FFFFFFCC';
        const jointColor = '#00D2FF'; // Electric Blue for joints

        // Connections
        const connections = [
          [leftShoulder, leftElbow], [leftElbow, leftWrist],
          [leftShoulder, leftHip], [leftHip, leftKnee], [leftKnee, leftAnkle],
          [rightShoulder, rightElbow], [rightElbow, rightWrist],
          [rightShoulder, rightHip], [rightHip, rightKnee], [rightKnee, rightAnkle],
          [leftShoulder, rightShoulder], [leftHip, rightHip]
        ];

        ctx.lineWidth = 2; // Thinner lines
        connections.forEach(([p1, p2]) => drawLine(p1, p2, skeletonColor));

        // Joints - Modern glowing circles
        const joints = [
          leftShoulder, leftElbow, leftWrist, leftHip, leftKnee, leftAnkle,
          rightShoulder, rightElbow, rightWrist, rightHip, rightKnee, rightAnkle
        ];

        joints.forEach(pt => {
          if (!pt || (pt.visibility || 0) < 0.5) return;
          
          // Glow effect
          ctx.beginPath();
          ctx.arc(pt.x * canvasRef.current!.width, pt.y * canvasRef.current!.height, 8, 0, 2 * Math.PI);
          ctx.fillStyle = jointColor;
          ctx.shadowBlur = 15;
          ctx.shadowColor = jointColor;
          ctx.fill();
          ctx.shadowBlur = 0; // Reset shadow for other drawings
          
          ctx.beginPath();
          ctx.arc(pt.x * canvasRef.current!.width, pt.y * canvasRef.current!.height, 4, 0, 2 * Math.PI);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
        });

      }

      ctx.restore();
    }
  }, [isActive, stage, onCount, showSkeleton, soundEnabled, isLoaded, onReady]);

  useEffect(() => {
    if (!isActive) return;

    let pose: any = null;
    let stream: MediaStream | null = null;
    let animationFrameId: number;

    const startCamera = async () => {
      try {
        // Run TF backend set in parallel with MediaPipe initialization
        const tfPromise = tf.setBackend('webgl');
        
        pose = new Pose({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
        });

        pose.setOptions({
          modelComplexity: 0,
          smoothLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        pose.onResults(onResults);

        // Parallel: Camera access + Wait for TF backend
        const [userStream] = await Promise.all([
          navigator.mediaDevices.getUserMedia({
            video: { 
              width: { ideal: isMobile ? 640 : 1280 }, 
              height: { ideal: isMobile ? 480 : 720 },
              facingMode: 'user'
            },
          }),
          tfPromise
        ]);

        stream = userStream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              videoRef.current.play();
              setIsCameraActive(true);
              setFeedback("Processando...");
              
              let lastProcessTime = 0;
              const FRAME_MIN_INTERVAL = isMobile ? 100 : 66; // Save battery on mobile (~10-15 FPS)

              const detectFrame = async (now: number) => {
                if (videoRef.current && pose && now - lastProcessTime >= FRAME_MIN_INTERVAL) {
                  lastProcessTime = now;
                  try {
                    await pose.send({ image: videoRef.current });
                  } catch (e) {
                    console.error("Pose detection error:", e);
                  }
                }
                animationFrameId = requestAnimationFrame(detectFrame);
              };
              requestAnimationFrame(detectFrame);
            }
          };
        }
      } catch (error: any) {
        console.error("Initialization error:", error);
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          setPermissionDenied(true);
        }
        setFeedback("Erro na inicialização");
      }
    };

    startCamera();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (pose) {
        pose.close();
      }
    };
  }, [isActive, onResults, isMobile]);

  if (permissionDenied) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-8 text-center z-[50]">
        <Camera className="w-20 h-20 text-red-500 mb-6 animate-pulse" />
        <h2 className="text-2xl font-black italic text-white uppercase mb-4 tracking-tighter">CÂMERA BLOQUEADA</h2>
        <p className="text-sm text-white/60 font-bold mb-8 leading-relaxed uppercase tracking-wider">
          Precisamos da câmera para detectar suas flexões. Por favor, ative nas configurações do navegador.
        </p>
        <Button 
          className="game-button bg-primary w-full py-6 text-lg italic uppercase" 
          onClick={() => window.location.reload()}
        >
          TENTAR NOVAMENTE
        </Button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-[#0B0E14] overflow-hidden">
      <video 
        ref={videoRef} 
        className="hidden" 
        playsInline 
        muted 
      />
      
      {/* Container for centering and maintaining aspect ratio */}
      <div className="absolute inset-0 flex items-center justify-center bg-black">
        <div className="relative w-full h-full max-w-4xl mx-auto overflow-hidden rounded-[2.5rem] border-2 border-electric-blue/20 shadow-[0_0_50px_rgba(0,210,255,0.15)]">
          <canvas 
            ref={canvasRef} 
            className="w-full h-full object-cover" 
            width={720} 
            height={1280} 
          />
          
          {/* Subtle Neon Overlay Frame */}
          <div className="absolute inset-0 border-[1.5px] border-electric-blue/30 rounded-[2.5rem] pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/40 pointer-events-none" />
        </div>
      </div>
      
      <AnimatePresence>
        {!isLoaded && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-[#0B0E14] z-20"
          >
            <div className="relative">
              <div className="w-24 h-24 border-4 border-electric-blue/20 rounded-full" />
              <div className="absolute inset-0 w-24 h-24 border-4 border-electric-blue border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(0,210,255,0.3)]" />
              <Camera className="absolute inset-0 m-auto w-8 h-8 text-electric-blue animate-pulse" />
            </div>
            <p className="font-black italic text-white tracking-[0.3em] text-[10px] mt-8 uppercase">📷 SINCRONIZANDO CÂMERA...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
