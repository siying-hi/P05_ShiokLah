const crypto = require("crypto");

// AES encryption algorithm used to protect sensitive card information
const algorithm = "aes-256-cbc";

// Load the encryption key from the environment variables
// The key is stored as a hexadecimal string and converted into a Buffer
const key = Buffer.from(
    process.env.CARD_ENCRYPTION_KEY,
    "hex"
);

// AES-CBC requires a 16-byte initialisation vector (IV)
const ivLength = 16;


// Encrypt
// Encrypts plain text using AES-256-CBC before storing it in the database
function encrypt(text) {

    // Generate a random IV for this encryption
    const iv = crypto.randomBytes(ivLength);

    // Create a cipher using the encryption algorithm, key and IV
    const cipher = crypto.createCipheriv(
        algorithm,
        key,
        iv
    );

    // Encrypt the plain text
    let encrypted = cipher.update(
        text,
        "utf8",
        "hex"
    );

    encrypted += cipher.final("hex");

    // Store the IV together with the encrypted text
    return `${iv.toString("hex")}:${encrypted}`;

}


// Decrypt
// Decrypts encrypted text retrieved from the database
function decrypt(encryptedText) {

    // Separate the stored IV and encrypted value
    const [ivHex, encrypted] = encryptedText.split(":");

    // Convert the IV back into a Buffer
    const iv = Buffer.from(ivHex, "hex");

    // Create a decipher using the same algorithm, key and IV
    const decipher = crypto.createDecipheriv(
        algorithm,
        key,
        iv
    );

    // Decrypt the encrypted value
    let decrypted = decipher.update(
        encrypted,
        "hex",
        "utf8"
    );

    decrypted += decipher.final("utf8");

    // Return the original plain text
    return decrypted;

}

// Export the encryption helper functions
module.exports = {

    encrypt,
    decrypt

};