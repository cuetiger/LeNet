import { LayerConfig, LayerType } from './types';

export const LENET_LAYERS: LayerConfig[] = [
  {
    id: 'input',
    type: LayerType.INPUT,
    name: 'Input Image',
    description: 'The raw input image (MNIST digit), typically 28x28 or 32x32 pixels.',
    inputShape: '28x28x1',
    outputShape: '28x28x1',
  },
  {
    id: 'conv1',
    type: LayerType.CONV,
    name: 'C1: Convolution',
    description: 'First convolutional layer. Extracts low-level features like edges and curves.',
    params: { filters: 6, kernelSize: 5, stride: 1, padding: 2, activation: 'tanh' },
    inputShape: '28x28x1',
    outputShape: '28x28x6',
  },
  {
    id: 'pool1',
    type: LayerType.POOL,
    name: 'S2: Average Pooling',
    description: 'Subsampling layer to reduce spatial dimensions and sensitivity to shifts.',
    params: { kernelSize: 2, stride: 2 },
    inputShape: '28x28x6',
    outputShape: '14x14x6',
  },
  {
    id: 'conv2',
    type: LayerType.CONV,
    name: 'C3: Convolution',
    description: 'Second convolutional layer. Combines lower-level features into complex patterns.',
    params: { filters: 16, kernelSize: 5, stride: 1, padding: 0, activation: 'tanh' },
    inputShape: '14x14x6',
    outputShape: '10x10x16',
  },
  {
    id: 'pool2',
    type: LayerType.POOL,
    name: 'S4: Average Pooling',
    description: 'Further dimensionality reduction.',
    params: { kernelSize: 2, stride: 2 },
    inputShape: '10x10x16',
    outputShape: '5x5x16',
  },
  {
    id: 'flatten',
    type: LayerType.FLATTEN,
    name: 'Flatten',
    description: 'Converts 2D feature maps into a 1D vector for the fully connected layers.',
    inputShape: '5x5x16',
    outputShape: '400',
  },
  {
    id: 'fc1',
    type: LayerType.LINEAR,
    name: 'C5: Fully Connected',
    description: 'Dense layer processing global information.',
    params: { units: 120, activation: 'tanh' },
    inputShape: '400',
    outputShape: '120',
  },
  {
    id: 'fc2',
    type: LayerType.LINEAR,
    name: 'F6: Fully Connected',
    description: 'Second dense layer.',
    params: { units: 84, activation: 'tanh' },
    inputShape: '120',
    outputShape: '84',
  },
  {
    id: 'output',
    type: LayerType.OUTPUT,
    name: 'Output',
    description: 'Final classification layer with 10 units (digits 0-9).',
    params: { units: 10, activation: 'softmax' },
    inputShape: '84',
    outputShape: '10',
  },
];

// Pre-defined kernels for the playground
export const SOBEL_X = [
  [-1, 0, 1],
  [-2, 0, 2],
  [-1, 0, 1],
];

export const SOBEL_Y = [
  [-1, -2, -1],
  [0, 0, 0],
  [1, 2, 1],
];

export const EDGE_DETECT = [
  [-1, -1, -1],
  [-1, 8, -1],
  [-1, -1, -1],
];

export const BLUR = [
  [0.11, 0.11, 0.11],
  [0.11, 0.11, 0.11],
  [0.11, 0.11, 0.11],
];
