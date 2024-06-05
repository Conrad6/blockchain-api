import { BigNumberish, parseUnits } from 'ethers';
import { ethers } from 'hardhat';
import { items } from '../items.json';

const tokens = (n: BigNumberish) => {
    return parseUnits(n.toString(), 'ether');
}

async function main() {
    const [deployer] = await ethers.getSigners();

    const Dappazon = await ethers.getContractFactory('Dappazon');
    const dappazon = await Dappazon.deploy();
    await dappazon.waitForDeployment();

    console.log(`Dappazon Contract deployed at: ${await dappazon.getAddress()}`);
    console.log('Listing items...');

    for (const { id, name, category, image, price, rating, stock } of items) {
        const transaction = await dappazon.connect(deployer).list(id, name, category, image, tokens(price), rating, stock);
        await transaction.wait();

        console.log(`Listed item ${id}: ${name}`);
    }
}

main();
