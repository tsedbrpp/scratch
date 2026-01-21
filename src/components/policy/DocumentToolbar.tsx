import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Loader2, Plus, Search, Upload, Globe, FileDown } from "lucide-react";

interface DocumentToolbarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isUploading: boolean;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onAddClick: () => void;
    onAddUrlClick: () => void;
    onExportReport: () => void;
    isExporting: boolean;
    isReadOnly?: boolean;
}

export function DocumentToolbar({
    searchQuery,
    onSearchChange,
    onUpload,
    isUploading,
    fileInputRef,
    onAddClick,
    onAddUrlClick,
    onExportReport,
    isExporting,
    isReadOnly = false
}: DocumentToolbarProps) {
    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Documents</h2>
                    <p className="text-slate-500">Manage and analyze policy texts (PDFs, Word docs) and web content. Drag & drop to upload.</p>
                </div>
                <div className="flex gap-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.docx,.doc"
                        onChange={onUpload}
                        className="hidden"
                    />
                    <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading || isReadOnly}
                        title={isReadOnly ? "Uploads disabled in Demo Mode" : ""}
                        className="bg-purple-600 text-white hover:bg-purple-700"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Document
                            </>
                        )}
                    </Button>
                    <Button
                        onClick={onAddUrlClick}
                        variant="outline"
                        disabled={isReadOnly}
                        title={isReadOnly ? "Adding URLs disabled in Demo Mode" : ""}
                        className="border-slate-300 hover:bg-slate-100"
                    >
                        <Globe className="mr-2 h-4 w-4" /> Add from URL
                    </Button>
                    <Button
                        onClick={onAddClick}
                        disabled={isReadOnly}
                        title={isReadOnly ? "Adding documents disabled in Demo Mode" : ""}
                        className="bg-slate-900 text-white hover:bg-slate-800"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Add Document
                    </Button>
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                        type="text"
                        placeholder="Search documents..."
                        className="w-full pl-9"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="border-slate-200">
                    <Filter className="mr-2 h-4 w-4" /> Filter
                </Button>
                <Button
                    onClick={onExportReport}
                    disabled={isExporting || isReadOnly}
                    title={isReadOnly ? "Export disabled in Demo Mode" : ""}
                    variant="outline"
                    className="border-slate-200 hover:bg-slate-100 text-slate-700"
                >
                    <FileDown className="mr-2 h-4 w-4" />
                    {isExporting ? "Generating..." : "Export Report"}
                </Button>
            </div>
        </div>
    );
}
