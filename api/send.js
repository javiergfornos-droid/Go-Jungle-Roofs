import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, hasApiKey: !!process.env.RESEND_API_KEY, hasLeadEmail: !!process.env.LEAD_EMAIL });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    type = 'lead',
    name,
    surname,
    email,
    phone,
    address,
    city,
    assetType,
    assetCategory,
    buildingRole,
    objective,
    timeline,
    surfaceArea,
    totalBudget,
    publicAidMin,
    publicAidMax,
    energySavings,
    waterRetention,
    co2Capture,
  } = req.body;

  if (!email || !address) {
    return res.status(400).json({ error: 'Email and address are required' });
  }

  const to = process.env.LEAD_EMAIL || 'javier.gonzalez@edu.escp.eu';
  const from = process.env.RESEND_FROM || 'onboarding@resend.dev';

  let subject;
  let html;

  if (type === 'meeting') {
    subject = `[CONFIRMED CONTACT] ${name} wants a meeting`;
    html = `
      <div style="font-family:'Montserrat',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;color:#333">
        <div style="background:#7FA068;padding:28px 32px;border-radius:12px 12px 0 0">
          <h1 style="margin:0;color:#fff;font-size:22px">Meeting Request Confirmed</h1>
        </div>
        <div style="background:#f9f9f9;padding:28px 32px;border:1px solid #e5e5e5;border-top:none;border-radius:0 0 12px 12px">
          <p style="margin:0 0 16px;font-size:15px">
            <strong>${name} ${surname || ''}</strong> has confirmed they want to schedule a meeting with Jungle Roofs.
          </p>
          <table style="width:100%;font-size:14px;border-collapse:collapse">
            <tr><td style="padding:6px 0;color:#888;width:140px">Email</td><td style="padding:6px 0;font-weight:600">${email}</td></tr>
            <tr><td style="padding:6px 0;color:#888">Phone</td><td style="padding:6px 0;font-weight:600">${phone || '&mdash;'}</td></tr>
            <tr><td style="padding:6px 0;color:#888">Address</td><td style="padding:6px 0;font-weight:600">${address || '&mdash;'}</td></tr>
            <tr><td style="padding:6px 0;color:#888">Surface Area</td><td style="padding:6px 0;font-weight:600">${surfaceArea || '&mdash;'} m&sup2;</td></tr>
          </table>
          <p style="margin:16px 0 0;font-size:13px;color:#888">Full lead data was already sent when the user viewed the dashboard.</p>
        </div>
      </div>
    `;
  } else {
    subject = `[AUTOMATIC LEAD] Dashboard Viewed: ${name} - ${city || '—'}`;
    html = `
      <div style="font-family:'Montserrat',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;color:#333">
        <div style="background:#fffbe6;padding:14px 20px;border:1px solid #ffe58f;border-radius:8px;margin-bottom:16px">
          <p style="margin:0;font-size:13px;color:#8c6d1f">
            <strong>Internal Note:</strong> This is an automated capture from a dashboard view.
            The user has NOT necessarily requested a meeting yet.
          </p>
        </div>

        <div style="background:#7FA068;padding:28px 32px;border-radius:12px 12px 0 0">
          <h1 style="margin:0;color:#fff;font-size:22px">New Dashboard Lead</h1>
          <p style="margin:6px 0 0;color:#e0ecd6;font-size:14px">${name} ${surname || ''} &mdash; ${surfaceArea} m&sup2;</p>
        </div>

        <div style="background:#f9f9f9;padding:28px 32px;border:1px solid #e5e5e5;border-top:none">
          <h2 style="font-size:15px;color:#7FA068;margin:0 0 14px;text-transform:uppercase;letter-spacing:1px">Contact Details</h2>
          <table style="width:100%;font-size:14px;border-collapse:collapse">
            <tr><td style="padding:6px 0;color:#888;width:140px">Name</td><td style="padding:6px 0;font-weight:600">${name} ${surname || ''}</td></tr>
            <tr><td style="padding:6px 0;color:#888">Email</td><td style="padding:6px 0;font-weight:600">${email}</td></tr>
            <tr><td style="padding:6px 0;color:#888">Phone</td><td style="padding:6px 0;font-weight:600">${phone || '&mdash;'}</td></tr>
            <tr><td style="padding:6px 0;color:#888">Address</td><td style="padding:6px 0;font-weight:600">${address || '&mdash;'}</td></tr>
          </table>

          <hr style="border:none;border-top:1px solid #e5e5e5;margin:20px 0" />

          <h2 style="font-size:15px;color:#7FA068;margin:0 0 14px;text-transform:uppercase;letter-spacing:1px">Project Details</h2>
          <table style="width:100%;font-size:14px;border-collapse:collapse">
            <tr><td style="padding:6px 0;color:#888;width:140px">Asset Type</td><td style="padding:6px 0;font-weight:600">${assetType || '&mdash;'}</td></tr>
            <tr><td style="padding:6px 0;color:#888">Property Type</td><td style="padding:6px 0;font-weight:600">${assetCategory || '&mdash;'}</td></tr>
            <tr><td style="padding:6px 0;color:#888">Building Role</td><td style="padding:6px 0;font-weight:600">${buildingRole || '&mdash;'}</td></tr>
            <tr><td style="padding:6px 0;color:#888">Objective</td><td style="padding:6px 0;font-weight:600">${objective || '&mdash;'}</td></tr>
            <tr><td style="padding:6px 0;color:#888">Timeline</td><td style="padding:6px 0;font-weight:600">${timeline || '&mdash;'}</td></tr>
          </table>

          <hr style="border:none;border-top:1px solid #e5e5e5;margin:20px 0" />

          <h2 style="font-size:15px;color:#7FA068;margin:0 0 14px;text-transform:uppercase;letter-spacing:1px">Estimate (Internal)</h2>
          <table style="width:100%;font-size:14px;border-collapse:collapse">
            <tr><td style="padding:6px 0;color:#888;width:140px">Surface Area</td><td style="padding:6px 0;font-weight:600">${surfaceArea} m&sup2;</td></tr>
            <tr><td style="padding:6px 0;color:#888">Total Budget</td><td style="padding:6px 0;font-weight:700;font-size:18px;color:#7FA068">${totalBudget}&euro;</td></tr>
            <tr><td style="padding:6px 0;color:#888">Public Aid (25%-60%)</td><td style="padding:6px 0;font-weight:600">${publicAidMin}&euro; &mdash; ${publicAidMax}&euro;</td></tr>
          </table>

          <hr style="border:none;border-top:1px solid #e5e5e5;margin:20px 0" />

          <h2 style="font-size:15px;color:#7FA068;margin:0 0 14px;text-transform:uppercase;letter-spacing:1px">Environmental Impact</h2>
          <table style="width:100%;font-size:14px;border-collapse:collapse">
            <tr><td style="padding:6px 0;color:#888;width:140px">Energy Savings</td><td style="padding:6px 0;font-weight:600">${energySavings || '&mdash;'}&euro; / year</td></tr>
            <tr><td style="padding:6px 0;color:#888">Water Retention</td><td style="padding:6px 0;font-weight:600">${waterRetention || '&mdash;'} L / year</td></tr>
            <tr><td style="padding:6px 0;color:#888">CO&sub2; Captured</td><td style="padding:6px 0;font-weight:600">${co2Capture || '&mdash;'} Kg / year</td></tr>
          </table>
        </div>

        <div style="background:#7FA068;padding:16px 32px;border-radius:0 0 12px 12px;text-align:center">
          <p style="margin:0;color:#fff;font-size:12px">&copy; Jungle Roofs &mdash; Making Cities Cooler</p>
        </div>
      </div>
    `;
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Resend error:', JSON.stringify(error));
      return res.status(500).json({ error: error.message || 'Failed to send email' });
    }

    console.log('Email sent:', data?.id, 'type:', type);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Server error:', err.message, err.stack);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
