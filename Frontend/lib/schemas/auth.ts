import { z } from "zod";

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email không được để trống" })
    .email({ message: "Email không hợp lệ" }),
  password: z.string().min(1, { message: "Mật khẩu không được để trống" }),
});

export const RegisterSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email không được để trống" })
    .email({ message: "Email không hợp lệ" })
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
      message: "Định dạng email không hợp lệ (ví dụ: user@example.com)",
    }),
  password: z
    .string()
    .min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" })
    .superRefine((val, ctx) => {
      if (!/[A-Z]/.test(val)) {
        ctx.addIssue({ code: "custom", message: "Thiếu ít nhất 1 chữ in hoa" });
      }
      if (!/[a-z]/.test(val)) {
        ctx.addIssue({ code: "custom", message: "Thiếu ít nhất 1 chữ in thường" });
      }
      if (!/[0-9]/.test(val)) {
        ctx.addIssue({ code: "custom", message: "Thiếu ít nhất 1 chữ số" });
      }
      if (!/[^A-Za-z0-9]/.test(val)) {
        ctx.addIssue({ code: "custom", message: "Thiếu ít nhất 1 ký tự đặc biệt" });
      }
    }),
  fullName: z
    .string()
    .min(2, { message: "Họ tên phải có ít nhất 2 ký tự" })
    .regex(/^[a-zA-ZÀ-ỹ\s]+$/, { message: "Họ và tên không được chứa chữ số hoặc ký tự đặc biệt" }),
});

export type LoginValues = z.infer<typeof LoginSchema>;
export type RegisterValues = z.infer<typeof RegisterSchema>;
