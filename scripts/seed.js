/**
 * ResiHub Seed Data Script
 * 
 * Run this script to populate your Firestore with sample data.
 * 
 * Prerequisites:
 *   1. Install firebase-admin: npm install firebase-admin
 *   2. Download your Firebase service account key JSON from:
 *      Firebase Console > Project Settings > Service Accounts > Generate New Private Key
 *   3. Save the key as `serviceAccountKey.json` in this directory
 *   4. Run: node scripts/seed.js
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const serviceAccount = JSON.parse(readFileSync(join(__dirname, "serviceAccountKey.json"), "utf8"));

initializeApp({
    credential: cert(serviceAccount),
});

const authAdmin = getAuth();
const db = getFirestore();

const users = [
    { email: "admin@resihub.com", password: "Admin@123", role: "admin", name: "Admin User", apartmentNumber: "" },
    { email: "resident1@resihub.com", password: "Resident@123", role: "resident", name: "Rahul Sharma", apartmentNumber: "A-102" },
    { email: "resident2@resihub.com", password: "Resident@123", role: "resident", name: "Priya Patel", apartmentNumber: "B-201" },
    { email: "security@resihub.com", password: "Security@123", role: "security", name: "Vikram Singh", apartmentNumber: "" },
];

async function seed() {
    console.log("🌱 Seeding ResiHub data...\n");

    // Create users
    for (const u of users) {
        try {
            let userRecord;
            try {
                userRecord = await authAdmin.getUserByEmail(u.email);
                console.log(`  ⏩ User exists: ${u.email}`);
            } catch {
                userRecord = await authAdmin.createUser({ email: u.email, password: u.password, displayName: u.name });
                console.log(`  ✅ Created user: ${u.email}`);
            }
            await db.collection("users").doc(userRecord.uid).set({
                email: u.email,
                name: u.name,
                role: u.role,
                apartmentNumber: u.apartmentNumber,
                createdAt: FieldValue.serverTimestamp(),
            });
        } catch (err) {
            console.error(`  ❌ Failed: ${u.email}`, err.message);
        }
    }

    // Sample announcements
    await db.collection("announcements").add({
        title: "Welcome to ResiHub!",
        message: "We are excited to launch our new residential management system. Please explore the features and let us know if you have any feedback.",
        createdBy: "admin",
        createdByName: "Admin User",
        createdAt: FieldValue.serverTimestamp(),
    });
    console.log("  ✅ Sample announcement created");

    console.log("\n🎉 Seed complete!\n");
    console.log("Login credentials:");
    users.forEach((u) => console.log(`  ${u.role.padEnd(10)} → ${u.email} / ${u.password}`));
}

seed().catch(console.error);
