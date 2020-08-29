const createGrid = (gridSize) => {
    // Create one dimensional array 
    const grid = new Array(gridSize)
        
    // Loop to create 2D array using 1D array 
    for (let i = 0; i < grid.length; i++) { 
        grid[i] = new Array(gridSize);
    }
        
    // Loop to initialize 2D array elements. 
    for (let i = 0; i < gridSize; i++) { 
        for (let j = 0; j < gridSize; j++) {
        if (i === 3 && j === 3) grid[i][j] = ["white"]

        else grid[i][j] = [] 
        } 
    }

    return grid
}
  
const updateGrid = (grid = [], ball = {}) => {
    if (!grid.length) grid = createGrid(7)

    if (Object.keys(ball).length) grid[ball.row][ball.column].push(ball.color)

    return grid
}

module.exports = {
    updateGrid: updateGrid
}