import React from "react";
import {
  MapPin,
  Gauge,
  Building2,
  Settings,
  Fuel,
  PaintBucket,
  History,
} from "lucide-react";
import "./CarDetails.css";

function CarDetails({ car }) {
  if (!car) return null;

  return (
    <div className="car-details">
      {/* --- Header --- */}
      <h2 className="car-title">
        {car.year} {car.make} {car.model}
      </h2>
      <p className="car-price">${car.price?.toLocaleString()}</p>
      <p className="car-meta">
        <MapPin size={14} /> {car.location} •{" "}
        <Gauge size={14} /> {car.mileage?.toLocaleString()} mi
      </p>

      {/* --- Description --- */}
      {car.description && (
        <p className="car-description">{car.description}</p>
      )}

      {/* --- Dealer / Listing --- */}
      {car.listing && (
        <a
          href={car.listing}
          target="_blank"
          rel="noopener noreferrer"
          className="listing-link"
        >
          View Full Listing →
        </a>
      )}
      {car.dealer && (
        <p className="car-dealer">
          <Building2 size={14} /> Dealer: {car.dealer}
        </p>
      )}

      {/* --- Vehicle Metadata --- */}
      <div className="vehicle-meta">
        {car.transmission && (
          <p>
            <Settings size={14} /> {car.transmission}
          </p>
        )}
        {car.fuel && (
          <p>
            <Fuel size={14} /> {car.fuel}
          </p>
        )}
        {car.exteriorColor && (
          <p>
            <PaintBucket size={14} /> Exterior: {car.exteriorColor}
          </p>
        )}
        {car.interiorColor && <p>Interior: {car.interiorColor}</p>}
      </div>

      {/* --- History --- */}
      {car.history && (
        <div className="car-history">
          <h3>
            <History size={16} /> Vehicle History
          </h3>
          <ul>
            <li>
              Accidents: {car.history.accidentCount ?? "N/A"}
            </li>
            <li>
              Owner Count: {car.history.ownerCount ?? "N/A"}
            </li>
            <li>
              One Owner: {car.history.oneOwner ? "Yes" : "No"}
            </li>
            <li>
              Personal Use: {car.history.personalUse ? "Yes" : "No"}
            </li>
            <li>
              Usage Type: {car.history.usageType ?? "N/A"}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default CarDetails;
