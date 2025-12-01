import { Matrix } from '../types';

export const createMatrix = (rows: number, cols: number, initialValue: number = 0): Matrix => {
  return Array.from({ length: rows }, () => Array(cols).fill(initialValue));
};

export const padMatrix = (input: Matrix, padding: number): Matrix => {
  if (padding === 0) return input;
  const rows = input.length;
  const cols = input[0].length;
  const newRows = rows + 2 * padding;
  const newCols = cols + 2 * padding;
  const output = createMatrix(newRows, newCols, 0);

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      output[i + padding][j + padding] = input[i][j];
    }
  }
  return output;
};

export const convolve2d = (input: Matrix, kernel: Matrix, stride: number = 1, padding: number = 0): Matrix => {
  const paddedInput = padMatrix(input, padding);
  const inputH = paddedInput.length;
  const inputW = paddedInput[0].length;
  const kernelH = kernel.length;
  const kernelW = kernel[0].length;

  const outputH = Math.floor((inputH - kernelH) / stride) + 1;
  const outputW = Math.floor((inputW - kernelW) / stride) + 1;

  const output = createMatrix(outputH, outputW, 0);

  for (let i = 0; i < outputH; i++) {
    for (let j = 0; j < outputW; j++) {
      let sum = 0;
      for (let ki = 0; ki < kernelH; ki++) {
        for (let kj = 0; kj < kernelW; kj++) {
          const row = i * stride + ki;
          const col = j * stride + kj;
          sum += paddedInput[row][col] * kernel[ki][kj];
        }
      }
      output[i][j] = sum;
    }
  }
  return output;
};

export const maxPool2d = (input: Matrix, poolSize: number = 2, stride: number = 2): Matrix => {
  const inputH = input.length;
  const inputW = input[0].length;
  const outputH = Math.floor((inputH - poolSize) / stride) + 1;
  const outputW = Math.floor((inputW - poolSize) / stride) + 1;
  const output = createMatrix(outputH, outputW, 0);

  for (let i = 0; i < outputH; i++) {
    for (let j = 0; j < outputW; j++) {
      let maxVal = -Infinity;
      for (let ki = 0; ki < poolSize; ki++) {
        for (let kj = 0; kj < poolSize; kj++) {
          const row = i * stride + ki;
          const col = j * stride + kj;
          // Boundary check just in case, though math above should handle it
          if (row < inputH && col < inputW) {
             maxVal = Math.max(maxVal, input[row][col]);
          }
        }
      }
      output[i][j] = maxVal;
    }
  }
  return output;
};

export const tanh = (x: number): number => Math.tanh(x);
export const relu = (x: number): number => Math.max(0, x);

export const applyActivation = (matrix: Matrix, type: 'relu' | 'tanh'): Matrix => {
  return matrix.map(row => row.map(val => type === 'relu' ? relu(val) : tanh(val)));
};

export const flatten = (tensor: number[][][]): number[] => {
  const flat: number[] = [];
  tensor.forEach(matrix => {
    matrix.forEach(row => {
      row.forEach(val => flat.push(val));
    });
  });
  return flat;
};

// Normalize matrix values to 0-1 range for visualization
export const normalizeMatrix = (matrix: Matrix): Matrix => {
    let min = Infinity;
    let max = -Infinity;
    matrix.forEach(row => row.forEach(val => {
        if (val < min) min = val;
        if (val > max) max = val;
    }));
    
    const range = max - min;
    if (range === 0) return createMatrix(matrix.length, matrix[0].length, 0);

    return matrix.map(row => row.map(val => (val - min) / range));
};
