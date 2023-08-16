import React, { useState } from "react";
import Button from "../Componenets/Button";
import Lottie from "lottie-react";
import WalletLoading from "../Animations/wallet-loading.json"

export default () => {
  const [isLoggedIn, setLogin] = useState(false);
  const [isLoading, setLoading] = useState(false);

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
              {!isLoading && <Button onClick={()=>{ setLoading(true) } }  text={"Connect With Xumm!"} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
