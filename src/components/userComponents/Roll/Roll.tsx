import RollCard from "./RollCard"

const Roll = () => {
    return(
        <>
        <div className="flex flex-col   w-full items-center  md:max-h-[90vh] max-h-[83vh] scrollbar-hide overflow-y-scroll lg:px-16  space-y-2 ">
        <RollCard/>
        <RollCard/>
        <RollCard/>
        </div>
        </>
    )
}

export default Roll 