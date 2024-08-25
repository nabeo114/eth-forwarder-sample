// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

contract MyRecipient is ERC20, Ownable, ERC2771Context {
  // ERC2771ContextはMeta-transactions（ユーザーがガス代を負担せずに
  // トランザクションを行う方法）をサポートするために使用されます。
  // trustedForwarderは、ユーザーの代理でトランザクションを送信する
  // 信頼されたエンティティとして機能します。
  // このコントラクトでは、trustedForwarderを使用することで、
  // 元の発信者のアドレスを取得し、それを基に処理を行います。
  constructor(address trustedForwarder)
    ERC20("MyToken", "MTK")
    Ownable(msg.sender)
    ERC2771Context(trustedForwarder)
  {}

  function mint(address to, uint256 amount) public onlyOwner {
    _mint(to, amount);
  }

  // ERC2771Contextのメカニズムにより、Meta-transactionsを処理する際に
  // _msgSender()がトランザクションを実際に発行したユーザーのアドレスを
  // 返すようにします。このため、ContextとERC2771Contextの両方を
  // 継承している場合、どの実装を優先するかを明示的に指定するために、
  // _msgSender()と_msgData()をオーバーライドしています。

  // ContextとERC2771Contextの両方が_msgSender()を定義しているため、
  // この関数をオーバーライドし、Meta-transactionsで使用される
  // 元の発信者のアドレスを返します。super._msgSender()を呼び出すことで、
  // ERC2771Contextの実装が使用されるように指定しています。
  function _msgSender()
    internal
    view
    override(Context, ERC2771Context)
    returns (address)
  {
    return super._msgSender();
  }

  // 同様に、_msgData()もオーバーライドし、Meta-transactionsで使用される
  // 元のトランザクションデータを取得します。
  // super._msgData()を呼び出すことで、ERC2771Contextの実装が
  // 使用されるように指定しています。
  function _msgData()
    internal
    view
    override(Context, ERC2771Context)
    returns (bytes calldata)
  {
    return super._msgData();
  }

  function _contextSuffixLength()
    internal
    view
    override(Context, ERC2771Context)
    returns (uint256)
  {
    return super._contextSuffixLength();
  }
}
