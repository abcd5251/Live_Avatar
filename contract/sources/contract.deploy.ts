import { WalletContractV4, TonClient } from "@ton/ton";
import { mnemonicToPrivateKey , KeyPair} from "@ton/crypto";
import { beginCell, contractAddress, toNano, Address } from "@ton/ton";
import { deploy } from "./utils/deploy";
import {AssetsSDK, PinataStorageParams, createApi, createSender, importKey} from "@ton-community/assets-sdk";
import { printAddress, printDeploy, printHeader } from "./utils/print";
// ================================================================= //
import { NftCollection } from "./output/sample_NftCollection";
// ================================================================= //

(async () => {
    // const keyPair: KeyPair = await mnemonicToPrivateKey(mnemonicArray);
    // console.log("key", keyPair);
    
    const mnemonicArray: string[] = (() => {
        const mnemonic = process.env.WALLET_MNEMONIC;
        return Array.isArray(mnemonic) ? mnemonic : (mnemonic?.split(' ') ?? []);
    })();
    
    const NETWORK = 'testnet';
    const api = await createApi(NETWORK);

    // create a sender from the wallet (in this case, Highload Wallet V2)
    const keyPair = await importKey(mnemonicArray);
    const sender = await createSender('highload-v2', keyPair, api);

    // define the storage parameters (in this case, Pinata)
    const storage: PinataStorageParams = {
        pinataApiKey: process.env.PINATA_API_KEY!,
        pinataSecretKey: process.env.PINATA_SECRET!,
    }

    // create the SDK instance
    const sdk = AssetsSDK.create({
        api: api,          // required, the TonClient4 instance
        storage: storage,  // optional, the storage instance (Pinata, S3 or your own)
        sender: sender,    // optional, the sender instance (WalletV4, TonConnect or your own)
    });
       
    // const collection = await sdk.createNftCollection({
    //     collectionContent: {
    //         name: 'Test collection',
    //         description: 'Test collection description',
    //     },
    //     commonContent: 'https://example.com/nft-items/',
    // });


    const OFFCHAIN_CONTENT_PREFIX = 0x01;
    const string_first = "https://s.getgems.io/nft-staging/c/628f6ab8077060a7a8d52d63/"; // Change to the content URL you prepared
    let newContent = beginCell().storeInt(OFFCHAIN_CONTENT_PREFIX, 8).storeStringRefTail(string_first).endCell();

    // ===== Parameters =====
    // Replace owner with your address
    let owner = Address.parse("0QCZ106ijmPF-7vsMC-gvEoa6gfld8iobZ8VEsGG2mo_LWPf"); // 🔴🔴🔴

    // Prepare the initial code and data for the contract
    let init = await NftCollection.init(owner, newContent, {
        $$type: "RoyaltyParams",
        numerator: 350n, // 350n = 35%
        denominator: 1000n,
        destination: owner,
    });

    let address = contractAddress(0, init);
    let deployAmount = toNano("0.15");
    let testnet = true;

    // The Transaction body we want to pass to the smart contract
    let body = beginCell().storeUint(0, 32).storeStringTail("Mint").endCell();

    // Do deploy
    await deploy(init, deployAmount, body, testnet);
    printHeader("sampleNFT_Contract");
    printAddress(address);
})();

//0QCZ106ijmPF-7vsMC-gvEoa6gfld8iobZ8VEsGG2mo_LWPf
// const client = new TonClient({endpoint : "https://testnet.toncenter.com/api/v2/jsonRPC"});
    
//     const srcWallet = await (async (mnemonic: string | string[], walletClass: typeof WalletContractV4) => {
//         const mnemonicArray: string[] = (() => {
//             return Array.isArray(mnemonic) ? mnemonic : mnemonic.split(' ');
//         })();
//         const keyPair: KeyPair = await mnemonicToPrivateKey(mnemonicArray);
//         return {
//             mnemonics: mnemonicArray,
//             keyPair: keyPair,
//             contract: client.open(walletClass.create({
//                 workchain: 0,
//                 publicKey: keyPair.publicKey
//             }))
//         };
//     })(process.env.WALLET_MNEMONIC!, WalletContractV4);