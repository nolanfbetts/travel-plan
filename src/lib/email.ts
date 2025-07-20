import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/verify?token=${token}`
  
  // For development, fallback to console logging if no API key
  if (!process.env.RESEND_API_KEY) {
    console.log(`Verification email for ${email}:`)
    console.log(`Click here to verify: ${verificationUrl}`)
    return
  }

  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@yourdomain.com',
      to: [email],
      subject: 'Verify your email address - Travel Plan',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Travel Plan!</h1>
          </div>
          
          <div style="padding: 40px 20px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Verify Your Email Address</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
              Thanks for signing up! To complete your registration and start planning your next adventure, 
              please verify your email address by clicking the button below.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; 
                        border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              This verification link will expire in 24 hours. If you didn't create an account with Travel Plan, 
              you can safely ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${verificationUrl}" style="color: #667eea;">${verificationUrl}</a>
            </p>
          </div>
        </div>
      `
    })
    
    console.log(`Verification email sent successfully to ${email}`)
  } catch (error) {
    console.error("Failed to send verification email:", error)
    // Don't throw error to avoid breaking the signup flow
    // In production, you might want to log this to a monitoring service
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/reset-password?token=${token}`
  
  // For development, fallback to console logging if no API key
  if (!process.env.RESEND_API_KEY) {
    console.log(`Password reset email for ${email}:`)
    console.log(`Click here to reset password: ${resetUrl}`)
    return
  }

  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@yourdomain.com',
      to: [email],
      subject: 'Reset your password - Travel Plan',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Travel Plan</h1>
          </div>
          
          <div style="padding: 40px 20px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Reset Your Password</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
              You requested to reset your password. Click the button below to create a new password.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; 
                        border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              This link will expire in 1 hour. If you didn't request a password reset, 
              you can safely ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetUrl}" style="color: #667eea;">${resetUrl}</a>
            </p>
          </div>
        </div>
      `
    })
    
    console.log(`Password reset email sent successfully to ${email}`)
  } catch (error) {
    console.error("Failed to send password reset email:", error)
    // Don't throw error to avoid breaking the flow
  }
}

export async function sendTripInvitationEmail(
  receiverEmail: string, 
  receiverName: string, 
  senderName: string, 
  tripName: string, 
  tripDescription: string | null,
  tripStartDate: string | null,
  tripEndDate: string | null,
  isNewUser: boolean = false
) {
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(receiverEmail)) {
    console.error(`Invalid email format: ${receiverEmail}`)
    return { success: false, error: 'Invalid email format' }
  }

  console.log(`Attempting to send email to: ${receiverEmail}`)
  console.log(`Email details:`, { receiverEmail, receiverName, senderName, tripName, isNewUser })

  const invitationsUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/invitations`
  const signupUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/signup`
  
  // For development, fallback to console logging if no API key
  if (!process.env.RESEND_API_KEY) {
    console.log(`Trip invitation email for ${receiverEmail}:`)
    console.log(`From: ${senderName}`)
    console.log(`Trip: ${tripName}`)
    if (isNewUser) {
      console.log(`Sign up first: ${signupUrl}`)
    }
    console.log(`View invitations: ${invitationsUrl}`)
    return { success: true }
  }

  const dateRange = tripStartDate && tripEndDate 
    ? `${new Date(tripStartDate).toLocaleDateString()} - ${new Date(tripEndDate).toLocaleDateString()}`
    : 'Dates TBD'

  try {
    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@yourdomain.com',
      to: [receiverEmail],
      subject: `You're invited to join "${tripName}" - Travel Plan`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Travel Plan</h1>
          </div>
          
          <div style="padding: 40px 20px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">You're Invited!</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Hi ${receiverName},
            </p>
            <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
              <strong>${senderName}</strong> has invited you to join their trip: <strong>"${tripName}"</strong>
            </p>
            
            ${isNewUser ? `
            <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #0c4a6e; margin: 0 0 10px 0;">New to Travel Plan?</h3>
              <p style="color: #0369a1; margin: 0 0 15px 0; line-height: 1.6;">
                You'll need to create an account first to accept this invitation. It only takes a minute!
              </p>
              <div style="text-align: center;">
                <a href="${signupUrl}" 
                   style="background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; 
                          border-radius: 5px; display: inline-block; font-weight: bold; font-size: 14px;">
                  Create Account
                </a>
              </div>
            </div>
            ` : ''}
            
            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="color: #333; margin: 0 0 10px 0;">Trip Details</h3>
              <p style="color: #666; margin: 5px 0;"><strong>Trip:</strong> ${tripName}</p>
              ${tripDescription ? `<p style="color: #666; margin: 5px 0;"><strong>Description:</strong> ${tripDescription}</p>` : ''}
              <p style="color: #666; margin: 5px 0;"><strong>Dates:</strong> ${dateRange}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${invitationsUrl}" 
                 style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; 
                        border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">
                View Invitation
              </a>
            </div>
            
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              Click the button above to view and respond to this invitation. You can accept or decline the invitation from your dashboard.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${invitationsUrl}" style="color: #667eea;">${invitationsUrl}</a>
            </p>
          </div>
        </div>
      `
    })
    
    console.log(`Trip invitation email sent successfully to ${receiverEmail}`)
    console.log(`Resend API response for ${receiverEmail}:`, JSON.stringify(result, null, 2))
    return { success: true, result }
  } catch (error) {
    console.error("Failed to send trip invitation email:", error)
    console.error("Email details:", { receiverEmail, senderName, tripName })
    // Don't throw error to avoid breaking the invitation flow, but return failure status
    return { success: false, error }
  }
} 