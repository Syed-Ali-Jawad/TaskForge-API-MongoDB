import { z } from "zod";

const user = z.object({
  name: z
    .string()
    .min(5, { error: "Name cant be lesser than 5 characters." })
    .max(20, { error: "Name cant be greater than 20 characters." }),
  password: z.string().transform((val) => val.trim()),
});

const updateUserSchema = user.partial();

export { updateUserSchema };
