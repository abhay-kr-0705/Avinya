declare module '@react-three/fiber' {
  import * as THREE from 'three';
  import React from 'react';

  export type StateSelector<T> = (state: RootState) => T;
  export type Subscription = [StateSelector<any>, (value: any) => void];

  export interface Renderer {
    render(scene: THREE.Scene, camera: THREE.Camera): void;
  }

  export interface RootState {
    clock: THREE.Clock;
    scene: THREE.Scene;
    camera: THREE.Camera;
    gl: THREE.WebGLRenderer;
    size: { width: number; height: number };
    viewport: { width: number; height: number; factor: number };
    aspect: number;
  }

  export type UseFrameCallback = (state: RootState, delta: number) => void;

  export function useFrame(callback: UseFrameCallback, renderPriority?: number): void;

  export function Canvas(props: any): JSX.Element;

  export namespace ReactThreeFiber {
    export type Object3DNode<T extends THREE.Object3D, P> = P & {
      position?: [number, number, number] | THREE.Vector3;
      rotation?: [number, number, number] | THREE.Euler;
      scale?: [number, number, number] | THREE.Vector3;
    };

    export type LightNode<T extends THREE.Light, P> = Object3DNode<T, P> & {
      intensity?: number;
      color?: string;
    };
  }
}

declare module '@react-three/drei' {
  import * as THREE from 'three';
  import React from 'react';

  export function OrbitControls(props: any): JSX.Element;
  export function Sphere(props: any): JSX.Element;
  export function Text(props: any): JSX.Element;
  export function Environment(props: any): JSX.Element;
  export function MeshDistortMaterial(props: any): JSX.Element;
  export function MeshWobbleMaterial(props: any): JSX.Element;
  export function useTexture(url: string | string[]): THREE.Texture | THREE.Texture[];
} 