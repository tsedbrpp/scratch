
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Loader2, FileJson } from "lucide-react";

export function DataExportSection() {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const response = await fetch('/api/user/export');

            if (!response.ok) {
                throw new Error("Export failed");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `instantTEA-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (error) {
            console.error("Export error:", error);
            alert("Failed to export data. Please try again.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Card className="border-blue-500/20 bg-blue-900/5 mt-8">
            <CardHeader>
                <CardTitle className="text-blue-700 dark:text-blue-400 flex items-center gap-2">
                    <FileJson className="h-5 w-5" />
                    Export Data
                </CardTitle>
                <CardDescription>
                    Download a copy of your personal data (GDPR Article 20).
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md">
                        This will generate a JSON file containing your profile information, usage history, and transaction logs stored on our servers.
                    </p>
                    <Button
                        onClick={handleExport}
                        disabled={isExporting}
                        variant="outline"
                        className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/50"
                    >
                        {isExporting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Exporting...
                            </>
                        ) : (
                            <>
                                <Download className="mr-2 h-4 w-4" />
                                Export My Data
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
