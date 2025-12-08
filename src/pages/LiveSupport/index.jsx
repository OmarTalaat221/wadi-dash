import React from "react";

const LiveSupport = () => {
  return (
    <>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Social Media Chat</title>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
      <div className="">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Left sidebar - Chat list */}
          <div className="w-full md:w-1/3 bg-white rounded-lg shadow">
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center border-slate-300">
              <h2 className="text-xl font-bold">Messages</h2>
            </div>
            {/* Search */}
            <div className="p-3 border-b border-slate-300">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full bg-gray-100 rounded-full py-2 px-4 pl-10 focus:outline-none"
                />
                <i className="fas fa-search absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            {/* Chat list */}
            <div className="overflow-y-auto" style={{ height: 500 }}>
              {/* Instagram Chat Item */}
              <div className="p-3 border-b flex items-center hover:bg-gray-50 cursor-pointer border-slate-300">
                <div className="relative">
                  <img
                    src="https://randomuser.me/api/portraits/women/44.jpg"
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">dorcas_</h3>
                    <span className="text-xs text-gray-500">2m ago</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    Hey! How are you doing?
                  </p>
                </div>
              </div>
              {/* Twitter Chat Item */}
              <div className="p-3 border-b flex items-center hover:bg-gray-50 cursor-pointer border-slate-300">
                <div className="relative">
                  <img
                    src="https://randomuser.me/api/portraits/men/32.jpg"
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">intrepidusvision</h3>
                    <span className="text-xs text-gray-500">1h ago</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    Check out this cool article I found!
                  </p>
                </div>
              </div>
              {/* More chat items would go here */}
            </div>
          </div>
          {/* Right side - Chat window */}
          <div
            className="w-full md:w-2/3 bg-white rounded-lg shadow flex flex-col"
            style={{ height: 600 }}
          >
            {/* Chat header */}
            <div className="p-4 border-b flex items-center border-slate-300">
              <img
                src="https://randomuser.me/api/portraits/women/44.jpg"
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="ml-3">
                <h3 className="font-medium">
                  dorcas_
                  <p className="text-xs text-gray-500">Active now</p>
                </h3>
              </div>
            </div>
            {/* Messages area */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {/* Incoming message */}
              <div className="flex mb-4">
                <img
                  src="https://images.unsplash.com/photo-1686670798036-675839253a0f?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover mt-1"
                />
                <div className="ml-3">
                  <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm max-w-xs">
                    <p>Hey there! How's it going?</p>
                  </div>
                  <span className="text-xs text-gray-500 mt-1 block">
                    10:30 AM
                  </span>
                </div>
              </div>
              {/* Outgoing message */}
              <div className="flex mb-4 justify-end">
                <div className="mr-3 text-right">
                  <div className="bg-blue-500 text-white p-3 rounded-lg rounded-tr-none shadow-sm max-w-xs">
                    <p>I'm doing great! Just working on some new projects.</p>
                  </div>
                  <span className="text-xs text-gray-500 mt-1 block">
                    10:32 AM <i className="fas fa-check ml-1 text-blue-500" />
                  </span>
                </div>
                <img
                  src="https://randomuser.me/api/portraits/men/1.jpg"
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover mt-1"
                />
              </div>
            </div>
            {/* Message input */}
            <div className="p-3 border-t border-slate-300">
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="Message..."
                  className="flex-1 bg-gray-100 rounded-full py-2 px-4 focus:outline-none"
                />
                <button className="ml-2 w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
                  <i className="fas fa-paper-plane" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LiveSupport;
