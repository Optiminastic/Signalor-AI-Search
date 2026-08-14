import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { sendWelcomeEmail } from '@/lib/email'
import { logger } from '@/lib/logger'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://signalor.ai'

function buildHtml(firstName: string, dashboardUrl: string): string {
  const logoUrl = `${SITE_URL}/signalor-logo-for-email.png`
  const fullDashboardUrl = dashboardUrl.startsWith('http')
    ? dashboardUrl
    : `${SITE_URL}${dashboardUrl}`

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
<meta content="text/html; charset=utf-8" http-equiv="Content-Type">
<meta name="viewport" content="width=device-width">
<meta name="format-detection" content="telephone=no">
<style type="text/css" data-premailer="ignore">
  #outlook a { padding: 0; }
  body { -webkit-text-size-adjust: none; -ms-text-size-adjust: none; font-weight: 400; margin: 0; padding: 0; }
  .ReadMsgBody { width: 100%; }
  .ExternalClass { width: 100%; }
  img { border: 0; max-width: 100%; height: auto; outline: none; display: inline-block; margin: 0; padding: 0; text-decoration: none; line-height: 100%; }
</style>
<style type="text/css">
  .main { font-family: Helvetica, Arial, sans-serif; letter-spacing: 0; }
  .main .main-td { padding: 40px 60px; border: 1px solid #e0e0e0; box-shadow: 0 1px 3px 0 rgba(0,0,0,0.06); border-radius: 2px; }
  table { border-spacing: 0; border-collapse: separate; table-layout: fixed; }
  td { font-size: 16px; padding: 0; font-family: Helvetica, Arial, sans-serif; }
  a { border: none; outline: none !important; }
  .cta-btn-td { background-color: #e04a3d !important; padding: 13px 36px !important; border-radius: 4px !important; border: none !important; }
  .cta-btn { display: inline-block; color: #ffffff !important; font-weight: 700; font-size: 14px; text-decoration: none; letter-spacing: 0.3px; }
  .footer-td { text-align: center; padding: 20px 30px 15px; }
  .footer-td p, .footer-td a { font-size: 12px; color: #b7b7b7; text-decoration: none; font-weight: 300; }
  .footer-td p { margin: 0 0 6px; }
  @media screen and (max-width: 595px) {
    body { padding: 10px !important; }
    .main { width: 100% !important; }
    .main .main-td { padding: 20px !important; }
  }
</style>
<!--[if gte mso 9]><style>table { border-collapse: collapse !important; } td { border-collapse: collapse !important; }</style><![endif]-->
</head>
<body style="background-color: #f5f5f5; margin: 0; padding: 20px;" bgcolor="#f5f5f5">

  <table cellspacing="0" border="0" cellpadding="0" align="center" width="595" bgcolor="#ffffff" class="main"
    style="border-collapse: separate; border-spacing: 0; font-family: Helvetica, Arial, sans-serif; letter-spacing: 0; table-layout: fixed;">
    <tbody>
      <tr>
        <td class="main-td" style="border: 1px solid #e0e0e0; border-radius: 2px; box-shadow: 0 1px 3px 0 rgba(0,0,0,0.06); font-family: Helvetica, Arial, sans-serif; font-size: 16px; padding: 40px 60px;">

          <!-- Logo -->
          <table width="100%" style="border-collapse: separate; border-spacing: 0; table-layout: fixed;">
            <tbody>
              <tr>
                <td style="text-align: left; padding: 0 0 28px;" align="left">
                  <img src="${logoUrl}" alt="SignalorAI" width="140" height="auto"
                    style="display: inline-block; height: auto; max-width: 140px; border: 0; outline: none; text-decoration: none;" />
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Heading -->
          <table width="100%" style="border-collapse: separate; border-spacing: 0; table-layout: fixed;">
            <tbody>
              <tr>
                <td style="padding: 0 0 20px;" align="left">
                  <span style="font-size: 24px; font-weight: 700; color: #0d0d0d; font-family: Helvetica, Arial, sans-serif; line-height: 1.3;">
                    Welcome to SignalorAI${firstName ? `, ${firstName}` : ''} 👋
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Content -->
          <table width="100%" style="border-collapse: separate; border-spacing: 0; table-layout: fixed;">
            <tbody>
              <tr>
                <td style="color: #333333; font-family: Helvetica, Arial, sans-serif; font-size: 15px; line-height: 22px; padding: 0;">

                  <p style="margin: 0 0 16px; line-height: 1.6; color: #333333;">
                    You're in. Over <strong>40% of searches now happen inside AI tools</strong>, not Google. SignalorAI is the platform that tracks, measures, and improves how your brand gets cited by ChatGPT, Gemini, Perplexity, and Claude.
                  </p>

                  <h2 style="font-size: 13px; font-weight: 700; color: #0d0d0d; margin: 22px 0 8px; text-transform: uppercase; letter-spacing: 0.5px;">What you can do with SignalorAI</h2>

                  <ul style="list-style: none; margin: 0 0 20px 0; padding: 0;">
                    <li style="padding: 8px 0 8px 18px; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #444444; line-height: 1.5; position: relative;">
                      <span style="color: #e04a3d; position: absolute; left: 0;">▸</span>
                      <strong>AI Visibility Score</strong>: get a 0-100 score across citability, schema, E-E-A-T, and technical health.
                    </li>
                    <li style="padding: 8px 0 8px 18px; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #444444; line-height: 1.5; position: relative;">
                      <span style="color: #e04a3d; position: absolute; left: 0;">▸</span>
                      <strong>Prompt Tracking</strong>: we fire your keywords at all major AI engines weekly and capture every cited URL.
                    </li>
                    <li style="padding: 8px 0 8px 18px; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #444444; line-height: 1.5; position: relative;">
                      <span style="color: #e04a3d; position: absolute; left: 0;">▸</span>
                      <strong>Competitor Intelligence</strong>: see who's winning AI citations in your space and what gaps you can own.
                    </li>
                    <li style="padding: 8px 0 8px 18px; font-size: 14px; color: #444444; line-height: 1.5; position: relative;">
                      <span style="color: #e04a3d; position: absolute; left: 0;">▸</span>
                      <strong>Auto-fix Recommendations</strong>: prioritized fixes for schema &amp; meta, auto-applied on Shopify &amp; WordPress or exported for your team.
                    </li>
                  </ul>

                  <p style="margin: 0 0 20px; line-height: 1.6; color: #555555; font-size: 14px;">
                    Your first brand analysis is ready. Click below to view your AI visibility report.
                  </p>

                  <!-- CTA Button -->
                  <table align="left" style="border-collapse: collapse; border-spacing: 0; margin: 4px 0 24px; table-layout: fixed;">
                    <tbody>
                      <tr>
                        <td class="cta-btn-td" style="background-color: #e04a3d; border: none; border-radius: 4px; font-family: Helvetica, Arial, sans-serif; font-size: 16px; margin: 0; padding: 13px 36px; text-align: center; vertical-align: top;" align="center" bgcolor="#e04a3d" valign="top">
                          <a class="cta-btn" target="_blank" href="${fullDashboardUrl}"
                            style="display: inline-block; color: #ffffff; font-weight: 700; font-size: 14px; text-decoration: none; letter-spacing: 0.3px; font-family: Helvetica, Arial, sans-serif;">
                            View My AI Dashboard →
                          </a>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <p style="margin: 0 0 24px; line-height: 1.6; font-size: 14px; color: #555555;">
                    Questions? Just reply, we read every message.
                  </p>

                  <hr style="border: none; border-top: 1px solid #eeeeee; margin: 24px 0;">

                  <p style="margin: 0; line-height: 1.6; font-size: 14px; color: #333333;">
                    The SignalorAI Team<br>
                    <a href="mailto:hello@signalor.ai" style="color: #e04a3d; border: none; outline: none;">hello@signalor.ai</a>
                  </p>

                </td>
              </tr>
            </tbody>
          </table>

        </td>
      </tr>
    </tbody>
  </table>

  <!-- Footer -->
  <table width="100%" align="middle" style="border-collapse: separate; border-spacing: 0; table-layout: fixed;">
    <tbody>
      <tr>
        <td style="font-family: Helvetica, Arial, sans-serif; font-size: 16px; padding: 0;">
          <table cellspacing="0" border="0" cellpadding="0" align="center" width="595" bgcolor="transparent"
            style="border-collapse: separate; border-spacing: 0; font-family: Helvetica, Arial, sans-serif; letter-spacing: 0; table-layout: fixed;">
            <tbody>
              <tr>
                <td class="footer-td" style="font-family: Helvetica, Arial, sans-serif; font-size: 12px; padding: 20px 30px 15px; text-align: center;" align="center">
                  <p style="color: #b7b7b7; font-size: 12px; font-weight: 300; margin: 0 0 4px;">
                    © 2026 SignalorAI · AI Search Visibility &amp; GEO Platform
                  </p>
                  <p style="margin: 0;">
                    <a href="${SITE_URL}" style="color: #b7b7b7; font-size: 12px; font-weight: 300; text-decoration: underline;">
                      Unsubscribe from our emails
                    </a>
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>

</body>
</html>`
}

export async function POST(req: NextRequest) {
  let email: string, name: string | undefined, dashboardUrl: string
  try {
    ;({ email, name, dashboardUrl } = await req.json())
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!email || !dashboardUrl) {
    return NextResponse.json({ error: 'email and dashboardUrl are required' }, { status: 400 })
  }

  const firstName = name ? name.split(' ')[0] : ''
  const sent = await sendWelcomeEmail(email, buildHtml(firstName, dashboardUrl))

  if (!sent) {
    logger.error({ email }, '[welcome-email] Resend send failed')
    return NextResponse.json({ error: 'Failed to send email' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
