import React from "react";

const TableView = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Table View</h2>
      <p>Table view content goes here</p>
      <div className="mt-4">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">ID</th>
              <th className="py-2 px-4 border-b text-left">Name</th>
              <th className="py-2 px-4 border-b text-left">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2 px-4 border-b">1</td>
              <td className="py-2 px-4 border-b">Item 1</td>
              <td className="py-2 px-4 border-b">100</td>
            </tr>
            <tr>
              <td className="py-2 px-4 border-b">2</td>
              <td className="py-2 px-4 border-b">Item 2</td>
              <td className="py-2 px-4 border-b">200</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableView;
