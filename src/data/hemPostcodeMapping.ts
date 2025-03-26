export interface PostcodeMapping {
  hemLocationId: number;
  postcode: string;
}

// This file would normally contain all postcode mappings from HEM-Postcode-Mapping.csv
// For performance, we'll use a Map for faster lookups instead of a large array

// Map postcodes to HEM location IDs
const postcodeToLocationMap = new Map<string, number>();

// Helper function to initialize the map with data
// This would typically be populated with all data from the CSV
// For demonstration, we'll include a sample of the data
function initializePostcodeMap() {
  // Sydney (hemLocationId: 1)
  ['2000', '2001', '2010', '2011', '2020', '2030', '2040', '2050', '2060', '2000'].forEach(
    postcode => postcodeToLocationMap.set(postcode, 1)
  );
  
  // Regional NSW (hemLocationId: 2)
  ['2250', '2259', '2264', '2265', '2280', '2300', '2320', '2330'].forEach(
    postcode => postcodeToLocationMap.set(postcode, 2)
  );
  
  // Melbourne (hemLocationId: 3)
  ['3000', '3001', '3002', '3003', '3004', '3005', '3006', '3010', '3050'].forEach(
    postcode => postcodeToLocationMap.set(postcode, 3)
  );
  
  // Regional VIC (hemLocationId: 4)
  ['3211', '3212', '3214', '3220', '3230', '3240', '3250', '3260'].forEach(
    postcode => postcodeToLocationMap.set(postcode, 4)
  );
  
  // Brisbane (hemLocationId: 5)
  ['4000', '4001', '4005', '4006', '4007', '4010', '4030', '4050', '4060'].forEach(
    postcode => postcodeToLocationMap.set(postcode, 5)
  );
  
  // Regional QLD (hemLocationId: 6)
  ['4207', '4208', '4209', '4210', '4211', '4212', '4220', '4230'].forEach(
    postcode => postcodeToLocationMap.set(postcode, 6)
  );
  
  // Adelaide (hemLocationId: 7)
  ['5000', '5001', '5005', '5006', '5007', '5008', '5009', '5010'].forEach(
    postcode => postcodeToLocationMap.set(postcode, 7)
  );
  
  // Regional SA (hemLocationId: 8)
  ['5118', '5153', '5157', '5172', '5174', '5201', '5202', '5203'].forEach(
    postcode => postcodeToLocationMap.set(postcode, 8)
  );
  
  // Perth (hemLocationId: 9)
  ['6000', '6001', '6003', '6004', '6005', '6006', '6007', '6008'].forEach(
    postcode => postcodeToLocationMap.set(postcode, 9)
  );
  
  // Regional WA (hemLocationId: 10)
  ['6041', '6042', '6044', '6083', '6084', '6207', '6213', '6214'].forEach(
    postcode => postcodeToLocationMap.set(postcode, 10)
  );
  
  // Hobart (hemLocationId: 11)
  ['7000', '7004', '7005', '7007', '7008', '7009', '7010', '7011'].forEach(
    postcode => postcodeToLocationMap.set(postcode, 11)
  );
  
  // Regional TAS (hemLocationId: 12)
  ['7001', '7012', '7017', '7026', '7027', '7030', '7054', '7109'].forEach(
    postcode => postcodeToLocationMap.set(postcode, 12)
  );
  
  // Darwin (hemLocationId: 13)
  ['800', '810', '812', '820', '828', '829', '830', '832'].forEach(
    postcode => postcodeToLocationMap.set(postcode, 13)
  );
  
  // Regional NT (hemLocationId: 14)
  ['822', '840', '845', '846', '847', '850', '852', '853'].forEach(
    postcode => postcodeToLocationMap.set(postcode, 14)
  );
  
  // Canberra (hemLocationId: 15)
  ['2600', '2601', '2602', '2603', '2604', '2605', '2606', '2607'].forEach(
    postcode => postcodeToLocationMap.set(postcode, 15)
  );
  
  // Regional ACT (hemLocationId: 16)
  ['2618', '2619', '2620', '2900', '2902', '2903', '2904', '2905'].forEach(
    postcode => postcodeToLocationMap.set(postcode, 16)
  );
  
  // Other/Special Cases (hemLocationId: 17)
  postcodeToLocationMap.set('9999', 17);
}

// Initialize the map
initializePostcodeMap();

/**
 * Gets the HEM location ID for a given postcode
 * @param postcode The postcode to look up
 * @returns The HEM location ID (defaults to 1 if not found)
 */
export function getHemLocationId(postcode: string): number {
  return postcodeToLocationMap.get(postcode) || 1; // Default to metropolitan (1)
}

/**
 * Gets all postcodes for a given HEM location ID
 * This is less efficient but might be needed for some use cases
 * @param hemLocationId The HEM location ID
 * @returns Array of postcodes for that location
 */
export function getPostcodesForLocation(hemLocationId: number): string[] {
  const result: string[] = [];
  
  postcodeToLocationMap.forEach((locationId, postcode) => {
    if (locationId === hemLocationId) {
      result.push(postcode);
    }
  });
  
  return result;
}

// Export the map for direct access if needed
export const HEM_POSTCODE_MAP = postcodeToLocationMap; 