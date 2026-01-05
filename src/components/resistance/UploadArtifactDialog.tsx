"use client"

import { useState } from "react";
import { ResistanceArtifact, ArtifactType } from "@/types/resistance";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface UploadArtifactDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (artifact: Omit<ResistanceArtifact, 'id' | 'uploaded_at' | 'uploaded_by'>) => void;
    availablePolicies?: { id: string; title: string }[];
}

export function UploadArtifactDialog({
    isOpen,
    onClose,
    onUpload,
    availablePolicies = []
}: UploadArtifactDialogProps) {
    const [formData, setFormData] = useState({
        title: "",
        type: "manifesto" as ArtifactType,
        source: "",
        date: new Date().toISOString().split('T')[0],
        text: "",
        target_policy: "",
        target_components: [] as string[],
        tags: [] as string[],
        notes: ""
    });

    const [newTag, setNewTag] = useState("");
    const [newComponent, setNewComponent] = useState("");

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpload(formData);
        // Reset form
        setFormData({
            title: "",
            type: "manifesto",
            source: "",
            date: new Date().toISOString().split('T')[0],
            text: "",
            target_policy: "",
            target_components: [],
            tags: [],
            notes: ""
        });
        onClose();
    };

    const addTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
            setNewTag("");
        }
    };

    const removeTag = (tag: string) => {
        setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
    };

    const addComponent = () => {
        if (newComponent.trim() && !formData.target_components.includes(newComponent.trim())) {
            setFormData({ ...formData, target_components: [...formData.target_components, newComponent.trim()] });
            setNewComponent("");
        }
    };

    const removeComponent = (component: string) => {
        setFormData({ ...formData, target_components: formData.target_components.filter(c => c !== component) });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Upload Resistance Artifact</CardTitle>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm text-slate-700">Basic Information</h3>

                            <div>
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., Community Data Charter"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="type">Type *</Label>
                                    <select
                                        id="type"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as ArtifactType })}
                                        className="w-full h-10 px-3 rounded-md border border-slate-200 text-sm"
                                        required
                                    >
                                        <option value="manifesto">Manifesto</option>
                                        <option value="policy_draft">Policy Draft</option>
                                        <option value="social_media">Social Media</option>
                                        <option value="protest_material">Protest Material</option>
                                        <option value="interview">Interview</option>
                                        <option value="petition">Petition</option>
                                        <option value="open_letter">Open Letter</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <Label htmlFor="date">Date *</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="source">Source *</Label>
                                <Input
                                    id="source"
                                    value={formData.source}
                                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                    placeholder="e.g., Data Justice Collective, Brazilian CSOs"
                                    required
                                />
                                <p className="text-xs text-slate-500 mt-1">Organization, individual, or movement</p>
                            </div>
                        </div>

                        {/* Artifact Text */}
                        <div>
                            <Label htmlFor="text">Full Text *</Label>
                            <Textarea
                                id="text"
                                value={formData.text}
                                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                                placeholder="Paste the full text of the resistance artifact here..."
                                rows={10}
                                required
                                className="font-mono text-sm"
                            />
                        </div>

                        {/* Assemblage Links */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm text-slate-700">Assemblage Context</h3>

                            {availablePolicies.length > 0 && (
                                <div>
                                    <Label htmlFor="target_policy">Target Policy (Optional)</Label>
                                    <select
                                        id="target_policy"
                                        value={formData.target_policy}
                                        onChange={(e) => setFormData({ ...formData, target_policy: e.target.value })}
                                        className="w-full h-10 px-3 rounded-md border border-slate-200 text-sm"
                                    >
                                        <option value="">None</option>
                                        {availablePolicies.map(policy => (
                                            <option key={policy.id} value={policy.id}>{policy.title}</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-slate-500 mt-1">Which policy does this artifact challenge?</p>
                                </div>
                            )}

                            <div>
                                <Label htmlFor="components">Target Assemblage Components</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="components"
                                        value={newComponent}
                                        onChange={(e) => setNewComponent(e.target.value)}
                                        placeholder="e.g., risk classification, enforcement mechanism"
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addComponent())}
                                    />
                                    <Button type="button" onClick={addComponent}>Add</Button>
                                </div>
                                {formData.target_components.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {formData.target_components.map((component, idx) => (
                                            <span
                                                key={idx}
                                                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                                            >
                                                {component}
                                                <button
                                                    type="button"
                                                    onClick={() => removeComponent(component)}
                                                    className="hover:text-blue-900"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tags & Notes */}
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="tags">Tags</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="tags"
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        placeholder="e.g., algorithmic justice, data sovereignty"
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                    />
                                    <Button type="button" onClick={addTag}>Add</Button>
                                </div>
                                {formData.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {formData.tags.map((tag, idx) => (
                                            <span
                                                key={idx}
                                                className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded"
                                            >
                                                {tag}
                                                <button
                                                    type="button"
                                                    onClick={() => removeTag(tag)}
                                                    className="hover:text-slate-900"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="notes">Field Notes (Optional)</Label>
                                <Textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Your observations, context, or analytical memos about this artifact..."
                                    rows={4}
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                Upload Artifact
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
