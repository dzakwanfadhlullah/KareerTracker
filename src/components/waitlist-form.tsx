"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({ email: z.email("Masukkan email yang valid.") });
type FormData = z.infer<typeof schema>;

export function WaitlistForm() {
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  if (submitted) {
    return <div className="form-success" role="status"><Check size={18} /> Email kamu sudah tercatat untuk early access.</div>;
  }

  return (
    <form className="waitlist-form" onSubmit={handleSubmit(() => setSubmitted(true))} noValidate>
      <div>
        <label className="sr-only" htmlFor="waitlist-email">Email</label>
        <input id="waitlist-email" type="email" placeholder="email@kamu.com" {...register("email")} aria-invalid={!!errors.email} />
        {errors.email && <small className="form-error">{errors.email.message}</small>}
      </div>
      <button className="button button-primary" type="submit">Join Early Access</button>
    </form>
  );
}
