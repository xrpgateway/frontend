import React, { useState } from "react";
import Button from "./Button";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import fiveBellsCondition from "five-bells-condition";
import crypto from "crypto";

export default ({ amount }) => {
  const [emails, setEmails] = useState([""]);

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
          let data = {
            method: "tx",
            params: [
              {
                transaction: payloadOutcome.txid,
                binary: false,
              },
            ],
          };
          let response = await fetch(process.env.REACT_APP_XRPL_API, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          });

          let responseData = await response.json();
          console.log(responseData.result);
        });
      })
      .catch(function (payloadError) {
        console.error(payloadError);
      });
  };

  return (
    <div className="p-4 pt-0 h-full">
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
          <div key={index} className="flex items-center space-x-2 mb-0.5">
            <input
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(index, e.target.value)}
              placeholder="Enter email"
              className="m-1 rounded-full border px-4 py-2 w-full focus:outline-none focus:ring focus:border-blue-300"
            />
            <button
              onClick={() => removeEmailInput(index)}
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
      <ToastContainer />
    </div>
  );
};
