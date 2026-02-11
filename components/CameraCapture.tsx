
import React, { useRef, useState, useCallback } from 'react';
import { Camera, RefreshCw, X, Check, Aperture } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CameraCaptureProps {
  onCapture: (base64Image: string) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const startCamera = useCallback(async () => {
    setIsStarting(true);
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1024 }, height: { ideal: 1024 } },
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError("Impossible d'accéder à la caméra. Vérifiez les permissions.");
      console.error(err);
    } finally {
      setIsStarting(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Carré parfait
        const size = Math.min(video.videoWidth, video.videoHeight);
        canvas.width = size;
        canvas.height = size;
        
        const startX = (video.videoWidth - size) / 2;
        const startY = (video.videoHeight - size) / 2;
        
        context.drawImage(video, startX, startY, size, size, 0, 0, size, size);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  // Démarrage auto
  React.useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-stone-900/95 flex flex-col items-center justify-center p-6 backdrop-blur-md"
    >
      <div className="w-full max-w-lg space-y-8">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h3 className="text-white font-impact text-3xl tracking-tight uppercase">CAPTURER L'EXISTENCE</h3>
            <p className="text-stone-500 font-serif italic text-sm">Portrait de recensement terrain</p>
          </div>
          <button onClick={onClose} className="p-3 text-stone-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="relative aspect-square w-full bg-stone-800 rounded-[3rem] overflow-hidden border-2 border-stone-700 shadow-2xl">
          <AnimatePresence mode="wait">
            {!capturedImage ? (
              <motion.div 
                key="video"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full relative"
              >
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover grayscale"
                />
                <div className="absolute inset-0 border-[40px] border-stone-900/20 pointer-events-none rounded-[3rem]"></div>
                
                {isStarting && (
                  <div className="absolute inset-0 flex items-center justify-center bg-stone-900/50">
                    <RefreshCw className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
                
                {error && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center space-y-4">
                    <X className="w-12 h-12 text-red-500" />
                    <p className="text-white font-serif italic">{error}</p>
                    <button onClick={startCamera} className="px-6 py-2 bg-white text-stone-900 rounded-full font-bold text-xs uppercase tracking-widest">Réessayer</button>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="preview"
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full h-full"
              >
                <img src={capturedImage} alt="Capture" className="w-full h-full object-cover grayscale" />
              </motion.div>
            )}
          </AnimatePresence>
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex justify-center gap-6">
          {!capturedImage ? (
            <button 
              onClick={capturePhoto}
              disabled={!stream}
              className="group flex flex-col items-center gap-3 disabled:opacity-30 transition-all"
            >
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl group-active:scale-90 transition-transform">
                <Aperture className="w-10 h-10 text-stone-900" />
              </div>
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Prendre la photo</span>
            </button>
          ) : (
            <div className="flex gap-12">
              <button 
                onClick={handleRetake}
                className="flex flex-col items-center gap-3 group"
              >
                <div className="w-16 h-16 bg-stone-800 border border-stone-700 rounded-full flex items-center justify-center text-white hover:bg-stone-700 transition-all">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <span className="text-[9px] font-black text-stone-500 uppercase tracking-widest">Recommencer</span>
              </button>

              <button 
                onClick={handleConfirm}
                className="flex flex-col items-center gap-3 group"
              >
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-blue-600/30 hover:bg-blue-500 transition-all scale-110">
                  <Check className="w-8 h-8" />
                </div>
                <span className="text-[9px] font-black text-white uppercase tracking-widest">Utiliser ce portrait</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CameraCapture;
