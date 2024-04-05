declare module "*.glb" {
    const content: string;
    export default content;
}  
  
interface PlayerProps {
  modelPath: string;
}

interface CameraProps {
  playerRef: React.RefObject<THREE.Object3D>;
}
