/**
 * Email Service - Professional Email Management System
 * 
 * Comprehensive email service with template support, HTML formatting,
 * and professional email delivery capabilities.
 * 
 * @author Professional Development Team
 * @version 2.1.0
 */

const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

/**
 * Email Service Class
 * Handles all email operations with professional templates
 */
class EmailService {
  constructor() {
    this.transporter = this.createTransporter();
  }

  /**
   * Create email transporter
   * @returns {Object} Nodemailer transporter
   */
  createTransporter() {
    // Production SMTP configuration
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_PORT == 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      });
    }

    // Development configuration
    return nodemailer.createTransporter({
      host: 'smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  /**
   * Send email with professional template
   * @param {Object} options - Email options
   */
  async sendEmail(options) {
    try {
      const mailOptions = {
        from: `${process.env.FROM_NAME || 'Culinary API Team'} <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.html,
        text: options.text
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      logger.info('Email sent successfully', {
        to: options.email,
        subject: options.subject,
        messageId: info.messageId
      });

      return info;
    } catch (error) {
      logger.error('Email sending failed', {
        to: options.email,
        subject: options.subject,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Generate professional email template
   * @param {Object} data - Template data
   * @returns {string} HTML template
   */
  generateEmailTemplate(data) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.title}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f8f9fa;
            }
            
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
            }
            
            .header h1 {
                font-size: 28px;
                margin-bottom: 10px;
            }
            
            .header p {
                font-size: 16px;
                opacity: 0.9;
            }
            
            .content {
                padding: 40px 30px;
            }
            
            .greeting {
                font-size: 18px;
                margin-bottom: 20px;
                color: #2c3e50;
            }
            
            .message {
                font-size: 16px;
                line-height: 1.8;
                margin-bottom: 30px;
                color: #555;
            }
            
            .button {
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                font-size: 16px;
                margin: 20px 0;
                transition: transform 0.2s;
            }
            
            .button:hover {
                transform: translateY(-2px);
            }
            
            .info-box {
                background-color: #f8f9fa;
                border-left: 4px solid #667eea;
                padding: 20px;
                margin: 20px 0;
                border-radius: 0 5px 5px 0;
            }
            
            .footer {
                background-color: #2c3e50;
                color: white;
                padding: 30px;
                text-align: center;
                font-size: 14px;
            }
            
            .footer a {
                color: #3498db;
                text-decoration: none;
            }
            
            .social-links {
                margin: 20px 0;
            }
            
            .social-links a {
                display: inline-block;
                margin: 0 10px;
                color: #3498db;
                text-decoration: none;
            }
            
            @media (max-width: 600px) {
                .container {
                    margin: 10px;
                    border-radius: 5px;
                }
                
                .header, .content, .footer {
                    padding: 20px;
                }
                
                .header h1 {
                    font-size: 24px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🍽️ Culinary API</h1>
                <p>Professional Recipe Management Platform</p>
            </div>
            
            <div class="content">
                <div class="greeting">Hello ${data.firstName}!</div>
                
                <div class="message">
                    ${data.message}
                </div>
                
                ${data.buttonUrl ? `
                <div style="text-align: center;">
                    <a href="${data.buttonUrl}" class="button">${data.buttonText || 'Take Action'}</a>
                </div>
                ` : ''}
                
                ${data.additionalInfo ? `
                <div class="info-box">
                    ${data.additionalInfo}
                </div>
                ` : ''}
            </div>
            
            <div class="footer">
                <p><strong>Culinary API Team</strong></p>
                <p>Professional Recipe Management Platform</p>
                
                <div class="social-links">
                    <a href="#">Website</a> |
                    <a href="#">Support</a> |
                    <a href="#">Documentation</a>
                </div>
                
                <p style="margin-top: 20px; font-size: 12px; opacity: 0.8;">
                    This email was sent from Culinary API. If you didn't request this email, please ignore it.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  /**
   * Send welcome email to new users
   * @param {Object} options - Email options
   */
  async sendWelcomeEmail(options) {
    const { email, firstName, verificationUrl } = options;

    const templateData = {
      title: 'Welcome to Culinary API',
      firstName,
      message: `
        Welcome to the Culinary API platform! We're excited to have you join our community of culinary enthusiasts.
        <br><br>
        To get started, please verify your email address by clicking the button below. This helps us ensure the security of your account and enables you to receive important updates.
        <br><br>
        Once verified, you'll be able to:
        <ul style="margin: 15px 0; padding-left: 20px;">
          <li>Create and manage your own recipes</li>
          <li>Explore thousands of recipes from our community</li>
          <li>Rate and review recipes</li>
          <li>Build your personal recipe collection</li>
          <li>Connect with other food lovers</li>
        </ul>
      `,
      buttonUrl: verificationUrl,
      buttonText: 'Verify Email Address',
      additionalInfo: `
        <strong>Need help?</strong><br>
        If you have any questions or need assistance, our support team is here to help. 
        Simply reply to this email or visit our help center.
      `
    };

    const html = this.generateEmailTemplate(templateData);

    await this.sendEmail({
      email,
      subject: '🍽️ Welcome to Culinary API - Verify Your Account',
      html,
      text: `Welcome to Culinary API! Please verify your email by visiting: ${verificationUrl}`
    });
  }

  /**
   * Send email verification
   * @param {Object} options - Email options
   */
  async sendVerificationEmail(options) {
    const { email, firstName, verificationUrl } = options;

    const templateData = {
      title: 'Verify Your Email Address',
      firstName,
      message: `
        Thank you for joining Culinary API! To complete your registration and secure your account, 
        please verify your email address by clicking the button below.
        <br><br>
        This verification link will expire in 24 hours for security reasons.
      `,
      buttonUrl: verificationUrl,
      buttonText: 'Verify Email Address',
      additionalInfo: `
        <strong>Why verify your email?</strong><br>
        Email verification helps us:
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Protect your account from unauthorized access</li>
          <li>Send you important account notifications</li>
          <li>Help you recover your account if needed</li>
        </ul>
      `
    };

    const html = this.generateEmailTemplate(templateData);

    await this.sendEmail({
      email,
      subject: '📧 Verify Your Email Address - Culinary API',
      html,
      text: `Please verify your email by visiting: ${verificationUrl}`
    });
  }

  /**
   * Send password reset email
   * @param {Object} options - Email options
   */
  async sendPasswordResetEmail(options) {
    const { email, firstName, resetUrl } = options;

    const templateData = {
      title: 'Password Reset Request',
      firstName,
      message: `
        We received a request to reset your password for your Culinary API account.
        <br><br>
        If you requested this password reset, click the button below to create a new password. 
        This link will expire in 10 minutes for security reasons.
        <br><br>
        <strong>If you didn't request this password reset, please ignore this email.</strong> 
        Your password will remain unchanged.
      `,
      buttonUrl: resetUrl,
      buttonText: 'Reset Password',
      additionalInfo: `
        <strong>Security Tips:</strong><br>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Choose a strong, unique password</li>
          <li>Don't share your password with anyone</li>
          <li>Consider using a password manager</li>
          <li>Enable two-factor authentication when available</li>
        </ul>
      `
    };

    const html = this.generateEmailTemplate(templateData);

    await this.sendEmail({
      email,
      subject: '🔒 Password Reset Request - Culinary API',
      html,
      text: `Reset your password by visiting: ${resetUrl}`
    });
  }

  /**
   * Send recipe notification email
   * @param {Object} options - Email options
   */
  async sendRecipeNotification(options) {
    const { email, firstName, recipeName, authorName, recipeUrl } = options;

    const templateData = {
      title: 'New Recipe Alert',
      firstName,
      message: `
        Great news! A new recipe "${recipeName}" has been shared by ${authorName} that matches your interests.
        <br><br>
        Check it out and discover something delicious for your next meal!
      `,
      buttonUrl: recipeUrl,
      buttonText: 'View Recipe',
      additionalInfo: `
        <strong>Stay Updated:</strong><br>
        You're receiving this because you've subscribed to recipe notifications. 
        You can manage your notification preferences in your account settings.
      `
    };

    const html = this.generateEmailTemplate(templateData);

    await this.sendEmail({
      email,
      subject: `🍳 New Recipe: ${recipeName} - Culinary API`,
      html,
      text: `New recipe "${recipeName}" by ${authorName}. View at: ${recipeUrl}`
    });
  }
}

// Export singleton instance
module.exports = new EmailService();