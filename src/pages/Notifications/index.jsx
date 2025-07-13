import React, { useState } from 'react';
import JoditEditor from 'jodit-react';
import editorConfig from '../../data/joditConfig';
import { Dialog, DialogContent } from '@mui/material';
import { Select } from 'antd';

const tripStatusOptions = [
  { label: 'User has a trip', value: 'has_trip' },
  { label: 'User does not have a trip', value: 'no_trip' },
  { label: 'User will make a trip', value: 'will_make_trip' },
];

const Notifications = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    map: '',
    tripStatus: undefined,
  });
  const [showMapModal, setShowMapModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTripStatusChange = (value) => {
    setFormData((prev) => ({ ...prev, tripStatus: value }));
  };

  const isMapUrl = (url) => {
    const regex =
      /^(https?:\/\/)?(www\.)?(google\.[a-z.]+\/maps|maps\.google\.[a-z.]+|openstreetmap\.org\/|maps\.apple\.com\/)/i;
    return regex.test(url);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted', formData);
  };

  const renderTabContent = () => {
    return (
      <>
        <div>
          <label className="block mb-1 font-medium">User Trip Status</label>
          <Select
           size='large'
            style={{ width: '100%' }}
            placeholder="Select user trip status"
            options={tripStatusOptions}
            value={formData.tripStatus}
            onChange={handleTripStatusChange}
            allowClear
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <JoditEditor
            value={formData.description || ''}
            config={editorConfig}
            onBlur={(content) =>
              setFormData((prev) => ({ ...prev, description: content }))
            }
          />
        </div>
      </>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Notification</h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-5 rounded-[10px]"
      >
        {renderTabContent()}
        <div className="w-full flex justify-end items-center">
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors duration-200"
          >
            Send Notification
          </button>
        </div>
      </form>
    </div>
  );
};

export default Notifications;



