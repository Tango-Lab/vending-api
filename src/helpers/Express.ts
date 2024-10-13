import { Request } from 'express';

export class ExpressHelper {
  /**
   * Retrieves the client's IP address from the request.
   *
   * This function prioritizes checking the `X-Forwarded-For` header, which is typically set
   * by proxies or load balancers, and may contain multiple IP addresses. If this header is not present,
   * it falls back to the direct connection IP from the request's socket.
   *
   * @param request - The Express.js request object.
   * @returns {string} - The IP address of the client or an empty string if not found.
   */
  static getClientIp(request: Request): string {
    // Check for the X-Forwarded-For header, which may be a comma-separated list of IPs
    const forwardedFor = request.headers['x-forwarded-for'];

    if (typeof forwardedFor === 'string') {
      // Return the first IP in the list, which is the client IP
      return forwardedFor.split(',')[0].trim();
    } else if (Array.isArray(forwardedFor)) {
      // In case it's an array, return the first IP
      return forwardedFor[0].trim();
    }

    // Fallback to the direct connection IP using the request's socket
    return request.socket?.remoteAddress ?? '';
  }
}
