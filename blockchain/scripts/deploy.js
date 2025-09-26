const hre = require("hardhat");

async function main() {
  await hre.run("compile");
  const AdviceLog = await hre.ethers.getContractFactory("AdviceLog");
  const adviceLog = await AdviceLog.deploy();
  await adviceLog.waitForDeployment();
  const address = await adviceLog.getAddress();
  console.log("AdviceLog deployed to:", address);

  // Write ABI and address into a shared json for server/FE
  const fs = require("fs");
  const path = require("path");
  const outDir = path.join(__dirname, "..", "artifacts-exports");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  const artifact = await hre.artifacts.readArtifact("AdviceLog");
  fs.writeFileSync(
    path.join(outDir, "AdviceLog.json"),
    JSON.stringify({ address, abi: artifact.abi }, null, 2)
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


