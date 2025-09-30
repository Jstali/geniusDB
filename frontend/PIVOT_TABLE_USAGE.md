# Pivot Table Functionality Usage Guide

This document explains how to use the Pivot Table functionality that has been added to the dashboard.

## Components

The pivot table functionality consists of the following components:

1. **PivotConfigPanel** - Configuration panel for setting up pivot table parameters
2. **PivotTableView** - Component that renders the pivot table using SpreadJS
3. **DataTable** - Main table component that includes toggle for pivot table mode

## Features

### 1. UI Placement

- Added a "Switch to Pivot Table" button next to the existing "Columns" button in the DataTable toolbar
- Default state is Regular Table mode
- Button toggles between "Switch to Pivot Table" and "Switch to Regular Table"

### 2. Pivot Table Panel

When Pivot Table mode is enabled, the configuration panel appears with:

- **Rows** (multi-select dropdown) - Choose fields for row grouping
- **Columns** (multi-select dropdown) - Choose fields for column grouping
- **Values** (multi-select dropdown with aggregation) - Choose fields for aggregation
- **Aggregation** options: SUM, AVG, COUNT, MIN, MAX
- **Add** button to add multiple value fields with different aggregations
- **Generate Pivot Table** button to create the pivot table

### 3. SpreadJS Integration

- Uses SpreadJS Pivot Table API to generate the pivot view
- Renders inside the same container as the regular table
- Supports sorting, filtering, and resizing
- Handles large datasets efficiently

## Usage Instructions

### In DataTable Component

1. Click the "Switch to Pivot Table" button in the toolbar
2. Configure the pivot table using the panel:
   - Select fields for Rows
   - Select fields for Columns
   - Add value fields with desired aggregations
3. Click "Generate Pivot Table"
4. View the generated pivot table
5. To return to regular table view, click "Switch to Regular Table"

### Testing

Two test pages are available:

1. **Pivot Table Test** (`/pivot-test`) - Basic functionality test with sample data
2. **Large Dataset Pivot Test** (`/large-pivot-test`) - Performance test with 1000 rows of data

## Error Handling

- Validates that at least one field is selected for Rows, Columns, and Values
- Shows user-friendly error messages for missing required fields
- Displays "No results found" message when no data exists for the chosen configuration

## Technical Implementation

### Component Structure

```
DataTable (main component)
├── PivotConfigPanel (configuration)
└── PivotTableView (rendering)
```

### Data Flow

1. DataTable passes column definitions to PivotConfigPanel
2. User configures pivot parameters in PivotConfigPanel
3. Configuration is sent back to DataTable
4. DataTable passes data and configuration to PivotTableView
5. PivotTableView uses SpreadJS to generate and display the pivot table

### Performance Considerations

- Handles large datasets (800+ rows) efficiently
- Processes data in chunks for better UI responsiveness
- Maintains filter/search state when switching between views
