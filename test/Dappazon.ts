import { expect } from 'chai';
import { ContractTransaction, ContractTransactionResponse, Signer, Transaction, parseUnits } from 'ethers';
import { ethers } from 'hardhat';
import { Dappazon } from '../typechain-types';

const tokens = (n: number) => {
    return parseUnits(n.toString(), 'ether');
}

const ID = 1
const NAME = "Shoes"
const CATEGORY = "Clothing"
const IMAGE = "https://ipfs.io/ipfs/QmTYEboq8raiBs7GTUg2yLXB3PMz6HuBNgNfSZBx5Msztg/shoes.jpg"
const COST = tokens(1)
const RATING = 4
const STOCK = 5

describe('Dappazon', () => {

    let dappazon: Dappazon;
    let deployer: Signer;
    let buyer: Signer;
    beforeEach(async () => {
        [deployer, buyer] = await ethers.getSigners();
        const Dappazon = await ethers.getContractFactory('Dappazon');
        const response = await Dappazon.deploy();
        await response.waitForDeployment();
        dappazon = response;
    });

    describe('Deployment', () => {
        it('Has an owner', async () => {
            expect(await dappazon.owner()).to.be.equal(await deployer.getAddress());
        })
    });

    describe('Listing', () => {
        let transaction: ContractTransactionResponse;

        beforeEach(async () => {
            transaction = await dappazon.connect(deployer).list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK);
            await transaction.wait();
        });

        it('Returns item attributes', async () => {
            const item = await dappazon.items(ID);
            expect(item.id).to.be.equal(ID);
            expect(item.name).to.be.equal(NAME);
            expect(item.category).to.be.equal(CATEGORY);
            expect(item.image).to.be.equal(IMAGE);
            expect(item.cost).to.be.equal(COST);
            expect(item.rating).to.be.equal(RATING);
            expect(item.stock).to.be.equal(STOCK);
        });

        it('Emits "List" event', () => {
            expect(transaction).to.emit(dappazon, 'List');
        });
    });
});
