const crypto = require('crypto');

const ENCRYPTION_KEY = "JBBR7pTBFo9TtcZWgSpeoV5pB2Oznsnb"; // Must be 256 bits (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16

function encrypt(text) {
	let iv = crypto.randomBytes(IV_LENGTH);
	let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
	let encrypted = cipher.update(text);

	encrypted = Buffer.concat([encrypted, cipher.final()]);

	return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {

	let textParts = text.iv.split(":");
	let iv = Buffer.from(textParts.shift(), 'hex');
	let encryptedText = Buffer.from(textParts.join(':'), 'hex');
	let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
	let decrypted = decipher.update(encryptedText);

	decrypted = Buffer.concat([decrypted, decipher.final()]);

	return decrypted.toString();
}

module.exports = { decrypt, encrypt };

/*
const {
	scrypt,
	randomFill,
	createCypheriv
} = import("crypto");

const algorithm = "aes-192-cbc";
const password = "pussy_said_he_want_sum_beef!";

scrypt(password, "salt", 24, (err, key) => {
	if (err) throw err;

	randomFill(new Uint8Array(16), (err, iv) => {
		if (err) throw err;

		const cipher = createCipheriv(algorithm, key, iv);

		let encrypted = cipher.update("some clear text data", "utf8", "hex");
		encrypted += cipher.final("hex");

		console.log(encrypted);
	})
})
*/

/*
const crypto = require("crypto");

const algorithm = "aes-128-cbc";
const secretKey = "flying_squirrels";
const key = crypto.randomBytes(16);
const iv = crypto.randomBytes(16);

const encrypt = (text) => {
	const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);

	const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

	return {
		iv: iv.toString("hex"),
		content: encrypted.toString("hex")
	};
}

const decrypt = (text) => {
	let iv = Buffer.from(text.iv, "hex");
	let encrypted_text = Buffer.from(text.content, "hex");

	let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
	let decrypted = decipher.update(encrypted_text);

	decrypted = Buffer.concat([decrypted, decipher.final()]);

	return decrypted.toString();
}
*/
