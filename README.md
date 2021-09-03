# EXPLODING-KITTEN

Proof-of-concept exploit for ERC1967Proxy with UUPSUpgradeable contract.

```
&&&&&&&&&&&&&&&&&&&&&&&&&&&&%&&%&&%%%%%%%%%%%%%&%%&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
&&&&&&&&&&&&&&&&&&&&&&&%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%&&&&&&&&&&&&&&&&&&
&&&&&&&&&&&&&&&&&%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%&&&&&&&&&&&&&
&&&&&&&&&%%&%%%%%%%%%%%%%%%%%%%%%###################%%%%%%%%%%%%%%%%%%%%%&&&&&&&
&&&&&&&&&%%%%%%%%%%%%%%%#####################################%%%%%%%%%%%%%%%%&&&
&&&&&&(%%%%%%%%%%%############((((((((((((((((((((((((############%%%%%%%%%%%%%%
&&&%%%%%%%%%%##########(((((((((((((((((((((((((((%(((((((((##########%%%%%%%%%%
%%%%%%%%%%%#######(((((((((((((((//////////////////@@&((((((((((##########%%%%%%
%%%%%%%%#######((((((((((///////////////////////////@@%@///(((((((((########%%%%
%%%%%%#####%@##%@@(((/////////////*************/////@%%%%@&////(((((((########%%
%%%%%#####(((@##@%%%%%@@///*********@@@@@@@@@@@@@@@@@@@%%%%@@/////(((((((######%
%%%#####((((((@###&%%%%%%@&@@@%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%#@@//////(((((######
%%####(((((((/@####@%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%@@@@@@@@&##@@//////(((((####
#####((((((///@((###%%@@@@@@@@@@@%%%%%%%%%%%%%%%%@@@@@@@@,@@@@@((@#//////(((((##
####((((((////@/((##@@@@@@@*,,,@@@@&%%%%%%%%%%%%@@@@@,(,,,@/(@@@&(@@//////((((((
###((((((/////@(((#@@@@@@,@,,,,@(@@@%%%%%%%%%%%&@@@@@,,,,,,,,,&@@((/@#/////(((((
###(((((/////*@/((#@@@@&*********@@@%%%@@@@@@%%%@@@@(*********@@%#((/@@*/////(((
###((((//////@@/((##@@@@(((((((((@@%%%%%%%@%%%%%%@@@@&(((((((@@%%%#((/@@/////(((
##((((((////#@//((##%%@@@@####@@@%%%%%@%%%@%%%@%%%%%%@@@@@@&%%%%%%##((/#@*////((
###((((/////@&//(##%%%%%%%%%%%%%%%%%%%%&&@%%@@%%%%%%%%%%%%%%%%%%%%%##(//#@/////(
##((((((///@@*/(##%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%##(//#@////(
##((((((//@@*/((##%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%#((//@@////
##((((((/@@*/((##%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%##((/*@@///
##((((((@///(###%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%##(//*@#//
##((((@@*/((###%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%##(//(@//
####(@%//(###%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%#((//@@/
###@@//(###%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%#%%%%%%%##((//@@
#@@/((###(%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%##((/&@
@/((##%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%###((/@
(##%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%###(((
#%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%###((
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%##(
```

## Description

This exploit is a denial of service (DOS) attack that targets contracts using the Universal Upgradeable Proxy Standard (UUPS) which has unprotected implementation contracts. 

The exploit destroys the code in the implementation contracts, rendering the UUPS proxy useless and it cannot be upgraded to fix the issue. This exploit does not work on Transparent Proxies as the contract upgrade code resides in the proxy, but since UUPS proxies store the upgrade code in the implementation contract, it allows the implementation contract to be upgraded and destroyed by an adversary. 

## POC

```
npm i
npm run test
```

The test is in `test/ExplodingKitten.test.ts`. It shows how a exploit can destroy a simple upgradeable ERC20 token.

## Contracts affected

https://etherscan.io/find-similar-contracts?a=0x222222222291749de47895c0c0a9b17e4fca8268

A quick seach on Ethereum mainnet shows a few contracts that are using the UUPS proxy, most of them has implementation contracts that are uninitialized. 

Few other contracts that may be affected:

| Proxy                                      | Implementation                             | Est. Value |
| ------------------------------------------ | ------------------------------------------ | ---------- |
| 0x1111111111acCdF36DbeE012FC26BB9fcC1D140D | 0xbFab91ed6E48D3D488808292170C6E97231DaaD7 | 7k         |
| 0x520683703eCF77BfDB3741E9Db47A769AEBAe53b | 0x4E76ea9C362696e584B48eC4240e0E8717690C7F | 118k       |
| 0x8d8503Ed56BE90bFF89FB716A3f9e0C359EE03ED | 0x387f3C9d3E51f993852E62e0148A141e85439c7d | 40k        |
| 0xB0FB8Cb274E68d04f590afE96C08a6892906a0Cb | 0x59D07Ba461BF4d2d27aec142b172303AD731157e | 31k        |
| 0x09D42407E6A5E92eeAce112bd4d9740BBf0C97Dc | 0xF0f6D791613cD44c4d06dD765A84E31E15f6767F | 590k       |
| 0x687d761089193dD5bb1C33a04cFeB6F18e6b9B3d | 0x0771017cbF77b5A4551864aD1461C6e8Ea4bd506 | 1.4 mil    |

Along with a NFT projects:
0xdf9Aa1012Fa49DC1d2a306e3e65EF1797d2b5fBb 0x4f27d5f3685e3ab4a06ae2a141c7228ba6fa1856

There might be other contracts in the wild using the UUPS proxy and has not initialized their implementation contract. 

## Suggested actions

1. Inform projects to intialize their UUPS proxy implementation.
2. Potentially rescuing some contracts if their owners are unreachable by initializing their contract with a throwaway contract that OZ can prove that they no longer have control of. Initializing contracts will not disrupt the proxy behavior.
3. Publish a report to alert developers who have used the existing implementation but didnt initialize their implementation contract.
4. Include adding a constructor with the `initializer` function to auto initialize any implementation contract for guides like:
   1. https://forum.openzeppelin.com/t/uups-proxies-tutorial-solidity-javascript/7786
   2. https://docs.openzeppelin.com/upgrades-plugins/1.x/writing-upgradeable
5. Disable constructor error in hardhat plugin that prevents deploying contracts with constructor by default.
