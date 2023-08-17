import React from "react";
import { XummPkce } from "xumm-oauth2-pkce";

export default () => {
  const convertRemToPixels = (rem) => {
    return (
      rem * parseFloat(getComputedStyle(document.documentElement).fontSize)
    );
  };
  const openPaymentWindow = async () => {
    const data = {
      item: "123",
      cid: "1233",
    };
    const data2 = {
      merchentId: "b1145317-a44b-4aac-9779-7437c569620d",
      amount: "12000000",
      nonce: "sdfdsf",
      data: "jlkdfjlksdfjlk",
    };
    let response = await fetch(
      `${process.env.REACT_APP_API}/transaction/signtest`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data2),
      }
    );
    let ans = await response.json();
    let data3 = data2;
    data3.sign = ans.signedhash;
    let response2 = await fetch(
      `${process.env.REACT_APP_API}/transaction/verificationtest`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data3),
      }
    );
    console.log(response2);
    const base64Data = btoa(JSON.stringify(data));

    const queryParams = new URLSearchParams({
      merchentId: data2.merchentId,
      merchentHash: ans.signedhash,
      amount: data2.amount,
      data: data2.data,
      nonce: data2.nonce,
      title: "XRPL conference",
      desc: "Ticket for xrpl yearly dev event",
    });

    const url = `/payment?${queryParams.toString()}`;

    window.open(
      url,
      "",
      `width=${convertRemToPixels(28)}, height=${convertRemToPixels(42)}`
    );
  };

  const signedInHandler = (authorized) => {
    window.sdk = authorized.sdk;
    window.wallet_address = authorized.me.account;
    const payload = {
      txjson: {
        TransactionType: "TrustSet",
        Account: authorized.me.account,
        LimitAmount: {
          currency: "USD",
          issuer: "rg2MAgwqwmV9TgMexVBpRDK89vMyJkpbC",
          value: "1000000",
        },
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
        resolved.then(async function (payloadOutcome) {
          const txHash = payloadOutcome.txid;
          console.log(txHash);
        });
      })
      .catch(function (payloadError) {
        console.error(payloadError);
      });
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
    <div>
      <button
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={openPaymentWindow}
      >
        Open
      </button>
      <button
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={async () => {
          onConnect();
        }}
      >
        CreateTrustline
      </button>
    </div>
  );
};
