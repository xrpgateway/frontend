import React, { useEffect, useState } from "react";
import Lottie from "lottie-react";
import Convert from "../Animations/convert.json";
import "./DirectPay.css"
import Button from "./Button";

export default () => {
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
  const [isConverting, setConverting] = useState(false)

  const handleOptionChange = (option) => {
    setSelectedOption(option);
    setDropdownOpen(false);
  };

  useEffect(() => {
    setConverting(true)
  }, [selectedOption])

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="flex items-center flex-1" style={{ zIndex: 10 }}>
        <div className=" text-lg font-semibold mr-2">Pay with</div>
        <div className="relative inline-block">
          <div
            className={`flex cursor-pointer bg-white border border-gray-300 px-4 py-2 rounded-full transition-transform ${
              dropdownOpen ? "scale-105" : ""
            }`}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            {selectedOption.icon == "png" ? (
              <img
                className="mr-2"
                height={"14px"}
                width={"18px"}
                src={selectedOption.url}
              />
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
      {!isConverting && (<div className="flex items-center mt-5 font-medium">
        1 XRP ~ 1 {selectedOption.text}
      </div>)}
      {!isConverting && (<div className="flex items-center mt-1 font-semibold">
        You will pay ~= 0 {selectedOption.text}
      </div>)}
      {isConverting && <Lottie
        style={{ height: 128, width: 128, zIndex: 1 }}
        animationData={Convert}
        loop={true}
      />}
      <div className="flex-1 flex items-end">
      <Button text={`Send Payment`} />
      </div>
    </div>
  );
};
