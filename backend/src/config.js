import { config } from "dotenv";

config(); // Loads the .env file into process.env

export const PORT = 3000;
export const HOST = "http://localhost:" + PORT;

export const PAYPAL_API_CLIENT = process.env.PAYPAL_API_CLIENT;
export const PAYPAL_API_SECRET = process.env.PAYPAL_API_SECRET;
export const PAYPAL_API = "https://api-m.sandbox.paypal.com";

export const DB_HOST = process.env.DB_HOST || 'localhost'
export const DB_USER = process.env.DB_USER || 'root'
export const DB_PASSWORD = process.env.DB_PASSWORD || 'Fto2022$$'
export const DB_NAME = process.env.DB_NAME || 'companydb'
export const DB_PORT = process.env.DB_PORT || 3306