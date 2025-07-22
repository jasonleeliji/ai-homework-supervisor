
import React, { useRef, useEffect, useImperativeHandle, forwardRef, useState } from 'react';

interface CameraProps {
  onCameraError: (error: string) => void;
}

export interface CameraHandle {
  captureFrame: () => string | null;
}

const Camera = forwardRef<CameraHandle, CameraProps>(({ onCameraError }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const setupCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user"
          } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraReady(true);
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        onCameraError("无法访问摄像头。请检查浏览器权限。");
        setIsCameraReady(false);
      }
    };

    setupCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onCameraError]);

  useImperativeHandle(ref, () => ({
    captureFrame: () => {
      if (videoRef.current && canvasRef.current && isCameraReady) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        // Define a smaller target resolution for the AI analysis to save tokens
        const analysisWidth = 320;
        const analysisHeight = 240;

        canvas.width = analysisWidth;
        canvas.height = analysisHeight;
        
        const context = canvas.getContext('2d');
        if (context) {
          // Draw the full video frame onto the smaller canvas, effectively downscaling it.
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          // Use a slightly lower quality to further reduce file size and save tokens.
          return canvas.toDataURL('image/jpeg', 0.7);
        }
      }
      return null;
    },
  }));

  return (
    <div className="relative w-full aspect-video bg-slate-900 rounded-lg overflow-hidden shadow-inner">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover transition-opacity duration-500 ${isCameraReady ? 'opacity-100' : 'opacity-0'}`}
      />
      {!isCameraReady && (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <p>正在启动摄像头...</p>
        </div>
      )}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
});

export default React.memo(Camera);