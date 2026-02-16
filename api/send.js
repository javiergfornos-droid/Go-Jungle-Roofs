import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    name,
    surname,
    email,
    phone,
    address,
    role,
    assetType,
    assetCategory,
    buildingRole,
    timeLinked,
    objective,
    timeline,
    energyBill,
    surfaceArea,
    totalBudget,
    publicAid,
  } = req.body;

  const html = `
    <div style="font-family:'Montserrat',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;color:#333">
      <div style="background:#7FA068;padding:28px 32px;border-radius:12px 12px 0 0">
        <h1 style="margin:0;color:#fff;font-size:22px">New Project Lead</h1>
        <p style="margin:6px 0 0;color:#e0ecd6;font-size:14px">${name} ${surname} &mdash; ${surfaceArea} m&sup2;</p>
      </div>

      <div style="background:#f9f9f9;padding:28px 32px;border:1px solid #e5e5e5;border-top:none">
        <h2 style="font-size:15px;color:#7FA068;margin:0 0 14px;text-transform:uppercase;letter-spacing:1px">Contact Details</h2>
        <table style="width:100%;font-size:14px;border-collapse:collapse">
          <tr><td style="padding:6px 0;color:#888;width:140px">Name</td><td style="padding:6px 0;font-weight:600">${name} ${surname}</td></tr>
          <tr><td style="padding:6px 0;color:#888">Email</td><td style="padding:6px 0;font-weight:600">${email}</td></tr>
          <tr><td style="padding:6px 0;color:#888">Phone</td><td style="padding:6px 0;font-weight:600">${phone || '—'}</td></tr>
          <tr><td style="padding:6px 0;color:#888">Address</td><td style="padding:6px 0;font-weight:600">${address || '—'}</td></tr>
        </table>

        <hr style="border:none;border-top:1px solid #e5e5e5;margin:20px 0" />

        <h2 style="font-size:15px;color:#7FA068;margin:0 0 14px;text-transform:uppercase;letter-spacing:1px">Project Details</h2>
        <table style="width:100%;font-size:14px;border-collapse:collapse">
          <tr><td style="padding:6px 0;color:#888;width:140px">Role</td><td style="padding:6px 0;font-weight:600">${role}</td></tr>
          <tr><td style="padding:6px 0;color:#888">Asset Type</td><td style="padding:6px 0;font-weight:600">${assetType || '—'}</td></tr>
          <tr><td style="padding:6px 0;color:#888">Property Type</td><td style="padding:6px 0;font-weight:600">${assetCategory || '—'}</td></tr>
          <tr><td style="padding:6px 0;color:#888">Building Role</td><td style="padding:6px 0;font-weight:600">${buildingRole || '—'}</td></tr>
          <tr><td style="padding:6px 0;color:#888">Time Linked</td><td style="padding:6px 0;font-weight:600">${timeLinked || '—'}</td></tr>
          <tr><td style="padding:6px 0;color:#888">Objective</td><td style="padding:6px 0;font-weight:600">${objective || '—'}</td></tr>
          <tr><td style="padding:6px 0;color:#888">Timeline</td><td style="padding:6px 0;font-weight:600">${timeline || '—'}</td></tr>
          <tr><td style="padding:6px 0;color:#888">Energy Bill</td><td style="padding:6px 0;font-weight:600">${energyBill}€ / month</td></tr>
        </table>

        <hr style="border:none;border-top:1px solid #e5e5e5;margin:20px 0" />

        <h2 style="font-size:15px;color:#7FA068;margin:0 0 14px;text-transform:uppercase;letter-spacing:1px">Estimate</h2>
        <table style="width:100%;font-size:14px;border-collapse:collapse">
          <tr><td style="padding:6px 0;color:#888;width:140px">Surface Area</td><td style="padding:6px 0;font-weight:600">${surfaceArea} m&sup2;</td></tr>
          <tr><td style="padding:6px 0;color:#888">Total Budget</td><td style="padding:6px 0;font-weight:700;font-size:18px;color:#7FA068">${totalBudget}€</td></tr>
          <tr><td style="padding:6px 0;color:#888">Public Aid (25%)</td><td style="padding:6px 0;font-weight:600">${publicAid}€</td></tr>
        </table>
      </div>

      <div style="background:#7FA068;padding:16px 32px;border-radius:0 0 12px 12px;text-align:center">
        <p style="margin:0;color:#fff;font-size:12px">&copy; Jungle Roofs &mdash; Making Cities Cooler</p>
      </div>
    </div>
  `;

  try {
    const { error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'javier.gonzalez@edu.escp.eu',
      subject: `New Project Lead: ${name} ${surname} - ${surfaceArea}m2`,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
