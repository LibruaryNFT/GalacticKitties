// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "forge-std/Script.sol";
import "@layerzerolabs/oapp-evm/contracts/oapp/libs/OptionsBuilder.sol";

interface IAdapter {
    struct EnforcedOptionParam {
        uint32 eid;
        uint16 msgType;
        bytes options;
    }
    function setEnforcedOptions(EnforcedOptionParam[] calldata _enforcedOptions) external;
}

contract SetEnforcedOptions is Script {
    using OptionsBuilder for bytes;
    
    uint16 constant SEND = 1;
    
    function run() external {
        uint256 privateKey = vm.envUint("BASE_SEPOLIA_PRIVATE_KEY");
        address adapter = 0x953015B459e7862DE2d2CF3624c2DadfFf6310c2;
        uint32 flowEid = 40351;
        
        vm.startBroadcast(privateKey);
        
        // Set enforced options: 200k gas on Flow for receiving
        IAdapter.EnforcedOptionParam[] memory enforcedOptions = new IAdapter.EnforcedOptionParam[](1);
        enforcedOptions[0] = IAdapter.EnforcedOptionParam({
            eid: flowEid,
            msgType: SEND,
            options: OptionsBuilder.newOptions().addExecutorLzReceiveOption(200000, 0)
        });
        
        IAdapter(adapter).setEnforcedOptions(enforcedOptions);
        
        vm.stopBroadcast();
        
        console.log("Enforced options set on adapter");
    }
}