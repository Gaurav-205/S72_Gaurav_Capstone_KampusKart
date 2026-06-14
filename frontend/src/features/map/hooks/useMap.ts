import { useState, useCallback, useMemo, useRef } from 'react';
import { Location, MapFilters } from '../types';
import { CAMPUS_LOCATIONS, UNIVERSITY_CENTER } from '../constants';

export const useMap = () => {
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [infoWindowPosition, setInfoWindowPosition] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [animationNotice, setAnimationNotice] = useState<string | null>(null);

  const [filters, setFilters] = useState<MapFilters>({
    search: '',
    category: 'All',
  });

  const animationInProgress = useRef(false);
  const pendingLocationRef = useRef<Location | null>(null);

  const filteredLocations = useMemo(() => {
    return CAMPUS_LOCATIONS.filter((loc) => {
      const matchesSearch =
        loc.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        loc.description?.toLowerCase().includes(filters.search.toLowerCase());
      const matchesCategory = filters.category === 'All' || loc.category === filters.category;
      return matchesSearch && matchesCategory;
    });
  }, [filters]);

  const handleMarkerClick = useCallback((location: Location) => {
    setSelectedLocation(location);
    setInfoWindowPosition({ lat: location.lat, lng: location.lng });
  }, []);

  const navigateToLocation = useCallback(
    (location: Location) => {
      if (!mapRef) return;

      if (animationInProgress.current) {
        pendingLocationRef.current = location;
        setAnimationNotice('Finishing current zoom...');
        return;
      }

      animationInProgress.current = true;
      setAnimationNotice(`Navigating to ${location.name}...`);

      const currentZoom = mapRef.getZoom() || 15;
      const targetZoom = 18;
      const zoomSteps = 10;
      const zoomInterval = 50;

      let currentStep = 0;
      const intervalId = setInterval(() => {
        if (currentStep >= zoomSteps) {
          clearInterval(intervalId);
          setTimeout(() => {
            handleMarkerClick(location);
            mapRef.panTo({ lat: location.lat, lng: location.lng });
            mapRef.setZoom(targetZoom);
            animationInProgress.current = false;
            setAnimationNotice(null);

            if (pendingLocationRef.current && pendingLocationRef.current.id !== location.id) {
              const next = pendingLocationRef.current;
              pendingLocationRef.current = null;
              navigateToLocation(next);
            }
          }, 100);
          return;
        }

        const progress = currentStep / zoomSteps;
        const newZoom = currentZoom + (targetZoom - currentZoom) * progress;
        mapRef.setZoom(newZoom);
        mapRef.panTo({ lat: location.lat, lng: location.lng });
        currentStep++;
      }, zoomInterval);
    },
    [mapRef, handleMarkerClick]
  );

  const recenterToUser = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(pos);
          if (mapRef) {
            mapRef.panTo(pos);
            mapRef.setZoom(17);
          }
        },
        (err) => console.warn('Geolocation error:', err)
      );
    }
  }, [mapRef]);

  return {
    mapRef,
    setMapRef,
    selectedLocation,
    setSelectedLocation,
    infoWindowPosition,
    setInfoWindowPosition,
    userLocation,
    animationNotice,
    filters,
    setFilters,
    filteredLocations,
    handleMarkerClick,
    navigateToLocation,
    recenterToUser,
  };
};
