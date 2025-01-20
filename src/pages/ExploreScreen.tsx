import { useEffect, useRef, useState } from "react";
import { getExploreDataApi } from "../services/user/api";
import ExploreFeed from "../components/userComponents/explore/ExploreFeed";
import toast from "react-hot-toast";
import { LoaderSpinner } from "../components/ui/LoadingSpinner";
import { ExploreI } from "../Types/exploreTypes";

const ExploreScreen = () => {
  const [data, setData] = useState<ExploreI[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(true); // Track if more data is available
  const observerRef = useRef(null);
  const pageRef = useRef(1);
  const containerRef = useRef<HTMLDivElement | null>(null);

  console.log('explore data',data)
  const fetchData = async () => {
    if (isFetching || !hasMore) return;
    setIsFetching(true);
    console.log("Fetching page", pageRef.current);
    try {
      const response = await getExploreDataApi(pageRef.current, 10);

      if (response.data.length < 10) {
        setHasMore(false); // If less than 10 items, stop fetching
      }

      setData((prevData) => {
        if (prevData.length === 0) {
          // If prevData is empty, set it directly to the fetched data
          return response.data;
        } else {
          // If prevData has data, filter out duplicates and append new data
          const existingData = new Set(prevData.map((data) => data?.id)); // Set for fast lookup
          const uniqueData = response.data.filter(
            (data:ExploreI) => !existingData.has(data.id)
          ); // Filter out duplicates
          return [...prevData, ...uniqueData]; // Add the unique new data to the existing data
        }
      });

      pageRef.current += 1;
    } catch (err) {
      console.log("err", err);
      toast.error("something went wrong");
    } finally {
      setIsFetching(false);
    }
  };
  useEffect(() => {
    fetchData(); // Initial fetch
  }, []);

  // Handle scroll event
  const handleScroll = () => {
    if (containerRef.current) {
      const bottom =
        containerRef.current.scrollHeight ===
        containerRef.current.scrollTop + containerRef.current.clientHeight;
      if (bottom && !isFetching && hasMore) {
        fetchData();
      }
    }
  };

  // Add scroll event listener
  useEffect(() => {
    fetchData(); // Initial data fetch on component mount

    // Attach the scroll event listener
    const currentContainer = containerRef.current;
    if (currentContainer) {
      currentContainer.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (currentContainer) {
        currentContainer.removeEventListener("scroll", handleScroll); // Clean up listener on unmount
      }
    };
  }, [isFetching, hasMore]);

  console.log("Data:", data);
  console.log("Page Number:", pageRef.current);
  return (
    <div className="flex h-full dark:bg-background-dark bg-background-light md:max-h-[90vh] max-h-[83vh]   lg:px-16 justify-center">
      <div
        ref={containerRef}
        className="grid grid-cols-3 gap-1 pb-12 overflow-y-auto md:px-80 scrollbar-hide"
      >
        {Array.isArray(data) && data.length > 0 ? (
          data.map((item, index) => (
            <ExploreFeed item={item} index={index} key={item.id} />
          ))
        ) : (
          <div className="flex items-center justify-center ">
            {/* <p className="text-text-white">No content available</p> */}
          </div>
        )}

        {hasMore && (
          <div
            ref={observerRef}
            className=" flex h-full  dark:bg-background-dark bg-background-light md:max-h-[90vh] max-h-[83vh]   lg:px-16 justify-center"
          >
            <div className="relative flex h-[80vh] w-[90vh] ">
              <LoaderSpinner loading={isFetching} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreScreen;
