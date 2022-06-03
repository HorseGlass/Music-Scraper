import React from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import Page from "../components/Page";

const Home: NextPage = () => {
  const router = useRouter();
  const { e } = router.query;
  const [value, setValue] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);

  const handleFetchResponse = (responseData: any) => {
    if (responseData["status"] == "doesn't exists") {
      setLoading(false);
      router.replace("/?e=Érvénytelen rádió állomás");
    } else {
      let newResponse = responseData;
      delete newResponse["status"];
      newResponse["redirected"] = "user-prompt";
      newResponse["station"] = value;
      router.push({ pathname: "/results", query: { data: encodeURIComponent(JSON.stringify(responseData)) } });
    }
  };

  const handleScrapeButton = () => {
    if (value.length == 0) {
      router.replace("/?e=Kötelező megadni egy nevet");
    } else {
      fetch(`/api/fetch/${value}`)
        .then((response) => response.json())
        .then((data) => handleFetchResponse(data));
      setLoading(true);
    }
  };

  return (
    <Page>
      <div className="flex flex-col justify-center items-center h-full relative">
        {!loading ? (
          <>
            <a href="http://horseglass.info" className="absolute left-2 top-2 text-lg">
              {"<"} Vissza a főoldalra
            </a>
            <span className="font-bold text-2xl mb-4 text-center">
              <a href="https://myonlineradio.hu" target={"_blank"}>
                MyOnlineRadio
              </a>{" "}
              oldalról add meg a csatorna linkjét
            </span>
            <input placeholder="pl.: dance-music" value={value} onChange={(event) => setValue(event.target.value)} className={e != undefined ? "outline-red-400 outline-dashed" : ""} type="text" />
            <span className="font-light mt-1 text-red-400">{e}</span>
            <button onClick={handleScrapeButton} className="mt-2">
              Zenék lekérése
            </button>
          </>
        ) : (
          <>
            <div className="lds-roller">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
            <span className="text-xl font-light">Adatok lekérdezése...</span>
          </>
        )}
      </div>
    </Page>
  );
};

export default Home;
