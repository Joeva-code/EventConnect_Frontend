export const forgotPasswordContent = {
  meta: {
    title: "Forgot Password — EventConnect",
    description: "Reset the password for your EventConnect account.",
  },
  heading: "Forgot your password?",
  subheading: "Enter your email and we'll send you a link to reset it.",
  form: {
    email: {
      label: "Email",
      placeholder: "Enter your email address",
    },
    submit: "Send Reset Link",
    backToSignIn: "Back to Sign In",
  },
  success: {
    heading: "Check your email",
    body: "We've sent a password reset link to",
    backToSignIn: "Back to Sign In",
  },
} as const;
