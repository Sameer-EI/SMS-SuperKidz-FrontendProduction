import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import image from "../../assets/auth-hero.png";
import { AuthContext } from "../../context/AuthContext";
import { constants } from "../../global/constants";
import { allRouterLink } from "../../router/AllRouterLinks";
import { validloginemail, validloginpassword } from "../../Validations/Validations";

export const Login = () => {
  const { LoginUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
 

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setFormError("");

    try {
      const response = await LoginUser({ email: data.email, password: data.password });
      console.log("Login response:", response);

      if (response && response["Message"] === "User logged in successfully") {
        const role = response.Roles?.[0] || "";
        const userId = response["User ID"] || "";

        // Fetch IDs for all roles
        const studentId = response.studentId || response.student_id || "";
        const guardianId = response.guardianId || response.guardian_id || "";
        const teacherId = response.teacherId || response.teacher_id || "";
        const officeStaffId = response.officeStaffId || response.office_staff_id || "";

        console.log("Role:", role, "TeacherId:", teacherId, "StudentId:", studentId);

        // Store in localStorage
        localStorage.setItem("access", response.access);
        localStorage.setItem("userRole", role);
        localStorage.setItem("userId", userId);
        if (studentId) localStorage.setItem("studentId", studentId);
        if (guardianId) localStorage.setItem("guardianId", guardianId);
        if (teacherId) localStorage.setItem("teacherId", teacherId);
        if (officeStaffId) localStorage.setItem("officeStaffId", officeStaffId);

        // Normalize role for redirect
        const normalizedRole = role.toLowerCase().replace(/[_\s]/g, "");
        let redirectPath = "";
        switch (normalizedRole) {
          case "director":
            redirectPath = allRouterLink.directorDashboard;
            break;
          case "officestaff":
            redirectPath = allRouterLink.officeStaffDashboard;
            break;
          case "guardian":
            redirectPath = allRouterLink.guardianDashboard;
            break;
          case "teacher":
            redirectPath = allRouterLink.teacherDashboard;
            break;
          case "student":
            redirectPath = allRouterLink.studentDashboard;
            break;
          default:
            redirectPath = allRouterLink.login; // fallback
        }

        navigate(redirectPath, { replace: true, state: { showSuccess: true } });
      } else {
        setFormError(response?.Message || "Invalid email or password");
      }
    } catch (err) {
      setFormError(
        err.response?.data?.Message ||
        err.response?.data?.message ||
        "Something went wrong. Please try again later."
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{constants.hideEdgeRevealStyle}</style>
      <div className="min-h-screen flex flex-col md:flex-row">
        <div className="hidden md:block md:w-2/3 formBgColor">
          <img src={image} alt="Authentication" className="w-full h-full object-cover" />
        </div>
        <div className="w-full md:w-1/2 lg:w-1/3 flex items-center justify-center p-4">
          <form className="w-full max-w-md space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <h1 className="text-3xl font-bold text-center mb-6">Login</h1>
            {/* Email */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-envelope text-sm"></i> Email
                </span>
              </label>
              <input
                type="email"
                placeholder="example@gmail.com"
                className="input input-bordered w-full focus:outline-none"
                autoComplete="on"
                {...register("email", { validate: (val) => validloginemail(val) || true })}
              />
              {errors.email && <span className="text-red-500 text-sm mt-1">{errors.email.message}</span>}
            </div>

            {/* Password */}
            <div className="form-control w-full relative">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <i className="fa-solid fa-lock text-sm"></i> Password
                </span>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="input w-full pr-10 focus:outline-none"
                autoComplete="on"
                {...register("password", { validate: (val) => validloginpassword(val) || true })}
              />
              <button
                type="button"
                className="passwordEyes text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`fa-solid ${showPassword ? "fa-eye" : "fa-eye-slash"}`}></i>
              </button>
              {errors.password && <span className="text-red-500 text-sm mt-1">{errors.password.message}</span>}
            </div>

            {formError && <div className="text-red-500 text-center font-medium">{formError}</div>}

            {/* Submit Button */}
            <div className="form-control w-full mt-6">
              <button type="submit" className="btn bgTheme btn-primary w-full">
                {loading ? <i className="fa-solid fa-spinner fa-spin mr-2"></i> : <i className="fa-solid fa-right-to-bracket mr-2"></i>}
                {loading ? "" : "Login"}
              </button>
            </div>

            {/* Forgot Password */}
            <div className="text-center mt-4">
              <Link
                to={`${allRouterLink.forgotPassword}`}
                className="text-sm textTheme hover:underline hover:text-[#4a17b1] font-medium"
              >
                <i className="fa-solid fa-key mr-2"></i> Forgot Password
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
