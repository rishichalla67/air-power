import React, { useState } from 'react';
import { FaPhone, FaFire, FaSnowflake, FaEnvelope } from 'react-icons/fa';
import InquiryModal from './InquiryForm';

function Landing() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="bg-gradient-to-b from-blue-100 to-blue-300 min-h-screen">
      <header className="bg-blue-600 text-white py-6 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold text-red-500 drop-shadow-lg mb-2">AIR POWER</h1>
          <h2 className="text-2xl sm:text-3xl text-blue-300 mb-1">Heating & Air Conditioning</h2>
          <h3 className="text-xl sm:text-2xl text-blue-300 mb-4">Residential / Commercial</h3>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <a
              href="tel:904-314-8892"
              className="w-full sm:w-auto text-xl sm:text-2xl font-bold bg-blue-800 hover:bg-blue-700 transition-colors duration-300 px-6 py-3 rounded-full flex items-center justify-center"
            >
              <FaPhone className="mr-2" />
              904-314-8892
            </a>
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto bg-green-500 hover:bg-green-600 transition-colors duration-300 text-white font-bold text-xl py-3 px-6 rounded-full flex items-center justify-center"
            >
              <FaEnvelope className="mr-2" />
              Inquire Now
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto mt-8 px-4">
        <section className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-3xl font-bold text-center text-red-500">FREE ESTIMATES</h2>
          <p className="text-3xl font-bold text-center mb-4 text-red-500">On Replacement Systems</p>
          <p className="text-center text-xl">We Service All Brands • With Same Day Service</p>
          {/* <p className="text-center text-xl">Service, Repairs, Insulation, Maintenance</p> */}
          <p className="text-right text-md">CAC 1815504</p>
        </section>

        {/* <nav className="flex justify-center space-x-4 mb-8">
          {['Service', 'Repairs', 'Insulation', 'Maintenance'].map((item) => (
            <button key={item} className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded">
              {item}
            </button>
          ))}
        </nav> */}

        <section className="bg-gradient-to-r from-red-500 to-yellow-500 text-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-4xl font-bold text-center mb-4">BEAT THE HEAT without BREAKING the BANK!</h2>
          <h3 className="text-3xl text-center">FLAT RATES WITH NO HIDDEN CHARGES</h3>
        </section>

        <div className="grid md:grid-cols-2 gap-8">
          <section className="bg-blue-700 text-white rounded-lg shadow-lg p-6">
            <h3 className="text-2xl font-bold mb-4">We Sell the Best and Service the Rest</h3>
            <h4 className="text-xl font-semibold mb-2">Compare our Flat Rate to The Other Guy's Hourly Rates</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h5 className="font-bold text-yellow-300">AIR POWER</h5>
                <p>Service Call: $125</p>
                <p>Travel Time: Included</p>
                <p>Fuel Charge: Included</p>
                <p>Freon Reclaim: Included</p>
                <p className="font-bold text-yellow-300">Total: $125</p>
              </div>
              <div>
                <h5 className="font-bold text-yellow-300">The Other Guys</h5>
                <p>Service Call: $105.25</p>
                <p>Travel Time: $34.75</p>
                <p>Fuel Charge: $10.00</p>
                <p>Freon Reclaim: $10.00</p>
                <p className="font-bold text-yellow-300">Total: $160.00</p>
              </div>
            </div>
          </section>

          <section className="bg-blue-700 text-white rounded-lg shadow-lg p-6">
            <h3 className="text-2xl font-bold mb-4">We specialize in the following units:</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <FaSnowflake className="text-5xl text-blue-300 mr-4" />
                <div>
                  <h4 className="text-xl font-bold">Air Conditioning Units</h4>
                  <p>High-efficiency cooling systems</p>
                </div>
              </div>
              <div className="flex items-center">
                <FaFire className="text-5xl text-red-500 mr-4" />
                <div>
                  <h4 className="text-xl font-bold">Heating Systems</h4>
                  <p>Reliable and efficient heating solutions</p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <img src="/path-to-ac-unit-image.jpg" alt="AC Unit" className="w-1/2 inline-block" />
              <img src="/path-to-goodman-logo.jpg" alt="Goodman Logo" className="w-1/2 inline-block" />
            </div>
          </section>
        </div>
      </main>

      <footer className="bg-blue-800 text-white mt-8 py-4">
        <div className="container mx-auto text-center">
          <p>Started and Founded by Kenneth L. Crutcher</p>
          <p>&copy; 2006 Air Power Heating & Air Conditioning. All rights reserved.</p>
        </div>
      </footer>

      <InquiryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

export default Landing;