"use client";

import { useState } from "react";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
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
        <button
          onClick={() => setSubmitted(false)}
          className="mt-8 text-sm font-bold text-primary hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative space-y-6">
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
            rows={6}
            placeholder="Tell us more about your inquiry..."
            className="w-full resize-none rounded-lg border-none bg-surface-container-highest px-4 py-4 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-0"
          />
        </div>
      </div>

      <button
        type="submit"
        className="kinetic-gradient w-full rounded-lg px-12 py-5 text-sm font-black uppercase tracking-widest text-on-primary-fixed transition-transform hover:scale-[1.02] active:scale-[0.98] md:w-auto"
      >
        Send Message
      </button>
    </form>
  );
}
