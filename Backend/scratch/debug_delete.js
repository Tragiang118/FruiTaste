"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const id = 13;
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            console.log('User not found');
            return;
        }
        console.log('Attempting to soft delete user:', user.email);
        const maskedEmail = `${user.email}.del.debug.${Date.now()}`;
        await prisma.user.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                isActive: false,
                email: maskedEmail
            },
        });
        console.log('Soft delete successful in script!');
    }
    catch (error) {
        console.error('CRITICAL ERROR DURING DELETE:', error.message);
        if (error.code)
            console.error('Prisma Error Code:', error.code);
        if (error.meta)
            console.error('Prisma Error Meta:', error.meta);
    }
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=debug_delete.js.map