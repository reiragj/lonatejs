import {  Api,  JsonRpc,  RpcError,  JsSignatureProvider} from 'eosjs';
import fetch from 'node-fetch' // node only; not needed in browsers
import {
  TextEncoder,
  TextDecoder
} from 'util' // node only; native TextEncoder/Decoder 

let _defaultPrivateKey = Symbol();
let _apiUrl = Symbol();
let _rpc = Symbol();
let _signatureProvider = Symbol();
let _api = Symbol();


export default class Lonate {
  constructor(defaultPrivateKey = "5JTot3g8Mw8bHVCXKyjCdKv4XpcJUQSGwnMDyyDpQhLfrwDrgFz", apiUrl = 'http://10.177.198.56:8888') {
    this[_defaultPrivateKey] = defaultPrivateKey;
    this[_api] = new Api({
      rpc : new JsonRpc(apiUrl, {fetch } ),
      signatureProvider : new JsSignatureProvider([defaultPrivateKey]),
      textDecoder: new TextDecoder(),
      textEncoder: new TextEncoder()
    });
  }

  /** function table
   *  -- param 
   * 
   *  _data : { key : value , ...}
   * 
   *  -- response
   *  { id: '27c39b0702452a356388bd1266b25f19ede4aec471555dd9fa41bac8250ecf98',
   *   receipt: { status: 'executed', cpu_usage_us: 24339, net_usage_words: 17 },
   *   elapsed: 24339,
   *   net_usage: 136,
   *   scheduled: false,
   *   action_traces: [ [Object] ],
   *   except: null } }
   *   
   **/

  table = async (_data, _table) =>  {
      if (!_data) {
        _data = {
          code: "lonate",
          json: true,
          limit: 10,
          ower_bound: "",
          scope: "lonate",
          table: _table,
          table_key: "",
          upper_bound: ""
        }
      }
      try {
        const result = await this[_api].rpc.get_table_rows(_data)
        return result;
      } catch (err) {
        console.log(err);
        return err;
      }
    }
  
  

  /**
--params
account_name : account name

--usage
get_currency_balance('gjlee').then(data=> console.log(data));

--response
[ '800.0000 LOTY' ]

**/
  get_currency_balance = async (account_name) => {
      try {
        const result = await this[_api].rpc.get_currency_balance("lonate.token", account_name, "loty")
        return result;
      } catch (err) {
        console.log(err);
        return err;
      }
  }

  /*
{
  --params
  data = 
  { 
    code:"lonate", 
    json:true, 
    limit:10, 
    ower_bound:"", 
    scope:"lonate", 
    table:"post", 
    table_key : "", 
    upper_bound :""
 }

 --usage
 get_comment_list( ).then(data=> console.log(data));
 get_account_list( ).then(data=> console.log(data));
 get_comment_list().then(data=> console.log(data));
*/

get_project_list() {
  return this.table(arguments[0], 'post');
}

  get_account_list() {
    return this.table(arguments[0], 'account')
  }

  get_comment_list() {
    return this.table(arguments[0], 'comment')
  }




  /**
  --params
  account_name : account name
   pos :  start position
   offset : start to end

   --usage
  get_action('gjlee', 0,  10)

  -- response
  { actions: 
     [ { global_action_seq: 730,
         account_action_seq: 6,
         block_num: 710,
         block_time: '2018-11-01T10:10:33.000',
         action_trace: { receipt: 
                                    { receiver: 'lonate',
                                      act_digest: 'dfdfd8691ed620db3cb2435e5ad0cc3ea2b0c52adfe8e21a0ecaa5025f47f686',
                                      global_sequence: 730,
                                      recv_sequence: 4,
                                      auth_sequence: [ [Array] ],
                                      code_sequence: 1,
                                      abi_sequence: 1 },
                                    act: 
                                    { account: 'lonate.token',
                                      name: 'transfer',
                                      authorization: [ [Object] ],
                                      data: 
                                        { from: 'gjlee',
                                          to: 'lonate',
                                          quantity: '100.0000 LOTY',
                                          memo: '' },
                                      hex_data: '0000000000a5e26300000000a86c268d40420f0000000000044c4f545900000000' },
                                    elapsed: 65,
                                    cpu_usage: 0,
                                    console: '',
                                    total_cpu_usage: 0,
                                    trx_id: '14940305852f18ae8e0a6df8e942bf377b2472b099dceeedcf8fd318ee77b185',
                                    inline_traces: [] }
                                 },
       { global_action_seq: 912,
         account_action_seq: 7,
         block_num: 891,
         block_time: '2018-11-01T10:12:03.500',
         action_trace: [Object] },
         .
         .
         .
    last_irreversible_block: 113765 }
    **/
  get_action = async(account_name, pos, offset) => {
      try {
        const result = await this[_api].rpc.history_get_actions(account_name, pos, offset);
        //console.dir(result.actions[0].action_trace);  json result usage
        return result;
      } catch (err) {
        console.log(err);
        return err;
      }
  }


  /** function transaction
   *  -- param 
   *  _actor : account_name
   *  _data : { key : value , ...}
   * 
   *  -- response
   *  { id: '27c39b0702452a356388bd1266b25f19ede4aec471555dd9fa41bac8250ecf98',
   *   receipt: { status: 'executed', cpu_usage_us: 24339, net_usage_words: 17 },
   *   elapsed: 24339,
   *   net_usage: 136,
   *   scheduled: false,
   *   action_traces: [ [Object] ],
   *   except: null } }
   *   
   **/

  transaction = async (_actor, _data, _action) =>  {
      try {
        const result = await this[_api].transact({
          actions: [{
            account: 'lonate',
            name: _action,
            authorization: [{
              actor: _actor,
              permission: 'active',
            }],
            data: _data,
          }]
        }, {
          blocksBehind: 3,
          expireSeconds: 30,
        });
        return result;
      } catch (err) {
        return err;
      }
  }

  /** function posting
   *  -- param 
   *  _actor : account_name
   *  _data : {
   *                 author :  "author account_name",
   *                 name : "theme",
   *                 context :  "contents"            
   *             } 
   * 
   *  posting('gjlee', {
   *    author: 'gjlee',
   *    name: '이것도 테스트4',
   *    context: '돈좀 주바'   
   *    }).then(data=>console.log(data));
   * 
   *   
   **/
  post(_actor, _data) {
    return this.transaction(_actor, _data, 'postaction');
  }

  /** function deposit
   *  -- param 
   *  _actor : account_name
   *  _data : {
   *                 from :  "author account_name",
   *                 quantity :  "10.0000 LOTY"            
   *             } 
   * 
   * deposit('gjlee', {
   * from: 'gjlee',
   * quantity: '100.0000' + " LOTY"
   * }).then(data => console.log(data));
   *   
   **/

  deposit(_actor, _data) {
    return this.transaction(_actor, _data,  'deposit');
  }

  /** function donate
   *  -- param 
   *  _actor : account_name
   *  _data : {
   *                 from :  "donor account name",
   *                 postid : "postid",
   *                 quantity : "기부 수량"                             
   *             } 
   * 
   * donate('gjlee', {
   *   from:"gjlee",
   *   postid:"0", 
   *   quantity: "10.0000" + " LOTY"
   * }).then(data => console.log(data));
   * 
   *   
   **/

  donate(_actor, _data) {
    return this.transaction(_actor, _data,  'donate');
  }

  /** function posting
   *  -- param 
   *  _actor : account_name
   *  _data : {
   *                 from :  "curator account name",
   *                 postid : "postid"                             
   *             } 
   * 
   * curate('gjlee', {
   *  from: 'gjlee',
   *  postid: '2'   
   * }).then(data=>console.log(data));
   * 
   *   
   **/
  curate(_actor, _data) {
    return this.transaction(_actor, _data,  'vote');
  }
  
}
