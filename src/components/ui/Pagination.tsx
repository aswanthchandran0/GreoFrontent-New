import { ChevronLeft, ChevronRight } from "lucide-react";


interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }
  

const Pagination:React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
   

    return (
    <div className="flex items-center justify-center mt-8 space-x-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`p-2 rounded-full ${
          currentPage === 1
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-purple-600 hover:bg-purple-100'
        }`}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
        <button
          key={pageNumber}
          onClick={() => onPageChange(pageNumber)}
          className={`w-8 h-8 rounded-full ${
            currentPage === pageNumber
              ? 'bg-purple-600 text-white'
              : 'text-gray-600 hover:bg-purple-100'
          }`}
        >
          {pageNumber}
        </button>
      ))}

      <button
       onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`p-2 rounded-full ${
          currentPage === totalPages
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-purple-600 hover:bg-purple-100'
        }`}
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>

    )
}


  export default Pagination