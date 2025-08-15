# Custom Design Blouse Purchase - Demo Testing Guide

## 🎯 Overview

This guide provides step-by-step instructions for testing the custom design blouse purchase flow using the demo account.

## 📋 Demo Account Credentials

- **Email**: `demo@example.com`
- **Password**: `demo123`

## 🚀 Testing the Complete Flow

### Step 1: Access the Application

1. **Navigate to the login page**:
   ```
   http://localhost:3000/login
   ```

2. **Login with demo credentials**:
   - Email: `demo@example.com`
   - Password: `demo123`
   - Click "Sign In"

3. **Successful login** will redirect you to the custom design page:
   ```
   http://localhost:3000/custom-design
   ```

### Step 2: Test Fabric Selection

1. **Browse Fabric Options**:
   - You'll see two main options: "Choose From Our Collection" and "Provide Your Own Fabric"
   - Test both options to ensure they work correctly

2. **Choose from Collection**:
   - Click on any fabric card (e.g., "Premium Silk", "Soft Cotton", etc.)
   - Observe the selection highlight (pink ring and background)
   - Click "Continue to Design" button

3. **Test Own Fabric Option** (Alternative):
   - Fill in the fabric details:
     - Fabric Name/Type: "My Special Silk"
     - Color: "Royal Blue"
     - Quantity: "1.5"
     - Description: "Special occasion fabric"
   - Click "Continue with Own Fabric"

### Step 3: Test Design Selection with Variants

1. **Front Design Selection**:
   - Browse the available front designs (e.g., "Classic Round Neck", "Elegant V-Neck", etc.)
   - Click on a design to expand it and see variants
   - Observe the hierarchical structure:
     - Main design sections (categories)
     - Specific style variants within each design

2. **Select a Design Variant**:
   - Click on any main design (e.g., "Classic Round Neck")
   - The section will expand to show 3 variant options:
     - "Simple Round"
     - "Round with Lace" 
     - "Round with Embroidery"
   - Click on a specific variant to select it
   - Observe the selection indicator (pink ring and "Selected" badge)

3. **Back Design Selection**:
   - Repeat the same process for back designs
   - Test different categories like "Elegant Deep Back", "Classic Regular Back", etc.
   - Select specific variants within each design

4. **Continue to Measurements**:
   - Click "Continue to Measurements" button (enabled when at least one design is selected)

### Step 4: Test Measurement Options

1. **Manual Measurements**:
   - Fill in all measurement fields:
     - Bust: "36"
     - Waist: "30"
     - Hips: "38"
     - Shoulder: "15"
     - Sleeve Length: "18"
     - Blouse Length: "15"
   - Add optional notes: "Prefer slightly loose fit"
   - Click "Save Measurements & Continue"

2. **Professional Measurement** (Alternative):
   - Click on "Virtual Call" button
   - Observe the appointment confirmation message
   - Click "Confirm Appointment & Continue"

### Step 5: Review and Add to Cart

1. **Review Design Summary**:
   - Verify all selected items are displayed correctly:
     - Fabric information
     - Front design with selected variant
     - Back design with selected variant
     - Measurements
     - Professional appointment (if selected)

2. **Check Price Calculation**:
   - Base Price: ₹1,500
   - Fabric cost (if not own fabric)
   - Design costs: ₹300 each for front and back
   - Total calculation should be correct

3. **Add to Cart**:
   - Click "Add to Cart" button
   - Observe success toast message
   - Verify the form resets and returns to fabric selection

### Step 6: Test Cart Functionality

1. **Navigate to Cart**:
   - Click on the cart icon in the header
   - Verify the custom blouse item appears in cart
   - Check that all details are preserved

2. **Test Cart Operations**:
   - Update quantity
   - Remove item
   - Proceed to checkout (if available)

## 🎨 Key Features to Test

### 1. Hierarchical Design Structure
- ✅ Main design sections are properly categorized
- ✅ Variants are displayed when a design is selected
- ✅ Selection indicators work correctly
- ✅ Category badges are displayed

### 2. User Experience Flow
- ✅ Progress bar shows current step
- ✅ Navigation between steps works correctly
- ✅ Form validation prevents incomplete submissions
- ✅ Toast notifications provide feedback

### 3. Design Variants System
- ✅ Each main design has 3 specific variants
- ✅ Variant selection is independent for front and back
- ✅ Variant names and descriptions are displayed
- ✅ Visual feedback for selected variants

### 4. Measurement Options
- ✅ Manual measurement form validation
- ✅ Professional appointment booking
- ✅ Both options work independently
- ✅ Data persistence between steps

### 5. Price Calculation
- ✅ Base price: ₹1,500
- ✅ Fabric cost calculation
- ✅ Design costs: ₹300 each
- ✅ Own fabric savings display

### 6. Cart Integration
- ✅ Custom design items are added to cart
- ✅ All design details preserved in cart
- ✅ Cart operations work with custom items

## 🐛 Common Issues to Check

### 1. Login Issues
- Ensure demo user credentials work
- Check redirect after successful login
- Verify error handling for invalid credentials

### 2. Design Selection Issues
- Verify all designs and variants are loaded
- Check selection state management
- Test expansion/collapse of design sections

### 3. Form Validation
- Test required field validation
- Check measurement format validation
- Verify error messages are displayed

### 4. State Management
- Verify data persistence between steps
- Check form reset functionality
- Test cart state management

### 5. Responsive Design
- Test on different screen sizes
- Verify mobile layout works correctly
- Check touch interactions

## 📊 Test Data Summary

### Demo Fabrics Available:
- Premium Silk - ₹1,200/meter
- Soft Cotton - ₹800/meter  
- Elegant Georgette - ₹600/meter
- Luxury Chiffon - ₹900/meter

### Design Categories:
- Classic Necklines
- Modern Styles
- Elegant Back Designs

### Front Designs with Variants:
1. **Classic Round Neck**
   - Simple Round
   - Round with Lace
   - Round with Embroidery

2. **Elegant V-Neck**
   - Deep V-Neck
   - Modest V-Neck
   - V-Neck with Collar

3. **Modern Boat Neck**
   - Wide Boat Neck
   - Narrow Boat Neck
   - Boat Neck with Frills

### Back Designs with Variants:
1. **Elegant Deep Back**
   - Deep U-Back
   - Deep V-Back
   - Deep Round Back

2. **Classic Regular Back**
   - Simple Regular
   - Regular with Dori
   - Regular with Buttons

3. **Designer Cut-Out Back**
   - Heart Cut-Out
   - Geometric Cut-Out
   - Floral Cut-Out

## 🔍 Debugging Tips

1. **Check Browser Console**: Look for JavaScript errors
2. **Network Tab**: Verify API calls are successful
3. **Local Storage**: Check cart data persistence
4. **Database**: Verify demo data exists in the database
5. **Authentication**: Verify login tokens are set correctly

## ✅ Success Criteria

The test is successful if:

- [ ] User can login with demo credentials
- [ ] Fabric selection works for both options
- [ ] Design variants are displayed and selectable
- [ ] Measurement options work correctly
- [ ] Review page shows all selected options
- [ ] Custom design is added to cart successfully
- [ ] All form validations work as expected
- [ ] Progress tracking is accurate
- [ ] Price calculations are correct

---

**🎉 Congratulations!** You've successfully tested the complete custom design blouse purchase flow with the new hierarchical design variants system!