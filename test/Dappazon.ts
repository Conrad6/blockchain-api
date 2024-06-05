import { expect } from 'chai';
import { ContractTransactionResponse, Signer, parseUnits } from 'ethers';
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

    describe('Purchasing', () => {
        let transaction: ContractTransactionResponse;

        beforeEach(async () => {
            transaction = await dappazon.connect(deployer).list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK);
            await transaction.wait();

            transaction = await dappazon.connect(buyer).buy(ID, { value: COST });
        });

        it('Updates the contract balance', async () => {
            const result = await ethers.provider.getBalance(await dappazon.getAddress());
            expect(result).to.equal(COST);
        });

        it('Updates the buyer\'s order count', async () => {
            const result = await dappazon.orderCount(await buyer.getAddress());
            expect(result).equal(1);
        });

        it('Updates the orders', async () => {
            const result = await dappazon.orders(await buyer.getAddress(), await dappazon.orderCount(await buyer.getAddress()));
            expect(result.item.id).to.equal(ID);
            expect(result.item.name).to.equal(NAME);
        });

        it('Emits buy event', async () => {
            expect(transaction).to.emit(dappazon, 'Buy')
        });
    });

    describe('Withdrawal', () => {
        let balanceBefore: bigint;

        beforeEach(async () => {
            let transaction = await dappazon.connect(deployer).list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK);
            await transaction.wait();

            transaction = await dappazon.connect(buyer).buy(ID, { value: COST });
            await transaction.wait();

            balanceBefore = await ethers.provider.getBalance(await deployer.getAddress());

            transaction = await dappazon.connect(deployer).withdraw();
            await transaction.wait();
        });

        it('Updates the owner\'s balance', async () => {
            const balanceAfter = await ethers.provider.getBalance(await deployer.getAddress());
            expect(balanceAfter).to.greaterThan(balanceBefore);
        });

        it('Updates the contract\'s balance', async () => {
            const result = await ethers.provider.getBalance(await dappazon.getAddress());
            expect(result).to.equal(0);
        })
    })
});
