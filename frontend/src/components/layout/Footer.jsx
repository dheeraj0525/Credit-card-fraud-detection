import React from "react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-800 bg-slate-900/40 py-4 text-center text-xs text-slate-500">
      <div className="container mx-auto px-4">
        &copy; {new Date().getFullYear()} FraudSense Security Systems. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;