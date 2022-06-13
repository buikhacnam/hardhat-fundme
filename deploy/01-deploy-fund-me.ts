import { network } from 'hardhat'
import { DeployFunction, Deployment } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import {developmentChains, networkConfig} from '../helper-hardhat-config'

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
    })

    log('FundMe deployed!')
    console.log('fundme address: ', fundMe.address)
    log('--------------------------------------------------')
}

export default deploy
deploy.tags = ["all", "fundme"]
//when we run: yarn hardhat deploy --tags fundme
//it will only run this file (has fundme tag)
