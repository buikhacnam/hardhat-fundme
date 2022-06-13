// export interface networkConfigItem {
//   ethUsdPriceFeed?: string
//   blockConfirmations?: number
// }

// export interface networkConfigInfo {
//   [key: string]: networkConfigItem
// }

export const networkConfig:any = {
    4: {
        name: 'rinkeby',
        ethUsdPriceFeed: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e" // https://docs.chain.link/docs/ethereum-addresses/
    },
    137: {
        name: 'polygon',
        ethUsdPriceFeed: "0xF9680D99D6C9589e2a93a78A04A279e509205945" //https://docs.chain.link/docs/matic-addresses/
    }
}

export const developmentChains = ["hardhat", "localhost"]

export const DECIMALS = 8
export const INITIAL_ANSWER = 200000000000