export class UiWidgetGrid {
    constructor() {
        this.gridElement = null;
        this.dotNetRef = null;
        this.resizeObserver = null;
        this.cellSize = 170;
        this.gap = 24;
    }

    init(gridElement, dotNetRef) {
        this.gridElement = gridElement;
        this.dotNetRef = dotNetRef;

        // Calculate initial grid dimensions
        this.calculateGridDimensions();

        // Set up resize observer for viewport changes
        this.setupResizeObserver();

        // Also listen to window resize events
        window.addEventListener('resize', () => this.handleResize());

        return {success: true};
    }

    calculateGridDimensions() {
        if (!this.gridElement) return null;

        // Get CSS variables from computed styles
        const computedStyle = getComputedStyle(this.gridElement);
        const cellSizeValue = computedStyle.getPropertyValue('--cell-size').trim();
        const cellGapValue = computedStyle.getPropertyValue('--cell-gap').trim();

        // Parse pixel values (remove 'px' and convert to number)
        this.cellSize = parseInt(cellSizeValue.replace('px', ''));
        this.gap = parseInt(cellGapValue.replace('px', ''));

        const cssGridColumns = computedStyle.getPropertyValue('grid-template-columns');
        const cssGridRows = computedStyle.getPropertyValue('grid-template-rows');

        const numberOfColumns = this.parseGridTrackCount(cssGridColumns);
        const numberOfRows = this.parseGridTrackCount(cssGridRows);

        // Create div for every cell, check if there is a div and remove divs from cells that don't exist
        this.manageGridCells(numberOfColumns, numberOfRows);
    }

    /**
     * Parse grid track count from CSS grid-template-columns or grid-template-rows value
     * Handles various CSS grid syntax including repeat(), fr units, px values, auto, etc.
     * @param {string} gridTrackValue - The CSS grid template value
     * @returns {number} - The number of tracks/columns/rows
     */
    parseGridTrackCount(gridTrackValue) {
        if (!gridTrackValue || gridTrackValue === 'none' || gridTrackValue === 'initial') {
            return 0;
        }

        // Clean up the value
        const cleanValue = gridTrackValue.trim();

        // Handle repeat() function syntax
        const repeatPattern = /repeat\s*\(\s*(\d+)\s*,\s*([^)]+)\)/gi;
        let processedValue = cleanValue;
        let totalTracks = 0;

        // Process repeat() functions
        let match;
        while ((match = repeatPattern.exec(cleanValue)) !== null) {
            const repeatCount = parseInt(match[1]);
            const repeatContent = match[2].trim();

            // Count tracks within repeat content
            const tracksInRepeat = this.countTracksInValue(repeatContent);
            totalTracks += repeatCount * tracksInRepeat;

            // Remove the repeat() from the processed value
            processedValue = processedValue.replace(match[0], '');
        }

        // Process remaining tracks outside of repeat()
        const remainingTracks = this.countTracksInValue(processedValue);
        totalTracks += remainingTracks;

        return totalTracks;
    }

    /**
     * Count individual tracks in a CSS value (excluding repeat() functions)
     * @param {string} value - CSS value to parse
     * @returns {number} - Number of tracks
     */
    countTracksInValue(value) {
        if (!value || value.trim() === '') {
            return 0;
        }

        // Remove any remaining repeat() functions (shouldn't happen, but safety)
        const cleanValue = value.replace(/repeat\s*\([^)]+\)/gi, '').trim();

        if (cleanValue === '') {
            return 0;
        }

        // Split by whitespace and filter out empty strings
        const tracks = cleanValue.split(/\s+/).filter(track => track.trim() !== '');

        // Filter out CSS functions that don't represent actual tracks
        const validTracks = tracks.filter(track => {
            // Remove grid line names in brackets
            if (track.startsWith('[') && track.endsWith(']')) {
                return false;
            }
            // Keep valid track sizes
            return true;
        });

        return validTracks.length;
    }

    setupResizeObserver() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }

        // Use ResizeObserver for more efficient detection of size changes
        this.resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                this.handleResize();
            }
        });

        if (this.gridElement) {
            this.resizeObserver.observe(this.gridElement);
        }
    }

    handleResize() {
        // Debounce resize events
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.calculateGridDimensions();
        }, 100);
    }

    dispose() {
        // Clean up event listeners and observers
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }

        window.removeEventListener('resize', this.handleResize);

        this.gridElement = null;
        this.dotNetRef = null;
    }

    /**
     * Manage grid cell divs - create new ones and remove obsolete ones
     * @param {number} columns - Number of columns in the grid
     * @param {number} rows - Number of rows in the grid
     */
    manageGridCells(columns, rows) {
        if (!this.gridElement || columns === 0 || rows === 0) return;

        console.log('columns:', columns, 'rows:', rows);

        const totalCells = columns * rows;
        const existingCells = this.gridElement.querySelectorAll('.grid-cell');

        console.log('totalCells:', totalCells, 'existingCells:', existingCells);

        // Remove excess cells if we have more than needed
        if (existingCells.length > totalCells) {
            for (let i = totalCells; i < existingCells.length; i++) {
                existingCells[i].remove();
            }
        }

        // Create missing cells
        for (let i = existingCells.length; i < totalCells; i++) {
            const cellDiv = document.createElement('div');
            cellDiv.className = 'grid-cell';
            cellDiv.setAttribute('data-cell-index', i.toString());

            // Calculate row and column position
            const row = Math.floor(i / columns) + 1;
            const col = (i % columns) + 1;

            cellDiv.style.gridRow = row.toString();
            cellDiv.style.gridColumn = col.toString();

            this.gridElement.appendChild(cellDiv);
        }

        // Update existing cells with correct grid positions
        const allCells = this.gridElement.querySelectorAll('.grid-cell');
        allCells.forEach((cell, index) => {
            if (index < totalCells) {
                const row = Math.floor(index / columns) + 1;
                const col = (index % columns) + 1;

                cell.style.gridRow = row.toString();
                cell.style.gridColumn = col.toString();
                cell.setAttribute('data-cell-index', index.toString());
            }
        });
    }
}

// Export function to create new instance
export function createUiWidgetGrid() {
    return new UiWidgetGrid();
}
