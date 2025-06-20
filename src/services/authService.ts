import emailjs from 'emailjs-com';

class AuthService {
  private readonly OTP_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_ATTEMPTS = 3;
  private otpStore: Map<string, { otp: string; expiresAt: number; attempts: number }> = new Map();

  // EmailJS Configuration - Replace these with your actual credentials
  private readonly EMAILJS_CONFIG = {
    serviceId: 'service_3uano3i', // Replace with your EmailJS service ID
    templateId: 'template_xzne5rd', // Replace with your EmailJS template ID
    userId: '6IXn9qDThhQLQKdjt' // Replace with your EmailJS user ID (public key)
  };

  constructor() {
    // Initialize EmailJS when the service is created
    this.initialize();
  }

  // Initialize EmailJS
  initialize() {
    try {
      emailjs.init(this.EMAILJS_CONFIG.userId);
      console.log('✅ EmailJS initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize EmailJS:', error);
    }
  }

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOTP(email: string): Promise<boolean> {
    try {
      const otp = this.generateOTP();
      const expiresAt = Date.now() + this.OTP_EXPIRY_TIME;

      // Store OTP
      this.otpStore.set(email, {
        otp,
        expiresAt,
        attempts: 0
      });

      // For demo purposes, show OTP in console
      console.log(`🔐 OTP for ${email}: ${otp}`);
      console.log(`⏰ Expires in 5 minutes`);
      
      // Send email using EmailJS
      try {
        const templateParams = {
          to_email: email,
          to_name: email.split('@')[0], // Use email prefix as name
          otp_code: otp,
          expires_in: '5 minutes',
          app_name: 'AI Invoice Processor',
          from_name: 'AI Invoice Processor'
        };

        const response = await emailjs.send(
          this.EMAILJS_CONFIG.serviceId,
          this.EMAILJS_CONFIG.templateId,
          templateParams
        );
        
        console.log('✅ Email sent successfully via EmailJS:', response);
        return true;
      } catch (emailError: any) {
        console.error('❌ EmailJS failed:', emailError);
        
        // Check if it's a configuration error
        if (emailError.text?.includes('Invalid') || emailError.status === 400) {
          console.error('🔧 Please check your EmailJS configuration in authService.ts');
        }
        
        // Still return true for demo purposes (OTP shown in console)
        return true;
      }

    } catch (error) {
      console.error('Failed to send OTP:', error);
      return false;
    }
  }

  verifyOTP(email: string, inputOTP: string): { success: boolean; message: string } {
    const otpData = this.otpStore.get(email);

    if (!otpData) {
      return { success: false, message: 'No OTP found for this email. Please request a new one.' };
    }

    if (Date.now() > otpData.expiresAt) {
      this.otpStore.delete(email);
      return { success: false, message: 'OTP has expired. Please request a new one.' };
    }

    if (otpData.attempts >= this.MAX_ATTEMPTS) {
      this.otpStore.delete(email);
      return { success: false, message: 'Maximum attempts exceeded. Please request a new OTP.' };
    }

    if (otpData.otp !== inputOTP) {
      otpData.attempts++;
      return { 
        success: false, 
        message: `Invalid OTP. ${this.MAX_ATTEMPTS - otpData.attempts} attempts remaining.` 
      };
    }

    // OTP verified successfully
    this.otpStore.delete(email);
    return { success: true, message: 'OTP verified successfully!' };
  }

  isOTPExpired(email: string): boolean {
    const otpData = this.otpStore.get(email);
    if (!otpData) return true;
    return Date.now() > otpData.expiresAt;
  }

  getOTPTimeRemaining(email: string): number {
    const otpData = this.otpStore.get(email);
    if (!otpData) return 0;
    const remaining = otpData.expiresAt - Date.now();
    return Math.max(0, Math.ceil(remaining / 1000));
  }

  login(email: string): void {
    const user = { email, isAuthenticated: true };
    localStorage.setItem('user', JSON.stringify(user));
  }

  logout(): void {
    localStorage.removeItem('user');
  }

  getCurrentUser(): { email: string; isAuthenticated: boolean } | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    return user?.isAuthenticated || false;
  }
}

export const authService = new AuthService();