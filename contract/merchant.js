export default `/*
* This contract act as a register for orders fulfillment
* Todolist:
* - add the ability to retrieve the data so stats can be analysed
* - add the ability to remove data (check the owner of the contract first)
* - add merchant maangement (can change the merchant address not to be binded by the contract creator)
*/
contract Aupos =

  record state = {
    store_open       : int,            // indicates whenever the store will fullfill orders
    orders           : map(hash, int), // map of tx_hash and block height, where the BH is the one when the tx was verified
    merchant         : address }       // address of the merchant that is able to fulfill transactions

  stateful entrypoint init() : state = {
      store_open = 1,
      orders     = {},
      merchant   = Contract.creator
    }

  /*
  * this functino should be only called by the merchant when it has retrieved the
  * address that has been signing the transaction with tx_hash
  */
  stateful entrypoint fulfill_order(customer: address, tx_hash : hash, sig : signature) =
    if(Call.caller != state.merchant)
      abort(String.concat("err:auth:", Address.to_str(Call.caller)))
    // get the signature
    if(!Crypto.verify_sig(tx_hash, customer, sig))
      abort("err:sig:verify")
    // TODO: if the store is closed do not fulfill
    // get the transaction by hash
    // check if the order has already been fulfilled
    switch(Map.lookup(tx_hash, state.orders))
      // if the order has been already fulfilled then return the height
      Some(height) => abort(String.concat("err:exec:", Int.to_str(height)))
      // all validation done, all is good, validate the state
      None         => put(state{orders[tx_hash] = Chain.block_height})

  // check if an order is fulfilled
  // return the block height of the tx if it is found
  // 0 otherwise
  entrypoint is_fulfilled(tx_hash : hash) =
    switch(Map.lookup(tx_hash, state.orders))
      Some(height)  => height
      None          => 0

  // get the number of orders
  entrypoint count_orders() =
    Map.size(state.orders)

  // get the number of orders
  entrypoint get_merchant() =
    state.merchant

  // set the merchant address
  stateful entrypoint set_merchant(merchant: address) =
    if(Call.caller != state.merchant)
      abort(String.concat("err:auth:", Address.to_str(Call.caller)))
    put(state{merchant = merchant})
`
