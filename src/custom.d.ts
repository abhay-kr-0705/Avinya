import { Object3D } from 'three';
import { ReactThreeFiber } from '@react-three/fiber';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: ReactThreeFiber.Object3DNode<THREE.Group, typeof THREE.Group>;
      mesh: ReactThreeFiber.Object3DNode<THREE.Mesh, typeof THREE.Mesh>;
      ambientLight: ReactThreeFiber.LightNode<THREE.AmbientLight, typeof THREE.AmbientLight>;
      pointLight: ReactThreeFiber.LightNode<THREE.PointLight, typeof THREE.PointLight>;
      directionalLight: ReactThreeFiber.LightNode<THREE.DirectionalLight, typeof THREE.DirectionalLight>;
    }
  }
} 