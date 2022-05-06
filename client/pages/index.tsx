import React from 'react';
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import Page from '../components/Page'

const Home: NextPage = () => {
  const router = useRouter();
  const { e } = router.query;
  const [value, setValue] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);

  const handleFetchResponse = (responseData: any) => {
    if (responseData['status'] == "doesn't exists") {
      setLoading(false);
      router.replace('/?e=Érvénytelen rádió állomás');
    } else {
      let newResponse = responseData;
      delete newResponse['status'];
      newResponse['redirected'] = 'user-prompt';
      newResponse['station'] = value;
      router.push(`/results?data=${encodeURIComponent(JSON.stringify(responseData))}`);
    }
  }

  const handleScrapeButton = () => {
    if (value.length == 0) {
      router.replace('/?e=Kötelező megadni egy nevet');
    } else {
      fetch(`/api/fetchradio/${value}`)
        .then(response => response.json())
        .then(data => handleFetchResponse(data));
      setLoading(true);
    }
  }

  return (
    <Page>
      <div className='flex flex-col justify-center items-center h-full'>
        {!loading ? (
          <>
            <span className='font-bold text-2xl mb-4'>Adja meg a zenecsatorna url címét</span>
            <input value={value} onChange={event => setValue(event.target.value)} className={e != undefined ? 'outline-red-400 outline-dashed' : ''} type="text" />
            <span className='font-light mt-1 text-red-400'>{e}</span>
            <button onClick={handleScrapeButton} className='mt-2'>Zenék lekérése</button>
          </>
        ) : (
          <>
            <div className="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
            <span className='text-xl font-light'>Adatok lekérdezése...</span>
          </>
        )}
        
      </div>
    </Page>
  )
}

export default Home
