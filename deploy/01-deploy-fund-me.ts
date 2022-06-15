import { network } from 'hardhat'
import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import {developmentChains, networkConfig} from '../helper-hardhat-config'
import { verify } from '../utils/verify'

const deploy:DeployFunction = async (hre:HardhatRuntimeEnvironment) => {
	console.log('Deploying fundme...')
    // hre can be a lot like: import hre from 'hardhat'
    // @ts-ignore
	const { getNamedAccounts, deployments } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId:number = network.config.chainId!
    console.log('network: ', network.name)
    let ethUsdPriceFeedAddress = ''
    if(developmentChains.includes(network.name)) {
        //get recent MockV3Aggregator deployed contract address
        const mockContract = await deployments.get('MockV3Aggregator')
        console.log('MockV3Aggregator contract address:', mockContract.address)
        ethUsdPriceFeedAddress = mockContract.address

    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed
    }

    console.log('fundme deployer: ', deployer)

    const fundMe = await deploy('FundMe', {
        from: deployer,
        args: [ethUsdPriceFeedAddress],
        log: true,
        waitConfirmations: developmentChains.includes(network.name) ? 0 : 1
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        console.log('start verify contract...')
        await verify(fundMe.address, [ethUsdPriceFeedAddress])
        //https://rinkeby.etherscan.io/address/0xe683379097D9BD1502e8a1Cef055C22372488E33#code
    }


    log('FundMe deployed!')
    console.log('fundme address: ', fundMe.address)
    log('--------------------------------------------------')
}

export default deploy
deploy.tags = ["all", "fundme"]
//when we run: yarn hardhat deploy --tags fundme
//it will only run this file (has fundme tag)
