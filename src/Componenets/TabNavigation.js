import { motion } from "framer-motion";
import { useEffect, useState } from "react";

let tabs = [
  { id: "1", label: "Direct Pay" },
  { id: "2", label: "Split Pay" },
  { id: "0", label: "Subscriptions" }
];

export default ({ onTabChange }) =>  {
  let [activeTab, setActiveTab] = useState(tabs[0].id);

  useEffect(() => {
    if(onTabChange){
        onTabChange(activeTab)
    }
  }, [activeTab])

  return (
    <div className="w-full flex space-x-1 justify-around p-3">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`${
            activeTab === tab.id ? "" : "hover:text-black/60"
          } relative rounded-full px-3 py-1.5 text-sm font-medium text-black outline-sky-400 transition focus-visible:outline-2`}
          style={{
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {activeTab === tab.id && (
            <motion.span
              layoutId="bubble"
              className="absolute inset-0 z-10 bg-white mix-blend-difference"
              style={{ borderRadius: 9999 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
