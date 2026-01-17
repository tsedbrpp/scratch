"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Label } from "@/components/ui/label";

export default function SubmitContributionPage() {
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSubmitting(false);
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-200 py-12 px-6 flex items-center justify-center">
                <Card className="max-w-md w-full bg-slate-900 border-slate-800">
                    <CardHeader className="text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        </div>
                        <CardTitle className="text-2xl text-white">Submission Received</CardTitle>
                        <CardDescription>
                            Thank you for your contribution to Assemblage-AI. Our governance team will review your submission and award credits accordingly.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-center">
                        <Link href="/governance/contributor-credits">
                            <Button variant="outline" className="border-slate-700 hover:bg-slate-800 text-slate-300">
                                Back to Policy
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 py-12 px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <Link href="/governance/contributor-credits" className="inline-flex items-center text-slate-400 hover:text-white transition-colors mb-6">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Policy
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">Submit a Contribution</h1>
                    <p className="text-slate-400 text-lg">
                        Submit your critique, code, or documentation review for usage credits.
                    </p>
                </div>

                <Card className="bg-slate-900 border-slate-800">
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-6 pt-6">
                            <div className="space-y-2">
                                <Label htmlFor="category">Contribution Category</Label>
                                <Select required>
                                    <SelectTrigger className="bg-slate-950 border-slate-700 text-slate-200">
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                                        <SelectItem value="critique">Interpretive Critique</SelectItem>
                                        <SelectItem value="bias">Bias & Ethics Review</SelectItem>
                                        <SelectItem value="methodology">Methodological Evaluation</SelectItem>
                                        <SelectItem value="docs">Documentation & Translation</SelectItem>
                                        <SelectItem value="tech">Technical Contribution</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="summary">Title / Summary</Label>
                                <Input
                                    id="summary"
                                    placeholder="Brief summary of your contribution"
                                    className="bg-slate-950 border-slate-700 text-slate-200"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Detailed Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Describe your critique, finding, or contribution..."
                                    className="bg-slate-950 border-slate-700 text-slate-200 min-h-[150px]"
                                    required
                                />
                                <p className="text-xs text-slate-500">Markdown is supported.</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="link">Relevant Link (Optional)</Label>
                                <Input
                                    id="link"
                                    placeholder="GitHub PR, external document, or citation URL"
                                    className="bg-slate-950 border-slate-700 text-slate-200"
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-4 border-t border-slate-800 pt-6">
                            <Link href="/governance/contributor-credits">
                                <Button type="button" variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800">Cancel</Button>
                            </Link>
                            <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                {isSubmitting ? "Submitting..." : (
                                    <>
                                        <Send className="w-4 h-4 mr-2" />
                                        Submit Contribution
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}
