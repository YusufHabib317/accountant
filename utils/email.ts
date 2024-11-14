import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

interface OptionType {
  email: string;
  subject: string;
  message: string;
  html?: string;
}

const sendEmail = async (options: OptionType) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER as string,
      pass: process.env.GMAIL_PASSWORD as string,
    },
  });

  const mailOption = {
    from: 'Private Tutorial',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || options.message,
  };

  await transporter.sendMail(mailOption);
};

export { sendEmail };
