import React, { useState } from 'react';
import './SubscriptionComponent.css'; // Make sure the CSS file path is correct
import Lottie from 'lottie-react';
import animationData from '../Animations/flow.json'; // Replace with your Lottie animation JSON

const SubscriptionComponent = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [paymentCount, setPaymentCount] = useState('');
    const [signature, setSignature] = useState('');

    const progressDots = ['dot', 'dot', 'dot'];

    const handleNext = () => {
        console.log(currentStep)
        if (currentStep === 0 && paymentCount !== '') {
            setCurrentStep(1);
        } else if (currentStep === 1 && signature !== '') {
            setCurrentStep(2);
        }
    };

    const handleSubmit = () => {
        // Perform submission logic here
        alert('Subscription submitted successfully!');
    };

    const lottieOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice',
        },
    };
    return (
        <div className="subscription-component">
            <Lottie
                style={{ height: 100, width: 100, alignSelf: "center" }}
                animationData={animationData}
                loop={true}
            />

            <div className="step" style={{ display: currentStep === 0 ? 'block' : 'none' }}>
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
                    <button className="next-button" onClick={handleNext}>
                        Next
                    </button>
                </div>
            </div>
            <div className="step" style={{ display: currentStep === 1 ? 'block' : 'none' }}>
                <div className="step-header">Step 2</div>
                <div className="step-content">
                    <label htmlFor="signature">Sign the Check:</label>
                    
                    <button className="next-button" onClick={handleNext}>
                        Sign
                    </button>
                </div>
            </div>
            <div className="step" style={{ display: currentStep === 2 ? 'block' : 'none' }}>
                <div className="step-header">Step 3</div>
                <div className="step-content">
                    <button className="submit-button" onClick={handleSubmit}>
                        Submit Check
                    </button>
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
