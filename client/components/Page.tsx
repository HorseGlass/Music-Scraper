import React from 'react';
import Head from 'next/head';

interface IBase {title?: string};

const Page = (props: React.PropsWithChildren<IBase>) => {
  return (
    <React.Fragment>
      <Head>
        <title>{props.title != undefined ? props.title + ' | Music Scraper' : 'Music Scraper'}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com"/>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;400;700&display=swap" rel="stylesheet"></link>
      </Head>

      <main className='w-11/12 sm:w-10/12 md:w-9/12 xl:w-8/12 h-full m-auto'>
        {props.children}
      </main>
    </React.Fragment>
  );
}

export default Page;