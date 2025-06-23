import React from "react";
import { useNavigate } from "react-router-dom";

const PageNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 px-6 text-center">
      <h1 className="text-7xl font-extrabold text-emerald-500 mb-4">404</h1>
      <h2 className="text-3xl font-semibold text-white mb-2">Page Not Found</h2>
      <p className="text-gray-400 max-w-md mb-6">
        Sorry, the page you are looking for doesn't exist or has been moved. Please check the URL or return to the homepage.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-md text-lg font-medium"
          onClick={() => navigate("/")}
        >
          Go to Homepage
        </button>

        <button
          className="border border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 px-6 py-3 rounded-md text-lg font-medium"
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default PageNotFound;
