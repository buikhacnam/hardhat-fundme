# Hardhat FundMe Contract


# Create Hardhat Typescript project

Install hardhat:

```
yarn add -D hardhat
```

Initialize Hardhat project:

```
yarn hardhat
```

And then select the prompt to create an advanced typescript project.

Copy the recommended packages from the terminal and install them.

It may look like this (2022 June):

```
yarn add --dev "hardhat@^2.9.9" "@nomiclabs/hardhat-waffle@^2.0.0" "ethereum-waffle@^3.0.0" "chai@^4.2.0" "@nomiclabs/hardhat-ethers@^2.0.0" "ethers@^5.0.0" "@nomiclabs/hardhat-etherscan@^3.0.0" "dotenv@^16.0.0" "eslint@^7.29.0" "eslint-config-prettier@^8.3.0" "eslint-config-standard@^16.0.3" "eslint-plugin-import@^2.23.4" "eslint-plugin-node@^11.1.0" "eslint-plugin-prettier@^3.4.0" "eslint-plugin-promise@^5.1.0" "hardhat-gas-reporter@^1.0.4" "prettier@^2.3.2" "prettier-plugin-solidity@^1.0.0-beta.13" "solhint@^3.3.6" "solidity-coverage@^0.7.16" "@typechain/ethers-v5@^7.0.1" "@typechain/hardhat@^2.3.0" "@typescript-eslint/eslint-plugin@^4.29.1" "@typescript-eslint/parser@^4.29.1" "@types/chai@^4.2.21" "@types/node@^12.0.0" "@types/mocha@^9.0.0" "ts-node@^10.1.0" "typechain@^5.1.2" "typescript@^4.5.2"
```

You may want to install @chainlink/contracts :

```
yarn add -D @chainlink/contracts
```

# Hardhat Deploy Plugin
Source: https://github.com/wighawag/hardhat-deploy

```
yarn add -D hardhat-deploy @nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers ethers
```

Then you can create a folder named deploy on the root folder of your project.

Run the deploy command below to automaically compile all the contracts and run all the deploy functions in all files in the deploy folder.

To deploy, run:

```
yarn hardhat deploy
```

```
yarn hardhat deploy --network <networkName> 
```

```
yarn hardhat deploy --tags <tagName>
```

```
yarn hardhat deploy --network <networkName> --tags <tagName>
```

# Mock Contracts

Problem: You want to use a <a href='https://docs.chain.link/docs/ethereum-addresses/'>Data Feed address</a> from a network to do some stuff on your contract, for example convert ETH to USD. But you only want to deploy the contract to hardhat / localhost network, but not the real network that Data Feed address belongs to. So where do you get the Data Feed address from?

The anwer is to create a mock contract. Then deploy it to hardhat / localhost network, and then you can use the mock contract address as Data Feed address.

In this project we will use a mock <a href='https://github.com/smartcontractkit/chainlink/blob/develop/contracts/src/v0.6/tests/MockV3Aggregator.sol'>contract</a> from chainlink: 

```
pragma solidity ^0.6.0;

import "@chainlink/contracts/src/v0.6/tests/MockV3Aggregator.sol";

```

Then we deploy the mock contract to hardhat / localhost network.  In the deploy folder, we have a file named `00-deploy-mocks.ts`:

```
const deploy: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	console.log('Deploying mocks...')
    // @ts-ignore
    const { getNamedAccounts, deployments } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    if(developmentChains.includes(network.name)) {
        log('Deploying mocks nha...')
        await deploy('MockV3Aggregator', {
            contract: 'MockV3Aggregator',
            from: deployer,
            args: [DECIMALS, INITIAL_ANSWER],
            log: true,
        })
        log('Mocks deployed!')
    }
}

export default deploy
deploy.tags = ["all", "mocks"]
```

Then we can use the contract address from the mock contract and use it as the Data Feed address.

```
const deploy:DeployFunction = async (hre:HardhatRuntimeEnvironment) => {
	console.log('Deploying fundme...')
    // hre can be a lot like: import hre from 'hardhat'
    // @ts-ignore
	const { getNamedAccounts, deployments } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId:number = network.config.chainId!
    let ethUsdPriceFeedAddress = ''
    if(developmentChains.includes(network.name)) {
        //get recent MockV3Aggregator deployed contract address
        const mockContract = await deployments.get('MockV3Aggregator')
        ethUsdPriceFeedAddress = mockContract.address

    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed
    }

    const fundMe = await deploy('FundMe', {
        from: deployer,
        args: [ethUsdPriceFeedAddress],
        log: true,
    })

    log('FundMe deployed!')
}

export default deploy
deploy.tags = ["all", "fundme"]
```

# Solidity Style Guide
Reference: https://docs.soliditylang.org/en/v0.8.13/style-guide.html

# Advanced Sample Hardhat Project

This project demonstrates an advanced Hardhat use case, integrating other tools commonly used alongside Hardhat in the ecosystem.

The project comes with a sample contract, a test for that contract, a sample script that deploys that contract, and an example of a task implementation, which simply lists the available accounts. It also comes with a variety of other tools, preconfigured to work with the project code.

Try running some of the following tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
npx hardhat help
REPORT_GAS=true npx hardhat test
npx hardhat coverage
npx hardhat run scripts/deploy.ts
TS_NODE_FILES=true npx ts-node scripts/deploy.ts
npx eslint '**/*.{js,ts}'
npx eslint '**/*.{js,ts}' --fix
npx prettier '**/*.{json,sol,md}' --check
npx prettier '**/*.{json,sol,md}' --write
npx solhint 'contracts/**/*.sol'
npx solhint 'contracts/**/*.sol' --fix
```

# Etherscan verification

To try out Etherscan verification, you first need to deploy a contract to an Ethereum network that's supported by Etherscan, such as Ropsten.

In this project, copy the .env.example file to a file named .env, and then edit it to fill in the details. Enter your Etherscan API key, your Ropsten node URL (eg from Alchemy), and the private key of the account which will send the deployment transaction. With a valid .env file in place, first deploy your contract:

```shell
hardhat run --network ropsten scripts/deploy.ts
```

Then, copy the deployment address and paste it in to replace `DEPLOYED_CONTRACT_ADDRESS` in this command:

```shell
npx hardhat verify --network ropsten DEPLOYED_CONTRACT_ADDRESS "Hello, Hardhat!"
```

# Performance optimizations

For faster runs of your tests and scripts, consider skipping ts-node's type checking by setting the environment variable `TS_NODE_TRANSPILE_ONLY` to `1` in hardhat's environment. For more details see [the documentation](https://hardhat.org/guides/typescript.html#performance-optimizations).
