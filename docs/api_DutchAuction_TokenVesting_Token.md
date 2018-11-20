---
id: DutchAuction_TokenVesting_Token
title: Token
---

<div class="contract-doc"><div class="contract"><h2 class="contract-header"><span class="contract-kind">contract</span> Token</h2><div class="source">Source: <a href="https://github.com/WOM-Protocol/WOM-Ethe/blob/v1.0.0/contracts/DutchAuction/TokenVesting.sol" target="_blank">DutchAuction/TokenVesting.sol</a></div></div><div class="index"><h2>Index</h2><ul><li><a href="DutchAuction_TokenVesting_Token.html#allowance">allowance</a></li><li><a href="DutchAuction_TokenVesting_Token.html#approveAndCall">approveAndCall</a></li><li><a href="DutchAuction_TokenVesting_Token.html#transferFrom">transferFrom</a></li></ul></div><div class="reference"><h2>Reference</h2><div class="functions"><h3>Functions</h3><ul><li><div class="item function"><span id="allowance" class="anchor-marker"></span><h4 class="name">allowance</h4><div class="body"><code class="signature"><span>abstract </span>function <strong>allowance</strong><span>(address _tokenHolder, address _spender) </span><span>public </span><span>view </span><span>returns  (uint) </span></code><hr/><dl><dt><span class="label-parameters">Parameters:</span></dt><dd><div><code>_tokenHolder</code> - address</div><div><code>_spender</code> - address</div></dd><dt><span class="label-return">Returns:</span></dt><dd>uint</dd></dl></div></div></li><li><div class="item function"><span id="approveAndCall" class="anchor-marker"></span><h4 class="name">approveAndCall</h4><div class="body"><code class="signature"><span>abstract </span>function <strong>approveAndCall</strong><span>(address _spender, uint _amount, bytes _data) </span><span>public </span><span>returns  (bool) </span></code><hr/><dl><dt><span class="label-parameters">Parameters:</span></dt><dd><div><code>_spender</code> - address</div><div><code>_amount</code> - uint</div><div><code>_data</code> - bytes</div></dd><dt><span class="label-return">Returns:</span></dt><dd>bool</dd></dl></div></div></li><li><div class="item function"><span id="transferFrom" class="anchor-marker"></span><h4 class="name">transferFrom</h4><div class="body"><code class="signature"><span>abstract </span>function <strong>transferFrom</strong><span>(address _from, address _to, uint _amount) </span><span>public </span><span>returns  (bool) </span></code><hr/><dl><dt><span class="label-parameters">Parameters:</span></dt><dd><div><code>_from</code> - address</div><div><code>_to</code> - address</div><div><code>_amount</code> - uint</div></dd><dt><span class="label-return">Returns:</span></dt><dd>bool</dd></dl></div></div></li></ul></div></div></div>