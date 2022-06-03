import React from 'react';

interface ITitleCluster {raw: string}

const TitleCluster = (props: ITitleCluster) => {
  const copyTitle = () => {
    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(props.raw)}`, '_blank');
  }

  return (
    <div className='flex flex-col items-center justify-center select-none cursor-grab active:cursor-grabbing active:text-sky-400 transition-colors' onClick={copyTitle}>
      <div className='font-bold text-xl'>{props.raw.split('-')[1]}</div>
      <div className='font-light'>{props.raw.split('-')[0]}</div>
    </div>
  );
}

export default TitleCluster;