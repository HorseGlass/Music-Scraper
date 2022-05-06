import React from 'react';
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import Page from '../components/Page'
import ButtonCluster from '../components/ButtonCluster';
import TitleCluster from '../components/TitleCluster';

const Results: NextPage = () => {
  const router = useRouter();
  const { data } = router.query;
  const [fetched, setFetched] = React.useState();
  const [error, setError] = React.useState<boolean>(false);
  const [current, setCurrent] = React.useState<number>(0);
  const [parsed, setParsed] = React.useState([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [done, setDone] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (typeof data == 'string') {
      let parsed = JSON.parse(decodeURIComponent(data));
      if (parsed['redirected'] == 'user-prompt') {
        setFetched(parsed);
      } else {
        setError(true);
      }
    } else {
      setError(true);
    }
  }, [])

  const returnToMain = () => {
    router.replace('/');
  }

  const acceptHandle = (customURL: string) => {
    if (fetched) {
      let newArray = parsed;
      (newArray as any).push({
        artist: (fetched['musics'][current as any]['title' as any] as any).split('-')[0].trim(),
        title: (fetched['musics'][current as any]['title' as any] as any).split('-')[1].trim(),
        link: customURL.length > 0 ? customURL : fetched['musics'][current as any]['ytLink' as any]
      })
      setParsed(newArray);
      console.log(parsed);
    }
    if (fetched && current + 1 >= (fetched['musics'] as any).length) {
      setLoading(true);
      sendZipRequest();
      return;
    }
    setCurrent(current+1);
  }

  const declineHandle = () => {
    if (fetched && current + 1 >= (fetched['musics'] as any).length) {
      setLoading(true);
      sendZipRequest();
      return;
    }
    setCurrent(current+1);
  }

  const handleBlob = (blob: any) => {
    if (fetched) {
      const downloadURL = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadURL;
      link.setAttribute('download', `${fetched['station']}.zip`)

      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      setLoading(false);
      setDone(true);
    }
  }

  const sendZipRequest = () => {
    fetch(`/api/download?data=${encodeURIComponent(JSON.stringify(parsed))}`).then(res => res.blob()).then(data => handleBlob(data));
  }

  return (
    <Page>
      <div className='flex flex-col justify-center items-center h-full'>
        {fetched && !loading && !done ? (
          <>
            <div className='absolute top-3 left-3 font-light text-lg'>{current+1}/{(fetched['musics'] as any).length}</div>
            {/* <button className='absolute top-3 right-3 font-light text-lg'>Átugrás</button> */}
            <div className='w-1/3'>
              <iframe src={fetched['musics'][current as any]['embedLink' as any]} frameBorder="0" className='w-full h-[250px]'></iframe>
              <TitleCluster raw={fetched['musics'][current as any]['title' as any]} />
              <ButtonCluster acceptHandler={acceptHandle} declineHandler={declineHandle} />
            </div>
          </>
        ) : (
          <></>  
        )}
        {error || !fetched ? (
          <>
            <span className='font-bold text-red-400 text-2xl mb-2'>Nem található feldolgozható adat</span>
            <button onClick={returnToMain}>Vissza a főoldalra</button>
          </>
        ) : (
          <></>
        )}
        {loading ? (
          <>
            <div className="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
            <span className='text-xl font-light'>Lejátszási lista generálása...</span>
          </>
        ) : (
          <></>
        )}
        {done ? (
          <>
            <span className='text-xl font-light'>Kész is vagyunk</span>
            <button onClick={returnToMain}>Vissza a főoldalra</button>
          </>
        ) : (
          <></>
        )}
      </div>
    </Page>
  )
}

export default Results;
