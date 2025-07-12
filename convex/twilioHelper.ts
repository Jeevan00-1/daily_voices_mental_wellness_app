"use node";
// NOTE: You must install the 'twilio' package in your Convex backend:
// pnpm add -D twilio @types/twilio
// import twilio from "twilio";

// const accountSid = process.env.TWILIO_ACCOUNT_SID!;
// const authToken = process.env.TWILIO_AUTH_TOKEN!;
// const twilioNumber = process.env.TWILIO_NUMBER!;

// const client = twilio(accountSid, authToken);

export async function makeAnonymousCall({ to }: { to: string }) {
  // Twilio integration temporarily disabled
  // await client.calls.create({
  //   url: "http://twimlets.com/forward?PhoneNumber=" + encodeURIComponent(to),
  //   to,
  //   from: twilioNumber,
  // });
  return;
} 