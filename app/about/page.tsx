import React from 'react';

import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function AboutPage() {
  return (
    <div className={`min-h-screen bg-background ${inter.className}`}>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-lg mb-6 leading-relaxed">
            AI News Hub is dedicated to bringing you the latest and most relevant news in the world of Artificial Intelligence. Our mission is to keep you informed about the rapidly evolving AI landscape, from groundbreaking research to practical applications across various industries.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">What We Offer</h2>
          <ul className="list-disc pl-8 mb-6 text-lg space-y-2">
            <li>Curated AI news from reputable sources</li>
            <li>In-depth analysis of AI trends and developments</li>
            <li>Interactive AI-powered chat for personalized news exploration</li>
            <li>Regular updates on NLP, Climate AI, Quantum ML, Robotics AI, AI Ethics, and ML in Business</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Contact Us</h2>
          <p className="text-lg mb-4">We value your feedback and inquiries. Feel free to reach out to us:</p>
          <ul className="list-none text-lg space-y-2">
            <li><strong>Email:</strong> <a href="mailto:info@ainewshub.com" className="text-blue-600 hover:underline">info@ainewshub.com</a></li>
            <li><strong>Phone:</strong> +1 (555) 123-4567</li>
            <li><strong>Address:</strong> 123 AI Street, Tech City, TC 12345, USA</li>
          </ul>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-6">Stay Connected</h2>
          <p className="text-lg mb-4">Follow us on social media for real-time updates and engaging discussions:</p>
          <div className="flex space-x-6 text-lg">
            <a href="#" className="text-blue-600 hover:underline">Twitter</a>
            <a href="#" className="text-blue-600 hover:underline">LinkedIn</a>
            <a href="#" className="text-blue-600 hover:underline">Facebook</a>
          </div>
        </section>
      </div>
    </div>
  );
}
