"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const pg_1 = require("pg");
const host = process.env.DB_HOST ?? 'localhost';
const port = Number(process.env.DB_PORT ?? 5432);
const user = process.env.DB_USERNAME ?? 'postgres';
const password = process.env.DB_PASSWORD ?? 'postgres';
const database = process.env.DB_DATABASE ?? 'auto_scan';
const maxAttempts = Number(process.env.DB_WAIT_MAX_ATTEMPTS ?? 30);
const delayMs = Number(process.env.DB_WAIT_DELAY_MS ?? 2000);
async function sleep(ms) {
    await new Promise((resolve) => setTimeout(resolve, ms));
}
async function tryConnect(attempt) {
    const client = new pg_1.Client({ host, port, user, password, database });
    try {
        await client.connect();
        console.log(`Banco disponivel em ${host}:${port} na tentativa ${attempt}.`);
        await client.end();
        return true;
    }
    catch (error) {
        console.log(`Tentativa ${attempt}/${maxAttempts} aguardando banco em ${host}:${port}...`);
        try {
            await client.end();
        }
        catch { }
        return false;
    }
}
async function main() {
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        const connected = await tryConnect(attempt);
        if (connected) {
            return;
        }
        if (attempt < maxAttempts) {
            await sleep(delayMs);
        }
    }
    console.error(`Nao foi possivel conectar ao banco ${database} em ${host}:${port}.`);
    process.exit(1);
}
main().catch((error) => {
    console.error('Erro ao aguardar banco:', error);
    process.exit(1);
});
