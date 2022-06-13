import { network } from 'hardhat'
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import {developmentChains, DECIMALS, INITIAL_ANSWER } from '../helper-hardhat-config'
const deploy: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	console.log('Deploying mocks...')
    // @ts-ignore
    const { getNamedAccounts, deployments } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    if(developmentChains.includes(network.name)) {
        log('Deploying mocks nha...')
        console.log('mock deployer:', deployer)
        const mock = await deploy('MockV3Aggregator', {
            contract: 'MockV3Aggregator',
            from: deployer,
            args: [DECIMALS, INITIAL_ANSWER],
            log: true,
        })
        log('Mocks deployed!')
        console.log('mock address: ', mock.address)
        log('--------------------------------------------------')
    }
}

export default deploy
deploy.tags = ["all", "mocks"]
//when we run: yarn hardhat deploy --tags mocks
//it will only run this file (has mocks tag)