
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

import {
  loginUser,
  getUserRoles,
} from "../../services/auth.service";

import "./LoginPage.css";

const LoginPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // Determine the user's destination based on role and account type.
  const getDashboardPath = (roles, accountType) => {
    if (roles.includes("super_admin")) {
      return "/nec";
    }

    if (roles.includes("nec_admin")) {
      return "/admin/workstations";
    }

    if (roles.includes("county_president")) {
      return "/dashboard";
    }

    if (roles.includes("individual_member")) {
      return "/individual/dashboard";
    }

    if (accountType === "individual_student") {
      return "/individual/application";
    }

    return "/dashboard";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password) {
      toast.error("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const loginData = await loginUser({
        email: formData.email,
        password: formData.password,
      });

      const userId = loginData?.user?.id;

      if (!userId) {
        throw new Error(
          "Login succeeded, but your account information could not be retrieved."
        );
      }

      // Fetch the user's assigned roles.
      const roles = await getUserRoles(userId);

      // Identify the account type from Supabase metadata.
      const accountType =
        loginData.user?.user_metadata?.account_type;

      // Redirect according to role priority and account type.
      const destination = getDashboardPath(
        roles,
        accountType
      );

      toast.success("Login successful!");

      navigate(destination, { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card login-card">

        <div className="auth-header">
          <h1>Welcome Back</h1>

          <p>
            Sign in to access your ACSP-Kenya account and
            continue your membership or County Association
            President application.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <div className="password-input-wrapper">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword((current) => !current)
                }
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>
            </div>
          </div>

          <div className="login-options">
            <Link to="/forgot-password">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="auth-submit-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register">
            Apply as County President
          </Link>
          {" or "}
          <Link to="/individual/register">
            Register as an Individual Student
          </Link>
        </div>

      </div>
    </main>
  );
};

export default LoginPage;
