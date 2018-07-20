# Script Section
:gem: Section for scripts that have been created whilst producing the WOMDaPP.  These scripts increase production time dramatically, and can be used by any other Solidity dev.

# BashCoverage
This script generates [code coverage](https://en.wikipedia.org/wiki/Code_coverage) on our Solidity Smart Contracts by using [solidity-coverage](https://github.com/sc-forks/solidity-coverage), which generates HTML for the outputted results, and then purges/removes any pre-existing [now.sh](https://github.com/zeit/now-cli) instances using [now-purge](https://www.npmjs.com/package/now-purge), to then create a new [now.sh](https://github.com/zeit/now-cli) instance of the results.  Once a now instance has been successfully created, we use [slacktee](https://github.com/coursehero/slacktee) to connect to the authorized Slack websocket, and post 'New solidity-coverage report: https://coverage-xxxxxxx.now.sh' to the desired [Slack](https://slack.com/) channel.
