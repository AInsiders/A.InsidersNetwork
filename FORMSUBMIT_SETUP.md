# FormSubmit.co Setup Guide

## Overview
Your contact form is now configured to use FormSubmit.co, a free service that handles form submissions and sends them directly to your email without requiring any backend code.

## Current Configuration
- **Email**: aiinsidersnetwork@gmail.com
- **Form Action**: https://formsubmit.co/aiinsidersnetwork@gmail.com
- **Redirect Page**: thank-you.html
- **Auto-response**: Enabled with custom message

## Setup Steps

### 1. Email Confirmation (First Time Only)
1. Submit the contact form once from your website
2. Check your email (aiinsidersnetwork@gmail.com) for a confirmation email from FormSubmit
3. Click the confirmation link in the email
4. Your form will now be active and ready to receive submissions

### 2. Testing the Form
1. Fill out the contact form on your website
2. Submit the form
3. You should be redirected to the thank-you.html page
4. Check your email for the form submission

## Form Features

### Current Configuration
- **Subject Line**: "New Contact Form Submission - A.Insiders"
- **Captcha**: Disabled (set to false)
- **Template**: Table format for easy reading
- **Auto-response**: Sends confirmation to form submitter
- **Redirect**: Goes to thank-you.html after submission

### Form Fields
- **Name**: Required text field
- **Email**: Required email field
- **Subject**: Optional text field (pre-filled)
- **Message**: Required textarea

## Troubleshooting

### If emails aren't received:
1. Check your spam folder
2. Verify the email confirmation was completed
3. Test with the alternative form on the page
4. Check FormSubmit.co status page

### If redirect doesn't work:
1. Ensure thank-you.html exists in the same directory
2. Check that the `_next` parameter is set correctly
3. Test with a full URL if needed

## Advanced Configuration

### Optional Features You Can Add:
- **Honeypot Protection**: Add `<input type="text" name="_honey" style="display:none">`
- **Custom Templates**: Change `_template` value to "box" or "basic"
- **Custom Subject**: Modify the `_subject` hidden field
- **File Uploads**: Add `<input type="file" name="attachment">`

### Example Advanced Configuration:
```html
<input type="hidden" name="_honey" style="display:none">
<input type="hidden" name="_template" value="box">
<input type="hidden" name="_subject" value="Website Contact - {{name}}">
```

## Security Notes
- FormSubmit.co is a trusted service used by thousands of websites
- No personal data is stored on their servers
- All submissions are sent directly to your email
- The service is free and doesn't require registration

## Support
- FormSubmit.co Documentation: https://formsubmit.co/
- Email: support@formsubmit.co
- Status Page: https://status.formsubmit.co/

## Next Steps
1. Test the form by submitting it once
2. Confirm your email address when you receive the confirmation
3. Monitor your email for form submissions
4. Customize the thank-you.html page as needed
5. Consider adding additional form fields if required 