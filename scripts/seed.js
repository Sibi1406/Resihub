/**
 * ResiHub Seed Data Script - Expanded
 * 
 * Populates Firestore with comprehensive sample data for a functional SaaS feel.
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
    { 
        email: "admin@resihub.com", password: "Admin@123", role: "admin", name: "Administrator", apartmentNumber: "" 
    },
    { 
        email: "resident1@resihub.com", password: "Resident@123", role: "resident", name: "Rahul Sharma", apartmentNumber: "A-102",
        phone: "+91 98765 43210", native: "Jaipur, Rajasthan",
        ownerName: "Self", ownerPhone: "", ownerEmail: "",
        emergencyContact: "Anita Sharma", emergencyPhone: "+91 98765 43211", emergencyRelation: "Spouse",
        members: [{ name: "Anita Sharma", relation: "Spouse", age: "28" }, { name: "Aryan Sharma", relation: "Son", age: "5" }]
    },
    { 
        email: "resident2@resihub.com", password: "Resident@123", role: "resident", name: "Priya Patel", apartmentNumber: "B-201",
        phone: "+91 87654 32109", native: "Ahmedabad, Gujarat",
        ownerName: "Mr. Mehta", ownerPhone: "+91 76543 21098", ownerEmail: "mehta@example.com",
        emergencyContact: "Suresh Patel", emergencyPhone: "+91 87654 32100", emergencyRelation: "Father",
        members: [{ name: "Suresh Patel", relation: "Father", age: "62" }]
    },
    { 
        email: "resident3@resihub.com", password: "Resident@123", role: "resident", name: "Amit Verma", apartmentNumber: "C-305",
        phone: "+91 76543 21098", native: "Lucknow, UP",
        ownerName: "Self", ownerPhone: "", ownerEmail: "",
        emergencyContact: "Deepak Verma", emergencyPhone: "+91 76543 21000", emergencyRelation: "Brother",
        members: []
    },
    { 
        email: "resident4@resihub.com", password: "Resident@123", role: "resident", name: "Sneha Reddy", apartmentNumber: "D-402",
        phone: "+91 65432 10987", native: "Hyderabad, Telangana",
        ownerName: "Self", ownerPhone: "", ownerEmail: "",
        emergencyContact: "Arjun Reddy", emergencyPhone: "+91 65432 10000", emergencyRelation: "Husband",
        members: [{ name: "Arjun Reddy", relation: "Husband", age: "32" }]
    },
    { 
        email: "resident5@resihub.com", password: "Resident@123", role: "resident", name: "Vikram Malhotra", apartmentNumber: "A-501",
        phone: "+91 54321 09876", native: "Chandigarh, Punjab",
        ownerName: "Mrs. Khanna", ownerPhone: "+91 43210 98765", ownerEmail: "khanna@example.com",
        emergencyContact: "Karan Malhotra", emergencyPhone: "+91 54321 00000", emergencyRelation: "Brother",
        members: []
    },
    { email: "security@resihub.com", password: "Security@123", role: "security", name: "Main Gate Security", apartmentNumber: "" },
    { email: "security2@resihub.com", password: "Security@123", role: "security", name: "Tower B Security", apartmentNumber: "" },
];

const announcements = [
    { title: "Quarterly Maintenance", message: "Elevator maintenance for Block A & B scheduled for this Friday from 10 AM to 2 PM.", category: "maintenance" },
    { title: "Annual General Meeting", message: "Join us for the AGM this Sunday at the Clubhouse. Your participation is important.", category: "event" },
    { title: "New Security Protocol", message: "Please ensure all delivery personnel enter through the main gate only and use the QR check-in.", category: "security" },
    { title: "Water Supply Notice", message: "Temporary water supply cut in Block C due to pipe replacement work tomorrow morning.", category: "emergency" },
];

const facilities = [
    { name: "Premium Gym", type: "sports", icon: "Dumbbell", description: "State-of-the-art gym equipment with trainers." },
    { name: "Olympic Pool", type: "recreation", icon: "Waves", description: "Temperature controlled swimming pool." },
    { name: "Clubhouse", type: "event", icon: "Home", description: "Spacious hall for community gatherings and events." },
    { name: "Tennis Court", type: "sports", icon: "Trophy", description: "Synthetic turf tennis court with floodlights." },
    { name: "Yoga Studio", type: "health", icon: "Heart", description: "Zen space for yoga and meditation." },
];

const complaints = [
    { title: "Leaking Pipe in Kitchen", category: "Plumbing", description: "There is a persistent leak under the kitchen sink causing water damage.", status: "pending", aiCategorized: true },
    { title: "Noisy Fan in Hallway", category: "Electrical", description: "The common area fan in Block B 2nd floor is making a very loud noise.", status: "resolved", aiCategorized: true },
    { title: "Broken Tile in Lobby", category: "Maintenance", description: "A floor tile is loose and broken near the elevators.", status: "pending", aiCategorized: false },
];

const visitors = [
    { visitorName: "John Doe", purpose: "Plumber", phone: "9876543210", type: "manual", status: "exited" },
    { visitorName: "Sarah Smith", purpose: "Guest", phone: "8765432109", type: "preapproved", status: "inside" },
    { visitorName: "Zomato Delivery", purpose: "Delivery", phone: "7654321098", type: "manual", status: "inside" },
];

const lostFound = [
    { type: "lost", itemName: "Car Keys", description: "Black Audi key fob with a leather keychain. Lost near the park.", status: "open" },
    { type: "found", itemName: "Umbrella", description: "Blue foldable umbrella found in the clubhouse lobby.", status: "open" },
];

const emergencies = [
    { title: "Fire Alarm - Block B", description: "Smoke detected on the 4th floor of Block B. Everyone please evacuate.", status: "resolved" },
];

async function seed() {
    console.log("🌱 Seeding ResiHub data...\n");

    const userMap = {};

    // 1. Create users
    for (const u of users) {
        try {
            let userRecord;
            try {
                userRecord = await authAdmin.getUserByEmail(u.email);
                console.log(`  ⏩ User exists: ${u.email}`);
            } catch {
                userRecord = await authAdmin.createUser({ email: u.email, password: u.password, displayName: u.name });
                console.log(`  ✅ Created auth: ${u.email}`);
            }
            userMap[u.email] = { uid: userRecord.uid, ...u };
            const { password, ...userDataToSave } = u; // Don't save password in Firestore
            await db.collection("users").doc(userRecord.uid).set({
                ...userDataToSave,
                createdAt: FieldValue.serverTimestamp(),
            });
            console.log(`  ✅ Synced Firestore user: ${u.email}`);
        } catch (err) {
            console.error(`  ❌ Failed: ${u.email}`, err.message);
        }
    }

    // 2. Announcements
    for (const a of announcements) {
        await db.collection("announcements").add({
            ...a,
            createdBy: "admin",
            createdByName: "Administrator",
            createdAt: FieldValue.serverTimestamp(),
        });
    }
    console.log(`  ✅ Seeded ${announcements.length} announcements`);

    // 3. Facilities
    const facilityIds = [];
    for (const f of facilities) {
        const docRef = await db.collection("facilities").add({
            ...f,
            active: true,
            createdAt: FieldValue.serverTimestamp(),
        });
        facilityIds.push(docRef.id);
    }
    console.log(`  ✅ Seeded ${facilities.length} facilities`);

    // 4. Complaints
    const residents = Object.values(userMap).filter(u => u.role === "resident");
    for (let i = 0; i < complaints.length; i++) {
        const res = residents[i % residents.length];
        await db.collection("complaints").add({
            ...complaints[i],
            raisedBy: res.uid,
            residentName: res.name,
            apartmentNumber: res.apartmentNumber,
            createdAt: FieldValue.serverTimestamp(),
            imageUrl: "",
            resolvedAt: complaints[i].status === "resolved" ? FieldValue.serverTimestamp() : null,
        });
    }
    console.log(`  ✅ Seeded ${complaints.length} complaints`);

    // 5. Visitors
    for (let i = 0; i < visitors.length; i++) {
        const res = residents[i % residents.length];
        const v = visitors[i];
        const entryTime = v.status === "informed" ? null : FieldValue.serverTimestamp();
        const exitTime = v.status === "exited" ? FieldValue.serverTimestamp() : null;
        
        await db.collection("visitors").add({
            ...v,
            residentName: res.name,
            apartmentNumber: res.apartmentNumber,
            entryTime,
            exitTime,
            createdAt: FieldValue.serverTimestamp(),
        });
    }
    console.log(`  ✅ Seeded ${visitors.length} visitors`);

    // 6. Payments
    const months = ["2026-03", "2026-02", "2026-01"];
    for (const res of residents) {
        for (const month of months) {
            const status = Math.random() > 0.3 ? "paid" : "pending";
            const docId = `${res.uid}_${month}`;
            await db.collection("payments").doc(docId).set({
                userId: res.uid,
                month,
                amount: 2500,
                status,
                residentName: res.name,
                apartmentNumber: res.apartmentNumber,
                paidAt: status === "paid" ? FieldValue.serverTimestamp() : null,
                dueDate: `${month}-05`,
            });
        }
    }
    console.log(`  ✅ Seeded payment history for all residents`);

    // 7. Lost & Found
    for (let i = 0; i < lostFound.length; i++) {
        const res = residents[i % residents.length];
        await db.collection("lostFound").add({
            ...lostFound[i],
            reportedBy: res.uid,
            reportedByName: res.name,
            apartmentNumber: res.apartmentNumber,
            createdAt: FieldValue.serverTimestamp(),
        });
    }
    console.log(`  ✅ Seeded lost and found items`);

    // 8. Emergencies
    for (const e of emergencies) {
        await db.collection("emergencies").add({
            ...e,
            createdAt: FieldValue.serverTimestamp(),
            resolvedAt: e.status === "resolved" ? FieldValue.serverTimestamp() : null,
        });
    }
    console.log(`  ✅ Seeded emergencies`);

    console.log("\n🎉 Seed complete!\n");
    console.log("Key Login credentials:");
    console.log(`  Admin    → admin@resihub.com / Admin@123`);
    console.log(`  Resident → resident1@resihub.com / Resident@123`);
    console.log(`  Security → security@resihub.com / Security@123`);
}

seed().catch(console.error);
