import { readFileSync } from 'fs';
import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const inMemory = new Map();
let db = null;

// Try initialize firebase-admin using default credentials — if it fails (no creds), fall back to memory
// In test environment (FIRESTORE_EMULATOR_HOST not set and no creds), skip Firestore entirely
const isTestEnv = process.env.NODE_ENV === 'test' || process.env.SKIP_IMMUTABLE_VERIFY === '1';
const hasEmulator = process.env.FIRESTORE_EMULATOR_HOST;

if (!isTestEnv || hasEmulator) {
	try{
		// Prefer explicit service account if supplied via environment or local .firebase service
		initializeApp();
		db = getFirestore();
		// eslint-disable-next-line no-console
		console.log('Firestore receipts enabled');
	}catch(e){
		// eslint-disable-next-line no-console
		console.warn('Firestore not available, using in-memory receipts. Error:', e.message||e);
		db = null;
	}
} else {
	// eslint-disable-next-line no-console
	console.log('Test mode: Using in-memory receipts only');
}

export async function putReceipt(hash, receipt){
	if (db){
		try{
			await db.collection('receipts').doc(hash).set({ receipt, issuedAt: new Date().toISOString() });
			return true;
		}catch(e){
			inMemory.set(hash, receipt); return false;
		}
	}else{
		inMemory.set(hash, receipt); return true;
	}
}

export async function getReceipt(hash){
	if (db){
		try{
			const doc = await db.collection('receipts').doc(hash).get();
			if (doc.exists) return doc.data().receipt;
			return null;
		}catch(e){
			return inMemory.get(hash)||null;
		}
	}
	return inMemory.get(hash)||null;
}