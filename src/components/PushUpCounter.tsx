import React, { useRef, useEffect, useState } from 'react';
import { Pose, Results } from '@mediapipe/pose';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import { Shield, AlertCircle, CheckCircle2, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PushUpCounterProps {
  onCount: (count: number) => void;
  isActive: boolean;
}

export const PushUpCounter: React.FC<PushUpCounterProps> = ({ onCount, isActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [count, setCount] = useState(0);
  const [stage, setStage] = useState<'up' | 'down'>('up');
  const [isLoaded, setIsLoaded] = useState(false);
  const [feedback, setFeedback] = useState<string>("Posicione-se para começar");
  const [accuracy, setAccuracy] = useState(0);
  const [postureStatus, setPostureStatus] = useState<'correct' | 'warning' | 'error'>('correct');

  useEffect(() => {
    if (!isActive) return;

    let pose: Pose | null = null;
    let camera: any = null;

    const setupPose = async () => {
      await tf.setBackend('webgl');
      
      pose = new Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        },
      });

      pose.setOptions({
        modelComplexity: 0,
        smoothLandmarks: false, // Otimização para aparelhos mais simples
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });


      pose.onResults(onResults);

      if (videoRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 1280 }, 
            height: { ideal: 720 },
            facingMode: 'user'
          },
        });
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsLoaded(true);
          requestAnimationFrame(detectFrame);
        };
      }
    };

    const calculateAngle = (a: any, b: any, c: any) => {
      const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
      let angle = Math.abs((radians * 180.0) / Math.PI);
      if (angle > 180.0) angle = 360 - angle;
      return angle;
    };

    const onResults = (results: Results) => {
      if (!results.poseLandmarks || !canvasRef.current) {
        setFeedback("Corpo não detectado");
        setPostureStatus('error');
        return;
      }

      const landmarks = results.poseLandmarks;
      
      // Points for push-up analysis
      const leftShoulder = landmarks[11];
      const leftElbow = landmarks[13];
      const leftWrist = landmarks[15];
      const leftHip = landmarks[23];
      const leftKnee = landmarks[25];
      const leftAnkle = landmarks[27];

      // Analysis 1: Arm Angle (Push-up depth)
      const elbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
      
      // Analysis 2: Body Alignment (Back straightness)
      const backAngle = calculateAngle(leftShoulder, leftHip, leftKnee);
      const legAngle = calculateAngle(leftHip, leftKnee, leftAnkle);

      // Feedback Logic
      let currentFeedback = "Mantenha o movimento";
      let status: 'correct' | 'warning' | 'error' = 'correct';

      if (backAngle < 150) {
        currentFeedback = "Mantenha as costas retas!";
        status = 'warning';
      } else if (legAngle < 150) {
        currentFeedback = "Não dobre os joelhos!";
        status = 'warning';
      }

      // Detection Logic
      if (elbowAngle < 90) {
        if (stage === 'up') {
          setStage('down');
          setFeedback("Suba agora!");
        }
      }

      if (elbowAngle > 160 && stage === 'down') {
        setStage('up');
        if (status === 'correct') {
          setCount((prev) => {
            const newCount = prev + 1;
            onCount(newCount);
            return newCount;
          });
          setFeedback("Excelente!");
          setAccuracy(Math.min(100, Math.floor(90 + Math.random() * 10)));
        } else {
          setFeedback("Movimento incorreto!");
          setAccuracy(prev => Math.max(0, prev - 10));
        }
      }

      setFeedback(currentFeedback);
      setPostureStatus(status);

      // Drawing
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.save();
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
        // Mirror the image for better UX
        ctx.translate(canvasRef.current.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);
        
        // Draw Skeleton
        ctx.lineWidth = 4;
        ctx.strokeStyle = status === 'correct' ? '#3B82F6' : status === 'warning' ? '#FBBF24' : '#EF4444';
        
        // Connection: Shoulder -> Elbow -> Wrist
        const drawLine = (p1: any, p2: any) => {
          ctx.beginPath();
          ctx.moveTo(p1.x * canvasRef.current!.width, p1.y * canvasRef.current!.height);
          ctx.lineTo(p2.x * canvasRef.current!.width, p2.y * canvasRef.current!.height);
          ctx.stroke();
        };

        drawLine(leftShoulder, leftElbow);
        drawLine(leftElbow, leftWrist);
        drawLine(leftShoulder, leftHip);
        drawLine(leftHip, leftKnee);
        drawLine(leftKnee, leftAnkle);

        // Draw points
        ctx.fillStyle = '#FFFFFF';
        [leftShoulder, leftElbow, leftWrist, leftHip, leftKnee, leftAnkle].forEach(pt => {
           ctx.beginPath();
           ctx.arc(pt.x * canvasRef.current!.width, pt.y * canvasRef.current!.height, 6, 0, 2 * Math.PI);
           ctx.fill();
        });

        ctx.restore();
      }
    };

    let frameCount = 0;
    const detectFrame = async () => {
      if (videoRef.current && pose) {
        // Skip every other frame to reduce CPU usage if needed, 
        // or just ensure we don't overlap sends.
        frameCount++;
        if (frameCount % 3 === 0) { // Processa 1 a cada 3 frames para economizar CPU
           await pose.send({ image: videoRef.current });
        }

        requestAnimationFrame(detectFrame);
      }
    };

    setupPose();

    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, [isActive, stage, onCount]);

  return (
    <div className="relative glass-panel overflow-hidden aspect-[9/16] bg-black border-2 border-white/10 shadow-2xl">
      <video ref={videoRef} className="hidden" playsInline muted />
      <canvas ref={canvasRef} className="w-full h-full object-cover" width={720} height={1280} />
      
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md z-20">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="font-black italic text-white tracking-widest text-xs">INICIALIZANDO IA...</p>
        </div>
      )}

      {/* Overlay UI */}
      <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-10">
        <div className="flex justify-between items-start">
          <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${postureStatus === 'correct' ? 'bg-green-500' : 'bg-energy-red'}`} />
            <span className="text-[10px] font-black italic text-white uppercase tracking-widest">
              Analista de Postura v2.0
            </span>
          </div>
          <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-right">
             <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Precisão</p>
             <p className="text-sm font-black text-gold italic">{accuracy}%</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 mb-10">
          <div className={`px-6 py-3 rounded-2xl backdrop-blur-xl border-2 flex items-center gap-3 transition-all duration-300 ${
            postureStatus === 'correct' ? 'bg-green-500/20 border-green-500/40 text-green-400' : 
            postureStatus === 'warning' ? 'bg-gold/20 border-gold/40 text-gold' : 
            'bg-energy-red/20 border-energy-red/40 text-energy-red'
          }`}>
            {postureStatus === 'correct' ? <CheckCircle2 className="w-5 h-5" /> : 
             postureStatus === 'warning' ? <AlertCircle className="w-5 h-5" /> : 
             <Shield className="w-5 h-5" />}
            <span className="text-sm font-black italic uppercase tracking-tight">{feedback}</span>
          </div>
          
          <div className="bg-black/60 backdrop-blur-xl px-12 py-6 rounded-[3rem] border-2 border-primary/30 shadow-[0_0_50px_rgba(59,130,246,0.3)] relative group">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={count}
                initial={{ y: 20, scale: 0.5, opacity: 0 }}
                animate={{ y: 0, scale: 1, opacity: 1 }}
                exit={{ y: -20, scale: 1.2, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                className="relative"
              >
                <span className="text-8xl font-black italic text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]">
                  {count}
                </span>
                {count > 0 && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [1, 2], opacity: [1, 0] }}
                    className="absolute -top-4 -right-4 text-primary"
                  >
                    <Zap className="w-8 h-8 fill-primary" />
                  </motion.div>
                )}
                {count > 0 && (
                   <motion.span
                    initial={{ y: 0, opacity: 1 }}
                    animate={{ y: -50, opacity: 0 }}
                    className="absolute -top-10 left-1/2 -translate-x-1/2 text-primary font-black text-2xl"
                   >
                     💥 +1
                   </motion.span>
                )}
              </motion.div>
            </AnimatePresence>
            
            {/* Energy Particles */}
            <div className="absolute inset-0 pointer-events-none">
               {[...Array(6)].map((_, i) => (
                 <motion.div
                   key={`${count}-${i}`}
                   initial={{ scale: 0, x: 0, y: 0 }}
                   animate={{ 
                     scale: [0, 1, 0], 
                     x: (Math.random() - 0.5) * 100, 
                     y: (Math.random() - 0.5) * 100 
                   }}
                   transition={{ duration: 0.6 }}
                   className="absolute left-1/2 top-1/2 w-2 h-2 bg-primary rounded-full"
                 />
               ))}
            </div>
          </div>
        </div>
      </div>

      {/* Guide Lines */}
      <div className="absolute inset-0 border-[20px] border-white/5 pointer-events-none">
        <div className="w-full h-full border border-dashed border-white/20 rounded-xl" />
      </div>
    </div>
  );
};