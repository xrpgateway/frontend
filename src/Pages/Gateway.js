import React, { useState } from "react";
import Button from "../Componenets/Button";
import Lottie from "lottie-react";
import WalletLoading from "../Animations/wallet-loading.json"
import { XummPkce } from "xumm-oauth2-pkce";

export default () => {
  const [isLoggedIn, setLogin] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const signedInHandler = (authorized) => {
    // Assign to global,
    // please don't do this but for the sake of the demo it's easy
    //window.sdk = authorized.sdk;
    setLoading(false)
    setLogin(true)
  };

  const onConnect = async () => {
    var auth = new XummPkce("4dd5496e-2d69-4741-b242-f8607d415e72", {
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
          //window.wallet_address = state.me.account
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
          //window.wallet_address = state.me.account
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
              {isLoading && <Lottie style={{ height: 128, width: 128 }} animationData={WalletLoading} loop={true} />}
              {!isLoading && <Button onClick={()=>{ setLoading(true); onConnect(); } }  text={"Connect With Xumm!"} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
