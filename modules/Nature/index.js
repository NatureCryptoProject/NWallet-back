const { Crypto, Nature, Transaction } = require("./utils.js");

let nature = new Nature("127.0.0.1", "27777");

// Ping (check server avalibility)
nature
  .ping()
  .then((ping_res) => {
    console.log(ping_res);
  })
  .catch((err) => {
    console.log("Error on ping: ", err);
  });

// Get current fee
nature
  .fee()
  .then((fee) => {
    console.log(`Now fee is ${fee}.`);
  })
  .catch((err) => {
    console.log("Error on fee: ", err);
  });

// Here will be error cause address format is bad
let addr = "NATURE123123";
nature
  .getBalance(addr)
  .then((balance) => {
    console.log(`Balance of "${addr}" is ${balance}`);
  })
  .catch((err) => {
    console.log("Error on getBalance: ", err);
  });

// Here good address
let mnem = Crypto.generateMnemonic();
let kp = Crypto.generateKeypair(mnem);
addr = kp.publicKey;
nature
  .getBalance(addr)
  .then((balance) => {
    console.log(`Balance of "${addr}" is ${balance}`);
  })
  .catch((err) => {
    console.log("Error on getBalance: ", err);
  });

// Test send with random kp
let kp_reciver = Crypto.generateKeypair(Crypto.generateMnemonic());
nature
  .sendTransaction(addr, kp.privateKey, kp_reciver.publicKey, 10)
  .then((resp) => {
    console.log(`Response for send transaction: ${resp}`);
  })
  .catch((err) => {
    console.log("Error on sendTransaction: ", err);
  });

// Test send with random kp and message
nature
  .sendTransaction(
    addr,
    kp.privateKey,
    kp_reciver.publicKey,
    10,
    "TESTING MESSAGES"
  )
  .then((resp) => {
    console.log(`Response for send transaction: ${resp}`);
  })
  .catch((err) => {
    console.log("Error on sendTransaction with message: ", err);
  });

// Get key-pair from server
nature
  .createAccount()
  .then((acc) => {
    console.log("ACC: ", acc);
  })
  .catch((err) => {
    console.log("Error on createAccount: ", err);
  });
