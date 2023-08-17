import React from 'react';

export default () => {
    const convertRemToPixels = (rem) => {    
        return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
    }
    const openPaymentWindow = () => {
        const data = {
            item: '123',
            cid: '1233'
        };

        const base64Data = btoa(JSON.stringify(data));

        const queryParams = new URLSearchParams({
            merchentId: '1234',
            merchentHash: 'xyzyzx',
            amount: '10000000',
            data: base64Data,
            title: 'XRPL conference',
            desc: 'Ticket for xrpl yearly dev event'
        });

        const url = `/payment?${queryParams.toString()}`;

        window.open(url, "", `width=${convertRemToPixels(28)}, height=${convertRemToPixels(42)}`);
    }
    return (
        <div>
            <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={openPaymentWindow}>Open</button>
        </div>
    )
}