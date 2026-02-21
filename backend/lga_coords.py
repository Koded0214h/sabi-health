# LGA to Coordinates Mapping for Nigeria
# This is a sample mapping for some LGAs. In a production app, this would be a complete dataset or a geocoding service.

LGA_COORDS = {
    "Kano Municipal": {"lat": 12.0022, "lon": 8.5920},
    "Ikeja": {"lat": 6.5913, "lon": 3.3367},
    "Abuja": {"lat": 9.0765, "lon": 7.3986},
    "Makurdi": {"lat": 7.7323, "lon": 8.5212},
    "Maiduguri": {"lat": 11.8311, "lon": 13.1507},
    "Port Harcourt": {"lat": 4.8156, "lon": 7.0498},
    "Enugu North": {"lat": 6.4484, "lon": 7.5143},
    "Jos North": {"lat": 9.8965, "lon": 8.8583},
    "Kano": {"lat": 12.0022, "lon": 8.5920}, # Mapping general name if specific LGA is unknown
    "Lagos": {"lat": 6.5244, "lon": 3.3792},
    "Benue": {"lat": 7.3369, "lon": 8.7404},
}

def get_coords_for_lga(lga: str):
    return LGA_COORDS.get(lga, {"lat": 9.0765, "lon": 7.3986}) # Default to Abuja
