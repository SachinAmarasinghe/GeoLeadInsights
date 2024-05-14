import { isDisposableEmail, verifyEmail } from "@devmehq/email-validator-js";

export async function POST(req: Request) {
  const { email } = await req.json();

  try {
    const options = {
      emailAddress: email,
      verifyMx: true,
      verifySmtp: true,
      timeout: 3000,
    };

    const { validFormat, validSmtp, validMx } = await verifyEmail(options);

    return new Response(
      JSON.stringify({
        success: true,
        verificationInfo: {
          validFormat,
          validSmtp,
          validMx,
        },
      })
    );
  } catch (error) {
    console.error("Error verifying email:", error);
    return new Response(JSON.stringify({ error: "Email verification failed" }));
  }
}
