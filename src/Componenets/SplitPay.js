import React, { useState } from "react";
import Button from "./Button";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import fiveBellsCondition from "five-bells-condition";
import crypto from "crypto";
import Lottie from "lottie-react";
import signature_animation from "../Animations/signature.json";
import submit_other from "../Animations/submit_other.json";

export default ({ amount, data, nonce, merchentId, merchentHash }) => {
  const [emails, setEmails] = useState([""]);
  const [step, setStep] = useState(1);

  const addEmailInput = () => {
    setEmails([...emails, ""]);
  };

  const removeEmailInput = (index) => {
    const updatedEmails = emails.filter((_, i) => i !== index);
    setEmails(updatedEmails);
  };

  const handleEmailChange = (index, value) => {
    const updatedEmails = [...emails];
    updatedEmails[index] = value;
    setEmails(updatedEmails);
  };

  const onPaymentInit = () => {
    for (let email of emails) {
      if (email == "") {
        toast.error("Email input can't be empty!", {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
        return;
      }
    }
    setStep(2);
    const mySplit = (parseInt(amount) / emails.length).toFixed(0);
    console.log("mySplit", mySplit);

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
        Amount: mySplit,
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
          const users = []
          for(let email of emails){
            users.push({
                email,
                txHash: "",
                secret: "",
            })
          }
          users[0].txHash = txHash
          users[0].secret = fulfillment_hex
          let dat = {
            merchantId: merchentId,
            amount: amount,
            nonce: nonce,
            signedHash: merchentHash,
            data: data,
            transactionHashes: [txHash],
            transactiontype: 2,
            users,
            extradata: "",
          };
          fetch(`${process.env.REACT_APP_API}/transaction/submitted`, {
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

  return (
    <div className="p-4 pt-0 h-full">
      {step == 1 && (
        <>
          <h4 className="text-lg font-semibold mb-2">Your Email</h4>
          <input
            type="email"
            value={emails[0]}
            onChange={(e) => handleEmailChange(0, e.target.value)}
            placeholder="Enter email"
            className="rounded-full border px-4 py-2 w-full focus:outline-none focus:ring focus:border-blue-300"
          />
          <h4 className="text-lg font-semibold  mt-3">Invite People</h4>
          <div
            className="overflow-scroll px-4 py-1 border border-2 rounded-lg "
            style={{ maxHeight: "8rem" }}
          >
            {emails.slice(1).map((email, index) => (
              <div
                key={index + 1}
                className="flex items-center space-x-2 mb-0.5"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(index + 1, e.target.value)}
                  placeholder="Enter email"
                  className="m-1 rounded-full border px-4 py-2 w-full focus:outline-none focus:ring focus:border-blue-300"
                />
                <button
                  onClick={() => removeEmailInput(index + 1)}
                  className="bg-red-500 text-white rounded-full mr-2 px-3 py-1 transition hover:bg-red-600 focus:outline-none"
                >
                  -
                </button>
              </div>
            ))}
            <div>
              <button
                onClick={addEmailInput}
                className="bg-green-500 text-white rounded-full px-3 py-1  ml-1 transition hover:bg-green-600 focus:outline-none"
              >
                +
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center mt-2">
            <Button onClick={onPaymentInit} text={"Initiate Split Pyament"} />
          </div>
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
            Your transaction will be successful once all invited parties approve
            it.
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};
