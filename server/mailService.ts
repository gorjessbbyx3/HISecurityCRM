import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  sendmail: true,
  newline: 'unix',
  path: '/usr/sbin/sendmail'
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const mailOptions = {
      from: process.env.MAIL_FROM_ADDRESS || 'noreply@yourdomain.com',
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
};

export const sendNotification = async (type: string, data: any) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@yourdomain.com';

  let subject = '';
  let html = '';

  switch (type) {
    case 'incident_created':
      subject = 'New Incident Reported';
      html = `
        <h2>New Incident Reported</h2>
        <p><strong>Type:</strong> ${data.incidentType}</p>
        <p><strong>Location:</strong> ${data.location || 'Unknown'}</p>
        <p><strong>Description:</strong> ${data.description}</p>
        <p><strong>Severity:</strong> ${data.severity || 'Medium'}</p>
        <p><strong>Reported by:</strong> ${data.reportedBy}</p>
        <p><strong>Time:</strong> ${new Date(data.occuredAt).toLocaleString()}</p>
      `;
      break;
    case 'user_registered':
      subject = 'New User Registered';
      html = `
        <h2>New User Registered</h2>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Role:</strong> ${data.role}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      `;
      break;
    default:
      subject = 'Security CRM Notification';
      html = `<p>${type}: ${JSON.stringify(data)}</p>`;
  }

  return await sendEmail(adminEmail, subject, html);
};
