import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { LocateFixed, MapPin, TriangleAlert, RefreshCw, Check, Loader2 } from "lucide-react";
import Button from "./Button.jsx";
import { reverseGeocode } from "../utils/geocode.js";

// react-leaflet's default marker icon points at asset paths that don't
// resolve under Vite's bundler — this re-registers it with the bundled files.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const LOW_ACCURACY_METERS = 50;

const GEOLOCATION_ERROR_MESSAGES = {
  1: "Location permission was denied. Please allow location access for this site and try again.",
  2: "Your location couldn't be determined. Check your device's location settings and try again.",
  3: "Location request timed out. Please try again.",
};

/** Recenters the map only when `token` changes — i.e. on a fresh GPS fix,
 * never while the user is dragging the marker around. */
function RecenterOnDetect({ position, token }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, map.getZoom() < 15 ? 16 : map.getZoom());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);
  return null;
}

/**
 * Detects the user's real location (browser Geolocation API), reverse
 * geocodes it into an address, and lets them drag a marker to the actual
 * issue location before confirming.
 *
 * Calls onConfirm({ latitude, longitude, accuracy, address }) once the user
 * confirms. `accuracy` is null once the pin has been manually dragged, since
 * it no longer reflects a GPS reading.
 */
export default function LocationPicker({ onConfirm }) {
  const [status, setStatus] = useState("idle"); // idle | locating | error | ready
  const [errorMessage, setErrorMessage] = useState("");
  const [coords, setCoords] = useState(null); // { lat, lng, accuracy, adjusted }
  const [address, setAddress] = useState(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const [focusToken, setFocusToken] = useState(0);
  const geocodeRequestId = useRef(0);

  const lookupAddress = async (lat, lng) => {
    const requestId = ++geocodeRequestId.current;
    setAddressLoading(true);
    const result = await reverseGeocode(lat, lng);
    // Ignore stale responses if the pin moved again before this returned.
    if (requestId === geocodeRequestId.current) {
      setAddress(result);
      setAddressLoading(false);
    }
  };

  const detectLocation = () => {
    if (!("geolocation" in navigator)) {
      setStatus("error");
      setErrorMessage("Geolocation isn't supported by this browser.");
      return;
    }

    setStatus("locating");
    setErrorMessage("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setCoords({ lat: latitude, lng: longitude, accuracy, adjusted: false });
        setStatus("ready");
        setFocusToken((t) => t + 1);
        lookupAddress(latitude, longitude);
      },
      (err) => {
        setStatus("error");
        setErrorMessage(GEOLOCATION_ERROR_MESSAGES[err.code] || "Something went wrong while detecting your location.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleMarkerDragEnd = (event) => {
    const { lat, lng } = event.target.getLatLng();
    setCoords((prev) => ({ ...prev, lat, lng, adjusted: true }));
    lookupAddress(lat, lng);
  };

  const handleConfirm = () => {
    if (!coords) return;
    onConfirm({
      latitude: coords.lat,
      longitude: coords.lng,
      accuracy: coords.adjusted ? null : coords.accuracy,
      address: address || "Address unavailable",
    });
  };

  const isLowAccuracy = coords && !coords.adjusted && typeof coords.accuracy === "number" && coords.accuracy > LOW_ACCURACY_METERS;

  return (
    <div className="rounded-xl2 border border-ink-100 bg-white p-6 shadow-card sm:p-8">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-civic-600 text-white">
          <MapPin className="h-4 w-4" strokeWidth={2.2} />
        </span>
        <h3 className="font-display text-lg font-semibold text-ink-900">Confirm Location</h3>
      </div>

      {(status === "idle" || status === "locating") && (
        <div className="mt-6 flex flex-col items-center py-6 text-center">
          <p className="max-w-sm text-sm text-ink-500">
            Civic-Eye needs your location to pin this report on the map. Your browser will ask for
            permission first.
          </p>
          <Button
            variant="signal"
            size="lg"
            className="mt-5"
            icon={status === "locating" ? Loader2 : LocateFixed}
            onClick={detectLocation}
            disabled={status === "locating"}
          >
            {status === "locating" ? "Detecting location..." : "Use My Current Location"}
          </Button>
        </div>
      )}

      {status === "error" && (
        <div className="mt-6 flex flex-col items-center py-6 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-alert-100 text-alert-600">
            <TriangleAlert className="h-5 w-5" strokeWidth={2} />
          </span>
          <p className="mt-3 max-w-sm text-sm text-ink-700">{errorMessage}</p>
          <Button variant="outline" className="mt-5" icon={RefreshCw} onClick={detectLocation}>
            Try Again
          </Button>
        </div>
      )}

      {status === "ready" && coords && (
        <div className="mt-6 space-y-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-300">
              {coords.adjusted ? "Adjusted location" : "Location detected"}
            </p>
            <p className="mt-1 font-display text-lg font-semibold text-ink-900">
              {addressLoading ? "Looking up address..." : address || "Address unavailable"}
            </p>
            <p className="mt-1 text-sm text-ink-500">
              {coords.adjusted
                ? "Pin manually adjusted"
                : `Accuracy: approximately ${Math.round(coords.accuracy)} meters`}
            </p>
          </div>

          {isLowAccuracy && (
            <p className="flex items-start gap-2 rounded-xl bg-alert-100 px-4 py-3 text-sm text-alert-600">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
              Location accuracy is low. You can adjust the pin manually.
            </p>
          )}

          <div className="overflow-hidden rounded-xl border border-ink-100">
            <MapContainer
              center={[coords.lat, coords.lng]}
              zoom={16}
              scrollWheelZoom={false}
              style={{ height: "280px", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker
                position={[coords.lat, coords.lng]}
                draggable
                eventHandlers={{ dragend: handleMarkerDragEnd }}
              />
              <RecenterOnDetect position={[coords.lat, coords.lng]} token={focusToken} />
            </MapContainer>
          </div>

          <p className="text-xs text-ink-300">
            Drag the pin to the exact spot of the issue if it isn't where you're standing.
          </p>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button variant="signal" icon={Check} onClick={handleConfirm}>
              Confirm Location
            </Button>
            <Button variant="outline" icon={RefreshCw} onClick={detectLocation}>
              Change Location
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
