export const signInContent = {
  meta: {
    title: "Sign In — EventConnect",
    description: "Sign in to your EventConnect account.",
  },
  heading: "Welcome Back",
  subheading: "Sign in to your EventConnect account",
  form: {
    email: {
      label: "Email",
      placeholder: "Enter your email address",
    },
    password: {
      label: "Password",
    },
    rememberMe: "Remember me",
    forgotPassword: "Forgot password?",
    submit: "Sign In",
    orDivider: "or continue with",
    google: "Continue with Google",
    footer: {
      prompt: "Don't have an account?",
      cta: "Sign Up",
    },
  },
} as const;
