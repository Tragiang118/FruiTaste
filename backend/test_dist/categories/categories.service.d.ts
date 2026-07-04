import { PrismaService } from '../prisma/prisma.service';
export declare class CategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name: string;
        description: string | null;
        imageUrl: string | null;
    }[]>;
    findOne(id: number): import(".prisma/client").Prisma.Prisma__CategoryClient<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name: string;
        description: string | null;
        imageUrl: string | null;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    create(data: any): import(".prisma/client").Prisma.Prisma__CategoryClient<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name: string;
        description: string | null;
        imageUrl: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    update(id: number, data: any): import(".prisma/client").Prisma.Prisma__CategoryClient<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name: string;
        description: string | null;
        imageUrl: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    remove(id: number): import(".prisma/client").Prisma.Prisma__CategoryClient<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name: string;
        description: string | null;
        imageUrl: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
}
