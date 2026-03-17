import React, { useEffect } from "react";

export default function Footer({ isAdmin, isSubadmin }) {
  useEffect(() => {
    const body = document.body;
    body.style.display = "flex";
    body.style.flexDirection = "column";
    body.style.minHeight = "100vh";

    const root = document.getElementById("root");
    if (root) root.style.flex = "1";
  }, []);

  return (
    <footer className="bg-black text-slate-200 mt-auto">
      <div className="container mx-auto px-6 py-10 flex flex-row md:flex-row md:justify-between gap-8">
         <div className="md:w-1/3">
            <h5 className="text-lg font-semibold text-white mb-3">Quick Links</h5>
            <ul className="space-y-2">
              <li>
                <a href="/" className="hover:text-emerald-400 transition">Home</a>
              </li>
              <li>
                <a href="/branches" className="hover:text-emerald-400 transition">Branches</a>
              </li>
              <li>
                <a href="/branch-assets-report" className="hover:text-emerald-400 transition">Asset Master</a>
              </li>
              {isAdmin && isSubadmin && (
                <li>
                  <a href="/requests" className="hover:text-emerald-400 transition">Request</a>
                </li>
              )}
              <li>
                <a href="/support" className="hover:text-emerald-400 transition">Support</a>
              </li>
              <li>
                <a href="/assetdashboard" className="hover:text-emerald-400 transition">Dashboard</a>
              </li>
            </ul>
              
          </div>
        {/* About Section */}
        <div className="md:w-1/3 justify-center ">
          <h4 className="text-xl font-bold text-white mb-3">Nepal Life Insurance</h4>
          <p className="text-sm md:text-base text-slate-300">
            Centralized system to manage devices, branches, and organizational records efficiently.
          </p>
        </div>
          {/* Social Links */}
          <div>
            <h5 className="text-lg font-semibold text-white mb-3">Follow Us</h5>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/Nepallife.Insurance"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-600 transition"
              >
                Facebook
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-400 transition"
              >
                Twitter
              </a>
              <a
                href="https://np.linkedin.com/company/nepallife-insurance"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-700 transition"
              >
                LinkedIn
              </a>
              <a
                href="https://www.instagram.com/nepallife.insurance"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-pink-500 transition"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>
              <hr className="border-slate-700 my-6" />
      {/* Footer Bottom */}
      <div className="bg-black text-slate-400 text-center text-sm py-4">
        © {new Date().getFullYear()} Project IMS — All rights reserved.
      </div>
    </footer>
  );
}
