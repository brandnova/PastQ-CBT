import React from 'react';

const Login = () => {
    <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaEnvelope className="text-gray-400" />
            </div>
            <input
            type="email"
            name="email"
            id="email"
            required
            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            />
        </div>
    </div>

    <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaLock className="text-gray-400" />
            </div>
            <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            id="password"
            required
            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-10 sm:text-sm border-gray-300 rounded-md"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500"
            >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            </div>
        </div>
    </div>
};

export default Login;