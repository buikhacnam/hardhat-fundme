// the purpose of this to test the contract one final time 
// before it is deployed to the mainnet
import { network, ethers, getNamedAccounts} from 'hardhat'
import { assert } from 'chai'
import { FundMe } from "../../typechain"
import  {developmentChains} from '../../helper-hardhat-config'


developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe Staging Tests", async function () {
          let deployer: any
          let fundMe: FundMe
          const sendValue = ethers.utils.parseEther("0.05")
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              fundMe = await ethers.getContract("FundMe", deployer)
              console.log('deployer: ', deployer)
                console.log('fundMe: ', fundMe)
          })

          it("allows people to fund and withdraw", async function () {
              await fundMe.fund({ value: sendValue })
              await fundMe.withdraw({
                gasLimit: 10000000
              })
              const endingFundMeBalance = await fundMe.provider.getBalance(
                  fundMe.address
              )
              console.log('endingFundMeBalance: ', endingFundMeBalance.toString())
              assert.equal(endingFundMeBalance.toString(), "0")
              console.log('here')
          })
      })