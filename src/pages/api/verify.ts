import { NextApiRequest, NextApiResponse } from 'next';
import { verifyEmail } from '@devmehq/email-validator-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email } = req.body;

  try {
    const options = {
      emailAddress: email,
      verifyMx: true,
      verifySmtp: true,
      timeout: 3000,
    };

    const { validFormat, validSmtp, validMx } = await verifyEmail(options);

    res.status(200).json({
      success: true,
      verificationInfo: { validFormat, validSmtp, validMx },
    });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(400).json({ error: 'Email verification failed' });
  }
}