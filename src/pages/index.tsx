import Head from "next/head";
import { useState, useEffect, useRef } from 'react';
import { StargateClient } from "@cosmjs/stargate"
import { ToastContainer, toast } from 'react-toastify';
import { Tx } from "cosmjs-types/cosmos/tx/v1beta1/tx"
import {MsgRelayPayment} from "@lavanet/lava-sdk/bin/src/codec/pairing/tx"
import type { Block } from "@cosmjs/stargate/build/stargateclient"
import type {RelaySession} from "@lavanet/lava-sdk/bin/src/codec/pairing/relay"

export default function Home() {
  // Maximum number of blocks to track
  const MAX_BLOCKS = 50; // Set to 50 instead of 20 because I've noticed that 20 blocks sometimes have no MsgRelayPayment data

  // Refs and states for block height, blocks, sync status, top ten chains and relays
  const blockHeight = useRef(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [topTen, setTopTen] = useState<[string, number][]>([]);
  const isSyncingRef = useRef(isSyncing);
  const [relays, setRelays] = useState<RelaySession[]>([]);

  // Function to update the ref whenever isSyncing changes
  useEffect(() => {
    isSyncingRef.current = isSyncing;
  }, [isSyncing]);

  // Function to fetch the block height every 5 seconds
  useEffect(() => {
    const getBlockHeight = async () => {
      // If already syncing, do nothing
      if (isSyncingRef.current) {
        return;
      }
      // Connect to the Stargate client and fetch the block height
      const client = await StargateClient.connect(process.env.NEXT_PUBLIC_LAVA_WSS_URL!)
      const fetchedBlockHeight = await client.getHeight();

      // If the fetched block height differs from the current one, start syncing
      if (blockHeight.current !== fetchedBlockHeight) {
        setIsSyncing(true);
        toast.info("New block mined");
        // Fetch the blocks depending on whether it's the first fetch or not
        if (blockHeight.current !== 0) {
          await getBlocks(blockHeight.current).catch((error) => console.error(error));
        } else {
          // Fetch the last 20 blocks if this is the first fetch.
          await getBlocks(Math.max(0, fetchedBlockHeight - 20), fetchedBlockHeight).catch((error) => console.error(error));
        }
        // After fetching the blocks, stop syncing and update the block height
        setIsSyncing(false);
        blockHeight.current = fetchedBlockHeight;
      }
    };

    const getBlocks = async (startHeight: number, endHeight: number = startHeight) => {
      if (!process.env.NEXT_PUBLIC_LAVA_WSS_URL) {
        throw new Error("NEXT_PUBLIC_LAVA_WSS_URL not defined");
      }
      const blocks: Block[] = [];
      const client = await StargateClient.connect(process.env.NEXT_PUBLIC_LAVA_WSS_URL!)
      console.log('fetching blocks from', startHeight, 'to', endHeight)
      for (let i = startHeight; i <= endHeight; i++) {
        const block = await client.getBlock(i);
        blocks.push(block); // Store blocks in the useRef variable
        if (blocks.length > MAX_BLOCKS) {
          blocks.shift(); // Remove the oldest block if we exceed the maximum
        }
      }
      processBlocks(blocks); // Process the blocks after they've been fetched
    };
    
    // Fetch the block height every 5 seconds
    const intervalId = setInterval(() => {
      getBlockHeight().catch((error) => console.error(error));
    }, 5000);
    setIsSyncing(false); // Signal that the app is ready to start syncing
  
    // Clear the interval when the component unmounts
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Function to parse relay data and calculate the top ten chains
  useEffect(() => {
    function parseRelayData(relays: RelaySession[]) {
      // Parse the relay data decoded from the blocks.txs
      const parsedData = [];
      for (const relay of relays) {
        const session = relay;
        if(session) { // Check if session is defined
          parsedData.push({
            specId: session.specId,
            relayNum: session.relayNum.low,
            epoch: session.epoch.low,
          });
        }
      }
      // Calculate the total number of relays per specId
      const totals: Record<string, number> = {};
      for (const data of parsedData) {
        if (totals[data.specId]) {
          totals[data.specId] += data.relayNum;
        } else {
          totals[data.specId] = data.relayNum;
        }
      }
      
      // Sort the totals and get the top ten
      const sortedTotals = Object.entries(totals).sort((a, b) => b[1] - a[1]);
      const topTen = sortedTotals.slice(0, 10);
      setTopTen(topTen);
    }
  
    parseRelayData(relays);
  }, [relays]);

  
  const processBlocks = (blocks: Block[]) => {
    console.log('processing blocks')
    let newRelays: RelaySession[] = [];
    for (const block of blocks) {
      try {
        for (const tx of block.txs) {
          const decodedTx: Tx = tx && Tx.decode(tx)
          if (decodedTx.body?.messages) {
            for(const msg of decodedTx.body?.messages) {
              if (msg.typeUrl === "/lavanet.lava.pairing.MsgRelayPayment") {
                const message = msg?.value && MsgRelayPayment.decode(msg.value);
                newRelays = newRelays.concat(message.relays); // Flatten the array
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to parse JSON:', err);
      }
    }
    setRelays((prevRelays) => [...prevRelays, ...newRelays]); // Append the new relays to the existing ones
  };
  
  return (
    <>
      <Head>
        <title>Lavanet Chains Leaderboard</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#FBAC07] to-[#D60024]">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem] mb-10">
          <span className="text-[hsl(350.5,100.0%,59.5%)]">Lavanet</span> Chains Leaderboard
        </h1>
        {isSyncing && (
          <div className="spinner">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        )}
        <div className="relative container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <div className={`w-full overflow-hidden rounded-lg shadow-xs ${isSyncing ? 'dimmed' : ''}`}>
            <div className="w-full overflow-x-auto">
              <table className="w-full whitespace-no-wrap">
              <thead>
                <tr
                  className="text-xs font-semibold tracking-wide text-center text-white uppercase border-b bg-[#800020]"
                >
                  <th className="px-4 py-3">Chain Name</th>
                  <th className="px-4 py-3">Number of Relays</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y">
                {topTen.length > 0 ? (
                  topTen.map(([specId, relayNum]: [string, number], i: number) => (
                    <tr key={i} className="text-gray-700 text-center">
                      <td className="px-4 py-3">{specId}</td>
                      <td className="px-4 py-3">{relayNum}</td>
                    </tr>
                  ))
                ) : (
                  <tr className="text-gray-700 text-center">
                    {blockHeight.current === 0 && !isSyncing && <td className="px-4 py-3" colSpan={2}>Stargate activating...</td>}
                    {isSyncing && <td className="px-4 py-3" colSpan={2}>Decoding block data</td>}
                    {blockHeight.current !== 0 &&!isSyncing && <td className="px-4 py-3" colSpan={2}>No MsgRelayPayment data found in the past {MAX_BLOCKS} blocks</td>}
                  </tr>
                )}
              </tbody>
              </table>
            </div>
          </div>
        </div>
        <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      </main>
    </>
  );

}
