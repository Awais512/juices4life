import { z } from "zod";

export const inviteEmployeeSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export const acceptInviteSchema = z
  .object({
    token: z.string().min(1, "Invalid invitation"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type InviteEmployeeData = z.infer<typeof inviteEmployeeSchema>;
export type AcceptInviteData = z.infer<typeof acceptInviteSchema>;
