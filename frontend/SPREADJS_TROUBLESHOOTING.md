# SpreadJS Troubleshooting Guide

This document provides solutions for common issues encountered when implementing SpreadJS components in the React dashboard.

## Common Issues and Solutions

### 1. MIME Type Errors

**Problem**:

```
Loading module from "http://localhost:5173/src/components/SpreadJSTest.jsx?t=1759055789849" was blocked because of a disallowed MIME type ("").
```

**Causes**:

- Vite development server not properly serving JavaScript modules
- Import path issues
- File encoding problems
- Cache issues

**Solutions**:

1. **Restart Development Server**:

   ```bash
   # Stop the current server (Ctrl+C)
   # Restart the server
   npm run dev
   ```

2. **Clear Browser Cache**:

   - Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)
   - Clear browser cache for localhost
   - Open in incognito/private browsing mode

3. **Check Import Statements**:
   Ensure all imports are correct:

   ```javascript
   import * as GC from "@grapecity/spread-sheets";
   import "@grapecity/spread-sheets-resources-en";
   import "@grapecity/spread-sheets/styles/gc.spread.sheets.excel2013white.css";
   ```

4. **Verify File Extensions**:
   Make sure all component files have the correct `.jsx` extension

5. **Check Vite Configuration**:
   Ensure `vite.config.js` is properly configured:

   ```javascript
   import path from "path";
   import tailwindcss from "@tailwindcss/vite";
   import react from "@vitejs/plugin-react";
   import { defineConfig } from "vite";

   export default defineConfig({
     plugins: [react(), tailwindcss()],
     resolve: {
       alias: {
         "@": path.resolve(__dirname, "./src"),
       },
     },
   });
   ```

### 2. SpreadJS Not Rendering

**Problem**:
SpreadJS component appears but shows a blank area or doesn't initialize properly.

**Solutions**:

1. **Check DOM Reference**:
   Ensure the ref is properly attached to a DOM element:

   ```javascript
   const spreadRef = useRef(null);

   // In JSX:
   <div ref={spreadRef} style={{ width: "100%", height: "400px" }} />;
   ```

2. **Verify useEffect Dependencies**:
   Make sure the useEffect hook runs when the component mounts:

   ```javascript
   useEffect(() => {
     if (spreadRef.current) {
       // Initialize SpreadJS here
     }
   }, []); // Empty dependency array for mount only
   ```

3. **Check CSS Import**:
   Ensure the SpreadJS CSS is imported:
   ```javascript
   import "@grapecity/spread-sheets/styles/gc.spread.sheets.excel2013white.css";
   ```

### 3. Pivot Table Configuration Issues

**Problem**:
Pivot table not generating or showing errors.

**Solutions**:

1. **Validate Configuration**:
   Ensure the pivot configuration has required fields:

   ```javascript
   const config = {
     rows: ["department"], // At least one row field
     columns: ["city"], // At least one column field
     values: [
       // At least one value field
       {
         field: "salary",
         aggregation: "SUM",
       },
     ],
   };
   ```

2. **Check Data Format**:
   Ensure data is in the correct format:

   ```javascript
   const data = [
     {
       name: "John",
       department: "Engineering",
       salary: 50000,
       city: "New York",
     },
     {
       name: "Jane",
       department: "Marketing",
       salary: 45000,
       city: "Los Angeles",
     },
   ];
   ```

3. **Verify Field Names**:
   Ensure field names in configuration match data property names exactly.

### 4. Performance Issues with Large Datasets

**Problem**:
Application becomes slow or unresponsive with large datasets.

**Solutions**:

1. **Implement Chunked Processing**:
   Process data in smaller chunks:

   ```javascript
   const chunkSize = 1000;
   for (let i = 0; i < data.length; i += chunkSize) {
     const chunk = data.slice(i, i + chunkSize);
     // Process chunk
     await new Promise((resolve) => setTimeout(resolve, 0));
   }
   ```

2. **Add Loading States**:
   Show loading indicators during processing:

   ```javascript
   const [isLoading, setIsLoading] = useState(false);

   // Show loading message when isLoading is true
   ```

3. **Optimize Rendering**:
   Use React.memo for components that render large datasets.

## Testing Checklist

Before deploying or considering the implementation complete, verify:

- [ ] Simple SpreadJS component renders correctly
- [ ] Pivot table configuration panel works
- [ ] Pivot table generates with sample data
- [ ] Large dataset handling (800+ rows) works smoothly
- [ ] Switching between regular and pivot table modes works
- [ ] Error handling displays appropriate messages
- [ ] All aggregation functions work (SUM, AVG, COUNT, MIN, MAX)
- [ ] No console errors in browser developer tools

## Dependency Verification

Ensure all required dependencies are installed:

```bash
npm list @grapecity/spread-sheets
npm list @grapecity/spread-sheets-react
```

Expected versions:

- `@grapecity/spread-sheets`: ^18.2.3
- `@grapecity/spread-sheets-react`: ^18.2.3

## Browser Compatibility

SpreadJS works best with modern browsers:

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Additional Resources

1. [SpreadJS Documentation](https://www.grapecity.com/spreadjs/docs)
2. [SpreadJS React Integration Guide](https://www.grapecity.com/spreadjs/react)
3. [Pivot Table API Reference](https://www.grapecity.com/spreadjs/docs/v18/API/index.html)
