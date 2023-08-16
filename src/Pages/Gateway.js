import React, { useEffect, useState } from "react";
import Button from "../Componenets/Button";
import Lottie from "lottie-react";
import WalletLoading from "../Animations/wallet-loading.json";
import { XummPkce } from "xumm-oauth2-pkce";
import TabNavigation from "../Componenets/TabNavigation";

export default () => {
  const [isLoggedIn, setLogin] = useState(true);
  const [isLoading, setLoading] = useState(false);
  const [tabId, onTabChange] = useState("1");
  const query = new URLSearchParams(window.location.search);

  const merchentId = query.get("merchentId");
  const merchentHash = query.get("merchentHash");
  const amount = query.get("amount");
  const data = query.get("data");
  const title = query.get("title");
  const description = query.get("desc");

  useEffect(() => {
    console.log(
      `Test --> ${window.location.search} \n ${merchentId} \n ${merchentHash} \n ${amount} \n ${data} \n ${title} \n ${description}`
    );
  }, []);
  const signedInHandler = (authorized) => {
    // Assign to global,
    // please don't do this but for the sake of the demo it's easy
    window.sdk = authorized.sdk;
    window.wallet_address = authorized.me.account;
    setLoading(false);
    setLogin(true);
  };

  const onConnect = async () => {
    var auth = new XummPkce("ffc1a4da-8ec2-40a7-a48d-fb23fb83cc43", {
      implicit: true,
    });

    auth.on("error", (error) => {
      console.log("error", error);
    });

    auth.on("success", async () => {
      console.log("success");
      auth.state().then((state) => {
        if (state.me) {
          console.log("success, me", JSON.stringify(state.me));

          signedInHandler(state);
        }
      });
    });

    auth.on("retrieved", async () => {
      // Redirect, e.g. mobile. Mobile may return to new tab, this
      // must retrieve the state and process it like normally the authorize method
      // would do
      console.log("Results are in, mobile flow, process sign in");

      auth.state().then((state) => {
        console.log(state);
        if (state) {
          console.log("retrieved, me:", JSON.stringify(state.me));
          signedInHandler(state);
        }
      });
    });

    await auth.authorize();
  };

  return (
    <div className="flex">
      <div
        className="h-full bg-slate-100 flex flex-col"
        style={{ width: "28rem", height: "42rem" }}
      >
        <div className="m-3 p-6 py-2 rounded-lg  bg-gradient-to-br  from-purple-500 to-purple-700 shadow-md transform hover:-translate-y-1 hover:shadow-lg transition-all">
          <span
            className="font-bold ml-2 text-white"
            style={{ fontSize: "1.8rem" }}
          >
            XRPG
          </span>
        </div>
        <div className="m-3 mt-2 mb-4 rounded-lg flex-1 bg-gradient-to-br from-gray-50 to-white  shadow-md">
          {!isLoggedIn && (
            <div className="w-full h-full flex justify-center items-center">
              {isLoading && (
                <Lottie
                  style={{ height: 128, width: 128 }}
                  animationData={WalletLoading}
                  loop={true}
                />
              )}
              {!isLoading && (
                <Button
                  onClick={() => {
                    setLoading(true);
                    onConnect();
                  }}
                  text={"Connect With Xumm!"}
                />
              )}
            </div>
          )}
          {isLoggedIn && (
            <div className="w-full h-full">
              <TabNavigation onTabChange={onTabChange} />
              <div className="p-4">
                {tabId == "1" && <div>Direct pay</div>}
                {tabId == "2" && <div>Split pay!</div>}
                {tabId == "0" && <div>Subscriptions!</div>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
