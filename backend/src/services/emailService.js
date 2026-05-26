import nodemailer from 'nodemailer';

// Create transporter (only if email is configured)
let transporter = null;

try {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
} catch (error) {
  console.warn('Email service not configured. Emails will not be sent.');
}

// Send booking email
export const sendBookingEmail = async (booking) => {
  if (!transporter) {
    console.log('Email service not configured. Skipping booking email.');
    return;
  }

  const { service, preferredDate, package: packageType, personalDetails } = booking;

  // Email to admin
  const adminMailOptions = {
    from: process.env.EMAIL_FROM,
    to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
    subject: 'New Booking Request - Rona Studio',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0A0F2C;">New Booking Request</h2>
        <p>You have received a new booking request:</p>
        
        <div style="background: #F8F8F8; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <p><strong>Service:</strong> ${service}</p>
          <p><strong>Package:</strong> ${packageType}</p>
          <p><strong>Preferred Date:</strong> ${new Date(preferredDate).toLocaleDateString()}</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
          <p><strong>Client Name:</strong> ${personalDetails.fullName}</p>
          <p><strong>Email:</strong> ${personalDetails.email}</p>
          <p><strong>Phone:</strong> ${personalDetails.phone}</p>
          ${personalDetails.message ? `<p><strong>Message:</strong> ${personalDetails.message}</p>` : ''}
        </div>
        
        <p style="color: #666; font-size: 14px;">Please respond to this inquiry as soon as possible.</p>
      </div>
    `,
  };

  // Email to client
  const clientMailOptions = {
    from: process.env.EMAIL_FROM,
    to: personalDetails.email,
    subject: 'Booking Confirmation - Rona Studio',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0A0F2C;">Thank You for Your Booking!</h2>
        <p>Dear ${personalDetails.fullName},</p>
        <p>We have received your booking request and will get back to you within 24 hours.</p>
        
        <div style="background: #F8F8F8; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="color: #0A0F2C; margin-top: 0;">Booking Details</h3>
          <p><strong>Service:</strong> ${service}</p>
          <p><strong>Package:</strong> ${packageType}</p>
          <p><strong>Preferred Date:</strong> ${new Date(preferredDate).toLocaleDateString()}</p>
        </div>
        
        <p>If you have any questions, feel free to contact us.</p>
        <p style="margin-top: 30px;">Best regards,<br><strong>Rona Studio Team</strong></p>
      </div>
    `,
  };

  // Send emails
  await Promise.all([
    transporter.sendMail(adminMailOptions),
    transporter.sendMail(clientMailOptions),
  ]);
};

// Send contact email
export const sendContactEmail = async (contact) => {
  if (!transporter) {
    console.log('Email service not configured. Skipping contact email.');
    return;
  }

  const { name, email, subject, message } = contact;

  // Email to admin
  const adminMailOptions = {
    from: process.env.EMAIL_FROM,
    to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
    subject: `New Contact Message${subject ? `: ${subject}` : ''} - Rona Studio`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0A0F2C;">New Contact Message</h2>
        <p>You have received a new message from your website:</p>
        
        <div style="background: #F8F8F8; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ''}
          <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        </div>
        
        <p style="color: #666; font-size: 14px;">Reply to: ${email}</p>
      </div>
    `,
  };

  // Email to sender (confirmation)
  const senderMailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Message Received - Rona Studio',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0A0F2C;">Thank You for Contacting Us!</h2>
        <p>Dear ${name},</p>
        <p>We have received your message and will respond as soon as possible.</p>
        
        <div style="background: #F8F8F8; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <p><strong>Your message:</strong></p>
          <p>${message}</p>
        </div>
        
        <p style="margin-top: 30px;">Best regards,<br><strong>Rona Studio Team</strong></p>
      </div>
    `,
  };

  // Send emails
  await Promise.all([
    transporter.sendMail(adminMailOptions),
    transporter.sendMail(senderMailOptions),
  ]);
};
