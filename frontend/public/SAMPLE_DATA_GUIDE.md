# Equipment Import Template Documentation

## 📊 Sample Data Overview

This Excel/CSV template contains comprehensive sample data demonstrating all supported equipment categories and validation scenarios for the Laboratory Management System.

### 🏷️ **Equipment Categories Included:**

#### 💻 **Computer Equipment (3 items)**
- **Dell OptiPlex 7090**: High-performance desktop (Excellent condition, Available)
- **HP EliteBook 840**: Portable laptop (Good condition, In Use)  
- **Legacy Desktop PC**: Older computer (Fair condition, Under Maintenance)

#### 📽️ **Projector Equipment (3 items)**
- **Epson PowerLite L3150**: Ultra short throw projector (Excellent, Available)
- **BenQ MW632ST**: Standard projector (Good condition, Available)
- **Old Overhead Projector**: Vintage equipment (Poor condition, Retired)

#### 🖨️ **Printer Equipment (3 items)**
- **Canon ImageClass MF445dw**: Multifunction laser printer (Good, Available)
- **HP LaserJet Pro M404n**: Network printer (Excellent, In Use)
- **Brother HL-L2350DW**: Compact printer (Fair, Under Maintenance)

#### 🔬 **Microscope Equipment (3 items)**
- **Nikon Eclipse E200**: Biological microscope (Excellent, Available)
- **Olympus CX23**: Educational microscope (Good, Available)
- **Carl Zeiss Stemi 305**: Stereo microscope (Excellent, In Use)

#### ⚗️ **Laboratory Equipment (3 items)**
- **Autoclave SX-500**: Steam sterilization equipment (Excellent, Available)
- **Centrifuge CF-800**: High-speed centrifuge (Good, Available)
- **pH Meter PH-2000**: Digital pH meter (Excellent, In Use)

#### 🌐 **Network Equipment (3 items)**
- **Cisco Catalyst 2960**: 24-port Ethernet switch (Excellent, Available)
- **TP-Link Archer AX6000**: WiFi 6 router (Good, Available)
- **Netgear ProSafe GS108**: 8-port switch (Fair, Under Maintenance)

### 📋 **Field Validation Examples:**

#### **Status Variations:**
- ✅ `available` - Equipment ready for use
- 🔄 `in_use` - Currently being used
- 🔧 `maintenance` - Under repair/maintenance
- 🚫 `retired` - No longer in service

#### **Condition Variations:**
- 🌟 `excellent` - Like new condition
- ✅ `good` - Minor wear, fully functional
- ⚠️ `fair` - Some wear, needs attention
- ❌ `poor` - Significant issues, limited use

#### **Date Formats:**
- Purchase dates: `YYYY-MM-DD` format
- Warranty dates: Future dates for validation
- Historical dates: For older equipment

#### **Price Ranges:**
- Low cost: $45 - $450 (basic equipment)
- Medium cost: $600 - $2,800 (standard equipment)  
- High cost: $8,500+ (specialized equipment)

### 🔧 **Category-Specific Fields:**

#### **Computer Equipment:**
- `processor`, `ram`, `storage`, `graphics_card`, `operating_system`

#### **Projector Equipment:**
- `resolution`, `brightness`, `contrast_ratio`, `lamp_hours`

#### **Printer Equipment:**
- `print_type`, `print_speed`, `paper_size`, `connectivity`

#### **Microscope Equipment:**
- `magnification`, `objective_lenses`, `illumination`

#### **Lab Equipment:**
- `capacity`, `power_rating`, `temperature_range`, `accuracy`

#### **Network Equipment:**
- `ports`, `speed`, `protocol`

### ⚠️ **Validation Test Cases:**

The sample data includes scenarios to test validation:

1. **Valid Data**: Most entries demonstrate proper formatting
2. **Legacy Equipment**: Older items with expired warranties
3. **Different Statuses**: All status types represented
4. **Condition Variations**: All condition levels included
5. **Price Depreciation**: Realistic current values vs purchase prices
6. **Category-Specific Data**: Proper fields for each equipment type

### 📝 **Required Fields (Must be filled):**
- `name` - Equipment name/title
- `serial_number` - Unique identifier
- `category` - Must be one of: computer, projector, printer, microscope, lab_equipment, network
- `lab_id` - Must exist in database (use 1 for testing)

### 🎯 **Import Instructions:**

1. **Download Template**: Use the "Download Template" button in the import modal
2. **Edit Data**: Modify the sample data or add new rows
3. **Validate Lab IDs**: Ensure lab_id values exist in your system
4. **Check Serial Numbers**: Must be unique across all equipment
5. **Import**: Drag and drop the file or browse to select it

### 🔍 **Error Prevention:**

- Use consistent date formats (YYYY-MM-DD)
- Ensure lab_id corresponds to existing labs
- Use only valid status values: available, in_use, maintenance, retired
- Use only valid condition values: excellent, good, fair, poor, damaged
- Make serial numbers unique and descriptive

This comprehensive sample demonstrates real-world equipment diversity and proper data formatting for successful bulk imports.