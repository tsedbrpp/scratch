
import * as THREE from 'three';
import { Relationship, getMediatorClassification } from '@/types/relationship';

import { EcosystemActor } from '@/types/ecosystem';
import { NodeViz, LinkViz } from '@/lib/viz-contract';

// --- VISUAL CONSTANTS (User Defined) ---
const PALETTE = {
    strong_intermediary: 0x64748B, // Slate-500
    weak_intermediary: 0x94A3B8,   // Slate-400
    weak_mediator: 0xFB923C,       // Orange-400
    strong_mediator: 0xEF4444      // Red-500
};

const THICKNESS = {
    strong_intermediary: 1,
    weak_intermediary: 2,
    weak_mediator: 3,
    strong_mediator: 5 // Thick
};

const CURVATURE = {
    strong_intermediary: 0,
    weak_intermediary: 0.2,
    weak_mediator: 0.5,
    strong_mediator: 0.8 // High wobble
};

// --- Shared Types ---
export interface GraphNode {
    id: string;
    name: string;
    type: string;
    val: number;
    color: string;
    isConfiguration: boolean;
    x?: number;
    y?: number;
    z?: number;
    fz?: number; // Stratum Z target
    actor?: EcosystemActor;
    viz?: NodeViz;
}

export interface GraphLink {
    source: string | GraphNode;
    target: string | GraphNode;
    type: string;
    viz?: LinkViz;
    analysis?: Relationship;
}

export interface NodeUserData {
    isJitterTarget?: boolean;
    jitterMagnitude?: number;
    heat?: number;
    baseColor?: string;
}

// --- FACTORY FUNCTIONS ---

export function createTextSprite(text: string, color: string, fontSize: number = 24) {
    if (typeof document === 'undefined') return new THREE.Mesh();

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return new THREE.Mesh();

    const font = `Bold ${fontSize}px Inter, sans-serif`;
    context.font = font;
    const metrics = context.measureText(text);
    const textWidth = metrics.width;

    canvas.width = textWidth + 20;
    canvas.height = fontSize + 20;

    context.font = font;
    context.globalAlpha = 0.65;
    context.fillStyle = color;
    context.beginPath();
    context.roundRect(0, 0, canvas.width, canvas.height, 10);
    context.fill();
    context.globalAlpha = 1.0;

    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);

    sprite.scale.set(textWidth / 4, (fontSize + 10) / 4, 1);
    return sprite;
}

export function createNodeObject(node: GraphNode): THREE.Object3D {
    if (node.isConfiguration) return createTextSprite(node.name, node.color);

    if (!node.viz) return new THREE.Mesh(new THREE.SphereGeometry(2), new THREE.MeshBasicMaterial({ color: '#ccc' }));

    const viz = node.viz;
    let geometry: THREE.BufferGeometry;
    if (viz.roleType === 'Material') {
        geometry = new THREE.BoxGeometry(node.val, node.val, node.val);
    } else if (viz.roleType === 'Expressive') {
        geometry = new THREE.IcosahedronGeometry(node.val / 1.5, 0);
    } else {
        geometry = new THREE.SphereGeometry(node.val / 2, 16, 16);
    }

    const roughness = 1 - (viz.territorialization * 0.8);
    const materialParams: THREE.MeshStandardMaterialParameters = {
        color: node.color,
        roughness: roughness,
        metalness: 0.2,
        emissive: viz.ethicalRisk > 0.4 ? 0xff0000 : 0x000000,
        emissiveIntensity: viz.ethicalRisk > 0.4 ? (viz.ethicalRisk * 5) : 0,
        transparent: true,
        opacity: Math.max(0.3, viz.confidence),
        wireframe: viz.isGhost
    };

    if (viz.hasMissingMetrics) {
        if (typeof document !== 'undefined') {
            const canvas = document.createElement('canvas');
            canvas.width = 64; canvas.height = 64;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 64, 64);
                ctx.fillStyle = '#000000'; ctx.globalAlpha = 0.3;
                for (let i = -64; i < 128; i += 16) {
                    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + 64, 64); ctx.lineWidth = 4; ctx.stroke();
                }
            }
            const texture = new THREE.CanvasTexture(canvas);
            materialParams.map = texture;
            materialParams.bumpMap = texture;
            materialParams.bumpScale = 0.5;
            materialParams.color = new THREE.Color(node.color).offsetHSL(0, 0, 0.1);
        }
    }

    const material = new THREE.MeshStandardMaterial(materialParams);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = {
        isJitterTarget: true,
        jitterMagnitude: viz.deterritorialization,
        heat: viz.heat,
        baseColor: node.color
    };

    const group = new THREE.Group();
    group.add(mesh);

    if (viz.isProvisional && !viz.isGhost) {
        const wiregeo = new THREE.WireframeGeometry(geometry);
        const wiremat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
        const wireframe = new THREE.LineSegments(wiregeo, wiremat);
        group.add(wireframe);
    }

    return group;
}

export function createLinkGeometry(link: GraphLink) {
    // Group to hold Tube + (Optional) Particles
    const group = new THREE.Group();

    // Default values for non-analyzed links
    let color = 0x94A3B8; // Default Slate-400
    let thickness = 1;
    let curvature = 0;
    let opacity = 0.4;
    let classification = 'weak_intermediary';

    if (link.analysis) {
        const rel = link.analysis;
        classification = rel.classification || getMediatorClassification(rel.mediatorScore);
        color = PALETTE[classification as keyof typeof PALETTE] || 0x94A3B8;
        thickness = THICKNESS[classification as keyof typeof THICKNESS] || 2;
        curvature = CURVATURE[classification as keyof typeof CURVATURE] || 0.2;
        opacity = classification.includes('intermediary') ? 0.8 : 0.6;
    }

    // 1. The Tube (Mesh with Volume for hit-testing)
    const tubeGeo = new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 1)]),
        20,
        thickness * 0.5, // [FIX] Reduced thickness to not obscure nodes
        8,
        false
    );

    const material = new THREE.MeshStandardMaterial({
        color: color,
        transparent: true,
        opacity: Math.max(opacity, 0.6), // [FIX] Balanced opacity
        emissive: color,
        emissiveIntensity: 0.4
    });

    const mesh = new THREE.Mesh(tubeGeo, material);
    mesh.userData = { isLinkMesh: true, curvature: curvature };
    group.add(mesh);

    // 2. Particles (if Mediator)
    if (classification.includes('mediator')) {
        const particleCount = classification === 'strong_mediator' ? 12 : 5;
        const particleGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const offsets = new Float32Array(particleCount); // Position along curve (0-1)

        for (let i = 0; i < particleCount; i++) {
            offsets[i] = Math.random();
            positions[i * 3] = 0;
            positions[i * 3 + 1] = 0;
            positions[i * 3 + 2] = 0;
        }

        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeo.setAttribute('offset', new THREE.BufferAttribute(offsets, 1));

        const particleMat = new THREE.PointsMaterial({
            color: classification === 'strong_mediator' ? 0xffea00 : 0xffffff,
            size: classification === 'strong_mediator' ? 2 : 1,
            sizeAttenuation: true
        });

        const particles = new THREE.Points(particleGeo, particleMat);
        particles.userData = {
            isParticleSystem: true,
            speed: classification === 'strong_mediator' ? 0.8 : 0.4,
            turbulence: classification === 'strong_mediator'
        };
        group.add(particles);
    }

    return group;
}

export function updateLinkPosition(
    object: THREE.Object3D,
    start: { x: number, y: number, z: number },
    end: { x: number, y: number, z: number },
    link?: GraphLink
) {
    if (!start || !end) return;

    const group = object as THREE.Group;
    let mesh = group.children.find(c => c.userData.isLinkMesh) as THREE.Mesh;
    const particles = group.children.find(c => c.userData.isParticleSystem) as THREE.Points;

    // [NEW] Dynamic Visual Update
    if (link && link.analysis && mesh) {
        const rel = link.analysis;
        const classification = rel.classification || getMediatorClassification(rel.mediatorScore);
        const targetColor = new THREE.Color(PALETTE[classification]);

        // Check if we need to update material
        const mat = mesh.material as THREE.MeshStandardMaterial;
        const targetOpacity = Math.max(classification.includes('intermediary') ? 0.9 : 0.7, 0.6);

        if (!mat.color.equals(targetColor) || mat.opacity !== targetOpacity) {
            mat.color.set(targetColor);
            mat.emissive.set(targetColor);
            mat.opacity = targetOpacity;

            // Also update curvature capability if needed (requires geometry regen)
            const targetCurvature = CURVATURE[classification as keyof typeof CURVATURE] || 0.2;
            if (mesh.userData.curvature !== targetCurvature) {
                mesh.userData.curvature = targetCurvature;
                // Geometry will be updated below in the curve regeneration
            }
        }
    }

    const startV = new THREE.Vector3(start.x, start.y, start.z);
    const endV = new THREE.Vector3(end.x, end.y, end.z);
    const midV = new THREE.Vector3().addVectors(startV, endV).multiplyScalar(0.5);

    // Apply Curvature (Perpendicular offset)
    if (mesh && mesh.userData.curvature > 0) {
        const dist = startV.distanceTo(endV);
        const dir = new THREE.Vector3().subVectors(endV, startV).normalize();

        // Arbitrary perpendicular vector (up-ish)
        const up = new THREE.Vector3(0, 1, 0);
        const perp = new THREE.Vector3().crossVectors(dir, up).normalize();

        // Wobble for Strong Mediators
        let wobble = 0;
        if (mesh.userData.curvature > 0.6) {
            const time = Date.now() * 0.002;
            wobble = Math.sin(time) * 2; // subtle wave
        }

        midV.add(perp.multiplyScalar(dist * mesh.userData.curvature * 0.2 + wobble));
    }

    const curve = new THREE.CatmullRomCurve3([startV, midV, endV]);

    // Use dynamic radius based on analysis if available
    let targetRadius = 0.5; // [FIX] Balanced thickness
    if (link && link.analysis) {
        const rel = link.analysis;
        const classification = rel.classification || getMediatorClassification(rel.mediatorScore);
        targetRadius = (THICKNESS[classification as keyof typeof THICKNESS] || 2) * 0.5; // [FIX] Match multiplier
    }

    // Update Tube Geometry
    if (mesh) {
        // [FIX] Store curve for animation
        group.userData.curve = curve;

        const newGeo = new THREE.TubeGeometry(
            curve,
            20,
            targetRadius, // [FIX] Thinner radius
            8,
            false
        );
        mesh.geometry.dispose();
        mesh.geometry = newGeo;
    }
}

// [NEW] Animation Loop Helper
export function animateLinkParticles(scene: THREE.Scene, time: number) {
    scene.traverse((object) => {
        if (object.userData && object.userData.isParticleSystem) {
            const particles = object as THREE.Points;
            const group = particles.parent;
            if (group && group.userData.curve) {
                const curve = group.userData.curve as THREE.Curve<THREE.Vector3>;
                const speed = (particles.userData.speed || 0.4) * 0.5; // Adjusted speed

                const positions = particles.geometry.attributes.position.array as Float32Array;
                const offsets = particles.geometry.attributes.offset.array as Float32Array;
                const count = offsets.length;

                const t = time * 0.001 * speed;
                const point = new THREE.Vector3();

                for (let i = 0; i < count; i++) {
                    const progress = (offsets[i] + t) % 1;
                    curve.getPoint(progress, point);
                    positions[i * 3] = point.x;
                    positions[i * 3 + 1] = point.y;
                    positions[i * 3 + 2] = point.z;
                }

                particles.geometry.attributes.position.needsUpdate = true;
            }
        }
    });
}
