interface ChatbotPromptContext {
    allProductsConcise: string;
    detailedProductsContext: string;
    ordersContext: string;
    productTags: string;
}
export declare function buildChatbotSystemPrompt({ allProductsConcise, detailedProductsContext, ordersContext, productTags, }: ChatbotPromptContext): string;
export {};
