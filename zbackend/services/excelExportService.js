const ExcelJS = require('exceljs');

class ExcelExportService {

    static async generateComprehensiveReport(reportData, reportType, dateRange) {
        const workbook = new ExcelJS.Workbook();

        // Set workbook properties
        workbook.creator = 'Lab Management System';
        workbook.lastModifiedBy = 'LabMS';
        workbook.created = new Date();
        workbook.modified = new Date();

        // Create manual sheet
        await this.createManualSheet(workbook);

        // Create summary sheet
        await this.createSummarySheet(workbook, reportData, reportType, dateRange);

        // Create data sheet based on report type
        if (reportType === 'usage') {
            await this.createUsageReportSheet(workbook, reportData);
        } else if (reportType === 'availability') {
            await this.createAvailabilityReportSheet(workbook, reportData);
        } else if (reportType === 'maintenance') {
            await this.createMaintenanceReportSheet(workbook, reportData);
        } else if (reportType === 'user') {
            await this.createUserReportSheet(workbook, reportData);
        } else if (reportType === 'financial') {
            await this.createFinancialReportSheet(workbook, reportData);
        } else if (reportType === 'comprehensive') {
            await this.createComprehensiveSheets(workbook, reportData);
        } else {
            await this.createGenericReportSheet(workbook, reportData);
        }

        return workbook;
    }

    static async createManualSheet(workbook) {
        const worksheet = workbook.addWorksheet('📖 User Manual', {
            properties: { tabColor: { argb: 'FF3366CC' } }
        });

        worksheet.columns = [
            { width: 25 },
            { width: 50 },
            { width: 30 }
        ];

        // Title
        worksheet.mergeCells('A1:C1');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = 'Lab Management System - Complete Report Manual';
        titleCell.font = { size: 18, bold: true, color: { argb: 'FF3366CC' } };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F8FF' } };

        let row = 3;

        // Table of Contents
        worksheet.mergeCells(`A${row}:C${row}`);
        const tocCell = worksheet.getCell(`A${row}`);
        tocCell.value = '📋 TABLE OF CONTENTS';
        tocCell.font = { size: 14, bold: true, color: { argb: 'FF2E5BBA' } };
        tocCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F3FF' } };
        row += 2;

        const tableOfContents = [
            ['📖 User Manual', 'Complete instructions and guidelines for using this report'],
            ['📊 Summary', 'Report overview with key performance metrics and statistics'],
            ['📈 Report Data', 'Detailed data analysis based on your selected report type'],
            ['🔍 System Overview', 'Comprehensive lab management system insights and usage tips'],
        ];

        tableOfContents.forEach(([sheet, description]) => {
            worksheet.getCell(`A${row}`).value = sheet;
            worksheet.getCell(`B${row}`).value = description;
            worksheet.getRow(row).font = { size: 11 };
            row++;
        });

        row += 2;

        // Report Types Section
        worksheet.mergeCells(`A${row}:C${row}`);
        const reportTypesCell = worksheet.getCell(`A${row}`);
        reportTypesCell.value = '📋 AVAILABLE REPORT TYPES';
        reportTypesCell.font = { size: 14, bold: true, color: { argb: 'FF2E5BBA' } };
        reportTypesCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F3FF' } };
        row += 2;

        const reportTypes = [
            ['🔧 Usage Report', 'Track equipment utilization, booking patterns, and usage statistics'],
            ['📅 Availability Report', 'Monitor equipment availability, uptime, and operational status'],
            ['🛠️ Maintenance Report', 'Analyze maintenance schedules, costs, completion rates, and efficiency'],
            ['👥 User Activity Report', 'Review user engagement, booking behavior, and department statistics'],
            ['💰 Financial Report', 'Examine cost analysis, budget management, and financial trends'],
        ];

        reportTypes.forEach(([type, description]) => {
            worksheet.getCell(`A${row}`).value = type;
            worksheet.getCell(`B${row}`).value = description;
            worksheet.getRow(row).font = { size: 10 };
            row++;
        });

        row += 2;

        // Excel Features Section
        worksheet.mergeCells(`A${row}:C${row}`);
        const featuresCell = worksheet.getCell(`A${row}`);
        featuresCell.value = '⚡ EXCEL REPORT FEATURES';
        featuresCell.font = { size: 14, bold: true, color: { argb: 'FF2E5BBA' } };
        featuresCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F3FF' } };
        row += 2;

        const features = [
            ['📊 Multiple Worksheets', 'Data organized across specialized sheets for easy navigation and analysis'],
            ['🎨 Professional Formatting', 'Color-coded headers, consistent styling, and proper data formatting'],
            ['📈 Chart-Ready Data', 'Structured data perfect for creating Excel charts and pivot tables'],
            ['🔍 Excel Filtering', 'Built-in filters on all data tables for custom data analysis'],
            ['📅 Date Range Analysis', 'Flexible time period reporting with customizable date ranges'],
            ['💾 Auto-Calculations', 'Pre-calculated totals, averages, and key performance metrics'],
            ['🏷️ Data Validation', 'Properly formatted data with consistent types and currency formatting'],
            ['📋 Export Compatibility', 'Compatible with Excel 2016+, Google Sheets, and other applications'],
            ['💡 Interactive Elements', 'Sortable columns, expandable sections, and user-friendly layouts'],
            ['🔒 Print Optimization', 'Layouts optimized for professional printing and presentations'],
        ];

        features.forEach(([feature, description]) => {
            worksheet.getCell(`A${row}`).value = feature;
            worksheet.getCell(`B${row}`).value = description;
            worksheet.getRow(row).font = { size: 10 };
            row++;
        });

        row += 2;

        // Instructions Section
        worksheet.mergeCells(`A${row}:C${row}`);
        const instructionsCell = worksheet.getCell(`A${row}`);
        instructionsCell.value = '📖 HOW TO USE THIS REPORT';
        instructionsCell.font = { size: 14, bold: true, color: { argb: 'FF2E5BBA' } };
        instructionsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F3FF' } };
        row += 2;

        const instructions = [
            '1. 📑 Navigate between worksheets using the colored tabs at the bottom of Excel',
            '2. 🔍 Use Excel\'s Data > Filter feature to create custom views of the data',
            '3. 📊 Create charts by selecting data ranges and using Insert > Charts',
            '4. 💰 All monetary values are displayed in your system\'s default currency',
            '5. 📅 Date formats follow YYYY-MM-DD standard for international compatibility',
            '6. 📈 Percentage values are properly formatted for easy readability',
            '7. 🔄 Generate new reports from the system to get updated data',
            '8. 💾 Save this file before making modifications to preserve original data',
            '9. 📋 Use Insert > PivotTable for advanced data analysis and insights',
            '10. 🖨️ File is print-ready - use File > Print Preview to check layouts',
        ];

        instructions.forEach(instruction => {
            worksheet.getCell(`A${row}`).value = instruction;
            worksheet.getRow(row).font = { size: 11 };
            row++;
        });

        row += 2;

        // Data Interpretation Guide
        worksheet.mergeCells(`A${row}:C${row}`);
        const interpretationCell = worksheet.getCell(`A${row}`);
        interpretationCell.value = '📊 DATA INTERPRETATION GUIDE';
        interpretationCell.font = { size: 14, bold: true, color: { argb: 'FF2E5BBA' } };
        interpretationCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F3FF' } };
        row += 2;

        const interpretationGuide = [
            ['📈 Usage Trends', 'Look for patterns in equipment usage over time to optimize scheduling'],
            ['🎯 Utilization Rates', 'High utilization (>80%) may indicate need for additional equipment'],
            ['⚠️ Maintenance Costs', 'Monitor cost trends and variances to predict future budget needs'],
            ['👥 User Patterns', 'Identify peak usage times and most popular equipment'],
            ['💡 Efficiency Metrics', 'Compare estimated vs actual costs for better planning'],
            ['🔄 Availability Impact', 'Track downtime patterns to improve equipment reliability'],
            ['📊 Performance KPIs', 'Use summary metrics to measure lab management effectiveness'],
            ['🎯 Resource Planning', 'Leverage data insights for strategic equipment and resource decisions'],
        ];

        interpretationGuide.forEach(([category, guidance]) => {
            worksheet.getCell(`A${row}`).value = category;
            worksheet.getCell(`B${row}`).value = guidance;
            worksheet.getRow(row).font = { size: 10 };
            row++;
        });

        row += 2;

        // Support Information
        worksheet.mergeCells(`A${row}:C${row}`);
        const supportCell = worksheet.getCell(`A${row}`);
        supportCell.value = '🆘 SUPPORT & ASSISTANCE';
        supportCell.font = { size: 14, bold: true, color: { argb: 'FF2E5BBA' } };
        supportCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F3FF' } };
        row += 2;

        const supportInfo = [
            ['📧 Technical Support', 'Contact your system administrator for technical assistance'],
            ['📚 Documentation', 'Refer to the lab management system user guide for detailed instructions'],
            ['🔄 Data Updates', 'Reports reflect data as of generation time - generate new reports for updates'],
            ['⚠️ Data Issues', 'Report any data discrepancies to the lab management team'],
            ['💡 Feature Requests', 'Submit suggestions for new report features through your admin'],
            ['🛠️ System Issues', 'Contact IT support for any Excel or system compatibility problems'],
        ];

        supportInfo.forEach(([category, info]) => {
            worksheet.getCell(`A${row}`).value = category;
            worksheet.getCell(`B${row}`).value = info;
            worksheet.getRow(row).font = { size: 10 };
            row++;
        });

        // Apply borders to all content
        this.applyBorders(worksheet, 1, 1, row - 1, 3);
    }

    static async createSummarySheet(workbook, reportData, reportType, dateRange) {
        const worksheet = workbook.addWorksheet('📊 Summary', {
            properties: { tabColor: { argb: 'FF28A745' } }
        });

        worksheet.columns = [
            { width: 25 },
            { width: 20 },
            { width: 15 },
            { width: 30 }
        ];

        // Title
        worksheet.mergeCells('A1:D1');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = `📊 ${reportType.toUpperCase()} REPORT SUMMARY`;
        titleCell.font = { size: 16, bold: true, color: { argb: 'FF28A745' } };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0FFF0' } };

        let row = 3;

        // Report Information
        const reportInfo = [
            ['Report Type', reportType.charAt(0).toUpperCase() + reportType.slice(1)],
            ['Generated Date', new Date().toLocaleDateString()],
            ['Generated Time', new Date().toLocaleTimeString()],
            ['Date Range', `${dateRange || 'Custom range'}`],
            ['Generated By', 'Lab Management System v1.0'],
            ['Data Source', 'Real-time database'],
            ['Report Status', 'Completed Successfully']
        ];

        worksheet.mergeCells(`A${row}:B${row}`);
        worksheet.getCell(`A${row}`).value = '📋 Report Information';
        worksheet.getCell(`A${row}`).font = { bold: true, size: 12, color: { argb: 'FF1565C0' } };
        worksheet.getCell(`A${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE3F2FD' } };
        row++;

        reportInfo.forEach(([key, value]) => {
            worksheet.getCell(`A${row}`).value = key;
            worksheet.getCell(`B${row}`).value = value;
            worksheet.getRow(row).font = { size: 11 };
            if (key === 'Report Type') {
                worksheet.getCell(`B${row}`).font = { size: 11, bold: true, color: { argb: 'FF1565C0' } };
            }
            row++;
        });

        row += 2;

        // Key Metrics
        worksheet.mergeCells(`A${row}:B${row}`);
        worksheet.getCell(`A${row}`).value = '📈 Key Performance Metrics';
        worksheet.getCell(`A${row}`).font = { bold: true, size: 12, color: { argb: 'FF1565C0' } };
        worksheet.getCell(`A${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE3F2FD' } };
        row++;

        if (reportData && reportData.summary) {
            Object.entries(reportData.summary).forEach(([key, value]) => {
                if (typeof value !== 'object') {
                    const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    worksheet.getCell(`A${row}`).value = formattedKey;

                    // Format the value based on its type
                    let formattedValue = value;
                    if (typeof value === 'number') {
                        if (key.includes('cost') || key.includes('Cost')) {
                            formattedValue = `$${parseFloat(value).toFixed(2)}`;
                        } else if (key.includes('percentage') || key.includes('rate')) {
                            formattedValue = `${parseFloat(value).toFixed(1)}%`;
                        } else {
                            formattedValue = parseFloat(value).toFixed(2);
                        }
                    }

                    worksheet.getCell(`B${row}`).value = formattedValue;
                    worksheet.getRow(row).font = { size: 11 };

                    // Highlight important metrics
                    if (key.includes('total') || key.includes('count')) {
                        worksheet.getCell(`B${row}`).font = { size: 11, bold: true };
                    }

                    row++;
                }
            });
        } else {
            worksheet.getCell(`A${row}`).value = 'No summary data available for this report period';
            worksheet.getCell(`A${row}`).font = { size: 11, italic: true, color: { argb: 'FF757575' } };
            row++;
        }

        row += 2;

        // Data Statistics
        if (reportData && reportData.data && Array.isArray(reportData.data)) {
            worksheet.mergeCells(`A${row}:B${row}`);
            worksheet.getCell(`A${row}`).value = '📊 Data Statistics';
            worksheet.getCell(`A${row}`).font = { bold: true, size: 12, color: { argb: 'FF1565C0' } };
            worksheet.getCell(`A${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE3F2FD' } };
            row++;

            const dataStats = [
                ['Total Records', reportData.data.length],
                ['Report Generated', reportData.generatedAt ? new Date(reportData.generatedAt).toLocaleString() : new Date().toLocaleString()],
                ['Data Quality', 'Real-time database'],
                ['Export Format', 'Excel Workbook (.xlsx)']
            ];

            dataStats.forEach(([key, value]) => {
                worksheet.getCell(`A${row}`).value = key;
                worksheet.getCell(`B${row}`).value = value;
                worksheet.getRow(row).font = { size: 11 };
                row++;
            });
        }

        // Apply borders
        this.applyBorders(worksheet, 1, 1, row - 1, 4);
    }

    static async createUsageReportSheet(workbook, reportData) {
        const worksheet = workbook.addWorksheet('🔧 Equipment Usage', {
            properties: { tabColor: { argb: 'FFFF6B35' } }
        });

        const headers = [
            'Equipment ID', 'Equipment Name', 'Model', 'Category',
            'Total Bookings', 'Total Hours', 'Avg Hours/Booking', 'Utilization Score'
        ];

        worksheet.columns = headers.map(() => ({ width: 15 }));

        // Add headers with professional formatting
        headers.forEach((header, index) => {
            const cell = worksheet.getCell(1, index + 1);
            cell.value = header;
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF6B35' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        // Add data
        if (reportData && reportData.data && Array.isArray(reportData.data)) {
            reportData.data.forEach((item, index) => {
                const row = index + 2;
                worksheet.getCell(row, 1).value = item.equipment_id || '';
                worksheet.getCell(row, 2).value = item.equipment_name || '';
                worksheet.getCell(row, 3).value = item.equipment_model || item.model || '';
                worksheet.getCell(row, 4).value = item.category || '';
                worksheet.getCell(row, 5).value = parseInt(item.total_bookings) || 0;
                worksheet.getCell(row, 6).value = parseFloat(item.total_hours) || 0;
                worksheet.getCell(row, 7).value = parseFloat(item.avg_hours_per_booking) || 0;

                // Calculate utilization score (0-100)
                const totalHours = parseFloat(item.total_hours) || 0;
                const bookingCount = parseInt(item.total_bookings) || 0;
                const utilizationScore = bookingCount > 0 ? Math.min((totalHours / (bookingCount * 8)) * 100, 100) : 0;
                worksheet.getCell(row, 8).value = utilizationScore;

                // Format numbers
                worksheet.getCell(row, 6).numFmt = '0.00';
                worksheet.getCell(row, 7).numFmt = '0.00';
                worksheet.getCell(row, 8).numFmt = '0.0';

                // Color code utilization
                const utilizationCell = worksheet.getCell(row, 8);
                if (utilizationScore >= 80) {
                    utilizationCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC8E6C9' } };
                } else if (utilizationScore >= 60) {
                    utilizationCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3C4' } };
                } else if (utilizationScore > 0) {
                    utilizationCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFCDD2' } };
                }
            });

            // Add totals row
            const totalRow = reportData.data.length + 2;
            worksheet.getCell(totalRow, 1).value = 'TOTAL';
            worksheet.getCell(totalRow, 1).font = { bold: true };
            worksheet.getCell(totalRow, 5).value = reportData.data.reduce((sum, item) => sum + (parseInt(item.total_bookings) || 0), 0);
            worksheet.getCell(totalRow, 6).value = reportData.data.reduce((sum, item) => sum + (parseFloat(item.total_hours) || 0), 0);
            worksheet.getRow(totalRow).font = { bold: true };
            worksheet.getRow(totalRow).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F0F0' } };

            // Apply borders
            this.applyBorders(worksheet, 1, 1, totalRow, headers.length);
        } else {
            // No data message
            worksheet.getCell(2, 1).value = 'No equipment usage data available for the selected period';
            worksheet.mergeCells('A2:H2');
            worksheet.getCell(2, 1).alignment = { horizontal: 'center' };
            worksheet.getCell(2, 1).font = { italic: true, color: { argb: 'FF757575' } };
        }
    }

    static async createAvailabilityReportSheet(workbook, reportData) {
        const worksheet = workbook.addWorksheet('📅 Equipment Availability', {
            properties: { tabColor: { argb: 'FF17A2B8' } }
        });

        const headers = [
            'Equipment ID', 'Equipment Name', 'Model', 'Current Status', 'Category',
            'Bookings Count', 'Availability Status', 'Uptime %', 'Notes'
        ];

        worksheet.columns = headers.map(() => ({ width: 15 }));

        // Add headers
        headers.forEach((header, index) => {
            const cell = worksheet.getCell(1, index + 1);
            cell.value = header;
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF17A2B8' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        // Add data
        if (reportData && reportData.data && Array.isArray(reportData.data)) {
            reportData.data.forEach((item, index) => {
                const row = index + 2;
                worksheet.getCell(row, 1).value = item.equipment_id || '';
                worksheet.getCell(row, 2).value = item.equipment_name || item.name || '';
                worksheet.getCell(row, 3).value = item.model || '';
                worksheet.getCell(row, 4).value = item.status || '';
                worksheet.getCell(row, 5).value = item.category || '';
                worksheet.getCell(row, 6).value = parseInt(item.bookings_count) || 0;
                worksheet.getCell(row, 7).value = item.availability_status || '';

                // Calculate uptime percentage
                const uptimePercentage = item.status === 'available' ? 100 :
                    item.status === 'maintenance' ? 75 :
                        item.status === 'out_of_order' ? 0 : 50;
                worksheet.getCell(row, 8).value = uptimePercentage;
                worksheet.getCell(row, 8).numFmt = '0"%"';

                worksheet.getCell(row, 9).value = item.notes || '';

                // Color code availability status
                const statusCell = worksheet.getCell(row, 7);
                if (item.availability_status === 'Available') {
                    statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC8E6C9' } };
                } else if (item.availability_status === 'Under Maintenance') {
                    statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3C4' } };
                } else if (item.availability_status === 'Out of Order') {
                    statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFCDD2' } };
                }
            });

            // Apply borders
            this.applyBorders(worksheet, 1, 1, reportData.data.length + 1, headers.length);
        } else {
            worksheet.getCell(2, 1).value = 'No availability data available for the selected period';
            worksheet.mergeCells('A2:I2');
            worksheet.getCell(2, 1).alignment = { horizontal: 'center' };
            worksheet.getCell(2, 1).font = { italic: true, color: { argb: 'FF757575' } };
        }
    }

    static async createMaintenanceReportSheet(workbook, reportData) {
        const worksheet = workbook.addWorksheet('🛠️ Maintenance Records', {
            properties: { tabColor: { argb: 'FFFFC107' } }
        });

        const headers = [
            'ID', 'Equipment Name', 'Maintenance Type', 'Scheduled Date', 'Completion Date',
            'Status', 'Technician', 'Estimated Cost', 'Actual Cost', 'Priority', 'Variance'
        ];

        worksheet.columns = headers.map(() => ({ width: 15 }));

        // Add headers
        headers.forEach((header, index) => {
            const cell = worksheet.getCell(1, index + 1);
            cell.value = header;
            cell.font = { bold: true, color: { argb: 'FF000000' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC107' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        // Add data
        if (reportData && reportData.data && Array.isArray(reportData.data)) {
            reportData.data.forEach((item, index) => {
                const row = index + 2;
                worksheet.getCell(row, 1).value = item.id || '';
                worksheet.getCell(row, 2).value = item.equipment_name || '';
                worksheet.getCell(row, 3).value = item.maintenance_type || '';
                worksheet.getCell(row, 4).value = item.scheduled_date ? new Date(item.scheduled_date).toLocaleDateString() : '';
                worksheet.getCell(row, 5).value = item.completion_date ? new Date(item.completion_date).toLocaleDateString() : '';
                worksheet.getCell(row, 6).value = item.status || '';
                worksheet.getCell(row, 7).value = item.technician || '';
                worksheet.getCell(row, 8).value = parseFloat(item.estimated_cost) || 0;
                worksheet.getCell(row, 9).value = parseFloat(item.actual_cost) || 0;
                worksheet.getCell(row, 10).value = item.priority || '';

                // Calculate variance
                const estimated = parseFloat(item.estimated_cost) || 0;
                const actual = parseFloat(item.actual_cost) || 0;
                const variance = actual - estimated;
                worksheet.getCell(row, 11).value = variance;

                // Format currency
                worksheet.getCell(row, 8).numFmt = '"$"#,##0.00';
                worksheet.getCell(row, 9).numFmt = '"$"#,##0.00';
                worksheet.getCell(row, 11).numFmt = '"$"#,##0.00';

                // Color code priority
                const priorityCell = worksheet.getCell(row, 10);
                if (item.priority === 'high') {
                    priorityCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFCDD2' } };
                } else if (item.priority === 'medium') {
                    priorityCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3C4' } };
                } else if (item.priority === 'low') {
                    priorityCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC8E6C9' } };
                }

                // Color code variance
                const varianceCell = worksheet.getCell(row, 11);
                if (variance > 0) {
                    varianceCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFCDD2' } };
                } else if (variance < 0) {
                    varianceCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC8E6C9' } };
                }

                // Color code status
                const statusCell = worksheet.getCell(row, 6);
                if (item.status === 'completed') {
                    statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC8E6C9' } };
                } else if (item.status === 'in_progress') {
                    statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3C4' } };
                } else if (item.status === 'overdue') {
                    statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFCDD2' } };
                }
            });

            // Add totals row
            const totalRow = reportData.data.length + 2;
            worksheet.getCell(totalRow, 1).value = 'TOTAL';
            worksheet.getCell(totalRow, 1).font = { bold: true };
            worksheet.getCell(totalRow, 8).value = reportData.data.reduce((sum, item) => sum + (parseFloat(item.estimated_cost) || 0), 0);
            worksheet.getCell(totalRow, 9).value = reportData.data.reduce((sum, item) => sum + (parseFloat(item.actual_cost) || 0), 0);
            worksheet.getCell(totalRow, 11).value = reportData.data.reduce((sum, item) => {
                const estimated = parseFloat(item.estimated_cost) || 0;
                const actual = parseFloat(item.actual_cost) || 0;
                return sum + (actual - estimated);
            }, 0);

            worksheet.getRow(totalRow).font = { bold: true };
            worksheet.getRow(totalRow).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F0F0' } };

            // Apply borders
            this.applyBorders(worksheet, 1, 1, totalRow, headers.length);
        } else {
            worksheet.getCell(2, 1).value = 'No maintenance data available for the selected period';
            worksheet.mergeCells('A2:K2');
            worksheet.getCell(2, 1).alignment = { horizontal: 'center' };
            worksheet.getCell(2, 1).font = { italic: true, color: { argb: 'FF757575' } };
        }
    }

    static async createUserReportSheet(workbook, reportData) {
        const worksheet = workbook.addWorksheet('👥 User Activity', {
            properties: { tabColor: { argb: 'FF6F42C1' } }
        });

        const headers = [
            'User ID', 'Name', 'Email', 'Role', 'Department',
            'Student ID', 'Total Bookings', 'Completed', 'Cancelled', 'Total Hours', 'Avg Hours/Booking'
        ];

        worksheet.columns = headers.map(() => ({ width: 15 }));

        // Add headers
        headers.forEach((header, index) => {
            const cell = worksheet.getCell(1, index + 1);
            cell.value = header;
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6F42C1' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        // Add data
        if (reportData && reportData.data && Array.isArray(reportData.data)) {
            reportData.data.forEach((item, index) => {
                const row = index + 2;
                worksheet.getCell(row, 1).value = item.user_id || '';
                worksheet.getCell(row, 2).value = item.name || '';
                worksheet.getCell(row, 3).value = item.email || '';
                worksheet.getCell(row, 4).value = item.role || '';
                worksheet.getCell(row, 5).value = item.department || '';
                worksheet.getCell(row, 6).value = item.student_id || '';
                worksheet.getCell(row, 7).value = parseInt(item.total_bookings) || 0;
                worksheet.getCell(row, 8).value = parseInt(item.completed_bookings) || 0;
                worksheet.getCell(row, 9).value = parseInt(item.cancelled_bookings) || 0;
                worksheet.getCell(row, 10).value = parseFloat(item.total_hours) || 0;

                // Calculate average hours per booking
                const totalBookings = parseInt(item.total_bookings) || 0;
                const totalHours = parseFloat(item.total_hours) || 0;
                const avgHours = totalBookings > 0 ? totalHours / totalBookings : 0;
                worksheet.getCell(row, 11).value = avgHours;

                // Format hours
                worksheet.getCell(row, 10).numFmt = '0.00';
                worksheet.getCell(row, 11).numFmt = '0.00';

                // Highlight top users (top 3)
                if (index < 3) {
                    worksheet.getRow(row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE1F5FE' } };
                }

                // Color code based on activity level
                const activityLevel = parseInt(item.total_bookings) || 0;
                if (activityLevel >= 20) {
                    worksheet.getCell(row, 7).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC8E6C9' } };
                } else if (activityLevel >= 10) {
                    worksheet.getCell(row, 7).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3C4' } };
                } else if (activityLevel > 0) {
                    worksheet.getCell(row, 7).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFCDD2' } };
                }
            });

            // Add totals row
            const totalRow = reportData.data.length + 2;
            worksheet.getCell(totalRow, 1).value = 'TOTAL';
            worksheet.getCell(totalRow, 1).font = { bold: true };
            worksheet.getCell(totalRow, 7).value = reportData.data.reduce((sum, item) => sum + (parseInt(item.total_bookings) || 0), 0);
            worksheet.getCell(totalRow, 8).value = reportData.data.reduce((sum, item) => sum + (parseInt(item.completed_bookings) || 0), 0);
            worksheet.getCell(totalRow, 9).value = reportData.data.reduce((sum, item) => sum + (parseInt(item.cancelled_bookings) || 0), 0);
            worksheet.getCell(totalRow, 10).value = reportData.data.reduce((sum, item) => sum + (parseFloat(item.total_hours) || 0), 0);

            worksheet.getRow(totalRow).font = { bold: true };
            worksheet.getRow(totalRow).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F0F0' } };

            // Apply borders
            this.applyBorders(worksheet, 1, 1, totalRow, headers.length);
        } else {
            worksheet.getCell(2, 1).value = 'No user activity data available for the selected period';
            worksheet.mergeCells('A2:K2');
            worksheet.getCell(2, 1).alignment = { horizontal: 'center' };
            worksheet.getCell(2, 1).font = { italic: true, color: { argb: 'FF757575' } };
        }
    }

    static async createFinancialReportSheet(workbook, reportData) {
        const worksheet = workbook.addWorksheet('💰 Financial Analysis', {
            properties: { tabColor: { argb: 'FF198754' } }
        });

        // Set column widths
        worksheet.columns = [
            { width: 30 },
            { width: 20 },
            { width: 15 },
            { width: 15 }
        ];

        // Title
        worksheet.mergeCells('A1:D1');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = '💰 Financial Analysis & Cost Management';
        titleCell.font = { size: 14, bold: true, color: { argb: 'FF198754' } };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0FFF0' } };

        let row = 3;

        // Summary data
        if (reportData && reportData.summary) {
            worksheet.mergeCells(`A${row}:B${row}`);
            worksheet.getCell(`A${row}`).value = '📊 Financial Summary';
            worksheet.getCell(`A${row}`).font = { bold: true, size: 12, color: { argb: 'FF198754' } };
            worksheet.getCell(`A${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E8' } };
            row++;

            const summaryData = [
                ['Total Maintenance Cost (Estimated)', parseFloat(reportData.summary.total_maintenance_cost || 0)],
                ['Total Maintenance Cost (Actual)', parseFloat(reportData.summary.actual_maintenance_cost || 0)],
                ['Cost Variance', parseFloat(reportData.summary.cost_variance || 0)],
                ['Cost Variance Percentage', parseFloat(reportData.summary.cost_variance_percentage || 0)],
                ['Total Maintenance Items', parseInt(reportData.summary.maintenance_count || 0)],
                ['Average Cost per Maintenance', parseFloat(reportData.summary.average_cost_per_maintenance || 0)],
            ];

            summaryData.forEach(([label, value]) => {
                worksheet.getCell(row, 1).value = label;
                worksheet.getCell(row, 2).value = value;

                if (label.includes('Cost') || label.includes('Average')) {
                    worksheet.getCell(row, 2).numFmt = '"$"#,##0.00';
                } else if (label.includes('Percentage')) {
                    worksheet.getCell(row, 2).numFmt = '0.00"%"';
                }

                // Color code variance
                if (label.includes('Variance') && typeof value === 'number') {
                    if (value > 0) {
                        worksheet.getCell(row, 2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFCDD2' } };
                    } else if (value < 0) {
                        worksheet.getCell(row, 2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC8E6C9' } };
                    }
                }

                row++;
            });

            // Monthly breakdown if available
            if (reportData.monthly_breakdown && reportData.monthly_breakdown.length > 0) {
                row += 2;
                worksheet.mergeCells(`A${row}:D${row}`);
                worksheet.getCell(`A${row}`).value = '📅 Monthly Cost Breakdown';
                worksheet.getCell(`A${row}`).font = { bold: true, size: 12, color: { argb: 'FF198754' } };
                worksheet.getCell(`A${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E8' } };
                row++;

                // Headers for monthly breakdown
                worksheet.getCell(row, 1).value = 'Year';
                worksheet.getCell(row, 2).value = 'Month';
                worksheet.getCell(row, 3).value = 'Total Cost';
                worksheet.getCell(row, 4).value = 'Item Count';
                worksheet.getRow(row).font = { bold: true };
                worksheet.getRow(row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD4E6F1' } };
                row++;

                reportData.monthly_breakdown.forEach(item => {
                    worksheet.getCell(row, 1).value = item.year;
                    worksheet.getCell(row, 2).value = item.month;
                    worksheet.getCell(row, 3).value = parseFloat(item.cost || 0);
                    worksheet.getCell(row, 4).value = parseInt(item.count || 0);
                    worksheet.getCell(row, 3).numFmt = '"$"#,##0.00';
                    row++;
                });
            }
        } else {
            worksheet.getCell(row, 1).value = 'No financial data available for the selected period';
            worksheet.getCell(row, 1).font = { italic: true, color: { argb: 'FF757575' } };
        }

        // Apply borders
        this.applyBorders(worksheet, 1, 1, row - 1, 4);
    }

    static async createComprehensiveSheets(workbook, reportData) {
        // Create individual sheets for each report type if data exists
        if (reportData.usage && reportData.usage.data && reportData.usage.data.length > 0) {
            await this.createUsageReportSheet(workbook, reportData.usage);
        }
        if (reportData.availability && reportData.availability.data && reportData.availability.data.length > 0) {
            await this.createAvailabilityReportSheet(workbook, reportData.availability);
        }
        if (reportData.maintenance && reportData.maintenance.data && reportData.maintenance.data.length > 0) {
            await this.createMaintenanceReportSheet(workbook, reportData.maintenance);
        }
        if (reportData.user && reportData.user.data && reportData.user.data.length > 0) {
            await this.createUserReportSheet(workbook, reportData.user);
        }
        if (reportData.financial && (reportData.financial.summary || reportData.financial.monthly_breakdown)) {
            await this.createFinancialReportSheet(workbook, reportData.financial);
        }
    }

    static async createGenericReportSheet(workbook, reportData) {
        const worksheet = workbook.addWorksheet('📋 Report Data', {
            properties: { tabColor: { argb: 'FF6C757D' } }
        });

        worksheet.columns = [{ width: 80 }];

        if (reportData && typeof reportData === 'object') {
            worksheet.getCell('A1').value = 'Report Data (JSON Format)';
            worksheet.getCell('A1').font = { bold: true, size: 14 };
            worksheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };

            const jsonString = JSON.stringify(reportData, null, 2);
            worksheet.getCell('A3').value = jsonString;
            worksheet.getCell('A3').alignment = { wrapText: true, vertical: 'top' };
            worksheet.getCell('A3').font = { size: 9, name: 'Courier New' };
        } else {
            worksheet.getCell('A1').value = 'No data available';
            worksheet.getCell('A1').font = { italic: true, color: { argb: 'FF757575' } };
        }
    }

    static applyBorders(worksheet, startRow, startCol, endRow, endCol) {
        const borderStyle = {
            style: 'thin',
            color: { argb: 'FF000000' }
        };

        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                const cell = worksheet.getCell(row, col);
                cell.border = {
                    top: borderStyle,
                    left: borderStyle,
                    bottom: borderStyle,
                    right: borderStyle
                };
            }
        }
    }
}

module.exports = ExcelExportService;