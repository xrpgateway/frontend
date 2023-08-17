import { useState } from "react";
import Button from "../Componenets/Button";
import { ToastContainer, toast } from "react-toastify";
import { XummPkce } from "xumm-oauth2-pkce";
import { dropsToXrp } from "xrpl";
import Lottie from "lottie-react";
import WalletLoading from "../Animations/wallet-loading.json";
import signature_animation from "../Animations/signature.json";
import submit_other from "../Animations/submit_other.json";
import fiveBellsCondition from "five-bells-condition";
import crypto from "crypto";

export default () => {
  const [isConnected, setConnect] = useState(false);
  const [wcLoading, setWCLoading] = useState(false);
  const [step, setStep] = useState(1);
  const query = new URLSearchParams(window.location.search);

  const id = query.get("id");
  const email = query.get("email");
  const amount = query.get("amount");

  const onPaymentInit = () => {

    setStep(2);
    const preimageData = crypto.randomBytes(32);
    const fulfillment = new fiveBellsCondition.PreimageSha256();
    fulfillment.setPreimage(preimageData);

    const condition = fulfillment
      .getConditionBinary()
      .toString("hex")
      .toUpperCase();
    console.log("Condition:", condition);

    // Keep secret until you want to finish the escrow
    const fulfillment_hex = fulfillment
      .serializeBinary()
      .toString("hex")
      .toUpperCase();
    console.log("Fulfillment:", fulfillment_hex);

    var payload = {
      txjson: {
        TransactionType: "EscrowCreate",
        Amount: amount,
        Destination: "rn957ufJRsuErNt4BS8RJTrk9VhJnrBnKc",
        Condition: condition,
        CancelAfter: 3472349872,
      },
    };
    window.sdk.payload
      .createAndSubscribe(payload, async function (payloadEvent) {
        if (typeof payloadEvent.data.signed !== "undefined") {
          // What we return here will be the resolved value of the `resolved` property
          return payloadEvent.data;
        }
      })
      .then(async function ({ created, resolved }) {
        toast.success(
          "Check xumm wallet we have sent you sign request to get approval of your split!",
          {
            position: "bottom-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          }
        );

        resolved.then(async function (payloadOutcome) {
          const txHash = payloadOutcome.txid;
          let dat = { splitPaymentID: id, txHash, secret: fulfillment_hex, email }
          fetch(`${process.env.REACT_APP_API}/transaction/escrow_submit`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(dat),
          })
            .then((res) => res.json())
            .then((e) => {
              if (e.success) {
                setStep(3);
                toast.success(
                  "Congratulations! Your split approved successfully!",
                  {
                    position: "bottom-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                  }
                );
              } else {
                toast.error("Failed to submit transaction!", {
                  position: "bottom-center",
                  autoClose: 5000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                  theme: "dark",
                });
                setStep(1);
              }
            });
        });
      })
      .catch(function (payloadError) {
        console.error(payloadError);
      });
  };


  const signedInHandler = (authorized) => {
    // Assign to global,
    // please don't do this but for the sake of the demo it's easy
    window.sdk = authorized.sdk;
    window.wallet_address = authorized.me.account;
    setConnect(true);
    setWCLoading(false);
  };

  const onConnect = async () => {
    setWCLoading(true);
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
    <div className="mt-5 h-full w-full flex flex-col items-center justify-center">
      {step == 1 && (
        <>
          {!wcLoading && !isConnected && (
            <Button onClick={onConnect} text={"Connect Wallet With Xumm!"} />
          )}
          {wcLoading && (
            <Lottie
              style={{ height: 128, width: 128 }}
              animationData={WalletLoading}
              loop={true}
            />
          )}
          {isConnected && <Button  onClick={onPaymentInit} text={`Pay ${dropsToXrp(amount)} XRP`} />}
        </>
      )}
      {step == 2 && (
        <div className="flex flex-col flex-1 justify-center items-center mt-2">
          <Lottie
            style={{
              height: 100,
              width: 100,
              alignSelf: "center",
            }}
            animationData={signature_animation}
            loop={true}
          />
          <div className="text-lg font-semibold mt-2">
            Waiting for signature approval!
          </div>
        </div>
      )}
      {step == 3 && (
        <>
          <div className="flex flex-col flex-1 justify-center items-center mt-2">
            <Lottie
              style={{
                height: 100,
                width: 100,
                alignSelf: "center",
              }}
              animationData={submit_other}
              loop={true}
            />
            <div className="text-center font-semibold mt-2">
              Your transaction will be successful once all invited parties
              approve it.
            </div>
          </div>
        </>
      )}
      <ToastContainer />
    </div>
  );
};
