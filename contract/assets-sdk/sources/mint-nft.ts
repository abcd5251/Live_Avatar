import {AssetsSDK, createApi, createSender, importKey, PinataStorageParams} from "../src";
import { config } from 'dotenv';
config();

async function main() {
    const NETWORK = 'testnet';
    const api = await createApi(NETWORK);
    const mnemonicArray: string[] = (() => {
        const mnemonic = process.env.MNEMONIC;
        return Array.isArray(mnemonic) ? mnemonic : (mnemonic?.split(' ') ?? []);
    })();
    const keyPair = await importKey(mnemonicArray);
    const sender = await createSender('highload-v2', keyPair, api);

    const pinataApiKey = process.env.PINATA_API_KEY!;
    const pinataSecretKey = process.env.PINATA_SECRET!;

    if (!pinataApiKey || !pinataSecretKey) {
        throw new Error("Pinata API key or secret key is not set");
    }
    
    const storage: PinataStorageParams = {
        pinataApiKey: pinataApiKey,
        pinataSecretKey: pinataSecretKey,
    };
    const sdk = AssetsSDK.create({
        api: api,
        storage: storage,
        sender: sender,
    });

    console.log('Using wallet', sdk.sender?.address);

    const collection = await sdk.deployNftCollection({
        collectionContent: {
            name: 'Test collection',
            description: 'Test collection description',
            image: 'https://purple-improved-woodpecker-816.mypinata.cloud/ipfs/QmPkNQ4H7Nrj9YwBTBTALjfduoFuHfieDiHrHnPPEu5mBv',
        },
        commonContent: '',
    });
    console.log(collection);
}

main().catch(console.error);
