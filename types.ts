export type Matrix = number[][];
export type Tensor3D = number[][][];

export enum LayerType {
  INPUT = 'Input',
  CONV = 'Convolution',
  POOL = 'Pooling',
  FLATTEN = 'Flatten',
  LINEAR = 'Linear (Fully Connected)',
  OUTPUT = 'Output',
}

export interface LayerConfig {
  id: string;
  type: LayerType;
  name: string;
  description: string;
  params?: {
    filters?: number;
    kernelSize?: number;
    stride?: number;
    padding?: number;
    units?: number;
    activation?: 'relu' | 'softmax' | 'tanh';
  };
  inputShape: string;
  outputShape: string;
}

export interface ConvSimulationState {
  inputGrid: Matrix;
  kernel: Matrix;
  stride: number;
  padding: number;
  outputGrid: Matrix;
}

export interface ActivationRecord {
  layerId: string;
  data: Tensor3D | number[]; // 3D for conv/pool, 1D for linear
}