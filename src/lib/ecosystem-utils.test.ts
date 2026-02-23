import { generateGhostId, mergeGhostNodes } from '@/lib/ecosystem-utils';
import { AssemblageAnalysis, EcosystemActor } from '@/types/ecosystem';

describe('ecosystem-utils', () => {
    describe('generateGhostId', () => {
        it('should handle standard names', () => {
            expect(generateGhostId('Test Name')).toBe('ghost-test-name');
        });

        it('should handle extra spaces', () => {
            expect(generateGhostId(' Test With Spaces ')).toBe('ghost-test-with-spaces');
        });

        it('should handle special characters', () => {
            expect(generateGhostId('Node with (parentheses) & symbols!')).toBe('ghost-node-with-parentheses-symbols');
        });

        it('should handle empty string correctly', () => {
            expect(generateGhostId('')).toBe('ghost-');
        });

        it('should handle names with multiple dashes', () => {
            expect(generateGhostId('Some -- name - here')).toBe('ghost-some-name-here');
        });
    });

    describe('mergeGhostNodes', () => {
        it('should merge physical and ghost actors using generateGhostId', () => {
            const physicalActors: EcosystemActor[] = [
                {
                    id: '1',
                    sourceId: 'src-1',
                    name: 'Existing Actor',
                    type: 'Policymaker',
                    description: 'Test',
                    metrics: { territorialization: 5, coding: 5, deterritorialization: 5, dynamic_power: 5 },
                    influence: 'Medium'
                }
            ];

            const analysis = {
                missing_voices: [
                    { name: 'Missing  (Community)!', reason: 'Not there', category: 'Civil Society', role: 'civil society' }
                ],
                relationships: [],
            } as unknown as AssemblageAnalysis;

            const result = mergeGhostNodes(physicalActors, analysis.missing_voices || []);

            expect(result.length).toBe(2);
            expect(result[0].isGhost).toBe(false);
            expect(result[0].name).toBe('Existing Actor');

            expect(result[1].isGhost).toBe(true);
            expect(result[1].name).toBe('Missing  (Community)!');
            expect(result[1].id).toBe('ghost-missing-community');
        });

        it('should handle empty absence analysis gracefully', () => {
            const physicalActors: EcosystemActor[] = [
                {
                    id: '1',
                    sourceId: 'src-1',
                    name: 'Actor',
                    type: 'Policymaker',
                    description: '',
                    metrics: { territorialization: 5, coding: 5, deterritorialization: 5, dynamic_power: 5 },
                    influence: 'Medium'
                }
            ];

            const result = mergeGhostNodes(physicalActors, undefined);
            expect(result.length).toBe(1);
            expect(result[0].isGhost).toBe(false);
        });
    });
});
