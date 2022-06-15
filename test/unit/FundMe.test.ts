import { network, deployments, ethers, getNamedAccounts} from 'hardhat'
import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { assert, expect } from 'chai'
import { FundMe, MockV3Aggregator } from "../../typechain"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"

describe("FundMe", () => {
    let fundMe:FundMe
    let deployer: any
    let mockV3Aggregator:MockV3Aggregator
    // const oneEther = 1000000000000000000
    const oneEther = ethers.utils.parseEther("1")
    beforeEach(async () => {
        //deploy fundme contract using hardhat-deploy
        
        //get deployer account
        deployer = (await getNamedAccounts()).deployer
        console.log('deployer in test: ', deployer)
        //we can also get a list of all accounts
        //const accounts = await ethers.getSigners()

        


        // fixture allows to run the entire deploy folder with as many tags as we want
        // notice that  we use the 'all' tag in both mocks and fundme contracts
        // so we deploy both mocks and fundme contracts
        await deployments.fixture(["all"])
        fundMe = await ethers.getContract("FundMe", deployer) 
        // add deployer as sencond arguments means whenever we call functions from fundme contract, it will be called/ made transactions by deployer
        
        
        //why not use: 11:14
        // fundMe = await deployments.get('FundMe') 
        // Is it because I cannot make a call to fundme functions from here due to the lack of deployer attached to it? I think so.


        mockV3Aggregator = await ethers.getContract('MockV3Aggregator', deployer)
    })

    describe("constructor", async() => {
        it("set the aggregator address correctly", async() => {
            const responsePriceFeed = await fundMe.i_priceFeed()
            assert.equal(responsePriceFeed, mockV3Aggregator.address)
        })
    })

    describe("fund", async () => {
        it("fails if you dont have enough ether", async () => {
            await expect(fundMe.fund()).to.be.revertedWith("You need to spend more ETH!")
        })
        it('update the amount funded data structure', async () => {
            await fundMe.fund({value: oneEther}) //call function fund and send 1 ether to fundme contract??
            const response = await fundMe.addressToAmountFunded(deployer)
            assert.equal(response.toString(), oneEther.toString())
        })
        it('add funder to array of funders', async () => {
            await fundMe.fund({value: oneEther})
            const response = await fundMe.funders(0)
            assert.equal(response, deployer)
        })
    })

    describe('withdraw', async () => {
        beforeEach(async () => {
            await fundMe.fund({value: oneEther})
        })

        it("withdraw ETH from a single funder", async () => {
            // TODO: proper way to get balance. Through ethers.provider or fundMe.provider ?
            const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address) // you can also use ethers.provider.getBalance(fundMe.address)
            console.log('startingFundMeBalance: ', startingFundMeBalance.toString())
            const startingDeployerBalance = await fundMe.provider.getBalance(deployer)
            console.log('startingDeployerBalance: ', startingDeployerBalance.toString())

            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)
            console.log('gasCost: ', gasCost.toString())

            const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            console.log('endingFundMeBalance: ', endingFundMeBalance.toString())
            const endingDeployerBalance = await fundMe.provider.getBalance(deployer)
            console.log('endingDeployerBalance: ', endingDeployerBalance.toString())


            assert.equal(endingFundMeBalance.toString(), "0")
            assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString())
        })
    })
})