import React, { useContext, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { fetchRoles } from "../../../services/api/Api";
import { SuccessModal } from "../../Modals/SuccessModal";
import { AuthContext } from "../../../context/AuthContext";

export const CreateSalaryExpense = () => {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedEmployeeName, setSelectedEmployeeName] = useState("");
  const [apiError, setApiError] = useState("");
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const modalRef = useRef();
  const dropdownRef = useRef();

  const { authTokens, axiosInstance } = useContext(AuthContext);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const selectedRole = watch("role");
  const selectedEmployee = watch("employee");

  const getFullName = (employee) => {
    if (!employee) return "";
    return `${employee.first_name || ""} ${employee.last_name || ""}`.trim();
  };

  const getRole = async () => {
    try {
      const fetchedRoles = await fetchRoles();
      setRoles(fetchedRoles || []);
    } catch (error) {
      console.log("Could not get roles", error.message);
      setRoles([]);
    }
  };

  const getRoleNameById = (roleId) => {
    if (!roleId) return null;
    const role = roles.find((r) => r.id == roleId);
    return role ? role.name : "";
  };

  const filteredRoles = roles.filter(
    (role) =>
      role && (role.name === "teacher" || role.name === "office staff")
  );

  const filteredEmployees = employees.filter(
    (employee) =>
      employee &&
      getFullName(employee) &&
      getFullName(employee).toLowerCase().includes(searchInput.toLowerCase())
  );

  const getEmployee = async () => {
    try {
      if (selectedRole) {
        const roleName = getRoleNameById(selectedRole);
        if (roleName) {
          const { data } = await axiosInstance.get(
            `/d/Employee/get_emp/?role=${roleName}`
          );
          const sortedEmployees = (data || []).sort((a, b) => {
            const nameA = `${a.first_name || ""} ${a.last_name || ""}`.trim().toLowerCase();
            const nameB = `${b.first_name || ""} ${b.last_name || ""}`.trim().toLowerCase();
            return nameA.localeCompare(nameB);
          });
          setEmployees(sortedEmployees);
        }
      } else {
        setEmployees([]);
      }
    } catch (error) {
      console.log("Could not get employees", error.message);
      setEmployees([]);
    }
  };

  useEffect(() => {
    getRole();
  }, []);

  //  Reset employee field whenever role changes

  useEffect(() => {
    setValue("employee", "");
    setSelectedEmployeeName("");
    setEmployees([]);
    setSearchInput("");
    getEmployee();
  }, [selectedRole]);


  useEffect(() => {
    if (selectedEmployee && employees.length > 0) {
      const employee = employees.find(
        (e) => e && e.id && e.id.toString() == selectedEmployee.toString()
      );
      if (employee) {
        setSelectedEmployeeName(getFullName(employee));
      }
    } else {
      setSelectedEmployeeName("");
    }
  }, [selectedEmployee, employees]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const payload = {
        user: Number(data.employee),
        joining_date: data.joiningDate,
        base_salary: data.baseSalary,
      };
      await axiosInstance.post("/d/Employee/create_emp/", payload);
      modalRef.current.show(); // success modal
    } catch (err) {
      const msg = err.response?.data?.error || "Something Went Wrong. Try again";
      setErrorMessage(msg);
      setErrorModalOpen(true); // show error modal
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-5 bg-gray-50 dark:bg-gray-900 mb-24 md:mb-10">
      <div className="w-full max-w-7xl mx-auto p-6 bg-base-100 dark:bg-gray-800 rounded-box my-5 shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
          <i className="fa-solid fa-money-bill-wave w-5 mr-5"></i>
          Create Salary
        </h1>

        {apiError && (
          <div className="border border-error/50 rounded-lg p-4 mb-6 bg-white dark:bg-red-900">
            <div className="flex items-center text-error dark:text-red-400">
              <i className="fa-solid fa-circle-exclamation mr-2"></i>
              <span className="font-medium">{apiError}</span>
            </div>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Role */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-1 text-gray-700 dark:text-gray-300">
                  <i className="fa-solid fa-school text-sm"></i>
                  Role <span className="text-error">*</span>
                </span>
              </label>
              <select
                className="select select-bordered w-full focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 capitalize"
                {...register("role", { required: "Role is required" })}
              >
                <option value="">Select Role</option>
                {filteredRoles?.map(
                  (role) =>
                    role && (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    )
                )}
              </select>
              {errors.role && (
                <p className="text-error text-sm mt-1">{errors.role.message}</p>
              )}
            </div>

            {/* Employee */}
            <div className="form-control relative" ref={dropdownRef}>
              <label className="label">
                <span className="label-text flex items-center gap-1 text-gray-700 dark:text-gray-300">
                  <i className="fa-solid fa-user text-sm"></i>
                  Employee <span className="text-error">*</span>
                </span>
              </label>

              {/* Invisible input for react-hook-form validation */}
              <input
                type="hidden"
                {...register("employee", { required: "Employee is required" })}
              />

              <div
                className={`input input-bordered w-full flex items-center justify-between cursor-pointer bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border ${errors.employee
                  ? ""
                  : "border-gray-300 dark:border-gray-600"
                  }`}
                onClick={() => setShowDropdown(!showDropdown)}
              >
                {selectedEmployeeName || "Select Employee"}
                <div >
                  <span class="arrow">&#9662;</span>
                </div>
              </div>

              {showDropdown && (
                <div className="absolute z-10 bg-white dark:bg-gray-700 rounded w-full mt-1 shadow-lg border border-gray-300 dark:border-gray-600">
                  <div className="p-2 sticky top-0 shadow-sm bg-white dark:bg-gray-700">
                    <input
                      type="text"
                      placeholder="Search Employee..."
                      className="input input-bordered w-full focus:outline-none bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-500"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                    />
                  </div>

                  <div className="max-h-40 overflow-y-auto">
                    {filteredEmployees.length > 0 ? (
                      filteredEmployees.map(
                        (employee) =>
                          employee && (
                            <p
                              key={employee.id}
                              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer text-gray-800 dark:text-gray-200 capitalize"
                              onClick={() => {
                                setValue("employee", employee.id.toString(), {
                                  shouldValidate: true,
                                });
                                setSelectedEmployeeName(getFullName(employee));
                                setSearchInput("");
                                setShowDropdown(false);
                              }}
                            >
                              {getFullName(employee)}
                            </p>
                          )
                      )
                    ) : (
                      <p className="p-2 text-gray-500 dark:text-gray-400">
                        No employees found
                      </p>
                    )}
                  </div>
                </div>
              )}

              {errors.employee && (
                <p className="text-error text-sm">{errors.employee.message}</p>
              )}
            </div>

            {/* Joining Date */}
            {/* <div className="form-control">
            <label className="label">
              <span className="label-text flex items-center gap-1 text-gray-700 dark:text-gray-300">
                <i className="fa-solid fa-calendar-days text-sm"></i>
                Joining Date <span className="text-error">*</span>
              </span>
            </label>
            <input
              type="date"
              className="input input-bordered w-full focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"
              {...register("joiningDate", {
                required: "Joining date is required",
              })}
            />
            {errors.joiningDate && (
              <p className="text-error text-sm mt-1">
                {errors.joiningDate.message}
              </p>
            )}
          </div> */}

            {/* Base Salary */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-1 text-gray-700 dark:text-gray-300">
                  <i className="fa-solid fa-sack-dollar text-sm"></i>
                  Base Salary <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="number"
                min={0}
                placeholder="Enter Base Salary e.g: 15000"
                className="input input-bordered w-full focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"
                {...register("baseSalary", {
                  required: "Base salary is required",
                  min: { value: 0, message: "Salary must be positive" },
                })}
              />
              {errors.baseSalary && (
                <p className="text-error text-sm mt-1">{errors.baseSalary.message}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-center pt-6 gap-4">
            <button
              type="submit"
              className="btn bgTheme text-white w-full md:w-40"
            >
              {loading ? (
                <i className="fa-solid fa-spinner fa-spin mr-2"></i>
              ) : (
                <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>
              )}
              {loading ? "" : "Create"}
            </button>
          </div>
        </form>

        <SuccessModal ref={modalRef} />
        {errorModalOpen && (
           <dialog open className="modal modal-open">
            <div className="modal-box dark:bg-gray-800 dark:text-gray-100">
              <h3 className="font-bold text-lg">Create Salary</h3>
              <p className="py-4">{errorMessage}</p>
              <div className="modal-action">
                <button
                  className="btn bgTheme text-white w-30"
                  onClick={() => setErrorModalOpen(false)}
                >
                  OK
                </button>
              </div>
            </div>
          </dialog>
        )}
      </div>
    </div>
  );
};
