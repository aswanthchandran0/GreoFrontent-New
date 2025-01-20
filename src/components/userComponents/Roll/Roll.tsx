import { useEffect, useState } from "react";
import RollCard from "./RollCard";
import {  latestRollApi} from "../../../services/user/api";
import { ClipLoader } from "react-spinners";
import { IRoll } from "../profile/UserPosts";

const Roll = () => {
  const [rolls, setRolls] = useState<IRoll[]>([]);
  console.log("rolls", rolls);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true); // Check if more data is available
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [likedRolls, setLikedRolls] = useState<Set<string>>(new Set());
  // const [unlikedRolls, setUnlikedRolls] = useState<Set<string>>(new Set());

  // Fetch rolls
  console.log("liked rolls",likedRolls)
  const fetchRolls = async () => {
    if (loading || !hasMore) return; // Prevent duplicate calls
    try {
      setLoading(true);
      const response = await latestRollApi(page, 10);
      const fetchedRolls = response.data.data;
      
      setRolls((prevRolls) => {
        const allRolls = [...prevRolls, ...fetchedRolls]
        return allRolls.filter(
          (value,index,self)=> index == self.findIndex((t) => t._id === value._id)
        )
      }
    );
      setHasMore(fetchedRolls.length === 10);
      setPage((prevPage) => prevPage + 1);

      // Initialize likedRolls set
      const likedSet = new Set<string>(
        fetchedRolls
          .filter((r: IRoll) => r.isLikedByViewingUser)
          .map((r: IRoll) => r._id)
      );
      setLikedRolls((prev) => new Set([...prev, ...likedSet]));
      
    } catch (err) {
      console.error("Error fetching rolls:", err);
    } finally {
      setLoading(false);
    }
  };

  // Detect scrolling to the bottom
  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 100
    ) {
      fetchRolls();
    }
  }

  // fetch initial rolls
  useEffect(() => {
    fetchRolls(); // Initial fetch
  }, []);


  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [rolls]);

  const handleIsAudioOn = () => {
    setIsAudioOn(!isAudioOn);
  };

  return (
    <>
      <div className="flex flex-col    w-full items-center  md:max-h-[90vh] max-h-[83vh] scrollbar-hide overflow-y-scroll lg:px-16  space-y-2 ">
        {rolls.map((roll) => (
          <RollCard
            key={roll._id}
            roll={roll}
            isAudioOn={isAudioOn}
            handleIsAudioOn={handleIsAudioOn}
            setRolls={setRolls}
          />
        ))}

        {loading && (
          <div className="flex items-center justify-center mt-5 h-dvh w-dvh">
            <ClipLoader size={50} color={"#00bcd4"} loading={loading} />
          </div>
        )}

        {!hasMore && (
          <p className="text-sm font-golos text-text-Grayish">
            No more rolls to show...
          </p>
        )}
      </div>
    </>
  );
};

export default Roll;
