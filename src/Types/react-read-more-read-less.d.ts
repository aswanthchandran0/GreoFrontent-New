declare module 'react-read-more-read-less' {
    import React from 'react';
  
    interface ReadMoreReadLessProps {
      children: React.ReactNode;
      charLimit?: number;
      moreText?: string;
      lessText?: string;
      readMoreClassName?: string;
      readLessClassName?: string;
    }
  
    const ReadMoreReadLess: React.FC<ReadMoreReadLessProps>;
  
    export default ReadMoreReadLess;
  }