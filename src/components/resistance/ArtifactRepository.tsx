"use client"

import { useState } from "react";
import { ResistanceArtifact, ArtifactType } from "@/types/resistance";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Plus,
    FileText,
    MessageSquare,
    Megaphone,
    FileEdit,
    Upload,
    Search,
    Loader2,
    Globe,
    Trash2
} from "lucide-react";

import { UploadArtifactDialog } from "./UploadArtifactDialog";
import { DiscoveryDialog } from "./DiscoveryDialog";
import { useResistanceArtifacts } from "@/hooks/useResistanceArtifacts";
import { useDemoMode } from "@/hooks/useDemoMode";

interface ArtifactRepositoryProps {
    onSelectArtifact?: (artifact: ResistanceArtifact) => void;
}

export function ArtifactRepository({ onSelectArtifact }: ArtifactRepositoryProps) {
    const { artifacts, isLoading, addArtifact, deleteArtifact } = useResistanceArtifacts();
    const { isReadOnly } = useDemoMode();
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isDiscoverOpen, setIsDiscoverOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<ArtifactType | "all">("all");

    const handleUpload = async (artifactData: Omit<ResistanceArtifact, 'id' | 'uploaded_at' | 'uploaded_by'>) => {
        try {
            await addArtifact(artifactData);
            setIsUploadOpen(false);
        } catch (error) {
            console.error('Failed to upload artifact:', error);
        }
    };

    const handleImport = async (artifactData: Omit<ResistanceArtifact, 'id' | 'uploaded_at' | 'uploaded_by'>) => {
        try {
            await addArtifact(artifactData);
            setIsDiscoverOpen(false);
        } catch (error) {
            console.error('Failed to import artifact:', error);
        }
    };

    const getTypeIcon = (type: ArtifactType) => {
        switch (type) {
            case 'manifesto': return FileText;
            case 'policy_draft': return FileEdit;
            case 'social_media': return MessageSquare;
            case 'protest_material': return Megaphone;
            default: return FileText;
        }
    };

    const getTypeColor = (type: ArtifactType) => {
        switch (type) {
            case 'manifesto': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'policy_draft': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'social_media': return 'bg-green-100 text-green-800 border-green-200';
            case 'protest_material': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    const filteredArtifacts = artifacts.filter(artifact => {
        const matchesSearch = !searchQuery ||
            artifact.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            artifact.source.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType = filterType === "all" || artifact.type === filterType;

        return matchesSearch && matchesType;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-bold">Resistance Artifacts Repository</CardTitle>
                            <p className="text-sm text-slate-500 mt-1">
                                Primary data: manifestos, alternative policies, and resistance materials
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button onClick={() => setIsUploadOpen(true)} disabled={isReadOnly} title={isReadOnly ? "Upload disabled in Demo Mode" : ""}>
                                <Plus className="mr-2 h-4 w-4" />
                                Upload Artifact
                            </Button>
                            <Button variant="secondary" onClick={() => setIsDiscoverOpen(true)} disabled={isReadOnly} title={isReadOnly ? "Discovery disabled in Demo Mode" : ""}>
                                <Globe className="mr-2 h-4 w-4" />
                                Discover
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Search & Filter */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search artifacts by title or source..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="w-48">
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value as ArtifactType | "all")}
                                className="w-full h-10 px-3 rounded-md border border-slate-200 text-sm"
                            >
                                <option value="all">All Types</option>
                                <option value="manifesto">Manifestos</option>
                                <option value="policy_draft">Policy Drafts</option>
                                <option value="social_media">Social Media</option>
                                <option value="protest_material">Protest Materials</option>
                                <option value="interview">Interviews</option>
                                <option value="petition">Petitions</option>
                                <option value="open_letter">Open Letters</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Artifacts List */}
            <div className="space-y-4">
                {isLoading ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-400" />
                            <p className="text-slate-500 mt-2">Loading artifacts...</p>
                        </CardContent>
                    </Card>
                ) : filteredArtifacts.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Upload className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500">
                                {artifacts.length === 0
                                    ? "No resistance artifacts yet. Upload or Discover to begin."
                                    : "No artifacts match your filters."}
                            </p>
                            {artifacts.length === 0 && (
                                <div className="flex justify-center gap-2 mt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsUploadOpen(true)}
                                        disabled={isReadOnly}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Upload
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsDiscoverOpen(true)}
                                        disabled={isReadOnly}
                                    >
                                        <Globe className="mr-2 h-4 w-4" />
                                        Discover
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    filteredArtifacts.map((artifact) => {
                        const TypeIcon = getTypeIcon(artifact.type);
                        return (
                            <Card
                                key={artifact.id}
                                className="hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => onSelectArtifact?.(artifact)}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 rounded-lg bg-slate-50">
                                            <TypeIcon className="h-6 w-6 text-slate-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-bold text-lg text-slate-900">
                                                        {artifact.title}
                                                    </h3>
                                                    <p className="text-sm text-slate-600 mt-1">
                                                        {artifact.source} • {new Date(artifact.date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <Badge className={getTypeColor(artifact.type)}>
                                                    {artifact.type.replace('_', ' ')}
                                                </Badge>
                                            </div>

                                            {artifact.target_policy && (
                                                <p className="text-sm text-slate-500 mt-2">
                                                    → Targets: {artifact.target_policy}
                                                </p>
                                            )}

                                            {artifact.tags && artifact.tags.length > 0 && (
                                                <div className="flex gap-2 mt-3 flex-wrap">
                                                    {artifact.tags.map((tag, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex gap-2 mt-4 items-center justify-between">
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline" onClick={(e) => {
                                                        e.stopPropagation();
                                                        onSelectArtifact?.(artifact);
                                                    }}>
                                                        View
                                                    </Button>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        if (confirm('Are you sure you want to delete this artifact?')) {
                                                            try {
                                                                await deleteArtifact(artifact.id);
                                                            } catch (e) {
                                                                console.error(e);
                                                            }
                                                        }
                                                    }}
                                                    disabled={isReadOnly}
                                                    title={isReadOnly ? "Delete disabled in Demo Mode" : ""}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>

            {/* Dialogs */}
            <UploadArtifactDialog
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                onUpload={handleUpload}
            />

            <DiscoveryDialog
                isOpen={isDiscoverOpen}
                onClose={() => setIsDiscoverOpen(false)}
                onImport={handleImport}
            />
        </div >
    );
}
