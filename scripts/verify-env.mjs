const required = ["DATABASE_URL", "TEST_DATABASE_URL"];

const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`Missing environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

console.log("Required environment variables are present.");
