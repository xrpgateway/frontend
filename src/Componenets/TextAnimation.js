import React, { useState, useEffect } from 'react';
import './TextAnimation.css';

const texts = [
  "Pay in any currency",
  "Split payments in a group, securely completing transactions",
  "Hassle-free recurring payments without interactions"
];

const colors = ['#ff9a8b', '#98ddca', '#ffe19e'];

const TextAnimation = () => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prevIndex) => (prevIndex + 1) % texts.length);
    }, 5000); // Change text every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-container">
      <div className="gradient-text">
        {texts[currentTextIndex].split("").map((char, index) => (
          <span
            key={index}
            className="gradient-char"
            style={{
              color: colors[index % colors.length],
              animationDuration: `${(index + 1) * 0.2}s`,
            }}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TextAnimation;
