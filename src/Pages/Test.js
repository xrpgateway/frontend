import React from 'react';

export default () => {
    const convertRemToPixels = (rem) => {    
        return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
    }

    return (
        <div>
            <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={()=>{window.open("/payment", "", `width=${convertRemToPixels(28)}, height=${convertRemToPixels(42)}`);}}>Open</button>
        </div>
    )
}