# Lavanet Chains Leaderboard

This project showcases a leaderboard of Lavanet chains, ranking them based on the number of relay messages processed. The application is part of a challenge to visualize the top 10 chains on Lava by the number of relays passed in the Lava Blockchain in the last 20 blocks. 

You can access the app here: [Lavanet Chains Leaderboard](https://lava-challenge.vercel.app/).

## Background

Lava Protocol is a decentralized RPC access infrastructure that, in a nutshell, gives developers the ability to interact with RPC providers for different chains. After the developer pairs with providers and passes relays, the provider reports the work that was done back to the blockchain and asks for payment.

## How the Application Works

The application continually checks the blockHeight at a 5s interval and when a new block is added, fetches the latest block from the Lavanet network. When the app starts, it fetches the last 20 blocks. The `block.txs` is decoded and checked for `MsgRelayPayment`. The relay payment messages contain relay sessions, which are used to calculate the number of relays each chain has processed.

The chains are then ranked based on the number of relays processed, and the top 10 chains are displayed on the leaderboard. The leaderboard is updated in real time as new blocks are mined.

The application is built using Next.js, bootstrapped using T3, and interacts with the Lavanet network using the `StargateClient` from the `@cosmjs/stargate` package.

## How to Run

Follow these steps to run the application:

1. Clone the repository to your local machine.
2. Install the necessary packages using `npm install` or `yarn`.
3. Create a `.env` file in the root directory of the project and add the following line:


```
NEXT_PUBLIC_LAVA_WSS_URL=<Your Lavanet WebSocket URL>
```
You can get the Lavanet WebSocket URL from [https://gateway.lavanet.xyz](https://gateway.lavanet.xyz)

4. Run the application with `npm run dev` or `yarn dev`.
5. Open your browser and navigate to `localhost:3000` to see the application in action.



## 

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fhello-world)
