"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const deletedUsers = await prisma.user.findMany({
        where: {
            deletedAt: { not: null },
            NOT: {
                email: {
                    contains: '.del.'
                }
            }
        }
    });
    console.log(`Found ${deletedUsers.length} users to cleanup.`);
    for (const user of deletedUsers) {
        const maskedEmail = `${user.email}.del.cleanup.${Date.now()}`;
        await prisma.user.update({
            where: { id: user.id },
            data: {
                email: maskedEmail,
                isActive: false
            }
        });
        console.log(`Released email for user ID: ${user.id} (${user.email} -> ${maskedEmail})`);
    }
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=cleanup_deleted_emails.js.map