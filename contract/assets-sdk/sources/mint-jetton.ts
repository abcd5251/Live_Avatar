import {toNano} from "@ton/core";
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

    const jetton = await sdk.deployJetton({
        name: 'Test jetton 4',
        decimals: 9,
        description: 'Test jetton',
        symbol: 'TEST',
    }, {
        adminAddress: sdk.sender?.address!,
        premintAmount: toNano('100'),
    });

    console.log('Created jetton with address', jetton.address);
}

main().catch(console.error);
