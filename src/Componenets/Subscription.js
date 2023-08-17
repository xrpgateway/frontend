import React, { useState } from 'react';
import './SubscriptionComponent.css'; // Make sure the CSS file path is correct
import Lottie from 'lottie-react';
import animationData from '../Animations/flow.json'; // Replace with your Lottie animation JSON
import Button from './Button';
import { dropsToXrp } from "xrpl";
import done from '../Animations/done.json'
import sign from '../Animations/signature.json'

import { XummPkce } from 'xumm-oauth2-pkce';
const SubscriptionComponent = ({ amount }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [paymentCount, setPaymentCount] = useState('');
    const [signature, setSignature] = useState('');
    const [currentnumber, setCurrentNumber] = useState(0)
    const [signmsg, setsignmsg] = useState('')
    const [transactionhash, settxhash] = useState([])
    const progressDots = ['dot', 'dot', 'dot'];
    var auth = new XummPkce("ffc1a4da-8ec2-40a7-a48d-fb23fb83cc43", {
        implicit: true,
    });
    const url = "https://testnet.xrpl-labs.com/";


    const handleNext = () => {
        console.log(currentStep)
        if (currentStep === 0 && paymentCount !== '') {
            setCurrentStep(1);
        } else if (currentStep === 1 && signature !== '') {
            setCurrentStep(2);
        }
    };


    async function signedInHandler(authorized) {
        window.sdk = authorized.sdk;
    }
    async function go(e) {
        let ans = await auth.authorize();
        await signedInHandler(ans);
    }

    auth.on("error", (error) => {
        console.log("error", error);
    });

    auth.on("success", async () => {
        console.log("success");
        auth.state().then((state) => {
            if (state.me) {
                console.log("success, me", JSON.stringify(state.me));
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


    const handleSign = async () => {
        setCurrentStep('sign')
        setsignmsg("Signing Check " + currentnumber)
        if (!window.sdk) {
            console.log("wait for this");
            await go();
        }


        await takeSign(taskSign, 0);

    }


    const taskSign = async (number) => {
        if (number < paymentCount) {

            console.log("the current is", number)
            setsignmsg("Signing Check " + number)
            takeSign(taskSign, number)
        }
        else {
            console.log(transactionhash)
            setCurrentStep(2);
        }


    }

    const takeSign = async (callback, numb) => {
        let payload = createChecks(parseInt(amount / paymentCount))
        console.log(payload)
        window.sdk.payload
            .createAndSubscribe(payload, async function (payloadEvent) {
                if (typeof payloadEvent.data.signed !== "undefined") {
                    // What we return here will be the resolved value of the `resolved` property
                    return payloadEvent.data;
                }
            })
            .then(async function ({ created, resolved }) {
                //settextmodal("Signing check no", currentStep);

                resolved.then(async function (payloadOutcome) {
                    console.log(payloadOutcome);
                    let data = {
                        method: "tx",
                        params: [
                            {
                                transaction: payloadOutcome.txid,
                                binary: false,
                            },
                        ],
                    };
                    let txhs = transactionhash
                    txhs.push(payloadOutcome.txid)
                    settxhash(txhs)
                    let response = await fetch(url, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(data),
                    });

                    let responseData = await response.json();
                    callback(numb + 1)

                })
            })

    }

    const handleSubmit = () => {
        // Perform submission logic here
        setCurrentStep("finished")
    };


    const createChecks = (amount) => {
        return {
            txjson: {
                TransactionType: "CheckCreate",

                Destination: "rNRqA2aDa3GBNZkBxdw1U3jEKFdxYV5MTe",
                SendMax: amount.toString(),

                Expiration: 810113521,
                DestinationTag: 1,
                Fee: "12",

            }
        }
    }



    return (
        <div className="subscription-component">
            <div className="signing" style={{ display: currentStep === 'sign' ? 'flex' : 'none', justifyContent: 'center', flexDirection: "column" }}>
                <Lottie
                    style={{ height: 100, width: 100, alignSelf: "center" }}
                    animationData={sign}
                    loop={true}
                />
                <h1 style={{ textAlign: "center" }}>{signmsg}</h1>
            </div>

            <div className="finished" style={{ display: currentStep === 'finished' ? 'flex' : 'none', justifyContent: 'center', flexDirection: "column" }}>
                <Lottie
                    style={{ height: 100, width: 100, alignSelf: "center" }}
                    animationData={done}
                    loop={true}
                />
            </div>

            <div className="step" style={{ display: currentStep === 0 ? 'block' : 'none' }}>

                <Lottie
                    style={{ height: 100, width: 100, alignSelf: "center", marginLeft: "6rem" }}
                    animationData={animationData}
                    loop={true}
                />
                <div className="step-header">Step 1</div>
                <div className="step-content">
                    <label htmlFor="paymentCount">Number of Payments:</label>
                    <input
                        type="number"
                        id="paymentCount"
                        value={paymentCount}
                        style={{
                            border: '1px solid #ccc', // You can customize the border properties
                            padding: '5px', // Optional: Add padding for better visual appearance
                        }}
                        onChange={(e) => setPaymentCount(e.target.value)}
                    />
                    <div className='SignButton'>
                        <Button text={`Next`} onClick={handleNext} />
                    </div>
                </div>
            </div>
            <div className="step" style={{ display: currentStep === 1 ? 'block' : 'none' }}>
                <Lottie
                    style={{ height: 100, width: 100, alignSelf: "center", marginLeft: "6rem" }}
                    animationData={animationData}
                    loop={true}
                />

                <div className="step-header">Step 2</div>
                <div className="step-content">
                    <label htmlFor="signature">Sign the Check:</label>
                    <div className='SignButton'>
                        <Button text={'Sign'} onClick={handleSign} />
                    </div>
                </div>
            </div>
            <div className="step" style={{ display: currentStep === 2 ? 'block' : 'none' }}>

                <Lottie
                    style={{ height: 100, width: 100, alignSelf: "center", marginLeft: "6rem" }}
                    animationData={animationData}
                    loop={true}
                />
                <div className="step-header">Step 3</div>
                <div className="step-content">
                    <div className='SignButton'>
                        <Button text={"Submit"} onClick={handleSubmit}></Button>
                    </div>
                </div>
            </div>

            <div className="progress-dots">
                {progressDots.map((dot, index) => (
                    <span
                        key={index}
                        className={index <= currentStep ? 'dot active-dot' : 'dot'}
                    ></span>
                ))}
            </div>
        </div>
    );
};

export default SubscriptionComponent;
