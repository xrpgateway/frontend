import React from 'react';

export default () => {
    const convertRemToPixels = (rem) => {    
        return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
    }
    const openPaymentWindow =async () => {
        const data = {
            item: '123',
            cid: '1233'
        };
        const data2 = {
            merchentId:"b1145317-a44b-4aac-9779-7437c569620d",
            amount:"12000000",
            nonce:"sdfdsf",
            data:"jlkdfjlksdfjlk"


        }
        let response = await fetch("http://localhost:4001/transaction/signtest", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data2),
        });
        let ans = await response.json()

        const base64Data = btoa(JSON.stringify(data));

        const queryParams = new URLSearchParams({
            merchentId: data2.merchentId,
            merchentHash: ans.signedhash,
            amount: data2.amount,
            data:data2.data,
            nonce:data2.nonce,
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