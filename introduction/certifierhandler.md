# CertifierHandler

This contract can be used by certified people to change their certification address.   
 How it works:   
         1. A trasaction must be sent from the first certified address, which will contain as argument the   
             new address to certify   
         2. An event is emitted by the contract, which a process will listen to. It will immediately call   
            `revoke(old_address)`and then `certify(new_address)` in order change the certification   
             address.   
         3. The certifier account calls `settle` so that the entry is deleted from this contract.  A small fee will                 
             be asked in order to pay for the transaction costs \(3 transactions are sent\). After the modification   
             of the certified address, the sender and the new account are both locked. This is to prevent people   
             change constantly their certified address.

