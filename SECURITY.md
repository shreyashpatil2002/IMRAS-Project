# Security Policy

## Supported Versions

Currently supported versions of IMRAS:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please follow these steps:

1. **DO NOT** open a public issue
2. Email the details to: [your-email@example.com]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to expect

- Acknowledgment within 48 hours
- Regular updates on the progress
- Credit in the security advisory (if desired)

## Security Best Practices

### For Deployment

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong, unique `JWT_SECRET`
   - Rotate secrets regularly

2. **Database**
   - Use MongoDB authentication
   - Enable SSL/TLS for connections
   - Regular backups

3. **API Security**
   - Enable rate limiting
   - Use HTTPS in production
   - Validate all inputs
   - Implement CSRF protection

4. **User Authentication**
   - Enforce strong passwords
   - Implement account lockout after failed attempts
   - Use secure session management
   - Enable 2FA (recommended)

5. **Dependencies**
   - Regularly update dependencies
   - Monitor for vulnerabilities
   - Use `npm audit` regularly

## Known Security Considerations

1. **JWT Tokens**: Tokens are stored in localStorage. Consider httpOnly cookies for production.
2. **Rate Limiting**: Should be implemented for all API endpoints in production.
3. **CORS**: Configure properly for your production domain.

