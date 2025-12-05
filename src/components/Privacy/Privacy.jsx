import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto mb-10">
      <h1 className="text-3xl font-bold mb-4 textTheme">Privacy Policy - SMS</h1>
      <p className="mb-4">
        SMS (School Management System) values your privacy and is committed to protecting the personal information of students, parents, teachers, and staff. This Privacy Policy explains how we collect, use, and safeguard information in accordance with Indian privacy regulations.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2 textTheme">Information We Collect</h2>
      <p className="mb-4">
        We may collect the following types of information:
      </p>
      <ul className="list-disc list-inside mb-4">
        <li>Student details: name, date of birth, admission number, class, academic records, attendance, and health information.</li>
        <li>Parent/guardian details: name, contact information, email, and emergency contacts.</li>
        <li>Teacher and staff details: name, contact information, employment details, and login credentials.</li>
        <li>Usage data: IP address, device information, login times, and activity within the SMS app.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2 textTheme">How We Use Your Information</h2>
      <p className="mb-4">
        The information collected is used solely to provide and improve school management services, including:
      </p>
      <ul className="list-disc list-inside mb-4">
        <li>Maintaining student academic records and attendance.</li>
        <li>Facilitating communication between school, students, and parents.</li>
        <li>Managing staff information and payroll.</li>
        <li>Ensuring secure access to SMS features for authorized users only.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2 textTheme">Data Security</h2>
      <p className="mb-4">
        SMS implements reasonable technical and organizational measures to protect personal data against unauthorized access, disclosure, or loss. However, no system can guarantee 100% security.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2 textTheme">Data Sharing</h2>
      <p className="mb-4">
        We do not sell or rent your personal information. Data may be shared with:
      </p>
      <ul className="list-disc list-inside mb-4">
        <li>Authorized school staff for academic and administrative purposes.</li>
        <li>Government authorities as required by law.</li>
        <li>Third-party service providers who assist with SMS operations under strict confidentiality agreements.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2 textTheme">Children's Privacy</h2>
      <p className="mb-4">
        SMS is primarily used by schools for students under 18. We take extra care to protect the privacy of children and do not collect unnecessary personal data.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2 textTheme">Changes to This Policy</h2>
      <p className="mb-4">
        We may update this Privacy Policy from time to time. Any changes will be posted on this page with the date of the latest update.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2 textTheme">Contact Us</h2>
      <p>
        If you have any questions or concerns regarding this Privacy Policy, please contact us at{" "}
        <a href="mailto:support@smsapp.com" className="textTheme underline">
          support@smsapp.com
        </a>.
      </p>
    </div>
  );
};

export default PrivacyPolicy;
