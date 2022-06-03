import React from "react";
import Head from "next/head";

interface IBase {
  title?: string;
}

const Page = (props: React.PropsWithChildren<IBase>) => {
  return (
    <React.Fragment>
      <Head>
        <title>{props.title != undefined ? props.title + " | Music Scraper - HorseGlass.info" : "Music Scraper | HorseGlass.info"}</title>
      </Head>

      <main className="w-11/12 sm:w-10/12 md:w-9/12 xl:w-8/12 h-full m-auto">{props.children}</main>
    </React.Fragment>
  );
};

export default Page;
