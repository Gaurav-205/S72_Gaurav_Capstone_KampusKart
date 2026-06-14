/// <reference types="vite/client" />
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useLoadScript, InfoWindow, Libraries } from '@react-google-maps/api';
import { MapSkeleton } from '../../../components/common/SkeletonLoader';
import { FeatureModal } from '../../../components/common/FeatureModal';
import { useSearchSuggestions } from '../../../hooks/useSearchSuggestions';
import { FiTarget, FiNavigation, FiMapPin, FiInfo, FiList } from 'react-icons/fi';

import { useMap } from '../hooks/useMap';
import type { Location } from '../types';
import {
  MAP_OPTIONS,
  MAP_CONTAINER_STYLE,
  CAMPUS_LOCATIONS,
  UNIVERSITY_CENTER,
} from '../constants';
import { MapSidebar } from './MapSidebar';
import { MapInfoWindow } from './MapInfoWindow';

const GOOGLE_MAPS_LIBRARIES: Libraries = ['places', 'marker'] as Libraries;
const rawMapId = (import.meta.env.VITE_GOOGLE_MAPS_MAP_ID as string | undefined)?.trim() || '';
const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined)?.trim() || '';
const isDemoMode = !apiKey || apiKey === 'your_google_maps_api_key' || apiKey === '';

const GOOGLE_MAPS_OPTIONS = {
  ...MAP_OPTIONS,
  mapId: rawMapId,
};

const CampusMap: React.FC = () => {
  // Only call useLoadScript when not in demo mode
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: isDemoMode ? 'dummy-key' : apiKey,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const {
    mapRef,
    setMapRef,
    selectedLocation,
    setSelectedLocation,
    infoWindowPosition,
    setInfoWindowPosition,
    userLocation,
    filters,
    setFilters,
    filteredLocations,
    handleMarkerClick,
    navigateToLocation,
    recenterToUser,
  } = useMap();

  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [pendingDirections, setPendingDirections] = useState<Location | null>(null);

  // Normalization for interactive vector fallback
  const lats = CAMPUS_LOCATIONS.map((l) => l.lat);
  const lngs = CAMPUS_LOCATIONS.map((l) => l.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const getXY = useCallback(
    (lat: number, lng: number) => {
      const latRange = maxLat - minLat || 1;
      const lngRange = maxLng - minLng || 1;
      // Map latitude to Y (top is 82%, bottom is 18% to keep away from edges)
      const y = 82 - ((lat - minLat) / latRange) * 64;
      // Map longitude to X (left is 18%, right is 82%)
      const x = 18 + ((lng - minLng) / lngRange) * 64;
      return { x: `${x}%`, y: `${y}%` };
    },
    [maxLat, minLat, maxLng, minLng]
  );

  // Search Suggestions logic
  const buildSuggestions = useCallback((loc: Location, query: string): string[] => {
    const suggestions: string[] = [];
    const normalizedQuery = query.toLowerCase();
    if (loc.name.toLowerCase().includes(normalizedQuery)) suggestions.push(loc.name);
    if (loc.category?.toLowerCase().includes(normalizedQuery)) suggestions.push(loc.category);
    return suggestions;
  }, []);

  const { showSuggestions, setShowSuggestions, filteredSuggestions, searchRef } =
    useSearchSuggestions<Location>({
      searchInput: filters.search,
      items: CAMPUS_LOCATIONS,
      buildSuggestions,
    });

  // Responsive panel
  useEffect(() => {
    const handleResize = () => setIsPanelOpen(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Lock scroll
  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = 'auto';
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleDirections = (loc: Location) => {
    setPendingDirections(loc);
  };

  const confirmDirections = () => {
    if (pendingDirections) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${pendingDirections.lat},${pendingDirections.lng}`;
      window.open(url, '_blank');
      setPendingDirections(null);
    }
  };

  // Get color by category
  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'Entrance':
        return 'bg-orange-500 border-orange-200 text-white';
      case 'Academic':
        return 'bg-blue-500 border-blue-200 text-white';
      case 'Sports':
        return 'bg-emerald-500 border-emerald-200 text-white';
      case 'Landmark':
        return 'bg-rose-500 border-rose-200 text-white';
      case 'Administration':
        return 'bg-purple-500 border-purple-200 text-white';
      case 'Arts':
        return 'bg-pink-500 border-pink-200 text-white';
      default:
        return 'bg-gray-500 border-gray-200 text-white';
    }
  };

  // Map Sidebar Recenter/Nav wrapper that works with both Modes
  const handleLocationSelect = useCallback(
    (loc: Location) => {
      if (isDemoMode) {
        setSelectedLocation(loc);
        setInfoWindowPosition({ lat: loc.lat, lng: loc.lng });
      } else {
        navigateToLocation(loc);
      }
    },
    [navigateToLocation, setSelectedLocation, setInfoWindowPosition]
  );

  if (!isDemoMode && loadError) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-8 text-center bg-white">
        <h3 className="text-2xl font-black text-gray-900 mb-4">Map Loading Failed</h3>
        <p className="text-gray-500 mb-8 max-w-md">
          We couldn't load the campus map. Please check your connection or API key.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-[#181818] text-white rounded-xl font-bold hover:bg-[#00C6A7] transition-all"
        >
          Retry Loading
        </button>
      </div>
    );
  }

  if (!isDemoMode && !isLoaded) return <MapSkeleton />;

  return (
    <div className="h-screen w-full flex flex-col pt-[72px] bg-white overflow-hidden select-none">
      {/* Demo Warning Banner */}
      {isDemoMode && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between text-xs text-amber-800 font-medium z-20 shrink-0">
          <div className="flex items-center gap-2">
            <FiInfo className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Interactive Vector Blueprint Mode (Google Maps API Key not set in <code>.env</code>)
            </span>
          </div>
        </div>
      )}

      <div className="flex-grow flex flex-col md:flex-row min-h-0 relative">
        {/* Map Container */}
        <div className="flex-grow relative h-full bg-slate-50 overflow-hidden">
          {isDemoMode ? (
            /* Interactive Vector Fallback Map */
            <div className="absolute inset-0 w-full h-full bg-[#fafbfc] overflow-hidden flex items-center justify-center">
              {/* Grid Background Effect */}
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: `radial-gradient(#181818 1.5px, transparent 1.5px)`,
                  backgroundSize: '24px 24px',
                }}
              />

              {/* Stylized CAD Blueprint Blueprint Ring */}
              <div className="absolute w-[80vw] h-[80vw] rounded-full border border-gray-100 flex items-center justify-center pointer-events-none">
                <div className="absolute w-[60vw] h-[60vw] rounded-full border border-dashed border-gray-200/60" />
                <div className="absolute w-[40vw] h-[40vw] rounded-full border border-gray-100" />
              </div>

              {/* Styled Pathway Lines connecting building nodes */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                {/* Visual paths between nodes to feel like a real map layout */}
                {CAMPUS_LOCATIONS.slice(0, -1).map((loc, idx) => {
                  const p1 = getXY(loc.lat, loc.lng);
                  const p2 = getXY(CAMPUS_LOCATIONS[idx + 1].lat, CAMPUS_LOCATIONS[idx + 1].lng);
                  return (
                    <line
                      key={idx}
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke="#00C6A7"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                  );
                })}
              </svg>

              {/* Campus Location Pins */}
              {filteredLocations.map((loc) => {
                const { x, y } = getXY(loc.lat, loc.lng);
                const isSelected = selectedLocation?.id === loc.id;
                return (
                  <div
                    key={loc.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group"
                    style={{ left: x, top: y }}
                    onClick={() => {
                      setSelectedLocation(loc);
                      setInfoWindowPosition({ lat: loc.lat, lng: loc.lng });
                    }}
                  >
                    {/* Animated Pulsing Ring */}
                    <div
                      className={`absolute -inset-3 rounded-full transition-all duration-300 scale-75 opacity-0 group-hover:opacity-100 group-hover:scale-110 ${
                        isSelected
                          ? 'bg-[#00C6A7]/20 scale-125 opacity-100 animate-ping'
                          : 'bg-gray-400/10'
                      }`}
                    />

                    {/* Main Pin node */}
                    <div
                      className={`w-8 h-8 rounded-full border-2 shadow-lg flex items-center justify-center transition-all duration-300 transform ${
                        isSelected ? 'scale-125 ring-4 ring-[#00C6A7]/20' : 'hover:scale-110'
                      } ${getCategoryColor(loc.category)}`}
                    >
                      <FiMapPin className={`w-4 h-4 ${isSelected ? 'animate-bounce' : ''}`} />
                    </div>

                    {/* Simple Hover Tooltip */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-[#181818] text-white text-[10px] font-bold rounded shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                      {loc.name.split(',')[0]}
                    </div>
                  </div>
                );
              })}

              {/* Mock Info Window */}
              {selectedLocation && infoWindowPosition && (
                <div
                  className="absolute z-20 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-[280px] max-w-sm transform -translate-x-1/2 -translate-y-[110%] transition-all duration-300"
                  style={{
                    left: getXY(selectedLocation.lat, selectedLocation.lng).x,
                    top: getXY(selectedLocation.lat, selectedLocation.lng).y,
                  }}
                >
                  <MapInfoWindow
                    location={selectedLocation}
                    onClose={() => {
                      setSelectedLocation(null);
                      setInfoWindowPosition(null);
                    }}
                    onGetDirections={handleDirections}
                  />
                  {/* Speech Bubble Arrow */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-white" />
                </div>
              )}
            </div>
          ) : (
            /* Google Map Mode */
            <GoogleMap
              mapContainerStyle={MAP_CONTAINER_STYLE}
              center={UNIVERSITY_CENTER}
              zoom={16}
              onLoad={setMapRef}
              options={GOOGLE_MAPS_OPTIONS}
              onClick={() => {
                setSelectedLocation(null);
                setInfoWindowPosition(null);
              }}
            >
              {filteredLocations.map((loc) => (
                <React.Fragment key={loc.id}>
                  <InfoWindow
                    position={{ lat: loc.lat, lng: loc.lng }}
                    options={{ pixelOffset: new google.maps.Size(0, -40) }}
                  >
                    <div onClick={() => handleMarkerClick(loc)} className="cursor-pointer p-1">
                      <div
                        className={`w-3 h-3 rounded-full border-2 border-white shadow-md ${
                          selectedLocation?.id === loc.id
                            ? 'bg-[#00C6A7] scale-125'
                            : 'bg-[#181818]'
                        }`}
                      />
                    </div>
                  </InfoWindow>
                </React.Fragment>
              ))}

              {selectedLocation && infoWindowPosition && (
                <InfoWindow
                  position={infoWindowPosition}
                  onCloseClick={() => {
                    setSelectedLocation(null);
                    setInfoWindowPosition(null);
                  }}
                  options={{ pixelOffset: new google.maps.Size(0, -50) }}
                >
                  <MapInfoWindow
                    location={selectedLocation}
                    onClose={() => {
                      setSelectedLocation(null);
                      setInfoWindowPosition(null);
                    }}
                    onGetDirections={handleDirections}
                  />
                </InfoWindow>
              )}

              {userLocation && (
                <InfoWindow position={userLocation}>
                  <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-xl animate-bounce" />
                </InfoWindow>
              )}
            </GoogleMap>
          )}

          {/* Map Controls */}
          <div className="absolute right-4 bottom-6 flex flex-col gap-3 z-10">
            {!isDemoMode && (
              <button
                onClick={recenterToUser}
                className="p-4 bg-white text-gray-900 rounded-2xl shadow-2xl border-2 border-gray-100 hover:text-[#00C6A7] transition-all"
                title="Find my location"
              >
                <FiTarget className="w-6 h-6" />
              </button>
            )}
            <button
              onClick={() => setIsPanelOpen(!isPanelOpen)}
              className="p-4 bg-white text-gray-900 rounded-2xl shadow-2xl border-2 border-gray-100 hover:text-[#00C6A7] transition-all"
              title={isPanelOpen ? 'Close Sidebar' : 'Open Sidebar'}
            >
              <FiList className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Sidebar */}
        {isPanelOpen && (
          <MapSidebar
            locations={filteredLocations}
            onLocationSelect={handleLocationSelect}
            selectedLocationId={selectedLocation?.id}
            searchInput={filters.search}
            onSearchChange={(val) => setFilters((f) => ({ ...f, search: val }))}
            suggestions={filteredSuggestions}
            showSuggestions={showSuggestions}
            setShowSuggestions={setShowSuggestions}
            searchRef={searchRef as any}
          />
        )}
      </div>

      {/* Directions Modal */}
      <FeatureModal
        isOpen={!!pendingDirections}
        onClose={() => setPendingDirections(null)}
        title="Open in Google Maps?"
      >
        <div className="p-6 text-center">
          <div className="w-20 h-20 bg-teal-50 text-[#00C6A7] rounded-full flex items-center justify-center mx-auto mb-6">
            <FiNavigation className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-2">Navigate to Location</h3>
          <p className="text-gray-500 mb-8">
            This will open Google Maps in a new tab to provide step-by-step directions.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => setPendingDirections(null)}
              className="flex-1 px-6 py-4 border-2 border-gray-100 rounded-2xl font-bold text-gray-400 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={confirmDirections}
              className="flex-1 px-6 py-4 bg-[#181818] text-white rounded-2xl font-bold hover:bg-[#00C6A7] transition-all shadow-xl"
            >
              Open Maps
            </button>
          </div>
        </div>
      </FeatureModal>
    </div>
  );
};

export default CampusMap;
