import { z } from "zod";

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email không được để trống" })
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
      message: "Email không hợp lệ",
    }),
  password: z.string().min(1, { message: "Mật khẩu không được để trống" }),
});

export const RegisterSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email không được để trống" })
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
      message: "Email không hợp lệ",
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

export const PasswordChangeSchema = z.object({
  oldPassword: z.string().min(1, { message: "Mật khẩu hiện tại không được để trống" }),
  newPassword: z
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
  confirmPassword: z.string().min(1, { message: "Vui lòng xác nhận mật khẩu mới" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Xác nhận mật khẩu mới không trùng khớp",
  path: ["confirmPassword"],
}).refine((data) => data.oldPassword !== data.newPassword, {
  message: "Mật khẩu mới phải khác mật khẩu hiện tại",
  path: ["newPassword"],
});

export type PasswordChangeValues = z.infer<typeof PasswordChangeSchema>;
