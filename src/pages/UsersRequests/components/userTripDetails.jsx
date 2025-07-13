import { Modal } from "antd";
import React from "react";

const UserTripDetails = ({ isModalOpen, setIsModalOpen , rowData}) => {
  return (
    <Modal
      title="Tour Details"
      open={isModalOpen}
      onOk={() => setIsModalOpen(false)}
      onCancel={() => setIsModalOpen(false)}
    >
      

      <TravelItinerary />
        
      
    </Modal>
  );
};

export default UserTripDetails;




const TravelItinerary = () => {
  const [language, setLanguage] = useState('en');
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedAccommodation, setSelectedAccommodation] = useState({});
  const [selectedTransfer, setSelectedTransfer] = useState({});

  // Helper function to get text in selected language
  const getText = (textObj) => {
    return textObj[language] || textObj.en;
  };

  // Get icon for transfer category
  const getTransferIcon = (category) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('flight')) return <Plane className="w-5 h-5" />;
    if (categoryLower.includes('bus')) return <Bus className="w-5 h-5" />;
    if (categoryLower.includes('bike')) return <Bike className="w-5 h-5" />;
    return <Car className="w-5 h-5" />;
  };

  // Get icon for accommodation category
  const getAccommodationIcon = (category) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('hotel')) return <Building className="w-5 h-5" />;
    if (categoryLower.includes('apartment')) return <Home className="w-5 h-5" />;
    return <Building className="w-5 h-5" />;
  };

  const AccommodationCard = ({ accommodation, dayIndex }) => (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden border-2 transition-all duration-300 ${
      selectedAccommodation[dayIndex] === accommodation.id 
        ? 'border-blue-500 ring-2 ring-blue-200' 
        : 'border-gray-200 hover:border-gray-300'
    }`}>
      <div className="relative h-48">
        <img 
          src={accommodation.image} 
          alt={getText(accommodation.name)}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pjwvc3ZnPg==';
          }}
        />
        <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-full px-3 py-1 flex items-center space-x-1">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="text-sm font-medium">{accommodation.rating}</span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {getText(accommodation.name)}
          </h3>
          <div className="flex items-center space-x-1 text-gray-600">
            {getAccommodationIcon(getText(accommodation.category))}
            <span className="text-sm">{getText(accommodation.category)}</span>
          </div>
        </div>
        
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4" />
            <span>{getText(accommodation.location)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Check-in/out: {accommodation.check_in_out}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Car className="w-4 h-4" />
            <span>Parking: {getText(accommodation.parking)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-gray-500">({accommodation.reviews} reviews)</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="text-2xl font-bold text-blue-600">
            ${accommodation.price_per_night}
            <span className="text-sm text-gray-500 font-normal">/night</span>
          </div>
          <button
            onClick={() => setSelectedAccommodation(prev => ({
              ...prev,
              [dayIndex]: prev[dayIndex] === accommodation.id ? null : accommodation.id
            }))}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              selectedAccommodation[dayIndex] === accommodation.id
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {selectedAccommodation[dayIndex] === accommodation.id ? 'Selected' : 'Select'}
          </button>
        </div>
      </div>
    </div>
  );

  const TransferCard = ({ transfer, dayIndex }) => (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden border-2 transition-all duration-300 ${
      selectedTransfer[dayIndex] === transfer.id 
        ? 'border-green-500 ring-2 ring-green-200' 
        : 'border-gray-200 hover:border-gray-300'
    }`}>
      <div className="relative h-32">
        <img 
          src={transfer.image} 
          alt={getText(transfer.name)}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pjwvc3ZnPg==';
          }}
        />
        <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-full px-2 py-1 flex items-center space-x-1">
          <Star className="w-3 h-3 text-yellow-400 fill-current" />
          <span className="text-xs font-medium">{transfer.rating}</span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-md font-semibold text-gray-900">
            {getText(transfer.name)}
          </h3>
          <div className="flex items-center space-x-1 text-gray-600">
            {getTransferIcon(getText(transfer.category))}
          </div>
        </div>
        
        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex items-center justify-between">
            <span>Duration:</span>
            <span>{getText(transfer.duration)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Capacity:</span>
            <span className="flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>{transfer.capacity}</span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Difficulty:</span>
            <span>{getText(transfer.difficulty)}</span>
          </div>
          <div className="text-xs text-gray-500">
            ({transfer.reviews} reviews)
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="text-xl font-bold text-green-600">
            ${transfer.price}
          </div>
          <button
            onClick={() => setSelectedTransfer(prev => ({
              ...prev,
              [dayIndex]: prev[dayIndex] === transfer.id ? null : transfer.id
            }))}
            className={`px-3 py-1 rounded-lg font-medium text-sm transition-all duration-200 ${
              selectedTransfer[dayIndex] === transfer.id
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {selectedTransfer[dayIndex] === transfer.id ? 'Selected' : 'Select'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Iceland Travel Itinerary</h1>
            <p className="text-gray-600">Plan your perfect Icelandic adventure</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setLanguage('en')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                language === 'en' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('ar')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                language === 'ar' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              العربية
            </button>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-8">
        {days.map((day, index) => (
          <div key={day.day} className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Day Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-white bg-opacity-20 rounded-full p-3">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Day {day.day}</h2>
                    <p className="text-blue-100">{day.date}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-blue-200" />
                  <span className="text-xl font-semibold">{getText(day.location)}</span>
                </div>
              </div>
              <p className="mt-4 text-blue-100">{getText(day.description)}</p>
            </div>

            {/* Day Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Accommodation Section */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Building className="w-5 h-5 text-blue-600" />
                    <span>Accommodation Options</span>
                  </h3>
                  <div className="space-y-4">
                    {day.accommodation.map((accommodation) => (
                      <AccommodationCard 
                        key={accommodation.id} 
                        accommodation={accommodation} 
                        dayIndex={index}
                      />
                    ))}
                  </div>
                </div>

                {/* Transfer Section */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Car className="w-5 h-5 text-green-600" />
                    <span>Transfer Options</span>
                  </h3>
                  <div className="space-y-4">
                    {day.transfers.map((transfer) => (
                      <TransferCard 
                        key={transfer.id} 
                        transfer={transfer} 
                        dayIndex={index}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Trip Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Total Days</h4>
            <p className="text-2xl font-bold text-blue-600">{days.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2">Selected Accommodations</h4>
            <p className="text-2xl font-bold text-green-600">
              {Object.values(selectedAccommodation).filter(Boolean).length}
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 mb-2">Selected Transfers</h4>
            <p className="text-2xl font-bold text-purple-600">
              {Object.values(selectedTransfer).filter(Boolean).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

