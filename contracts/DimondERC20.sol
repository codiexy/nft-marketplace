// SPDX-License-Identifier:MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract DiamondVerseToken is ERC20, Ownable, Pausable {
    uint8 private _decimals;
    uint256 public tokenPrice = 100; // Token price in cents
    address distributorAddress;
    
     struct AddressInfoStruct {
        uint256 tokenPrice;
        uint256 balance;
        uint8 decimal;
    } 
    
    constructor(uint256 initialSupply, uint8 _decimalVal) ERC20("DiamondVerse Token", "DVT") {
        require(_decimalVal <= 18, "Decimals must be 18 or lower");
        _mint(msg.sender, initialSupply * (10 ** uint256(_decimalVal))); 
        _decimals = _decimalVal;
    }

    function transferAmountMP(address _to, uint256 _amount)external onlyOwner{
        uint256 amount = _amount * (10 ** decimals());
        transfer(_to, amount);
    }
    
     function decimals() public view override returns (uint8) {
        return _decimals;
    }

    function getBalWithoutDeci(address _getbal)public view returns(uint256)
    {
        return((balanceOf(_getbal)/(10 **decimals())));
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, amount);
    }
   
    function setTokenPrice(uint256 _centsPrice) external onlyOwner {
        tokenPrice = _centsPrice;
    }
    
    function burnTokens(uint256 _amount) public onlyOwner {
        uint256 amount = _amount * (10 ** decimals());
        _burn(msg.sender, amount);
    }

    function getAddressInfo(address _address) public view returns (AddressInfoStruct memory) {
        AddressInfoStruct memory data;
        data.tokenPrice = tokenPrice;
        data.balance = balanceOf(_address);
        data.decimal = decimals();
        return data;
    }
}
