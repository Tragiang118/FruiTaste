export declare class UploadController {
    uploadRecipeImage(file: Express.Multer.File): Promise<{
        imageUrl: string;
    }>;
    uploadProductImage(file: Express.Multer.File): Promise<{
        url: string;
    }>;
    uploadCategoryImage(file: Express.Multer.File): Promise<{
        imageUrl: string;
    }>;
}
