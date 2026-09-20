// The animated mesh gradient, a typed port of the `Gradient` class of `UiStripeBackground.razor.js`.
// Scroll handling, the gradient legend and the mouse scrubbing of the original were never wired
// up and are not ported.

import { parseHexColor, type RgbColor } from './colors';
import { MiniGl, type Mesh, type ScalarUniform, type Uniform, type Uniforms } from './miniGl';
import { blendShader, fragmentShader, noiseShader, vertexShader } from './shaders';

export interface StripeGradientOptions {
  /** Hex colors. The first is the base, the others become wave layers. */
  colors: readonly string[];
  width: number;
  height: number;
  targetFps?: number;
  /** Render a single frame and stop, for `prefers-reduced-motion`. */
  still?: boolean;
}

export interface StripeGradient {
  resize(width: number, height: number): void;
  dispose(): void;
}

// Numbers of the original
const DENSITY = [0.06, 0.16] as const;
const START_TIME = 1253106;
const AMPLITUDE = 500;
const SEED = 5;
const FREQUENCY = [14e-5, 29e-5];
const ANGLE = 0;

const float = (value: number): ScalarUniform => ({ type: 'float', value });

function waveLayer(color: RgbColor, index: number, colorCount: number): Uniform {
  return {
    type: 'struct',
    value: {
      color: { type: 'vec3', value: color },
      noiseFreq: { type: 'vec2', value: [2 + index / colorCount, 3 + index / colorCount] },
      noiseSpeed: float(11 + 0.3 * index),
      noiseFlow: float(6.5 + 0.3 * index),
      noiseSeed: float(SEED + 10 * index),
      noiseFloor: float(0.1),
      noiseCeil: float(0.63 + 0.07 * index),
    },
  };
}

/** Starts the gradient on the canvas. `null` without WebGL or without a usable color. */
export function createStripeGradient(canvas: HTMLCanvasElement, options: StripeGradientOptions): StripeGradient | null {
  const colors = options.colors.map(parseHexColor).filter((color): color is RgbColor => color !== null);
  const [baseColor, ...layerColors] = colors;
  if (baseColor === undefined) return null;

  const renderer = MiniGl.create(canvas);
  if (renderer === null) return null;
  // Function declarations below do not see the narrowing of `renderer`
  const miniGl: MiniGl = renderer;

  const time = float(0);
  const shadowPower = float(5);
  const uniforms: Uniforms = {
    u_time: time,
    u_shadow_power: shadowPower,
    u_darken_top: float(0),
    u_active_colors: { type: 'vec4', value: [1, 1, 1, 1] },
    u_global: {
      type: 'struct',
      value: {
        noiseFreq: { type: 'vec2', value: [...FREQUENCY] },
        noiseSpeed: float(5e-6),
      },
    },
    u_vertDeform: {
      type: 'struct',
      excludeFrom: 'fragment',
      value: {
        incline: float(Math.sin(ANGLE) / Math.cos(ANGLE)),
        offsetTop: float(-0.5),
        offsetBottom: float(-0.5),
        noiseFreq: { type: 'vec2', value: [3, 4] },
        noiseAmp: float(AMPLITUDE),
        noiseSpeed: float(10),
        noiseFlow: float(3),
        noiseSeed: float(SEED),
      },
    },
    u_baseColor: { type: 'vec3', value: baseColor, excludeFrom: 'fragment' },
    u_waveLayers: {
      type: 'array',
      excludeFrom: 'fragment',
      value: layerColors.map((color, index) => waveLayer(color, index + 1, colors.length)),
    },
  };

  const mesh: Mesh = miniGl.createMesh([noiseShader, blendShader, vertexShader].join('\n\n'), fragmentShader, uniforms);
  const frameBudget = 1000 / Math.max(1, Math.min(options.targetFps ?? 30, 120));

  let elapsed = START_TIME;
  let last = 0;
  let frameHandle = 0;
  let disposed = false;

  function resize(width: number, height: number): void {
    miniGl.setSize(width, height);
    miniGl.setOrthographicCamera();
    mesh.geometry.setTopology(Math.ceil(width * DENSITY[0]), Math.ceil(height * DENSITY[1]));
    mesh.geometry.setSize(width, height);
    shadowPower.value = width < 600 ? 5 : 6;

    if (options.still) {
      draw();
    }
  }

  function draw(): void {
    time.value = elapsed;
    miniGl.render();
  }

  function animate(now: number): void {
    if (disposed) return;
    frameHandle = requestAnimationFrame(animate);

    // As the original: nothing while the tab is hidden, and only every other frame
    if (document.hidden || Math.trunc(now) % 2 === 0) return;

    elapsed += Math.min(now - last, frameBudget);
    last = now;
    draw();
  }

  resize(options.width, options.height);
  if (!options.still) {
    frameHandle = requestAnimationFrame(animate);
  }

  return {
    resize,
    dispose() {
      disposed = true;
      cancelAnimationFrame(frameHandle);
      miniGl.dispose();
    },
  };
}
