import { useRef, useState, useEffect } from "react";

export default function MediaCanvas() {
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const [media, setMedia] = useState(null);
  const [isVideo, setIsVideo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(10);
  const [currentTime, setCurrentTime] = useState(null);
  const [showCurrentTime, setShowCurrentTime] = useState(false);
  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(800);

  useEffect(() => {
    if (media && !isVideo) {
      drawMedia(media);
    }
  }, [media, isVideo, width, height]);

  useEffect(() => {
    let timer;
    if (isPlaying) {
      setCurrentTime(startTime);
      setShowCurrentTime(true);
      timer = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= endTime) {
            setIsPlaying(false);
            setShowCurrentTime(false);
            if (isVideo && videoRef.current) {
              videoRef.current.pause();
            }
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isPlaying, startTime, endTime]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setIsVideo(file.type.startsWith("video"));
      setMedia(url);
    }
  };

  const drawMedia = (src) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = src;
    img.onload = () => {
      canvas.width = width;
      canvas.height = height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (isVideo && videoRef.current) {
        videoRef.current.pause();
      }
    } else {
      setIsPlaying(true);
      setCurrentTime(startTime);
      setShowCurrentTime(true);
      if (isVideo && videoRef.current) {
        videoRef.current.currentTime = startTime;
        videoRef.current.play();
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <input
        type="file"
        accept="image/*,video/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="w-full h-[800px] flex">
        <div className="w-1/4 flex flex-col items-center justify-center border-r border-gray-300 p-4 gap-4">
          <button 
            onClick={() => fileInputRef.current.click()} 
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Import Media
          </button>
          {isVideo && media && (
            <button 
              onClick={togglePlayPause} 
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              {isPlaying ? "Pause" : "Play"}
            </button>
          )}
          <div className="flex flex-col gap-2 mt-4">
            <label>Width: <input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} className="border p-1 w-20" /></label>
            <label>Height: <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="border p-1 w-20" /></label>
            <label>Start Time: <input type="number" value={startTime} onChange={(e) => setStartTime(Number(e.target.value))} className="border p-1 w-20" /></label>
            <label>End Time: <input type="number" value={endTime} onChange={(e) => setEndTime(Number(e.target.value))} className="border p-1 w-20" /></label>
            {showCurrentTime && <div className="text-lg font-bold">Time: {currentTime}s</div>}
          </div>
        </div>
        <div 
          className="w-3/4 flex justify-center items-center border border-gray-300 relative"
          style={{ width: `${width}px`, height: `${height}px` }}
        >
          {media && (
            isVideo ? (
              <video
                ref={videoRef}
                src={media}
                className="w-full h-full object-cover"
                controls
                width={width}
                height={height}
              />
            ) : (
              <canvas
                ref={canvasRef}
                className="w-full h-full"
              ></canvas>
            )
          )}
        </div>
      </div>
    </div>
  );
}
