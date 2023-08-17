import React, { useEffect, useState } from "react";
import Lottie from "lottie-react";
import Convert from "../Animations/convert.json";
import "./DirectPay.css";
import Button from "./Button";
import signature_animation from "../Animations/signature.json";
import animationData from "../Animations/done.json";
import { Client } from "xrpl";
import { ToastContainer, toast } from "react-toastify";

export default ({ amount, data, nonce, merchentId, merchentHash }) => {
  const paymentOptions = [
    { icon: "png", url: "/xrp.png", text: "XRP" },
    { icon: "png", url: "/bitcoin.png", text: "BTC" },
    { icon: "🇺🇸", text: "USD" },
    { icon: "🇬🇧", text: "GBP" },
    { icon: "🇪🇺", text: "EUR" },
    { icon: "🇸🇬", text: "SGD" },
    { icon: "🇯🇵", text: "JPY" },
    { icon: "🇨🇭", text: "CHF" },
  ];

  const [selectedOption, setSelectedOption] = useState(paymentOptions[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isConverting, setConverting] = useState(false);
  const [cRate, setRate] = useState(1);
  const [amount_, setAmount] = useState(0);
  const [step, setStep] = useState(1);

  const handleOptionChange = (option) => {
    setSelectedOption(option);
    setDropdownOpen(false);
  };

  useEffect(() => {
    setConverting(true);
    fetch(
      `${process.env.REACT_APP_API}/transaction/rate/${selectedOption.text}/${amount}`
    )
      .then((res) => res.json())
      .then((res) => {
        const rate = res.rate;
        const val = res.val;
        setRate(rate);
        setAmount(val);
      })
      .catch((e) => console.error(e))
      .finally(() => setConverting(false));
  }, [selectedOption]);

  const onSendPayment = async () => {
    setStep(2);
    let payload = {};
    if (selectedOption.text != "XRP") {
      const client = new Client(process.env.REACT_APP_XRPWH);
      await client.connect();
      const response = await client.request({
        id: 2,
        command: "account_lines",
        account: window.wallet_address,
        ledger_index: "validated",
      });
      await client.disconnect();
      const lines = response.result.lines;
      let provider = null;
      for (const line of lines) {
        if (
          line.currency == selectedOption.text &&
          parseFloat(amount_) <= parseFloat(line.balance)
        ) {
          provider = line.account;
          break;
        }
      }
      if (!provider) {
        setStep(1);
        toast.error(
          "Selected currency with required balance not found in your wallet!",
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
        return;
      }
      payload = {
        txjson: {
          TransactionType: "Payment",
          Amount: {
            "currency" :  selectedOption.text,
            "value" : amount_.toString(),
            "issuer" : provider
          },
          Account: window.wallet_address,
          Destination: process.env.REACT_APP_AW
        },
      };
    } else {
      payload = {
        txjson: {
          TransactionType: "Payment",
          Amount: amount,
          Account: window.wallet_address,
          Destination: process.env.REACT_APP_AW
        },
      };
    }
    console.log(payload)
    window.sdk.payload
      .createAndSubscribe(payload, async function (payloadEvent) {
        if (typeof payloadEvent.data.signed !== "undefined") {
          // What we return here will be the resolved value of the `resolved` property
          return payloadEvent.data;
        }
      })
      .then(async function ({ created, resolved }) {
        toast.success(
          "Check xumm wallet we have sent you sign request to send money!",
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
          console.log(txHash)
          let dat = {
            merchantId:merchentId,
            amount:amount,
            nonce:nonce,
            signedHash:merchentHash,
            data:data,
            transactionHashes:[txHash],
            transactiontype:1,
            users:[],
            extradata:""

        }
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
              } else {
                toast.error("Transaction Failed!", {
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
    <div className="h-full flex flex-col items-center justify-center">
      {step == 1 && (
        <div className="flex items-center flex-1" style={{ zIndex: 10 }}>
          <div className=" text-lg font-semibold mr-2">Pay with</div>
          <div className="relative inline-block">
            <div
              className={`flex items-center cursor-pointer bg-white border border-gray-300 px-4 py-2 rounded-full transition-transform ${
                dropdownOpen ? "scale-105" : ""
              }`}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {selectedOption.icon == "png" ? (
                <div className="h-full flex justify-center items-center">
                  <img
                    className="mr-2"
                    height={"18px"}
                    width={"18px"}
                    src={selectedOption.url}
                  />
                </div>
              ) : (
                <span className="mr-2">{selectedOption.icon}</span>
              )}
              {selectedOption.text}
            </div>
            {dropdownOpen && (
              <div
                className="absolute overflow-scroll top-full left-0 mt-2 w-40 bg-white rounded-lg shadow-md overflow-hidden transform origin-top animate-fade-in"
                style={{ maxHeight: "8rem" }}
                onAnimationEnd={() => setDropdownOpen(true)}
              >
                {paymentOptions.map((option) => (
                  <button
                    key={option.text}
                    className={`flex items-center justify-start px-4 py-3 w-full ${
                      selectedOption === option
                        ? "bg-blue-100 text-blue-500"
                        : "text-gray-700"
                    } transition-colors`}
                    onClick={() => handleOptionChange(option)}
                  >
                    {option.icon == "png" ? (
                      <img
                        className="mr-2"
                        height={"18px"}
                        width={"18px"}
                        src={option.url}
                      />
                    ) : (
                      <span className="mr-2">{option.icon}</span>
                    )}
                    {option.text}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {step == 1 && !isConverting && (
        <div className="flex items-center mt-5 font-medium">
          1 XRP ~ {cRate} {selectedOption.text}
        </div>
      )}
      {step == 1 && !isConverting && (
        <div className="flex items-center mt-1 font-semibold">
          You will pay ~= {amount_} {selectedOption.text}
        </div>
      )}
      {step == 1 && isConverting && (
        <Lottie
          style={{ height: 128, width: 128, zIndex: 1 }}
          animationData={Convert}
          loop={true}
        />
      )}
      {step == 1 && (
        <div className="flex-1 flex items-end">
          <Button onClick={onSendPayment} text={`Send Payment`} />
        </div>
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
            animationData={animationData}
            loop={true}
          />
          <div className=" font-semibold mt-3">Transaction Successful 🥳</div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};
