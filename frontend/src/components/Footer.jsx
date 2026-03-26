import React from 'react';
import { MessageCircle, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
      <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
        <div className="mb-4 md:mb-0 text-center md:text-left">
          <p className="font-semibold text-gray-700">© 2026 NISCO AIU Election Committee</p>
          <p>Secure, Anonymous, and Transparent.</p>
        </div>
        
        <div className="flex space-x-6">
            <p>Need a help?</p>
          {/* Replace the # with your actual WhatsApp link, e.g., https://wa.me/1234567890 */}
          <a href="https://wa.me/+601151159297" className="flex items-center hover:text-nisco-green transition-colors">
            <MessageCircle className="w-4 h-4 mr-1" /> WhatsApp Us
          </a>
          {/* Replace with actual support email */}
          <a href="mailto:ajogal.abubakar@student.aiu.edu.my" className="flex items-center hover:text-nisco-green transition-colors">
            <Mail className="w-4 h-4 mr-1" /> Email Us
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;