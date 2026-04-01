// Sample Test File for PII Blocker Extension
// This file contains various types of PII for testing the extension

// Email addresses (should be detected)
const userEmail = "user@example.com";
const businessEmail = "john.doe@company.co.uk";
const personalEmail = "alice.smith+tag@gmail.com";

// Credit card numbers (should be detected)
const visa = "4532-1234-5678-9010";
const mastercard = "5500 1234 5678 9010";
const amex = "378282246310005";

// Aadhar numbers (should be detected)
const aadharNumber = "1234 5678 9012";
const aadharWithoutSpace = "123456789012";

// AWS Keys (should be detected)
const awsAccessKey = "AKIAIOSFODNN7EXAMPLE";

// IP Addresses (should be detected)
const localhost = "127.0.0.1";
const privateIP = "192.168.1.1";
const anotherIP = "10.0.0.1";

// Database connection strings (should be detected)
const mongoConnection = "mongodb+srv://user:password@host.mongodb.net/database?retryWrites=true";
const postgresConnection = "postgres://user:password@localhost:5432/mydb";
const mysqlConnection = "mysql://root:mypassword@localhost:3306/database";

// High-entropy secrets (should be detected)
const secretKey = "sk_fake_4eC39HqLyjWDarhtT657365PK";

// SSN (should be detected)
const socialSecurityNumber = "123-45-6789";

// UPI IDs (should be detected)
const upiId = "user.name@okhdfcbank";

// Proprietary markers (should be detected)
const confidentialTag = "INTERNAL_ONLY";
const restricted = "DO_NOT_DISTRIBUTE";
const acmeProperty = "PROPERTY_OF_ACME";

// Safe data (should NOT be redacted)
const username = "johndoe123";
const age = 30;
const score = 95.5;
const message = "Hello, this is a safe message without any sensitive data";

// Edge cases
const similarToEmail = "not.an.email@domain_underscore.com";
const numberSequence = "1234567891011121314";
const path = "C:/Users/John/Documents/file.txt";

console.log("Test data loaded. Check the editor for redacted content!");
