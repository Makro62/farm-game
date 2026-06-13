export async function generateHash(dataStr) {
    const encoder = new TextEncoder();
    const data = encoder.encode(dataStr + 'SUPER_SECRET_SALT_2026'); // Adding salt for extra security
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

export async function verifyHash(dataStr, providedHash) {
    const expectedHash = await generateHash(dataStr);
    return expectedHash === providedHash;
}
