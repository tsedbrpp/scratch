"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export function DeleteAccountSection() {
    const { signOut } = useClerk();
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmationText, setConfirmationText] = useState("");

    const handleDelete = async () => {
        if (confirmationText !== "DELETE") return;

        setIsDeleting(true);
        try {
            const res = await fetch("/api/user/delete", {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete account");

            toast.success("Account deleted successfully");
            await signOut();
            router.push("/");
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete account. Please try again.");
            setIsDeleting(false);
        }
    };

    return (
        <Card className="border-red-500/20 bg-red-950/10 mt-8">
            <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Danger Zone
                </CardTitle>
                <CardDescription>
                    Irreversible account actions.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h4 className="text-slate-900 dark:text-slate-200 font-medium">Delete Account</h4>
                        <p className="text-sm text-slate-500">
                            Permanently remove your account and all associated data. This action cannot be undone.
                        </p>
                    </div>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Account
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-slate-950 text-slate-200 border-slate-800">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="text-red-500">Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription className="text-slate-400">
                                    This will permanently delete your account and remove your data from our servers.
                                    <br /><br />
                                    To confirm, type <strong>DELETE</strong> below:
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="py-4">
                                <Input
                                    value={confirmationText}
                                    onChange={(e) => setConfirmationText(e.target.value)}
                                    placeholder="Type DELETE to confirm"
                                    className="bg-slate-900 border-red-900/50 text-white placeholder:text-slate-600"
                                />
                            </div>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-700">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleDelete();
                                    }}
                                    disabled={confirmationText !== "DELETE" || isDeleting}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                    {isDeleting ? "Deleting..." : "Confirm Deletion"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardContent>
        </Card>
    );
}
