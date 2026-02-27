export async function isAdmin(userId: string | null | undefined): Promise<boolean> {
    if (!userId) return false;
    const adminIds = process.env.ADMIN_USER_IDS?.split(',') || [];
    return adminIds.map(id => id.trim()).includes(userId);
}
