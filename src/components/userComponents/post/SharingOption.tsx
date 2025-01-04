import { IoCloseOutline } from "react-icons/io5";
import { BiLinkAlt } from "react-icons/bi";
import { FaWhatsapp } from "react-icons/fa";
import toast from "react-hot-toast";

interface Props{
    postId:string
    onClose:()=>void
}
const SharingOption:React.FC<Props> =  ({postId,onClose}) => {
    const baseUrl = `http://localhost:5173/p/${postId}`

   // Function to handle copying the link
  const handleCopyLink = () => {
    navigator.clipboard
      .writeText(baseUrl)
      .then(() => {
        toast.success("Link copied to clipboard.");
      })
      .catch(() => {
        toast.error("Failed to copy the link. Please try again.");
      });
  };

  // Function to handle WhatsApp sharing
  const handleWhatsAppShare = () => {
    const whatsappShareLink = `https://wa.me/?text=${encodeURIComponent(
      `Check this out: ${baseUrl}`
    )}`;
    window.open(whatsappShareLink, "_blank");
  };
  
  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center w-full h-full pt-12 bg-transparent pb-14">
      <div className="flex flex-col items-center justify-center w-full h-screen bg-opacity-50 bg-background-dark">
        <div onClick={(e)=> e.stopPropagation()}  className="flex flex-col w-full items-center h-full max-w-md max-h-[50vh] rounded-md bg-background-customDarkGray ">
            <div className="relative flex flex-row items-center justify-center w-full p-3 border-b border-text-charcoal">
                           <p className="absolute cursor-pointer text-text-white font-outfit">share</p>
                           <IoCloseOutline onClick={onClose} className="flex ml-auto text-2xl font-bold cursor-pointer text-text-white"/>

                       </div>

                       <div className="flex flex-row items-center w-full p-2 mt-auto space-x-4 border-t border-background-charcoal">
                       
                       <div onClick={handleCopyLink} className="flex flex-col items-center gap-1">
                       <div className="flex items-center justify-center w-12 h-12 p-2 rounded-full cursor-pointer bg-background-dark ">
                       <BiLinkAlt  className="text-2xl text-text-white " />
                       </div>
                       <span className="text-xs cursor-pointer font-golos text-text-white ">Copy link</span>
                       </div>

                       <div onClick={handleWhatsAppShare}  className="flex flex-col items-center gap-1">
                       <div className="flex items-center justify-center w-12 h-12 p-2 rounded-full cursor-pointer bg-background-dark ">
                       <FaWhatsapp  className="text-2xl text-text-white " />
                       </div>
                       <span className="text-xs cursor-pointer font-golos text-text-white ">Whatsapp</span>
                       </div>
                       

                       </div>
        </div>
      </div>
    </div>
  );
};

export default SharingOption;
