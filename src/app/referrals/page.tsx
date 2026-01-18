import { getReferralStats } from "@/app/actions/referral";
import { ReferralRedemptionForm } from "@/components/referral/ReferralRedemptionForm";
import { Sidebar } from "@/components/Sidebar";
import { Copy, Gift, Users, Trophy } from "lucide-react";
import CopyButton from "@/components/referral/CopyButton";

export default async function ReferralsPage() {
    const stats = await getReferralStats();

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto py-12 px-6 lg:px-8">

                    {/* Hero Section */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-full text-indigo-600 mb-6">
                            <Gift className="w-8 h-8" />
                        </div>
                        <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-4">
                            Give 5, Get 5
                        </h1>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Invite your colleagues to InstantTea. They get <span className="font-bold text-indigo-600">5 free credits</span> instantly,
                            and you get <span className="font-bold text-indigo-600">5 credits</span> when they use your code.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">

                        {/* Your Code Card */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 flex flex-col items-center text-center">
                            <h2 className="text-lg font-semibold text-slate-900 mb-2">Your Unique Referral Code</h2>
                            <p className="text-sm text-slate-500 mb-6">Share this code with friends</p>

                            <div className="flex items-center gap-2 w-full max-w-xs bg-slate-50 border border-slate-200 rounded-lg p-2 mb-4">
                                <div className="flex-1 font-mono text-xl font-bold text-slate-700 tracking-wider">
                                    {stats.code || "LOADING..."}
                                </div>
                                <CopyButton code={stats.code || ""} />
                            </div>

                            <p className="text-xs text-slate-400">
                                Valid for new users only.
                            </p>
                        </div>

                        {/* Stats Card */}
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 shadow-lg text-white flex flex-col justify-between">
                            <div>
                                <h2 className="text-lg font-medium text-slate-300 mb-1">Your Impact</h2>
                                <p className="text-sm text-slate-400">Total rewards earned</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-8">
                                <div>
                                    <div className="text-3xl font-bold text-white mb-1">{stats.count}</div>
                                    <div className="text-xs text-slate-400 flex items-center gap-1">
                                        <Users className="w-3 h-3" /> Friends Invited
                                    </div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-emerald-400 mb-1">{stats.earned}</div>
                                    <div className="text-xs text-slate-400 flex items-center gap-1">
                                        <Trophy className="w-3 h-3" /> Credits Earned
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Redemption Form */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-8 md:p-10">
                            <h3 className="text-xl font-bold text-slate-900 mb-6">Have a code from a friend?</h3>
                            <ReferralRedemptionForm />
                        </div>
                        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 text-xs text-slate-500 text-center">
                            Referral codes can only be redeemed once per account.
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
