import React, { useRef, useEffect, useState } from 'react';
import { Pose, Results } from '@mediapipe/pose';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';

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
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      pose.onResults(onResults);

      if (videoRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
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
      if (!results.poseLandmarks || !canvasRef.current) return;

      const landmarks = results.poseLandmarks;
      // Index for shoulders, elbows, and wrists
      const leftShoulder = landmarks[11];
      const leftElbow = landmarks[13];
      const leftWrist = landmarks[15];
      
      const angle = calculateAngle(leftShoulder, leftElbow, leftWrist);

      // Simple logic: down if angle < 90, up if angle > 160
      if (angle < 90) {
        setStage('down');
      }
      if (angle > 160 && stage === 'down') {
        setStage('up');
        setCount((prev) => {
          const newCount = prev + 1;
          onCount(newCount);
          return newCount;
        });
      }

      // Draw landmarks on canvas
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);
        
        // Simple visualization: Draw only the relevant arm points
        ctx.fillStyle = '#3B82F6';
        [leftShoulder, leftElbow, leftWrist].forEach((pt) => {
          ctx.beginPath();
          ctx.arc(pt.x * canvasRef.current!.width, pt.y * canvasRef.current!.height, 5, 0, 2 * Math.PI);
          ctx.fill();
        });
      }
    };

    const detectFrame = async () => {
      if (videoRef.current && pose) {
        await pose.send({ image: videoRef.current });
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
    <div className="relative glass-panel overflow-hidden aspect-video bg-black">
      <video ref={videoRef} className="hidden" playsInline muted />
      <canvas ref={canvasRef} className="w-full h-full object-cover opacity-60" width={640} height={480} />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      )}
      <div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded-full text-xs font-bold border border-white/20">
        IA ATIVA • MODO COMPETIÇÃO
      </div>
      <div className="absolute bottom-4 right-4 text-4xl font-black italic text-primary drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
        {count}
      </div>
    </div>
  );
};
