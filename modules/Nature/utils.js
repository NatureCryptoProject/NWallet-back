const bip39 = require('bip39');
const tweetnacl = require('tweetnacl');
const slip10 = require('ed25519-hd-key');
const {
    sha256
} = require('js-sha256');
const sha3_256 = require('js-sha3').sha3_256;


class Crypto {
    static generateMnemonic() {
        return bip39.generateMnemonic(256);
    }

    /**
     * Returns keypair (Private Key, Public key)
     * @param {string} mnemonic - Mnemonic in string format from bip39
     * @param {string} bip32Path - BIP32Path in string format. Default: "m/0'"
     * @returns {[string, string]} - keypair as a tuple of two strings (private key, public key)
     */
    static generateKeypair(mnemonic, bip32Path = "m/0'") {
        if (!bip39.validateMnemonic(mnemonic)) {
            return false;
        }
        const seed = bip39.mnemonicToSeedSync(mnemonic);
        const derivedKey = slip10.derivePath(bip32Path, seed.toString('hex'));
        const keypair = tweetnacl.sign.keyPair.fromSeed(Buffer.from(derivedKey.key, 'hex'));
        let publicKey = `NATURE${Buffer.from(keypair.publicKey).toString('hex')}`;
        let privateKey = Buffer.from(keypair.secretKey).subarray(0, 32).toString('hex');

        return {
            privateKey,
            publicKey
        };

    }


    /**
     * Returns the signature of a given message using a given private key.
     * @param {string} message - The message to sign
     * @param {string} privateKey - The private key as a hex-encoded string
     * @returns {string} - The signature as a hex-encoded string
     */
    static sign(message, privateKey) {
        const secretKey = Buffer.from(privateKey, 'hex');
        const keypair = tweetnacl.sign.keyPair.fromSeed(secretKey);
        const signature = tweetnacl.sign(Buffer.from(message, 'utf8'), keypair.secretKey);
        return Buffer.from(signature).subarray(0, 64).toString('hex');
    }

    /**
     * Returns true if a given signature is valid for a given message and public key.
     * @param {string} expectedMessage - The expected message
     * @param {string} signature - The signature as a hex-encoded string
     * @param {string} publicKey - The public key as a hex-encoded string (with "NATURE" prefix)
     * @returns {boolean} - True if the signature is valid, false otherwise
     */
    static isValid(expectedMessage, signature, publicKey) {
        const publicKeyBytes = Buffer.from(publicKey.slice(6), 'hex'); // remove "NATURE" prefix
        const signatureBytes = Buffer.from(signature, 'hex');
        return tweetnacl.sign.detached.verify(
            Buffer.from(expectedMessage, 'utf8'),
            signatureBytes,
            publicKeyBytes
        );
    }

    /*
     * Returns hash of the transaction
     * @param {Transaction} transaction - transaction
     * @return {string} hash of transaction
     */
    static getHash(transaction) {
        let hasher = sha3_256.create();
        hasher.update(transaction.sender);
        hasher.update(transaction.reciver);
        hasher.update(transaction.amount.toString());
        hasher.update(this.u64ToByteArray(transaction.timestamp));
        return hasher.hex();
    }

    static u64ToByteArray(number) {
        const byteArray = new Uint8Array(8);
        for (let index = 0; index < byteArray.length; index++) {
            const byte = number & 0xff;
            byteArray[index] = byte;
            number = (number - byte) / 256;
        }
        return byteArray;
    }
}

const Net = require('net');

class Nature {
    /*
     * @param {string} host - Address of the node. Example: `127.0.0.1`
     * @param {string} host - Address of the node. Example: `8080`
     * @returns {Nature} - object of nature client
     */
    constructor(host, port) {
        this.host = host;
        this.port = port;
        this.requestId = 1;
    }

    /*
     * Ping-Pong method for check server accessebility
     * @returns {Promise<string>} - "Pong" if avalible.
     */
    ping() {
        return this.base_request("ping", []);
    }

    /*
     * Get fee amount
     * @returns {number} fee amout 
     */
    fee() {
        return new Promise((resolve, reject) => {
            this.base_request("fee", [TransactionType.Transaction(null)]).then((fee_resp) => {
                let data = JSON.parse(fee_resp);
                if (data.result !== undefined) {
                    resolve(data.result);
                } else {
                    reject(data.error);
                }
            }).catch((err) => {
                reject(err);
            })
        });
    }

    /*
     * getBalance method
     * @param {string} address - user address
     * @returns {Promise<number>} balance of passed address
     */
    getBalance(address) {
        return new Promise((resolve, reject) => {
            this.base_request("getBalance", [address]).then((bal_resp) => {
                let data = JSON.parse(bal_resp);
                if (data.result !== undefined) {
                    resolve(data.result);
                } else {
                    reject(data.error);
                }
            }).catch((err) => {
                reject(err);
            })
        });
    }

    /*
     * sendTransaction method. Check balance (balance >= amount+fee)
     * @param {string} senderPublicKey - user address
     * @param {string} senderPrivateKey - user private key
     * @param {string} reciver - address of reciver
     * @param {number} amount - transaction amount
     * @param {string} message (Optional) - transaction message. (Max: 30 chars)
     * @returns {Promise<string>} response from server (Message or error)
     */
    sendTransaction(senderPublicKey, senderPrivateKey, reciver, amount, message = null) {
        let transaction = new Transaction(senderPublicKey, senderPrivateKey,
            reciver, amount, TransactionType.Transaction(message));
        return new Promise((resolve, reject) => {
            this.base_request("sendTransaction",
                [transaction.sender, transaction.reciver, transaction.amount,
                    transaction.signature, transaction.timestamp,
                    transaction.transaction_type.data
                ]
            ).then((resp) => {
                let data = JSON.parse(resp);
                if (data.result !== undefined) {
                    resolve(data.result);
                } else {
                    reject(data.error);
                }
            }).catch((err) => {
                reject(err);
            })
        });
    }

    /*
     * createAccount method. Get Mnemonic and keypair from server
     * @returns {Promise<{string, string, string}>}
     */
    createAccount() {
        return new Promise((resolve, reject) => {
            this.base_request("createAccount", []).then((resp) => {
                let data = JSON.parse(resp);
                if (data.result !== undefined) {
                    resolve(data.result);
                } else {
                    reject(data.error);
                }
            }).catch((err) => {
                reject(err);
            })
        });
    }

    /*
    * getTransactions method. Returning from last to first.
    * @param {string} address - getting transactions for this address.
    * @param {number} offset - first transaction will be alltransactions[alltransactions.length-offset]. 
    *                        To get first, set offset = 0
    * @param {number} limit - limit of requestable transactions. Max: 1000
    * @returns {Promise<[Transaction]>} transactions array
    */
    getTransactions(address, offset, limit) {
        return new Promise((resolve, reject) => {
            this.base_request("getTransactions", [address, offset, limit]).then((resp) => {
                let data = JSON.parse(resp);
                if (data.result !== undefined) {
                    resolve(data.result);
                } else {
                    reject(data.error);
                }
            }).catch((err) => {
                reject(err);
            })
        });
    }

    /*
     * @param {string} method - requested method (Ping, Fee, SendTransaction, etc.)
     * @param {[]} params - array of requested params. 
     * @returns {Promise<string>} data from server
     */
    base_request(method, params) {
        let data = {
            jsonrpc: "2.0",
            method,
            params,
            id: this.requestId++
        };
        return new Promise((resolve, reject) => {
            const client = new Net.Socket();
            client.connect({
                port: this.port,
                host: this.host
            }, function() {
                client.write(JSON.stringify(data));
            });

            // The client can also receive data from the server by reading from its socket.
            client.on('data', function(chunk) {
                let received_data = chunk.toString();
                client.end();
                resolve(received_data);
            });

            client.on('error', function(err) {
                reject(err);
            });
        });
    }
}

class Transaction {

    /*
     * @param {string} sender - sender address
     * @param {string} senderPrivateKey - sender private key
     * @param {string} reciver - reciver address
     * @param {number} amount - amount of sending
     * @param {TransactionType} type - type of transaction
     * @param {number} timestamp(Optional) - timestamp of transaction
     * @returns {Transaction} transaction object
     */
    constructor(sender, senderPrivateKey, reciver, amount, type, timestamp = null) {
        this.sender = sender;
        this.reciver = reciver;
        this.amount = amount;
        this.transaction_type = type
        if (timestamp == null) {
            var now = new Date;
            var utc_timestamp = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(),
                now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
            utc_timestamp = Math.round(utc_timestamp / 100);
            this.timestamp = utc_timestamp;
        } else {
            this.timestamp = timestamp;
        }

        this.hash = Crypto.getHash(this);
        this.signature = Crypto.sign(this.hash, senderPrivateKey);
    }
}

const TransactionType = {
    // Default transaction with optional message
    Transaction: (message) => ({
        transaction_type: 'Transaction',
        data: message
    }),

    // Stake transaction
    Stake: () => ({
        transaction_type: 'Stake',
        data: null
    })
};

module.exports = {
    Crypto,
    Nature,
    Transaction,
    TransactionType
}