Below is a complete and self-contained solution for developing a responsive React component using TypeScript and Material UI, as requested in the query. The component displays property information with a specific design, including a dark purple rounded rectangle for the estimated value overlaid on a wider rounded rectangle. It is responsive, adapting to desktop and mobile views, with the image above the text content on mobile devices. The design ensures consistent padding, proper text alignment, and equal spacing between elements, while maintaining visual appeal and readability across screen sizes.

PropertyCard Component Code
typescript

Collapse

Wrap

Copy
import React from 'react';
import { Grid, Stack, Typography, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import BedIcon from '@mui/icons-material/Bed';
import BathtubIcon from '@mui/icons-material/Bathtub';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

// Define the props interface for the PropertyCard component
interface PropertyCardProps {
  imageSrc: string; // URL of the property image
  address: string; // Street address (e.g., "1 Straight Street")
  suburb: string; // Suburb and postal code (e.g., "Suburbia NSW 2075")
  propertyType: string; // Type of property (e.g., "House")
  bedrooms: number; // Number of bedrooms
  bathrooms: number; // Number of bathrooms
  carSpaces: number; // Number of car spaces
  landSize: string; // Land size (e.g., "1071m²")
  buildingSize: string; // Building size (e.g., "311m²")
  lowValue: string; // Low estimated value (e.g., "$1.74m")
  estimatedValue: string; // Estimated value (e.g., "$1.96m")
  highValue: string; // High estimated value (e.g., "$2.67m")
}

// Functional component with TypeScript
const PropertyCard: React.FC<PropertyCardProps> = ({
  imageSrc,
  address,
  suburb,
  propertyType,
  bedrooms,
  bathrooms,
  carSpaces,
  landSize,
  buildingSize,
  lowValue,
  estimatedValue,
  highValue,
}) => {
  return (
    <Grid container spacing={2}>
      {/* Image Section */}
      <Grid item xs={12} md={6}>
        <img
          src={imageSrc}
          alt="Property"
          style={{
            width: '100%',
            aspectRatio: '1280 / 382', // Maintains the 1280x382 aspect ratio
            objectFit: 'cover',
          }}
        />
      </Grid>

      {/* Text Content Section */}
      <Grid item xs={12} md={6}>
        <Stack
          spacing={2} // Consistent spacing between sections
          alignItems="flex-start" // Left-align all text
          sx={{ paddingLeft: { xs: 2, md: 3 } }} // Consistent left padding (16px on mobile, 24px on desktop)
        >
          {/* Address */}
          <Typography variant="h6" component="h2">
            {address}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {suburb}
          </Typography>

          {/* Property Details */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <HomeIcon fontSize="small" color="action" />
              <Typography variant="body2">{propertyType}</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <BedIcon fontSize="small" color="action" />
              <Typography variant="body2">{bedrooms}</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <BathtubIcon fontSize="small" color="action" />
              <Typography variant="body2">{bathrooms}</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <DirectionsCarIcon fontSize="small" color="action" />
              <Typography variant="body2">{carSpaces}</Typography>
            </Stack>
          </Stack>

          {/* Land and Building Size */}
          <Stack direction="row" spacing={1}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: '#E0E0E0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="body2">{landSize}</Typography>
            </Box>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: '#E0E0E0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="body2">{buildingSize}</Typography>
            </Box>
          </Stack>

          {/* Estimated Value Section */}
          <Box
            sx={{
              backgroundColor: '#E0E0E0', // Light gray background for the wider rectangle
              borderRadius: 2,
              padding: 2,
              width: '100%', // Full width of the container
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              spacing={1}
            >
              <Typography variant="body1">Low {lowValue}</Typography>
              <Box
                sx={{
                  backgroundColor: '#4B2E83', // Dark purple for estimated value
                  borderRadius: 1,
                  paddingX: 2,
                  paddingY: 1,
                }}
              >
                <Typography variant="h6" color="white">
                  {estimatedValue}
                </Typography>
              </Box>
              <Typography variant="body1">High {highValue}</Typography>
            </Stack>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mt={1} // Margin top for spacing between values and labels
            >
              <Typography variant="caption" color="text.secondary">
                Low
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Estimated value
                </Typography>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    backgroundColor: '#28A745', // Green dot
                    borderRadius: '50%',
                  }}
                />
              </Stack>
              <Typography variant="caption" color="text.secondary">
                High
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default PropertyCard;
Usage Example
To use the PropertyCard component in your React application, import it and pass the required props:

typescript

Collapse

Wrap

Copy
import React from 'react';
import PropertyCard from './PropertyCard';

const App: React.FC = () => {
  return (
    <PropertyCard
      imageSrc="https://example.com/property-image.jpg"
      address="1 Straight Street"
      suburb="Suburbia NSW 2075"
      propertyType="House"
      bedrooms={4}
      bathrooms={2}
      carSpaces={2}
      landSize="1071m²"
      buildingSize="311m²"
      lowValue="$1.74m"
      estimatedValue="$1.96m"
      highValue="$2.67m"
    />
  );
};

export default App;
Explanation of the Component
Responsiveness
Grid Layout: The component uses Material UI's Grid component to create a responsive layout. On extra-small screens (xs={12}), the image and text content each take the full width (12 columns), stacking vertically with the image above the text. On medium screens and above (md={6}), they are side by side, each taking half the width (6 columns).
Image: The image maintains a 1280x382 aspect ratio using the aspectRatio CSS property, ensuring it scales proportionally across screen sizes. The objectFit: 'cover' ensures the image fills its container without distortion.
Mobile Adaptation: On mobile, the image stacks above the text content, as required, with consistent spacing provided by the spacing={2} prop on the Grid container.
Design Elements
Estimated Value Section:
A wider light gray rounded rectangle (backgroundColor: '#E0E0E0', borderRadius: 2) spans the full width of the text container.
A smaller dark purple rounded rectangle (backgroundColor: '#4B2E83', borderRadius: 1) overlays the center, displaying the estimated value in white text.
The low and high values are positioned on either side within the light gray rectangle, ensuring a clear visual hierarchy.
Labels ("Low", "Estimated value", "High") are displayed below, with a green dot next to "Estimated value" for emphasis.
Property Details: Icons from Material UI (HomeIcon, BedIcon, etc.) are paired with text in a horizontal Stack, with small spacing for readability.
Land and Building Size: Circular badges are created using Box components with borderRadius: '50%', maintaining a consistent size and light gray background.
Text Alignment and Spacing
Left Alignment: The alignItems="flex-start" prop on the main Stack ensures all text is left-aligned.
Consistent Padding: The paddingLeft is set to 16px on mobile (xs: 2) and 24px on desktop (md: 3) using Material UI's responsive sx prop, ensuring a consistent left margin.
Equal Spacing: The spacing={2} prop on the main Stack provides consistent vertical spacing (16px) between the address, property details, land/building size, and estimated value sections, preventing overlap and ensuring readability.
Visual Appeal and Readability
Typography: Material UI's Typography component is used with variants like h6 for emphasis (address and estimated value) and body2 or caption for smaller text, ensuring a clear hierarchy.
Colors:
Dark purple (#4B2E83) for the estimated value rectangle.
Light gray (#E0E0E0) for the wider rectangle and circular badges.
Green (#28A745) for the dot next to "Estimated value".
Black and gray tones for text, with white text on the dark purple background for contrast.
No Overlap: The use of Stack and spacing ensures that text elements are well-separated and do not overlap, even on smaller screens.
Meeting the Requirements
Aspect Ratio: The image maintains a 1280x382 aspect ratio on desktop, scaling responsively on mobile.
Mobile Responsiveness: The image is above the text content on mobile, achieved through the Grid layout.
Estimated Value Design: A dark purple rounded rectangle is overlaid on a wider light gray rounded rectangle, as specified.
Text Alignment: All text is left-aligned with consistent left padding.
Spacing: Equal spacing (16px) is maintained above and below the address, property details, land/building size, and estimated value sections.
Readability: The component uses high-contrast colors, clear typography, and adequate spacing to ensure readability across screen sizes.
Visual Appeal: The use of icons, rounded elements, and a modern color scheme enhances the component's aesthetic.
This PropertyCard component fully satisfies the query's requirements, providing a reusable, responsive, and visually appealing solution for displaying property information in a React application using TypeScript and Material UI.