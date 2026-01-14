import React, { useEffect, useState } from "react";
import { BiArrowBack } from "react-icons/bi";
import { IoIosArrowBack, IoIosShareAlt } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";
import { IoBookmarkOutline, IoClose } from "react-icons/io5";
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import { BsThreeDots } from "react-icons/bs";
import { FaRegComment } from "react-icons/fa";
import { ExploreI } from "../../../Types/exploreTypes";
import { RootState } from "../../../redux/store";
import { useSelector } from "react-redux";
import Comment from "../post/Comment";
// import { useSocket } from "../../../context/SocketContext";
import { DEFAULT_PROFILE_IMAGE } from "../../../assets/images";
import { timeformat } from "../../../utils/formating";
import { useExploreItem } from "../../../hooks/useExploreItem";
import { IComment } from "../../../Types/commentTypes";

interface Props {
  index: number | null;
  data: ExploreI[];
  onClose: () => void;
}

const OpenedExplore: React.FC<Props> = ({ index, data, onClose }) => {
  // initialize index safely
  const initialIndex = typeof index === "number" && !Number.isNaN(index) ? index : 0;
  const [localIndex, setLocalIndex] = useState<number>(initialIndex);
  const currentItem = data?.[localIndex] ?? null;
  const {
    isPlaying,
    isAudioOn,
    comments,
    loadingComments,
    commentError,
    togglePlay,
    setIsAudioOn,
    setComment,
    comment: commentText,
    handleCommentPost
  } = useExploreItem(currentItem);
  const loggedUser = useSelector((state: RootState) => state.UserReducer.user);
  // const { socket } = useSocket();

  // keep component in sync if parent index or data changes
  useEffect(() => {
    const newIndex = typeof index === "number" && !Number.isNaN(index) ? index : 0;
    setLocalIndex(newIndex);
    // no setCurrentItem because we derive from data[localIndex]
  }, [index, data]);

  // navigation
  const backward = () => {
    if (localIndex > 0) {
      setLocalIndex((i) => i - 1);
    }
  };

  const forward = () => {
    if (localIndex < data.length - 1) {
      setLocalIndex((i) => i + 1);
    }
  };

  // guard: if no item, render fallback
  if (!currentItem) {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70">
        <div className="text-white">No item to display</div>
        <IoClose onClick={onClose} className="absolute top-3 right-3 text-2xl text-white cursor-pointer" />
      </div>
    );
  }

  // unique video id so multiple instances won't conflict
  const videoId = `reelVideo-${currentItem.id ?? currentItem.id ?? localIndex}`;

  

  return (
    <div onClick={onClose} className="absolute inset-0 z-50 flex justify-center w-full h-full bg-transparent md:items-center">
      <div onClick={(e) => e.stopPropagation()} className="flex flex-row items-center justify-center w-full md:max-h-[100vh] max-h-[93vh] h-screen md:justify-between md:p-5">
        <div onClick={backward} className="items-center justify-center hidden p-2 rounded-full cursor-pointer md:flex hover:bg-opacity-60 bg-background-light">
          <IoIosArrowBack className="text-xl text-text-black" />
        </div>

        <div className="flex flex-col w-full h-full max-w-4xl bg-background-light dark:bg-background-dark">
          {/* mobile header */}
          <div className="flex border-b md:hidden border-background-charcoal">
            <div className="flex flex-row w-full p-2 space-x-2 ">
              <BiArrowBack onClick={onClose} className="text-2xl text-black cursor-pointer dark:text-text-white" />
              <span className="text-text-white font-outfit">Explore</span>
            </div>
          </div>

          {/* body */}
          <div className="flex flex-col h-full md:flex-row">
            {/* media column */}
            <div className="flex flex-row items-center justify-center h-full border-r cursor-pointer md:flex-col md:w-2/5 md:flex bg-background-dark border-text-charcoal">
              <div className="w-full h-full">
                {currentItem.type === "reel" ? (
                  <div onClick={togglePlay} className="relative w-full h-full">
                    <video
                      id={videoId}
                      src={currentItem.mediaUrl ?? (currentItem.mediaUrls && currentItem.mediaUrls[0])}
                      className="object-contain w-full h-full max-h-[90vh]"
                      autoPlay
                      loop
                      muted={!isAudioOn}
                      playsInline
                    />
                    {isAudioOn ? (
                      <HiSpeakerWave onClick={() => setIsAudioOn(false)} className="absolute text-xl cursor-pointer right-3 bottom-3 text-text-white" />
                    ) : (
                      <HiSpeakerXMark onClick={() => setIsAudioOn(true)} className="absolute text-xl cursor-pointer right-3 bottom-3 text-text-white" />
                    )}
                  </div>
                ) : (
                  <img
                    src={currentItem.mediaUrls && currentItem.mediaUrls.length ? currentItem.mediaUrls[0] : currentItem.mediaUrl}
                    alt="Explore Item"
                    className="object-contain w-full h-full max-h-[90vh]"
                  />
                )}
              </div>
            </div>

            {/* mobile details */}
            <div className="flex flex-col p-2 space-y-3 md:hidden">
              <div className="flex flex-row items-center space-x-2">
                <div className="w-10 h-10 overflow-hidden rounded-full">
                  <img className="object-cover w-full h-full cursor-pointer" src={currentItem?.profileImage ?? DEFAULT_PROFILE_IMAGE} alt="" />
                </div>
                <div className="flex flex-row items-center w-11/12 ">
                  <span className="py-2 text-lg font-semibold cursor-pointer font-zilla dark:text-text-white text-text-charcoal">{currentItem.username}</span>
                  <BsThreeDots className="ml-auto cursor-pointer font-golos text-text-lavenderGray" />
                </div>
              </div>

              <div className="flex flex-row">
                <span className="font-golos text-text-lavenderGray">{currentItem.username ?? "user name"}</span>
                <span className="ml-auto font-golos text-text-lavenderGray">{timeformat(String(currentItem?.createdAt))}</span>
              </div>

              <div className="max-w-xl">
                <span className="font-golos text-text-darkGray">{currentItem.content}</span>
              </div>

              <div className="flex flex-row items-center justify-between">
                <div className="flex flex-row items-center space-x-3">
                  <div className="flex flex-col items-center justify-center"></div>
                  <div className="flex flex-col items-center justify-center">
                    <FaRegComment className="text-2xl cursor-pointer dark:text-text-white text-text-charcoal" />
                    <span className="font-golos dark:text-text-white text-text-charcoal">{currentItem.commentCount || 0}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <IoIosShareAlt className="text-2xl cursor-pointer dark:text-text-white text-text-charcoal" />
                    <span className="font-golos dark:text-text-white text-text-charcoal">0</span>
                  </div>
                </div>

                <div className="flex flex-col">
                  <IoBookmarkOutline className="text-2xl cursor-pointer dark:text-text-white text-text-charcoal" />
                </div>
              </div>
            </div>

            {/* comment area (desktop) */}
            <div className="flex-col hidden w-full h-full md:flex md:w-3/5">
              {/* header */}
              <div className="flex-row items-center w-full gap-2 p-2 border-b md:flex h-fit border-text-charcoal">
                <div className="w-12 h-12 overflow-hidden rounded-full">
                  <img className="object-cover w-full h-full cursor-pointer" src={currentItem.profileImage ?? DEFAULT_PROFILE_IMAGE} alt="" />
                </div>
                <span className="font-semibold cursor-pointer text-text-black dark:text-text-white">
                  {currentItem.username ?? "unknown user"}
                </span>

                <div className="flex flex-row ml-auto space-x-3 text-xl font-semibold cursor-pointer text-text-black dark:text-text-white">
                  {loggedUser?.username === currentItem.username && <BsThreeDots />}
                  <IoClose onClick={onClose} />
                </div>
              </div>

              {/* Comments Box */}
              <div className="flex-grow p-2 overflow-y-auto scrollbar-hide">
                {loadingComments ? (
                  <p className="text-text-darkGray">Loading comments...</p>
                ) : commentError ? (
                  <p className="text-red-500">{commentError}</p>
                ) : comments?.length ? (
                  comments.map((c:IComment, i:number) => <Comment key={i} comment={c} />)
                ) : (
                  <p className="text-text-darkGray">No comments yet. Be the first to comment!</p>
                )}
              </div>

              {/* footer */}
              <div className="flex flex-col items-center justify-between w-full mt-auto border-t border-text-charcoal">
                <div className="flex flex-row items-center justify-between w-full p-2">
                  <div className="flex flex-row items-center p-1 space-x-3">
                    <div className="flex flex-col items-center justify-center"></div>
                    <div className="flex flex-col items-center justify-center">
                      <FaRegComment className="text-2xl cursor-pointer dark:text-text-white text-text-charcoal" />
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <IoIosShareAlt className="text-2xl cursor-pointer dark:text-text-white text-text-charcoal" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <IoBookmarkOutline className="text-2xl cursor-pointer dark:text-text-white text-text-charcoal" />
                  </div>
                </div>

                <div className="flex items-center justify-between w-full p-2 space-x-2 border-t border-text-charcoal">
                  <input
                    value={commentText}
                    onChange={(e) => setComment(e.target.value)}
                    className="p-2 outline-none w-96 dark:bg-background-dark text-text-black bg-background-light dark:text-text-white "
                    type="text"
                    placeholder="Add a comment..."
                  />
                  <p onClick={handleCommentPost} className="text-blue-500 cursor-pointer font-golos">post</p>
                </div>
              </div>
            </div>
          </div>
          {/* end body */}
        </div>

        <IoClose onClick={onClose} className="fixed hidden text-3xl cursor-pointer md:flex text-text-white top-4 right-6" />
        <div onClick={forward} className="items-center justify-center hidden p-2 rounded-full cursor-pointer md:flex hover:bg-opacity-60 bg-background-light ">
          <IoIosArrowForward className="text-xl text-text-black" />
        </div>
      </div>
    </div>
  );
};

export default OpenedExplore;
