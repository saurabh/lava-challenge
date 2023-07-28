// UNUSED CODE. Started the challenge with this code, but then decided to use the Cosmjs library instead.

// import { LavaSDK } from "@lavanet/lava-sdk";

// export default async (req, res) => {
//     if (!process.env.NEXT_PUBLIC_LAVA_WSS_URL) {
//         throw new Error("NEXT_PUBLIC_LAVA_WSS_URL not defined");
//     }
//     // const client = await lavajs.lavanet.ClientFactory.createRPCQueryClient({ rpcEndpoint: process.env.NEXT_PUBLIC_LAVA_WSS_URL})
//     // console.log(client.cosmos.tx)

//     const lavaSDK = await new LavaSDK({
//         badge: {
//             badgeServerAddress: "https://badges.lavanet.xyz", // Or your own Badge-Server URL 
//             projectId: "03260eadc3eba6c45650a06016343620"
//         },
//         chainID: "LAV1",
//         rpcInterface:  "rest",
//         geolocation: "2",
//     });
//      // You can handle different types of requests (GET, POST, etc.) here
     
//     if (req.method === 'GET') {
//         const info = await lavaSDK.sendRelay({
//             method: "GET",
//             url: "/blocks/latest",
//         });
//         return res.status(200).json(info);
//     }

//     // Handle other types of requests or send a response for unhandled methods
//     res.setHeader('Allow', 'GET');
//     res.status(405).end(`Method ${req.method} Not Allowed`);
// };
