
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
    // Group to hold Tube/Line + (Optional) Particles
    const group = new THREE.Group();

    // Determine Pattern Type & Base Colors
    const flowType = link.viz?.flowType || (link as any).flow_type || (link.type === 'ghost' ? 'ghost' : 'logic');

    // Evaluate if we should override with Mediator Score (Only for thickness/particles, colors stay fixed to Flow Legend)
    let classification = 'weak_intermediary';
    let opacity = 0.5;
    let thicknessMultiplier = 1;

    if (link.analysis) {
        classification = link.analysis.classification || getMediatorClassification(link.analysis.mediatorScore);
        thicknessMultiplier = (THICKNESS[classification as keyof typeof THICKNESS] || 2) * 0.5;
        // Intermediaries (0-0.5 score) are subtle, Mediators (0.5-1.0) are bold
        opacity = classification.includes('intermediary') ? 0.4 : 0.8;
    }

    // 1. Core Geometry & Material Selection based on Flow Type
    let mesh: THREE.Mesh | THREE.Line;
    let curvature = CURVATURE[classification as keyof typeof CURVATURE] || 0.2;

    if (flowType === 'power') {
        // [SOLID RED TUBE] - Power Flow
        const tubeColor = 0xEF4444; // Red-500
        const tubeGeo = new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 1)]),
            20,
            thicknessMultiplier * 0.5,
            8,
            false
        );
        const material = new THREE.MeshStandardMaterial({
            color: tubeColor,
            transparent: true,
            opacity: Math.max(opacity, 0.6),
            emissive: tubeColor,
            emissiveIntensity: 0.4
        });
        mesh = new THREE.Mesh(tubeGeo, material);
        mesh.userData = { isLinkMesh: true, curvature, flowType: 'power', baseColor: tubeColor };
        group.add(mesh);

        // Always attach a particle to Power forces to indicate Direction
        const particleGeo = new THREE.BufferGeometry();
        particleGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3));
        particleGeo.setAttribute('offset', new THREE.BufferAttribute(new Float32Array([Math.random()]), 1));
        const particleMat = new THREE.PointsMaterial({ color: 0xffaaaa, size: Math.max(2, thicknessMultiplier * 1.5), sizeAttenuation: true });
        const particles = new THREE.Points(particleGeo, particleMat);
        particles.userData = { isParticleSystem: true, speed: 0.6, isDirected: true };
        group.add(particles);

    } else if (flowType === 'ghost') {
        // [TRANSLUCENT INDIGO TUBE] - Absent/Ghost Flow
        // Switched from THREE.Line to THREE.TubeGeometry for guaranteed hardware visibility
        const tubeColor = 0x6366F1; // Indigo-500
        const tubeGeo = new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 1)]),
            20,
            Math.max(0.3, thicknessMultiplier * 0.4), // Thinner than power
            8,
            false
        );
        const ghostMaterial = new THREE.MeshStandardMaterial({
            color: tubeColor,
            transparent: true,
            opacity: Math.max(opacity, 0.4),
            emissive: tubeColor,
            emissiveIntensity: 0.6,
            wireframe: true // Gives a 'virtual' dotted appearance securely
        });
        mesh = new THREE.Mesh(tubeGeo, ghostMaterial);
        mesh.userData = { isLinkMesh: true, curvature: 0.1, flowType: 'ghost', baseColor: tubeColor };
        group.add(mesh);
    } else {
        // [DASHED AMBER LINE] - Logic Flow (Default)
        const lineColor = 0xF59E0B; // Amber-500
        const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 1)];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const logicMaterial = new THREE.LineDashedMaterial({
            color: lineColor,
            linewidth: Math.max(1, thicknessMultiplier),
            transparent: true,
            opacity: Math.max(opacity, 0.5),
            dashSize: 4, // Long dash
            gapSize: 4   // Standard gap = Dashed
        });
        mesh = new THREE.Line(lineGeo, logicMaterial);
        mesh.userData = { isLinkLine: true, curvature, flowType: 'logic', baseColor: lineColor };
        group.add(mesh);
    }

    // 2. Extra Mediator Particles (Only for strong structural Logic/Ghost links, since Power already gets a directional dot)
    if (classification.includes('mediator') && flowType !== 'power') {
        const particleCount = classification === 'strong_mediator' ? 8 : 3;
        const particleGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const offsets = new Float32Array(particleCount);

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
            size: classification === 'strong_mediator' ? 2 : 1.5,
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
    let mainGeometryChild = group.children.find(c => c.userData.isLinkMesh || c.userData.isLinkLine) as THREE.Mesh | THREE.Line;

    // Safety check
    if (!mainGeometryChild) return;

    // [NEW] Dynamic Visual Update
    if (link && link.analysis && mainGeometryChild.userData.baseColor) {
        const rel = link.analysis;
        const classification = rel.classification || getMediatorClassification(rel.mediatorScore);

        // Ensure flow_type colors (Power/Logic/Ghost) are strictly maintained when overridden by updates
        const targetColor = new THREE.Color(mainGeometryChild.userData.baseColor);

        // Check if we need to update material properties
        const mat = mainGeometryChild.material as THREE.Material & { color?: THREE.Color; emissive?: THREE.Color; opacity: number };
        const targetOpacity = Math.max(classification.includes('intermediary') ? 0.9 : 0.7, 0.6);

        if (mat.color && (!mat.color.equals(targetColor) || mat.opacity !== targetOpacity)) {
            mat.color.copy(targetColor);
            if (mat.emissive) mat.emissive.copy(targetColor);
            mat.opacity = targetOpacity;

            // Update curvature property based on relation strength
            const targetCurvature = CURVATURE[classification as keyof typeof CURVATURE] || 0.2;
            if (mainGeometryChild.userData.curvature !== targetCurvature && mainGeometryChild.userData.flowType !== 'ghost') {
                mainGeometryChild.userData.curvature = targetCurvature;
            }
        }
    }

    const startV = new THREE.Vector3(start.x, start.y, start.z);
    const endV = new THREE.Vector3(end.x, end.y, end.z);
    const midV = new THREE.Vector3().addVectors(startV, endV).multiplyScalar(0.5);

    // Apply Curvature (Perpendicular offset)
    if (mainGeometryChild.userData.curvature > 0) {
        const dist = startV.distanceTo(endV);
        const dir = new THREE.Vector3().subVectors(endV, startV).normalize();

        // Arbitrary perpendicular vector
        const up = new THREE.Vector3(0, 1, 0);
        let perp = new THREE.Vector3().crossVectors(dir, up);
        if (perp.lengthSq() < 0.001) {
            perp = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(1, 0, 0));
        }
        perp.normalize();

        // Wobble for Strong Mediators
        let wobble = 0;
        if (mainGeometryChild.userData.curvature > 0.6) {
            const time = Date.now() * 0.002;
            wobble = Math.sin(time) * 2; // subtle wave
        }

        midV.add(perp.multiplyScalar(dist * mainGeometryChild.userData.curvature * 0.2 + wobble));
    }

    const curve = new THREE.CatmullRomCurve3([startV, midV, endV]);

    // Store curve in group for particle animation systems
    group.userData.curve = curve;

    // Use dynamic radius based on analysis if available (for Tube)
    let targetRadius = 0.5;
    if (link && link.analysis) {
        const classification = link.analysis.classification || getMediatorClassification(link.analysis.mediatorScore);
        targetRadius = (THICKNESS[classification as keyof typeof THICKNESS] || 2) * 0.5;
    }

    // Update the geometry based on the type of WebGL object (Tube vs DashedLine)
    if (mainGeometryChild.userData.isLinkMesh && mainGeometryChild instanceof THREE.Mesh) {
        // [SOLID POWER FLOW] Re-generate Tube
        const newGeo = new THREE.TubeGeometry(curve, 20, targetRadius, 8, false);
        mainGeometryChild.geometry.dispose();
        mainGeometryChild.geometry = newGeo;
    } else if (mainGeometryChild.userData.isLinkLine && mainGeometryChild instanceof THREE.Line) {
        // [DASHED LOGIC/GHOST FLOW] Sample curve points and generate Line
        const points = curve.getPoints(20);
        mainGeometryChild.geometry.dispose();

        const newGeo = new THREE.BufferGeometry().setFromPoints(points);
        mainGeometryChild.geometry = newGeo;

        // Crucial for Dashed/Dotted Materials to render gap intervals natively on GPU
        mainGeometryChild.computeLineDistances();
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
