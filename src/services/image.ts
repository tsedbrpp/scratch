export const generateImage = async (prompt: string): Promise<string> => {
    try {
        const response = await fetch('/api/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.details || result.error || 'Image generation failed');
        }

        return result.image;
    } catch (error) {
        console.error('Image generation service error:', error);
        throw error;
    }
};
