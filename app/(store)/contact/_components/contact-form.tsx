"use client";

import { useActionState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { sendContact, type ContactActionState } from "../_actions/send-contact";

const INITIAL_STATE: ContactActionState = { status: "idle" };

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(sendContact, INITIAL_STATE);

  if (state.status === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <span className="text-2xl">&#10003;</span>
        </div>
        <h3 className="mt-6 text-2xl font-black">Message Sent</h3>
        <p className="mt-2 max-w-sm text-on-surface-variant">
          Thank you for reaching out. We&apos;ll get back to you within 24
          hours.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="relative space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            Full Name
          </label>
          <div className="input-indicator">
            <input
              type="text"
              name="name"
              required
              minLength={2}
              maxLength={100}
              placeholder="John Doe"
              className="w-full rounded-lg border-none bg-surface-container-highest px-4 py-4 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-0"
            />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            Email
          </label>
          <div className="input-indicator">
            <input
              type="email"
              name="email"
              required
              maxLength={200}
              placeholder="john@example.com"
              className="w-full rounded-lg border-none bg-surface-container-highest px-4 py-4 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-0"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
          Subject
        </label>
        <div className="input-indicator">
          <input
            type="text"
            name="subject"
            required
            minLength={3}
            maxLength={200}
            placeholder="How can we help?"
            className="w-full rounded-lg border-none bg-surface-container-highest px-4 py-4 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-0"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
          Message
        </label>
        <div className="input-indicator">
          <textarea
            name="message"
            required
            minLength={10}
            maxLength={5000}
            rows={6}
            placeholder="Tell us more about your inquiry..."
            className="w-full resize-none rounded-lg border-none bg-surface-container-highest px-4 py-4 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-0"
          />
        </div>
      </div>

      {state.status === "error" && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle size={16} />
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="kinetic-gradient inline-flex w-full items-center justify-center gap-2 rounded-lg px-12 py-5 text-sm font-black uppercase tracking-widest text-on-primary-fixed transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed md:w-auto"
      >
        {isPending ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Sending...
          </>
        ) : (
          "Send Message"
        )}
      </button>
    </form>
  );
}
