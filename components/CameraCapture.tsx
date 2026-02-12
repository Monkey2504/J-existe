
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, RefreshCw, X, Check, Aperture } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CameraCaptureProps {
  onCapture: (base64Image: string) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const lastActiveElement = useRef<HTMLElement | null>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  // Focus Trap & Restore
  useEffect(() => {
    lastActiveElement.current = document.activeElement as HTMLElement;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])');
        const first = focusables[0] as HTMLElement;
        const last = focusables[focusables.length - 1] as HTMLElement;
        
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      lastActiveElement.current?.focus();
    };
  }, [onClose]);

  const startCamera = useCallback(async () => {
    setIsStarting(true);
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1024 }, height: { ideal: 1024 } },
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (err) {
      setError("Accès caméra refusé. Vérifiez les permissions du navigateur.");
    } finally {
      setIsStarting(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach(track => track.stop());
    setStream(null);
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        const size = Math.min(video.videoWidth, video.videoHeight);
        canvas.width = size;
        canvas.height = size;
        context.drawImage(video, (video.videoWidth - size) / 2, (video.videoHeight - size) / 2, size, size, 0, 0, size, size);
        setCapturedImage(canvas.toDataURL('image/jpeg', 0.8));
        stopCamera();
      }
    }
  }, [stopCamera]);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  return (
    <motion.div 
      ref={modalRef}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-stone-900/98 flex flex-col items-center justify-center p-6 backdrop-blur-xl"
      role="dialog" aria-modal="true" aria-labelledby="cam-title"
    >
      <div className="w-full max-w-lg space-y-8">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h3 id="cam-title" className="text-white font-impact text-3xl tracking-tight uppercase">Portrait de Recensement</h3>
            <p className="text-stone-500 font-serif italic text-sm">Documentation visuelle terrain</p>
          </div>
          <button onClick={onClose} className="p-3 text-stone-500 hover:text-white transition-colors" aria-label="Fermer la caméra"><X className="w-6 h-6" /></button>
        </div>

        <div className="relative aspect-square w-full bg-stone-800 rounded-[3rem] overflow-hidden border-2 border-stone-700 shadow-2xl">
          {!capturedImage ? (
            <>
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover grayscale" aria-label="Aperçu caméra en direct" />
              {isStarting && <div className="absolute inset-0 flex items-center justify-center bg-stone-900/50"><RefreshCw className="w-8 h-8 text-white animate-spin" /></div>}
              {error && <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center space-y-4" role="alert"><p className="text-white font-serif">{error}</p><button onClick={startCamera} className="px-6 py-2 bg-white text-stone-900 rounded-full font-bold text-xs uppercase">Réessayer</button></div>}
            </>
          ) : (
            <img src={capturedImage} alt="Portrait capturé" className="w-full h-full object-cover grayscale" />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex justify-center gap-6">
          {!capturedImage ? (
            <button onClick={capturePhoto} disabled={!stream} className="flex flex-col items-center gap-3 disabled:opacity-30 group" aria-label="Prendre la photo">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl group-active:scale-90 transition-transform"><Aperture className="w-10 h-10 text-stone-900" /></div>
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Capturer</span>
            </button>
          ) : (
            <div className="flex gap-12">
              <button onClick={() => { setCapturedImage(null); startCamera(); }} className="flex flex-col items-center gap-3" aria-label="Refaire la photo"><div className="w-16 h-16 bg-stone-800 border border-stone-700 rounded-full flex items-center justify-center text-white hover:bg-stone-700 transition-all"><RefreshCw className="w-6 h-6" /></div><span className="text-[9px] font-black text-stone-500 uppercase tracking-widest">Refaire</span></button>
              <button onClick={() => { onCapture(capturedImage); onClose(); }} className="flex flex-col items-center gap-3" aria-label="Confirmer le portrait"><div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl hover:bg-blue-500 transition-all scale-110"><Check className="w-8 h-8" /></div><span className="text-[9px] font-black text-white uppercase tracking-widest">Utiliser</span></button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default React.memo(CameraCapture);
