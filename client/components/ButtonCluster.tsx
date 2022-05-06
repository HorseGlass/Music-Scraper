import React from 'react';

interface IButtonCluster {acceptHandler: (customurl: string) => void, declineHandler: () => void}

const ButtonCluster = (props: IButtonCluster) => {
  const [showInput, setShowInput] = React.useState<boolean>(false);
  const [customURL, setCustomURL] = React.useState<string>('');

  const handleYTUrlButton = () => {
    setShowInput(!showInput);
  }

  return (
    <>
      <div className='flex flex-row w-full gap-2 mb-2 mt-3'>
        <button onClick={() => {setCustomURL(''); props.acceptHandler(customURL)}} className='grow bg-emerald-500 hover:bg-emerald-600'>Elfogad</button>
        <button onClick={() => {setCustomURL(''); props.declineHandler()}} className='grow bg-red-400 hover:bg-red-500'>Elutasít</button>
      </div>
      <button onClick={handleYTUrlButton} className='w-full text-center bg-opacity-0 hover:bg-opacity-0 text-sky-500 hover:text-sky-600 mb-1'>Egyedi Youtube URL hozzáadása</button>
      {showInput ? (
        <input value={customURL} onChange={e => setCustomURL(e.target.value)} className='w-full' type="text" />
      ) : (
        <></>
      )}
    </>
  );
}

export default ButtonCluster;