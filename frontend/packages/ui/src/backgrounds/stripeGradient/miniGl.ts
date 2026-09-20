// Minimal WebGL wrapper behind the stripe gradient. A typed port of the `MiniGl` class of
// `UiStripeBackground.razor.js`; structure and numbers follow the original.

export type ShaderKind = 'vertex' | 'fragment';

interface UniformBase {
  /** The uniform is not declared in this kind of shader. */
  excludeFrom?: ShaderKind;
}

export interface ScalarUniform extends UniformBase {
  type: 'float' | 'int';
  value: number;
}

export interface VectorUniform extends UniformBase {
  type: 'vec2' | 'vec3' | 'vec4' | 'mat4';
  value: number[];
}

export interface StructUniform extends UniformBase {
  type: 'struct';
  value: Record<string, Uniform>;
}

export interface ArrayUniform extends UniformBase {
  type: 'array';
  value: Uniform[];
}

export type Uniform = ScalarUniform | VectorUniform | StructUniform | ArrayUniform;
export type Uniforms = Record<string, Uniform>;

function declareUniform(uniform: Uniform, name: string, kind: ShaderKind, length = 0): string {
  if (uniform.excludeFrom === kind) return '';

  const suffix = length > 0 ? `[${length}]` : '';

  if (uniform.type === 'array') {
    const first = uniform.value[0];
    if (first === undefined) return '';
    return `${declareUniform(first, name, kind, uniform.value.length)}\nconst int ${name}_length = ${uniform.value.length};`;
  }

  if (uniform.type === 'struct') {
    const bare = name.replace('u_', '');
    const structName = bare.charAt(0).toUpperCase() + bare.slice(1);
    const fields = Object.entries(uniform.value)
      .map(([field, value]) => declareUniform(value, field, kind).replace(/^uniform/, ''))
      .join('');
    return `uniform struct ${structName}\n{\n${fields}\n} ${name}${suffix};`;
  }

  return `uniform ${uniform.type} ${name}${suffix};`;
}

function declareUniforms(uniforms: Uniforms, kind: ShaderKind): string {
  return Object.entries(uniforms)
    .map(([name, uniform]) => declareUniform(uniform, name, kind))
    .join('\n');
}

interface UniformInstance {
  uniform: ScalarUniform | VectorUniform;
  location: WebGLUniformLocation | null;
}

class Material {
  readonly program: WebGLProgram;
  private readonly uniformInstances: UniformInstance[] = [];

  constructor(
    private readonly gl: WebGLRenderingContext,
    commonUniforms: Uniforms,
    vertexSource: string,
    fragmentSource: string,
    readonly uniforms: Uniforms,
  ) {
    const prefix = 'precision highp float;';
    const vertex = [
      prefix,
      'attribute vec4 position;',
      'attribute vec2 uv;',
      'attribute vec2 uvNorm;',
      declareUniforms(commonUniforms, 'vertex'),
      declareUniforms(uniforms, 'vertex'),
      vertexSource,
    ].join('\n');
    const fragment = [
      prefix,
      declareUniforms(commonUniforms, 'fragment'),
      declareUniforms(uniforms, 'fragment'),
      fragmentSource,
    ].join('\n');

    const program = gl.createProgram();
    if (program === null) throw new Error('WebGL program could not be created');
    this.program = program;

    gl.attachShader(program, this.compile(gl.VERTEX_SHADER, vertex));
    gl.attachShader(program, this.compile(gl.FRAGMENT_SHADER, fragment));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
    }
    gl.useProgram(program);

    for (const [name, uniform] of Object.entries({ ...commonUniforms, ...uniforms })) {
      this.attach(name, uniform);
    }
  }

  /** Pushes the current values of all uniforms to the GPU. */
  update(): void {
    const gl = this.gl;

    for (const { uniform, location } of this.uniformInstances) {
      switch (uniform.type) {
        case 'float':
          gl.uniform1f(location, uniform.value);
          break;
        case 'int':
          gl.uniform1i(location, uniform.value);
          break;
        case 'vec2':
          gl.uniform2fv(location, uniform.value);
          break;
        case 'vec3':
          gl.uniform3fv(location, uniform.value);
          break;
        case 'vec4':
          gl.uniform4fv(location, uniform.value);
          break;
        case 'mat4':
          gl.uniformMatrix4fv(location, false, uniform.value);
          break;
      }
    }
  }

  private compile(type: number, source: string): WebGLShader {
    const gl = this.gl;
    const shader = gl.createShader(type);
    if (shader === null) throw new Error('WebGL shader could not be created');

    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
    }
    return shader;
  }

  private attach(name: string, uniform: Uniform): void {
    if (uniform.type === 'array') {
      uniform.value.forEach((item, index) => this.attach(`${name}[${index}]`, item));
    } else if (uniform.type === 'struct') {
      for (const [field, value] of Object.entries(uniform.value)) {
        this.attach(`${name}.${field}`, value);
      }
    } else {
      this.uniformInstances.push({ uniform, location: this.gl.getUniformLocation(this.program, name) });
    }
  }
}

class Attribute {
  values: Float32Array | Uint16Array | undefined;
  private readonly buffer: WebGLBuffer | null;

  constructor(
    private readonly gl: WebGLRenderingContext,
    private readonly target: number,
    private readonly size: number,
  ) {
    this.buffer = gl.createBuffer();
  }

  update(): void {
    if (this.values === undefined) return;

    this.gl.bindBuffer(this.target, this.buffer);
    this.gl.bufferData(this.target, this.values, this.gl.STATIC_DRAW);
  }

  attach(name: string, program: WebGLProgram): number {
    const location = this.gl.getAttribLocation(program, name);
    if (this.target === this.gl.ARRAY_BUFFER) {
      this.point(location);
    }
    return location;
  }

  use(location: number): void {
    this.gl.bindBuffer(this.target, this.buffer);
    if (this.target === this.gl.ARRAY_BUFFER) {
      this.point(location);
    }
  }

  private point(location: number): void {
    this.gl.enableVertexAttribArray(location);
    this.gl.vertexAttribPointer(location, this.size, this.gl.FLOAT, false, 0, 0);
  }
}

/** A flat, subdivided plane in the xz orientation of the original. */
class PlaneGeometry {
  readonly attributes: Record<'position' | 'uv' | 'uvNorm' | 'index', Attribute>;
  private xSegCount = 1;
  private ySegCount = 1;
  private vertexCount = 0;

  constructor(gl: WebGLRenderingContext) {
    this.attributes = {
      position: new Attribute(gl, gl.ARRAY_BUFFER, 3),
      uv: new Attribute(gl, gl.ARRAY_BUFFER, 2),
      uvNorm: new Attribute(gl, gl.ARRAY_BUFFER, 2),
      index: new Attribute(gl, gl.ELEMENT_ARRAY_BUFFER, 3),
    };
    this.setTopology();
    this.setSize();
  }

  get indexCount(): number {
    return this.attributes.index.values?.length ?? 0;
  }

  setTopology(xSegCount = 1, ySegCount = 1): void {
    this.xSegCount = xSegCount;
    this.ySegCount = ySegCount;
    this.vertexCount = (xSegCount + 1) * (ySegCount + 1);

    const uv = new Float32Array(2 * this.vertexCount);
    const uvNorm = new Float32Array(2 * this.vertexCount);
    const index = new Uint16Array(3 * xSegCount * ySegCount * 2);

    for (let y = 0; y <= ySegCount; y += 1) {
      for (let x = 0; x <= xSegCount; x += 1) {
        const vertex = y * (xSegCount + 1) + x;
        uv[2 * vertex] = x / xSegCount;
        uv[2 * vertex + 1] = 1 - y / ySegCount;
        uvNorm[2 * vertex] = (x / xSegCount) * 2 - 1;
        uvNorm[2 * vertex + 1] = 1 - (y / ySegCount) * 2;

        if (x < xSegCount && y < ySegCount) {
          const quad = y * xSegCount + x;
          index[6 * quad] = vertex;
          index[6 * quad + 1] = vertex + 1 + xSegCount;
          index[6 * quad + 2] = vertex + 1;
          index[6 * quad + 3] = vertex + 1;
          index[6 * quad + 4] = vertex + 1 + xSegCount;
          index[6 * quad + 5] = vertex + 2 + xSegCount;
        }
      }
    }

    this.attributes.uv.values = uv;
    this.attributes.uvNorm.values = uvNorm;
    this.attributes.index.values = index;
    this.attributes.uv.update();
    this.attributes.uvNorm.update();
    this.attributes.index.update();
  }

  setSize(width = 1, height = 1): void {
    const position = new Float32Array(3 * this.vertexCount);
    const left = width / -2;
    const top = height / -2;
    const segmentWidth = width / this.xSegCount;
    const segmentHeight = height / this.ySegCount;

    for (let y = 0; y <= this.ySegCount; y += 1) {
      for (let x = 0; x <= this.xSegCount; x += 1) {
        const vertex = y * (this.xSegCount + 1) + x;
        position[3 * vertex] = left + x * segmentWidth;
        position[3 * vertex + 2] = -(top + y * segmentHeight);
      }
    }

    this.attributes.position.values = position;
    this.attributes.position.update();
  }
}

class Mesh {
  private readonly attributeInstances: { attribute: Attribute; location: number }[];

  constructor(
    private readonly gl: WebGLRenderingContext,
    readonly geometry: PlaneGeometry,
    readonly material: Material,
  ) {
    this.attributeInstances = Object.entries(geometry.attributes).map(([name, attribute]) => ({
      attribute,
      location: attribute.attach(name, material.program),
    }));
  }

  draw(): void {
    this.gl.useProgram(this.material.program);
    this.material.update();
    for (const { attribute, location } of this.attributeInstances) {
      attribute.use(location);
    }
    this.gl.drawElements(this.gl.TRIANGLES, this.geometry.indexCount, this.gl.UNSIGNED_SHORT, 0);
  }
}

const IDENTITY = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

export class MiniGl {
  private readonly meshes: Mesh[] = [];
  private width = 1;
  private height = 1;

  private readonly projectionMatrix: VectorUniform = { type: 'mat4', value: [...IDENTITY] };
  private readonly resolution: VectorUniform = { type: 'vec2', value: [1, 1] };
  private readonly aspectRatio: ScalarUniform = { type: 'float', value: 1 };
  private readonly commonUniforms: Uniforms = {
    projectionMatrix: this.projectionMatrix,
    modelViewMatrix: { type: 'mat4', value: [...IDENTITY] },
    resolution: this.resolution,
    aspectRatio: this.aspectRatio,
  };

  private constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly gl: WebGLRenderingContext,
  ) {}

  /** `null` where WebGL is not available. */
  static create(canvas: HTMLCanvasElement): MiniGl | null {
    const gl = canvas.getContext('webgl', { antialias: true });
    return gl === null ? null : new MiniGl(canvas, gl);
  }

  createMesh(vertexSource: string, fragmentSource: string, uniforms: Uniforms): Mesh {
    const material = new Material(this.gl, this.commonUniforms, vertexSource, fragmentSource, uniforms);
    const mesh = new Mesh(this.gl, new PlaneGeometry(this.gl), material);
    this.meshes.push(mesh);
    return mesh;
  }

  setSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
    this.gl.viewport(0, 0, width, height);
    this.resolution.value = [width, height];
    this.aspectRatio.value = width / height;
  }

  setOrthographicCamera(near = -2000, far = 2000): void {
    this.projectionMatrix.value = [
      ...[2 / this.width, 0, 0, 0],
      ...[0, 2 / this.height, 0, 0],
      ...[0, 0, 2 / (near - far), 0],
      ...[0, 0, 0, 1],
    ];
  }

  render(): void {
    this.gl.clearColor(0, 0, 0, 0);
    this.gl.clearDepth(1);
    for (const mesh of this.meshes) {
      mesh.draw();
    }
  }

  /** Gives the GPU resources back right away instead of waiting for garbage collection. */
  dispose(): void {
    this.meshes.length = 0;
    this.gl.getExtension('WEBGL_lose_context')?.loseContext();
  }
}

export type { Mesh };
