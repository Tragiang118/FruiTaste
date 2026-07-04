"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRequestSchema = exports.CHATBOT_MAX_MESSAGES = exports.CHATBOT_MODEL = void 0;
const zod_1 = require("zod");
exports.CHATBOT_MODEL = 'llama-3.3-70b-versatile';
exports.CHATBOT_MAX_MESSAGES = 50;
exports.chatRequestSchema = zod_1.z.object({
    text: zod_1.z
        .string()
        .trim()
        .min(1, { message: 'Nội dung chat không được trống' }),
});
//# sourceMappingURL=chat.schemas.js.map