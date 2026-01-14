import { useEffect, useState, useCallback, useRef } from "react";
import { latestRollApi } from "../../../services/user/api";
import { ClipLoader } from "react-spinners";
import { IRoll } from "../profile/UserPosts";
import RollCard from "./RollCard";
import { useNavigate } from "react-router-dom";

const Roll = () => {
  const [rolls, setRolls] = useState<IRoll[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const touchStartY = useRef(0);
  const isScrolling = useRef(false);
  const navigate = useNavigate();

  // Hide navbar when on roll page
  useEffect(() => {
    // Hide the navbar by adding a class to body
    document.body.classList.add("roll-page");
    
    return () => {
      document.body.classList.remove("roll-page");
    };
  }, []);

  // Fetch rolls
  const fetchRolls = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    
    try {
      loadingRef.current = true;
      setLoading(true);
      const response = await latestRollApi(page, 10);
      const fetchedRolls = response.data.data;
      
      setRolls((prevRolls) => {
        const allRolls = [...prevRolls, ...fetchedRolls];
        return allRolls.filter(
          (value, index, self) => index === self.findIndex((t) => t.id === value.id)
        );
      });
      
      setHasMore(fetchedRolls.length === 10);
      setPage((prevPage) => prevPage + 1);
      
    } catch (err) {
      console.error("Error fetching rolls:", err);
    } finally {
      loadingRef.current = false;
      setLoading(false);
      setInitialLoading(false);
    }
  }, [page, hasMore]);

  // Initial fetch
  useEffect(() => {
    fetchRolls();
  }, []);

  // Handle touch events for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    isScrolling.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY;
    const diff = touchStartY.current - currentY;
    
    if (Math.abs(diff) > 10) {
      isScrolling.current = true;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isScrolling.current) return;
    
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;
    const minSwipeDistance = 50;

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0 && currentIndex < rolls.length - 1) {
        // Swipe up - next roll
        setCurrentIndex(prev => prev + 1);
      } else if (diff < 0 && currentIndex > 0) {
        // Swipe down - previous roll
        setCurrentIndex(prev => prev - 1);
      }
    }
  };

  // Handle wheel scroll for desktop
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    
    if (e.deltaY > 20 && currentIndex < rolls.length - 1) {
      // Scroll down - next roll
      setCurrentIndex(prev => prev + 1);
    } else if (e.deltaY < -20 && currentIndex > 0) {
      // Scroll up - previous roll
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex, rolls.length]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown') {
      e.preventDefault();
      if (currentIndex < rolls.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      if (currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    } else if (e.key === 'Home') {
      e.preventDefault();
      setCurrentIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setCurrentIndex(rolls.length - 1);
    } else if (e.key === 'Escape') {
      // Go back on escape
      navigate(-1);
    }
  }, [currentIndex, rolls.length, navigate]);

  // Add event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      window.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleWheel, handleKeyDown]);

  // Scroll to current roll
  useEffect(() => {
    if (containerRef.current && rolls.length > 0) {
      const container = containerRef.current;
      const rollElements = container.querySelectorAll('[data-roll-index]');
      if (rollElements[currentIndex]) {
        rollElements[currentIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  }, [currentIndex, rolls.length]);

  // Fetch more rolls when near the end
  useEffect(() => {
    if (currentIndex >= rolls.length - 3 && hasMore && !loading) {
      fetchRolls();
    }
  }, [currentIndex, rolls.length, hasMore, loading, fetchRolls]);

  const handleIsAudioOn = () => {
    setIsAudioOn(!isAudioOn);
  };

  if (initialLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black z-50">
        <div className="flex flex-col items-center gap-4">
          <ClipLoader size={50} color="#8b5cf6" />
          <p className="text-lg text-gray-300">Loading reels...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Top Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-30 p-2 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex justify-center gap-1 max-w-md mx-auto">
          {rolls.slice(0, 8).map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-purple-500 flex-1'
                  : 'bg-gray-700/50 flex-1'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-4 left-4 z-30 p-2 text-white bg-black/40 rounded-full hover:bg-black/60 transition-all duration-200 backdrop-blur-sm"
        aria-label="Go back"
      >
        ←
      </button>

      {/* Current Roll Indicator */}
      <div className="fixed top-4 left-16 z-30 hidden md:block">
        <div className="px-3 py-1 text-sm text-white bg-black/50 backdrop-blur-sm rounded-full">
          {currentIndex + 1} / {rolls.length}
        </div>
      </div>

      {/* Audio Control */}
      <button
        onClick={handleIsAudioOn}
        className="fixed top-4 right-4 z-30 p-3 text-white bg-black/50 rounded-full hover:bg-black/70 transition-all backdrop-blur-sm"
        aria-label={isAudioOn ? "Mute sound" : "Unmute sound"}
      >
        {isAudioOn ? (
          <div className="flex items-center gap-2">
            <span className="text-sm">🔊</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm">🔇</span>
          </div>
        )}
      </button>

      {/* Navigation Controls - Desktop Only */}
      <div className="hidden md:flex fixed right-4 top-1/2 transform -translate-y-1/2 z-30 flex-col gap-2">
        <button
          onClick={() => currentIndex > 0 && setCurrentIndex(prev => prev - 1)}
          disabled={currentIndex === 0}
          className="p-3 text-white bg-black/50 rounded-full hover:bg-black/70 transition-all disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-sm"
          aria-label="Previous reel"
        >
          ↑
        </button>
        <div className="text-center text-xs text-gray-300 py-1">
          {currentIndex + 1}/{rolls.length}
        </div>
        <button
          onClick={() => currentIndex < rolls.length - 1 && setCurrentIndex(prev => prev + 1)}
          disabled={currentIndex === rolls.length - 1}
          className="p-3 text-white bg-black/50 rounded-full hover:bg-black/70 transition-all disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-sm"
          aria-label="Next reel"
        >
          ↓
        </button>
      </div>

      {/* Main Container */}
      <div
        ref={containerRef}
        className="fixed inset-0 w-full h-screen overflow-hidden bg-black"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="h-full snap-y snap-mandatory overflow-y-auto scrollbar-hide">
          {rolls.map((roll, index) => (
            <div
              key={roll.id}
              data-roll-index={index}
              className="h-screen snap-start relative flex items-center justify-center"
            >
              <RollCard
                roll={roll}
                isAudioOn={isAudioOn}
                handleIsAudioOn={handleIsAudioOn}
                setRolls={setRolls}
              />
            </div>
          ))}
          
          {/* Loading Indicator */}
          {loading && (
            <div className="h-screen flex items-center justify-center bg-black">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <ClipLoader size={40} color="#8b5cf6" />
                  <div className="absolute inset-0 animate-ping rounded-full bg-purple-500/20"></div>
                </div>
                <p className="text-gray-300">Loading more reels...</p>
              </div>
            </div>
          )}
          
          {/* End of Rolls */}
          {!hasMore && rolls.length > 0 && (
            <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black">
              <div className="text-center p-8 max-w-md">
                <div className="text-6xl mb-6 animate-bounce">🎬</div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  You've reached the end!
                </h3>
                <p className="text-gray-400 mb-8">
                  That's all the reels for now. Check back later for more amazing content!
                </p>
                <button
                  onClick={() => setCurrentIndex(0)}
                  className="px-8 py-3 text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-full hover:opacity-90 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                >
                  Back to Top
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Swipe Hint - Mobile Only */}
      <div className="md:hidden fixed bottom-20 left-1/2 transform -translate-x-1/2 z-30">
        <div className="flex flex-col items-center text-white/70 text-sm animate-pulse">
          <div className="flex flex-col items-center mb-1">
            <span className="text-2xl">↑↓</span>
            <span className="text-xs mt-1">Swipe to navigate</span>
          </div>
        </div>
      </div>

      {/* Controls Hint - Desktop Only */}
      <div className="hidden md:block fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30">
        <div className="flex items-center gap-2 text-white/60 text-sm">
          <kbd className="px-2 py-1 bg-black/50 rounded text-xs">↑↓</kbd>
          <span>or</span>
          <kbd className="px-2 py-1 bg-black/50 rounded text-xs">SPACE</kbd>
          <span>to navigate</span>
        </div>
      </div>
    </>
  );
};

export default Roll;