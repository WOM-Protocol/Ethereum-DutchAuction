# SecondPriceAuction

Simple modified second price auction contract. Price starts high and monotonically decreases until all tokens are sold at the current price with currently received funds. The price curve has been chosen to resemble a logarithmic curve and produce a reasonable auction timeline. Requires softcap to be met, before finalisation, and if finalisation is not met a refund will be available.

