// import React from "react";
// import { useNavigate } from "react-router-dom";

// const Navbar = ({ activeTab, onTabChange }) => {
//   const navigate = useNavigate();

//   const menuItems = [
//     "Home",
//     "Summary",
//     "Charts",
//     "Map View",
//     "Table View",
//     "Admin Panel",
//   ];

//   const handleLogout = () => {
//     navigate("/login");
//   };

//   return (
//     <header className="w-full bg-white shadow-md border-b border-gray-200">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex items-center justify-between h-16">
//           {/* Logo */}
//           <div className="flex items-center">
//             <h1 className="text-2xl font-bold text-gray-900">Genius DB</h1>
//           </div>

//           {/* Navigation Tabs */}
//           <nav className="hidden md:flex space-x-1">
//             {menuItems.map((item) => {
//               const isActive = item === activeTab;
//               return (
//                 <button
//                   key={item}
//                   onClick={() => onTabChange(item)}
//                   className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
//                     isActive
//                       ? "bg-blue-600 text-white"
//                       : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
//                   }`}
//                 >
//                   {item}
//                 </button>
//               );
//             })}
//           </nav>

//           {/* Logout Button */}
//           <div className="flex items-center">
//             <button
//               onClick={handleLogout}
//               className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors duration-200"
//             >
//               Logout
//             </button>
//           </div>
//         </div>

//         {/* Mobile Navigation */}
//         <div className="md:hidden">
//           <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
//             {menuItems.map((item) => {
//               const isActive = item === activeTab;
//               return (
//                 <button
//                   key={item}
//                   onClick={() => onTabChange(item)}
//                   className={`block w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
//                     isActive
//                       ? "bg-blue-600 text-white"
//                       : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
//                   }`}
//                 >
//                   {item}
//                 </button>
//               );
//             })}
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Navbar;
